import "server-only";
import { db } from "@/db";
import { order, orderItem } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { audit } from "@/lib/audit";
import { safeError } from "@/lib/errors";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// GET /api/orders/[id] — order + items. Customer can only read their own;
// admin can read any.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return safeError(401, "Unauthorized");
  }
  const { id } = await params;

  const [found] = await db.select().from(order).where(eq(order.id, id));
  if (!found) return safeError(404, "Not found");
  if (!isAdmin(user) && found.userId !== user.id) {
    return safeError(403, "Forbidden");
  }

  const items = await db
    .select()
    .from(orderItem)
    .where(eq(orderItem.orderId, id));

  return NextResponse.json({ order: found, items });
}

const adminUpdateSchema = z.object({
  status: z.enum([
    "pending_payment",
    "paid",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ]),
});

const customerCancelSchema = z.object({
  status: z.literal("cancelled"),
});

const CUSTOMER_CANCELLABLE = new Set([
  "pending_payment",
  "paid",
  "preparing",
]);

// PATCH /api/orders/[id] — admin can change to any status. Customer can only
// cancel their own order, and only while it's still cancellable.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return safeError(401, "Unauthorized");
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return safeError(400, "Invalid JSON");
  }

  if (isAdmin(user)) {
    const parsed = adminUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return safeError(400, "Invalid request", parsed.error.flatten());
    }

    const [updated] = await db
      .update(order)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(order.id, id))
      .returning();

    if (!updated) return safeError(404, "Not found");

    await audit({
      userId: user.id,
      action: "order.status",
      targetType: "order",
      targetId: id,
      meta: { from: updated.status, to: parsed.data.status },
    });

    return NextResponse.json({ order: updated });
  }

  // Customer path — cancel only.
  const parsed = customerCancelSchema.safeParse(body);
  if (!parsed.success) {
    return safeError(403, "Customers can only cancel orders");
  }

  const [existing] = await db.select().from(order).where(eq(order.id, id));
  if (!existing) return safeError(404, "Not found");
  if (existing.userId !== user.id) return safeError(403, "Forbidden");
  if (!CUSTOMER_CANCELLABLE.has(existing.status)) {
    return safeError(403, "This order can no longer be cancelled");
  }

  const [updated] = await db
    .update(order)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(order.id, id), eq(order.userId, user.id)))
    .returning();

  if (!updated) return safeError(404, "Not found");

  await audit({
    userId: user.id,
    action: "order.customer_cancel",
    targetType: "order",
    targetId: id,
  });

  return NextResponse.json({ order: updated });
}
