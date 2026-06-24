import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/dashboard");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ivory-dim/50 pt-24">{children}</main>
    </>
  );
}