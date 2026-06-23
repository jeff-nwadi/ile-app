import { MenuManager } from "@/components/admin/menu-manager";
import { AdminPageHeader } from "@/components/admin/admin-layout-client";

export default function AdminMenuPage() {
  return (
    <>
      <AdminPageHeader
        title="Menu"
        description="Manage dishes, pricing, and visibility on the public menu."
      />
      <main className="px-8 py-8">
        <MenuManager />
      </main>
    </>
  );
}
