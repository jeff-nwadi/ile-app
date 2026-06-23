import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminPageHeader } from "@/components/admin/admin-layout-client";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="A snapshot of tonight's service — menu, reservations, and orders."
      />
      <main className="px-8 py-8">
        <AdminOverview />
      </main>
    </>
  );
}
