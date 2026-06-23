import { db } from "@/db";
import { order } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Paystack calls this URL directly (configure it in your Paystack dashboard).
// We verify the signature so random requests can't fake a "payment succeeded" event.
export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference: string = event.data.reference;
    await db
      .update(order)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(order.paystackReference, reference));

    // TODO: notify kitchen (e.g. push to an admin dashboard channel / send email).
  }

  return NextResponse.json({ received: true });
}
