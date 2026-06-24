import { db } from "@/db";
import { order } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";
import type { DashboardOrder } from "@/components/dashboard/order-row";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/dashboard");

  const rows = await db
    .select()
    .from(order)
    .where(eq(order.userId, user.id))
    .orderBy(desc(order.createdAt));

  const orders: DashboardOrder[] = rows.map((o) => ({
    id: o.id,
    status: o.status,
    totalKobo: o.totalKobo,
    createdAt: o.createdAt.toISOString(),
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
  }));

  return <DashboardShell initialOrders={orders} />;
}