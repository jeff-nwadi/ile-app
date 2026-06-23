import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/roles";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/sign-in");
  if (!isAdmin(user)) redirect("/sign-in");

  return (
    <AdminLayoutClient user={{ name: user.name, email: user.email }}>
      {children}
    </AdminLayoutClient>
  );
}
