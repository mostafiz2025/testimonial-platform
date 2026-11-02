"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Td } from "@/components/dashboard/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { deleteAdminSpace, getAdminSpaces } from "@/app/(admin)/_actions/adminApi";
import { getErrorMessage } from "@/lib/utils";
import type { Space } from "@/lib/types";

export function SpacesTable() {
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [target, setTarget] = useState<Space | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => getAdminSpaces().then(setSpaces).catch((e) => toast.error(getErrorMessage(e)));
  useEffect(() => { load(); }, []);

  async function remove() {
    if (!target) return;
    setBusy(true);
    try {
      await deleteAdminSpace(target.id);
      toast.success("Space deleted");
      setTarget(null);
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setBusy(false); }
  }

  if (!spaces) return <PageSpinner />;

  return (
    <>
      <DataTable head={["Space", "Owner", "Testimonials", "Status", "Created", ""]} empty={spaces.length === 0}>
        {spaces.map((s) => (
          <tr key={s.id}>
            <Td>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">/s/{s.slug}</p>
            </Td>
            <Td>{s.owner ? <><p>{s.owner.name}</p><p className="text-xs text-muted-foreground">{s.owner.email}</p></> : "–"}</Td>
            <Td>{s.testimonials_count ?? 0}</Td>
            <Td><Badge variant={s.is_active ? "success" : "secondary"}>{s.is_active ? "Live" : "Paused"}</Badge></Td>
            <Td>{new Date(s.created_at).toLocaleDateString()}</Td>
            <Td>
              <div className="flex justify-end gap-1">
                <a href={`/s/${s.slug}`} target="_blank" rel="noreferrer">
                  <Button size="icon-sm" variant="outline" aria-label="Open"><ExternalLink /></Button>
                </a>
                <Button size="icon-sm" variant="destructive" aria-label="Delete space" onClick={() => setTarget(s)}><Trash2 /></Button>
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
      <ConfirmDialog open={!!target} loading={busy} title={`Delete "${target?.name}"?`}
        description="The space and all its testimonials will be permanently removed."
        onConfirm={remove} onClose={() => setTarget(null)} />
    </>
  );
}
