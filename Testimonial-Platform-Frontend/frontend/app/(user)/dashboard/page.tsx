"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/ui/spinner";
import { ActivityChart, UserStatCards } from "@/components/dashboard/user/UserStats";
import { SpaceCard } from "@/components/dashboard/user/SpaceCard";
import { getSpaces, getStats } from "@/app/(user)/_actions/spaceApi";
import { getStoredUser } from "@/app/(user)/_actions/authAction";
import { getErrorMessage } from "@/lib/utils";
import type { Space, UserStats } from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    setName(getStoredUser()?.name.split(" ")[0] ?? "");
    Promise.all([getStats(), getSpaces()])
      .then(([s, sp]) => {
        setStats(s);
        setSpaces(sp);
      })
      .catch((e) => toast.error(getErrorMessage(e, "Could not load your dashboard")));
  }, []);

  if (!stats || !spaces) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi{name ? `, ${name}` : ""} 👋</h1>
          <p className="text-muted-foreground">Here is what is happening with your testimonials.</p>
        </div>
        <Link href="/dashboard/spaces/new">
          <Button><Plus /> New space</Button>
        </Link>
      </div>

      <UserStatCards stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>New testimonials (last 14 days)</CardTitle>
          <CardDescription>{stats.last_7_days} received in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityChart data={stats.per_day} />
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Your spaces</h2>
        {spaces.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-lg font-semibold">Create your first space</p>
              <p className="max-w-md text-sm text-muted-foreground">
                A space is a project or product. Each one gets its own collection link and Wall of Love.
              </p>
              <Link href="/dashboard/spaces/new">
                <Button><Plus /> Create a space</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {spaces.map((s) => <SpaceCard key={s.id} space={s} />)}
          </div>
        )}
      </section>
    </div>
  );
}
