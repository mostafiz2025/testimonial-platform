"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, PlusCircle, UserCircle } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { clearSession } from "@/app/(user)/_actions/authAction";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/spaces/new", label: "New space", icon: PlusCircle },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export function UserSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar p-4">
      <div className="px-2 py-2">
        <Logo href="/dashboard" />
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((i) => {
          const active = i.href === "/dashboard" ? pathname === i.href || pathname.startsWith("/dashboard/spaces/") && !pathname.endsWith("/new") : pathname === i.href;
          return (
            <Link
              key={i.href}
              href={i.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <i.icon className="size-4.5" />
              {i.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4.5" /> Log out
      </button>
    </aside>
  );
}
