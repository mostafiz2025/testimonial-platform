"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderKanban, LayoutDashboard, LogOut, MessageSquareText, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/spaces", label: "Spaces", icon: FolderKanban },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareText },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar p-4">
      <div className="flex items-center gap-2 px-2 py-2 text-lg font-bold">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-white">
          <ShieldCheck className="size-4.5" />
        </span>
        Admin
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((i) => (
          <Link key={i.href} href={i.href} onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === i.href ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}>
            <i.icon className="size-4.5" /> {i.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={() => { localStorage.removeItem("admin_access_token"); router.replace("/admin"); }}
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
        <LogOut className="size-4.5" /> Log out
      </button>
    </aside>
  );
}
