import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminSessionProvider } from "@/components/admin-session-provider";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <AdminSessionProvider>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
