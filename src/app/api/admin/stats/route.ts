import { db } from "@/db";
import { menuItem, order, reservation } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { count, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const today = new Date().toISOString().slice(0, 10);

  const [[menuStats], [reservationStats], [orderStats], [todayReservations]] =
    await Promise.all([
      db
        .select({
          total: count(),
          available: sql<number>`count(*) filter (where ${menuItem.available} = true)`,
        })
        .from(menuItem),
      db
        .select({
          total: count(),
          pending: sql<number>`count(*) filter (where ${reservation.status} = 'requested')`,
        })
        .from(reservation),
      db
        .select({
          total: count(),
          pending: sql<number>`count(*) filter (where ${order.status} = 'pending_payment')`,
        })
        .from(order),
      db
        .select({ count: count() })
        .from(reservation)
        .where(sql`${reservation.date} = ${today}`),
    ]);

  return NextResponse.json({
    menu: {
      total: menuStats.total,
      available: Number(menuStats.available),
    },
    reservations: {
      total: reservationStats.total,
      pending: Number(reservationStats.pending),
      today: todayReservations.count,
    },
    orders: {
      total: orderStats.total,
      pending: Number(orderStats.pending),
    },
  });
}
