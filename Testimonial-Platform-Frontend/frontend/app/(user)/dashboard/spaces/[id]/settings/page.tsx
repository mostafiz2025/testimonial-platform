"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SpaceForm } from "@/components/dashboard/user/SpaceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { deleteSpace, getSpace } from "@/app/(user)/_actions/spaceApi";
import { getErrorMessage } from "@/lib/utils";
import type { Space } from "@/lib/types";

export default function SpaceSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    getSpace(id).then(setSpace).catch((e) => {
      toast.error(getErrorMessage(e, "Space not found"));
      router.replace("/dashboard");
    });
  }, [id, router]);

  async function onDelete() {
    setDeleting(true);
    try {
      await deleteSpace(id);
      toast.success("Space deleted");
      router.replace("/dashboard");
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleting(false);
    }
  }

  if (!space) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link href={`/dashboard/spaces/${space.id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to {space.name}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Space settings</h1>
      </div>

      {/* key remounts the form after a successful save so it re-reads fresh values */}
      <SpaceForm key={version} mode="edit" initial={space} onSaved={(s) => { setSpace(s); setVersion((v) => v + 1); }} />

      <Card className="border-destructive/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-destructive">Delete this space</p>
            <p className="text-sm text-muted-foreground">
              Permanently removes the space and all of its testimonials, photos and videos.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setConfirm(true)}>
            <Trash2 /> Delete space
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm}
        loading={deleting}
        title={`Delete "${space.name}"?`}
        description="This cannot be undone. All testimonials in this space will be lost."
        confirmLabel="Yes, delete it"
        onConfirm={onDelete}
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}
