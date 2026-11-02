import { AdminPageHeader } from "@/components/dashboard/admin/AdminPageHeader";
import { UsersTable } from "@/components/dashboard/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Users" description="Manage accounts: ban or remove users." />
      <UsersTable />
    </div>
  );
}
