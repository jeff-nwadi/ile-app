import { db } from "@/db";
import { order, orderItem } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  OrderDetail,
  type DashboardOrderDetail,
  type DashboardOrderItem,
} from "@/components/dashboard/order-detail";

export default async function DashboardOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { id } = await params;
  const [found] = await db.select().from(order).where(eq(order.id, id));
  if (!found) notFound();
  if (!isAdmin(user) && found.userId !== user.id) notFound();

  const items = (await db
    .select()
    .from(orderItem)
    .where(eq(orderItem.orderId, id))) as DashboardOrderItem[];

  const detail: DashboardOrderDetail = {
    id: found.id,
    status: found.status,
    totalKobo: found.totalKobo,
    createdAt: found.createdAt.toISOString(),
    updatedAt: found.updatedAt.toISOString(),
    customerName: found.customerName,
    customerEmail: found.customerEmail,
    customerPhone: found.customerPhone,
    notes: found.notes,
    paystackReference: found.paystackReference,
  };

  return <OrderDetail order={detail} items={items} />;
}