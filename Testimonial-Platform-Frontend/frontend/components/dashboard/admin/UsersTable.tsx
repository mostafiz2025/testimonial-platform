"use client";

import { useEffect, useState } from "react";
import { Ban, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/common/Avatar";
import { DataTable, Td } from "@/components/dashboard/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { deleteUser, getAdminUsers, toggleBanUser } from "@/app/(admin)/_actions/adminApi";
import { getErrorMessage } from "@/lib/utils";
import type { UserSummary } from "@/lib/types";

export function UsersTable() {
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [target, setTarget] = useState<UserSummary | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => getAdminUsers().then(setUsers).catch((e) => toast.error(getErrorMessage(e)));
  useEffect(() => { load(); }, []);

  async function ban(u: UserSummary) {
    try {
      const r = await toggleBanUser(u.id);
      toast.success(r.is_banned ? "User banned" : "User unbanned");
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  }

  async function remove() {
    if (!target) return;
    setBusy(true);
    try {
      await deleteUser(target.id);
      toast.success("User deleted");
      setTarget(null);
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setBusy(false); }
  }

  if (!users) return <PageSpinner />;

  return (
    <>
      <DataTable head={["User", "Company", "Spaces", "Joined", "Status", ""]} empty={users.length === 0}>
        {users.map((u) => (
          <tr key={u.id}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={u.name} src={u.profile_image} size={34} />
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            </Td>
            <Td>{u.company || "–"}</Td>
            <Td>{u.spaces_count ?? 0}</Td>
            <Td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "–"}</Td>
            <Td><Badge variant={u.is_banned ? "destructive" : "success"}>{u.is_banned ? "Banned" : "Active"}</Badge></Td>
            <Td>
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="outline" onClick={() => ban(u)}>
                  {u.is_banned ? <CheckCircle2 /> : <Ban />} {u.is_banned ? "Unban" : "Ban"}
                </Button>
                <Button size="icon-sm" variant="destructive" aria-label="Delete user" onClick={() => setTarget(u)}>
                  <Trash2 />
                </Button>
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
      <ConfirmDialog open={!!target} loading={busy} title={`Delete ${target?.name}?`}
        description="The user, all of their spaces and every testimonial will be permanently removed."
        onConfirm={remove} onClose={() => setTarget(null)} />
    </>
  );
}
