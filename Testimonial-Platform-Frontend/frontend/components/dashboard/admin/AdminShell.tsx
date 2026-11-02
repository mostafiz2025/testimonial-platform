"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="sticky top-0 hidden h-screen lg:block"><AdminSidebar /></div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative"><AdminSidebar onNavigate={() => setOpen(false)} /></div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center border-b bg-background px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-full p-2 hover:bg-muted" aria-label="Menu">
            <Menu className="size-5" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
