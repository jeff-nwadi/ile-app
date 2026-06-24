import "server-only";
import { db } from "@/db";
import { order, webhookEvent } from "@/db/schema";
import { audit } from "@/lib/audit";
import { safeError } from "@/lib/errors";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MAX_BODY_BYTES = 64 * 1024;
const HANDLED_EVENTS = new Set(["charge.success"]);

const paystackEventSchema = z.object({
  event: z.string(),
  data: z.object({
    reference: z.string().min(1).max(128),
  }).passthrough(),
}).passthrough();

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return safeError(500, "Webhook not configured");
  }

  // Body size cap. We refuse to read anything larger than 64 KB — Paystack
  // webhooks are well under that.
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return safeError(413, "Payload too large");
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return safeError(413, "Payload too large");
  }

  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    await audit({
      userId: null,
      action: "webhook.signature_failed",
      targetType: "paystack",
      meta: { reason: "missing_signature" },
    });
    return safeError(401, "Invalid signature");
  }

  // Constant-time comparison. Length mismatch is handled explicitly so we
  // don't pass buffers of different length to timingSafeEqual (which would
  // throw on Node).
  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    await audit({
      userId: null,
      action: "webhook.signature_failed",
      targetType: "paystack",
      meta: { reason: "mismatch" },
    });
    return safeError(401, "Invalid signature");
  }

  let event: z.infer<typeof paystackEventSchema>;
  try {
    event = paystackEventSchema.parse(JSON.parse(rawBody));
  } catch {
    return safeError(400, "Malformed event");
  }

  if (!HANDLED_EVENTS.has(event.event)) {
    // Unknown event types: acknowledge (200) so Paystack stops retrying, but
    // do nothing.
    return NextResponse.json({ received: true, ignored: true });
  }

  // Idempotency: try to record the event before applying the side effect.
  // The unique index on (source, eventType, reference) is the source of truth.
  try {
    await db.insert(webhookEvent).values({
      source: "paystack",
      eventType: event.event,
      reference: event.data.reference,
      payload: rawBody,
    });
  } catch (err) {
    // Unique-constraint violation = already processed. Anything else is a
    // real failure.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      await audit({
        userId: null,
        action: "webhook.duplicate",
        targetType: "paystack",
        targetId: event.data.reference,
      });
      return NextResponse.json({ received: true, duplicate: true });
    }
    return safeError(500, "Failed to record event", err);
  }

  if (event.event === "charge.success") {
    await db
      .update(order)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(order.paystackReference, event.data.reference));
    // TODO: notify kitchen (e.g. push to an admin dashboard channel / send email).
  }

  await audit({
    userId: null,
    action: "webhook.processed",
    targetType: "paystack",
    targetId: event.data.reference,
    meta: { event: event.event },
  });

  return NextResponse.json({ received: true });
}
