import AdminProtected from "@/components/authForm/AdminProtected";
import { AdminShell } from "@/components/dashboard/admin/AdminShell";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProtected>
      <AdminShell>{children}</AdminShell>
    </AdminProtected>
  );
}
