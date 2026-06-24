import { GalleryManager } from "@/components/admin/gallery-manager";
import { AdminPageHeader } from "@/components/admin/admin-layout-client";

export default function AdminGalleryPage() {
  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Manage photos displayed on the home page."
      />
      <main className="px-8 py-8">
        <GalleryManager />
      </main>
    </>
  );
}
