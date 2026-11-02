import { AdminPageHeader } from "@/components/dashboard/admin/AdminPageHeader";
import { TestimonialsTable } from "@/components/dashboard/admin/TestimonialsTable";

export default function AdminTestimonialsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Testimonials" description="Latest 200 testimonials from every space." />
      <TestimonialsTable />
    </div>
  );
}
