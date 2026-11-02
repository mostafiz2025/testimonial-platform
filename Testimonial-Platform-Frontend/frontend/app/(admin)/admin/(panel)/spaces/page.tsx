import { AdminPageHeader } from "@/components/dashboard/admin/AdminPageHeader";
import { SpacesTable } from "@/components/dashboard/admin/SpacesTable";

export default function AdminSpacesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Spaces" description="All spaces created on the platform." />
      <SpacesTable />
    </div>
  );
}
