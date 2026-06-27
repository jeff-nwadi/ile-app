import "server-only";
import { db } from "@/db";
import { menuItem, order, orderItem } from "@/db/schema";
import { paystackInitialize } from "@/lib/paystack";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { protect, isDenied } from "@/lib/arcjet";
import { safeError } from "@/lib/errors";
import { inArray, desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// GET /api/orders — admin sees all, customer sees their own
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return safeError(401, "Unauthorized");
  }
  const rows = isAdmin(user)
    ? await db.select().from(order).orderBy(desc(order.createdAt))
    : await db
        .select()
        .from(order)
        .where(eq(order.userId, user.id))
        .orderBy(desc(order.createdAt));
  return NextResponse.json({ orders: rows });
}

const cartSchema = z.object({
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email().max(254),
  customerPhone: z.string().min(7).max(32),
  notes: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(50),
});

// POST /api/orders — create order (pending_payment) + Paystack checkout link
export async function POST(req: NextRequest) {
  try {
    const decision = await protect(req, "order");
    if (isDenied(decision)) {
      return safeError(429, "Too many requests. Try again later.");
    }
  } catch {
    // Fail open on Arcjet errors.
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return safeError(400, "Invalid JSON");
  }

  const parsed = cartSchema.safeParse(body);
  if (!parsed.success) {
    return safeError(400, "Invalid request", parsed.error.flatten());
  }
  const { customerName, customerEmail, customerPhone, notes, items } = parsed.data;

  // Re-fetch prices server-side — never trust client-submitted prices.
  const ids = items.map((i) => i.menuItemId);
  const dbItems = await db.select().from(menuItem).where(inArray(menuItem.id, ids));
  const itemMap = new Map(dbItems.map((i) => [i.id, i]));

  for (const i of items) {
    const found = itemMap.get(i.menuItemId);
    if (!found || !found.available) {
      return safeError(400, `Item unavailable: ${i.menuItemId}`);
    }
  }

  const totalKobo = items.reduce((sum, i) => {
    const found = itemMap.get(i.menuItemId)!;
    return sum + found.priceKobo * i.quantity;
  }, 0);

  const user = await getCurrentUser();
  const reference = `ile_${randomUUID().replace(/-/g, "")}`;

  const [createdOrder] = await db
    .insert(order)
    .values({
      userId: user?.id ?? null,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      totalKobo,
      paystackReference: reference,
      status: "pending_payment",
    })
    .returning();

  await db.insert(orderItem).values(
    items.map((i) => {
      const found = itemMap.get(i.menuItemId)!;
      return {
        orderId: createdOrder.id,
        menuItemId: found.id,
        nameSnapshot: found.name,
        priceKoboSnapshot: found.priceKobo,
        quantity: i.quantity,
      };
    }),
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ile-app-ivory.vercel.app";
  const paystackRes = await paystackInitialize({
    email: customerEmail,
    amountKobo: totalKobo,
    reference,
    callbackUrl: `${appUrl}/checkout/success?ref=${reference}`,
    metadata: { orderId: createdOrder.id },
  });

  return NextResponse.json(
    {
      order: createdOrder,
      checkoutUrl: paystackRes.data.authorization_url,
    },
    { status: 201 },
  );
}
