import { db } from "@/db";
import { order, orderItem } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// GET /api/orders/[id] — order + items. Customer can only read their own;
// admin can read any.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const [found] = await db.select().from(order).where(eq(order.id, id));
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isAdmin(user) && found.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

// Statuses a customer is allowed to cancel from.
const CUSTOMER_CANCELLABLE = new Set([
  "pending_payment",
  "paid",
  "preparing",
]);

// PATCH /api/orders/[id] — admin can change to any status. Customer can only
// cancel their own order, and only while it's still cancellable.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body = await req.json();

  if (isAdmin(user)) {
    const parsed = adminUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(order)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(order.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ order: updated });
  }

  // Customer path — cancel only.
  const parsed = customerCancelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Customers can only cancel orders." },
      { status: 403 }
    );
  }

  const [existing] = await db.select().from(order).where(eq(order.id, id));
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!CUSTOMER_CANCELLABLE.has(existing.status)) {
    return NextResponse.json(
      { error: "This order can no longer be cancelled." },
      { status: 403 }
    );
  }

  const [updated] = await db
    .update(order)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(order.id, id), eq(order.userId, user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ order: updated });
}