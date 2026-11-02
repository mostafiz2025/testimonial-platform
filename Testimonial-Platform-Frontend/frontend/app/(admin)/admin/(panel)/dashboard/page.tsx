"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/dashboard/admin/AdminPageHeader";
import { AdminStatCards } from "@/components/dashboard/admin/AdminStats";
import { PageSpinner } from "@/components/ui/spinner";
import { getAdminStats } from "@/app/(admin)/_actions/adminApi";
import { getErrorMessage } from "@/lib/utils";
import type { AdminStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => { getAdminStats().then(setStats).catch((e) => toast.error(getErrorMessage(e))); }, []);
  if (!stats) return <PageSpinner />;
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Platform overview" description="Everything happening across all accounts." />
      <AdminStatCards stats={stats} />
    </div>
  );
}
