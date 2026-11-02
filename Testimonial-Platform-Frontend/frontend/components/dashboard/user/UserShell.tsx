"use client";

import { useState } from "react";
import { UserHeader } from "@/components/dashboard/user/UserHeader";
import { UserSidebar } from "@/components/dashboard/user/UserSidebar";

export function UserShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="sticky top-0 hidden h-screen lg:block">
        <UserSidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative">
            <UserSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <UserHeader onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
