import { OrdersManager } from "@/components/admin/orders-manager";
import { AdminPageHeader } from "@/components/admin/admin-layout-client";

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Track payments and move orders through the kitchen flow."
      />
      <main className="px-8 py-8">
        <OrdersManager />
      </main>
    </>
  );
}
