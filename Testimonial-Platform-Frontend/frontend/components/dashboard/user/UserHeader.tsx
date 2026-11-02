"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { getStoredUser } from "@/app/(user)/_actions/authAction";
import type { UserSummary } from "@/lib/types";

export function UserHeader({ onMenu }: { onMenu: () => void }) {
  const [user, setUser] = useState<UserSummary | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    const sync = () => setUser(getStoredUser());
    window.addEventListener("user-updated", sync);
    return () => window.removeEventListener("user-updated", sync);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:justify-end">
      <button className="rounded-full p-2 hover:bg-muted lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="size-5" />
      </button>
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Avatar name={user.name} src={user.profile_image} size={36} />
        </div>
      )}
    </header>
  );
}
