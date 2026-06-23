import { ReservationsManager } from "@/components/admin/reservations-manager";
import { AdminPageHeader } from "@/components/admin/admin-layout-client";

export default function AdminReservationsPage() {
  return (
    <>
      <AdminPageHeader
        title="Reservations"
        description="Review table requests and confirm or cancel bookings."
      />
      <main className="px-8 py-8">
        <ReservationsManager />
      </main>
    </>
  );
}
