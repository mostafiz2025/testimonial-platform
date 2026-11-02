"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "@/components/common/StarRating";
import { DataTable, Td } from "@/components/dashboard/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { deleteAdminTestimonial, getAdminTestimonials } from "@/app/(admin)/_actions/adminApi";
import { getErrorMessage } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";

export function TestimonialsTable() {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [target, setTarget] = useState<Testimonial | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => getAdminTestimonials().then(setItems).catch((e) => toast.error(getErrorMessage(e)));
  useEffect(() => { load(); }, []);

  async function remove() {
    if (!target) return;
    setBusy(true);
    try {
      await deleteAdminTestimonial(target.id);
      toast.success("Testimonial deleted");
      setTarget(null);
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setBusy(false); }
  }

  if (!items) return <PageSpinner />;

  return (
    <>
      <DataTable head={["From", "Space", "Type", "Rating", "Message", "Date", ""]} empty={items.length === 0}>
        {items.map((t) => (
          <tr key={t.id}>
            <Td><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.email || ""}</p></Td>
            <Td>{t.space?.name ?? "–"}</Td>
            <Td><Badge variant={t.type === "video" ? "default" : "secondary"}>{t.type}</Badge></Td>
            <Td>{t.rating ? <StarRating value={t.rating} size={13} /> : "–"}</Td>
            <Td className="max-w-xs"><p className="line-clamp-2 text-muted-foreground">{t.message || "(video only)"}</p></Td>
            <Td>{new Date(t.created_at).toLocaleDateString()}</Td>
            <Td>
              <div className="flex justify-end">
                <Button size="icon-sm" variant="destructive" aria-label="Delete" onClick={() => setTarget(t)}><Trash2 /></Button>
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
      <ConfirmDialog open={!!target} loading={busy} title="Delete this testimonial?"
        description="It will be permanently removed, including any video."
        onConfirm={remove} onClose={() => setTarget(null)} />
    </>
  );
}
