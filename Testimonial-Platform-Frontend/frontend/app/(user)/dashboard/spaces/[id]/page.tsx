"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Heart, Inbox, Plus, Search, Settings } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/common/Avatar";
import { CopyButton } from "@/components/common/CopyButton";
import { TestimonialCard } from "@/components/common/TestimonialCard";
import { ImportTestimonialDialog } from "@/components/dashboard/user/ImportTestimonialDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import { getSpace } from "@/app/(user)/_actions/spaceApi";
import {
  deleteTestimonial,
  getTestimonials,
  toggleArchive,
  toggleLike,
} from "@/app/(user)/_actions/testimonialApi";
import { cn, getErrorMessage, siteUrl } from "@/lib/utils";
import type { Space, Testimonial, TestimonialCounts, TestimonialFilter } from "@/lib/types";

const tabs: { key: TestimonialFilter; label: string }[] = [
  { key: "inbox", label: "All" },
  { key: "video", label: "Video" },
  { key: "text", label: "Text" },
  { key: "liked", label: "Wall of Love" },
  { key: "archived", label: "Archived" },
];

export default function SpaceInboxPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [space, setSpace] = useState<Space | null>(null);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [counts, setCounts] = useState<TestimonialCounts | null>(null);
  const [filter, setFilter] = useState<TestimonialFilter>("inbox");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getSpace(id).then(setSpace).catch((e) => {
      toast.error(getErrorMessage(e, "Space not found"));
      router.replace("/dashboard");
    });
  }, [id, router]);

  // debounce search typing
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTestimonials(id, { filter, search: query || undefined });
      setItems(res.items);
      setCounts(res.counts);
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not load testimonials"));
    } finally {
      setLoading(false);
    }
  }, [id, filter, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function onLike(t: Testimonial) {
    try {
      await toggleLike(t.id);
      toast.success(t.is_liked ? "Removed from Wall of Love" : "Added to Wall of Love ❤️");
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  }

  async function onArchive(t: Testimonial) {
    try {
      await toggleArchive(t.id);
      toast.success(t.is_archived ? "Restored to inbox" : "Archived");
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  }

  async function onDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteTestimonial(toDelete.id);
      toast.success("Testimonial deleted");
      setToDelete(null);
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setDeleting(false); }
  }

  if (!space) return <PageSpinner />;
  const link = `${siteUrl()}/s/${space.slug}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={space.name} src={space.logo} size={52} color={space.button_color} className="rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight">{space.name}</h1>
            {!space.is_active && <Badge variant="secondary">Paused</Badge>}
          </div>
          <p className="truncate text-sm text-muted-foreground">{link}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={link} label="Copy link" />
          <a href={`/s/${space.slug}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><ExternalLink /> Preview</Button>
          </a>
          <Link href={`/dashboard/spaces/${space.id}/wall`}>
            <Button variant="outline" size="sm"><Heart /> Wall of Love</Button>
          </Link>
          <Link href={`/dashboard/spaces/${space.id}/settings`}>
            <Button variant="outline" size="sm"><Settings /> Settings</Button>
          </Link>
        </div>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-full bg-muted p-1">
          {tabs.map((t) => {
            const n = counts ? (t.key === "inbox" ? counts.inbox : counts[t.key]) : undefined;
            return (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === t.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}>
                {t.label}{n !== undefined && <span className="ml-1.5 text-xs text-muted-foreground">{n}</span>}
              </button>
            );
          })}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
        </div>
        <Button onClick={() => setImportOpen(true)}><Plus /> Add testimonial</Button>
      </div>

      {/* list */}
      {loading && items.length === 0 ? (
        <div className="flex justify-center py-16"><Spinner className="size-7" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-background py-16 text-center">
          <Inbox className="size-9 text-muted-foreground" />
          <p className="font-semibold">
            {query ? "No results found" : filter === "inbox" ? "No testimonials yet" : "Nothing here"}
          </p>
          {filter === "inbox" && !query && (
            <>
              <p className="max-w-sm text-sm text-muted-foreground">
                Share your collection link with customers. New testimonials will show up here.
              </p>
              <CopyButton text={link} label="Copy collection link" />
            </>
          )}
        </div>
      ) : (
        <div className={cn("masonry columns-1 lg:columns-2", loading && "opacity-60")}>
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t}
              manage={{ onLike: () => onLike(t), onArchive: () => onArchive(t), onDelete: () => setToDelete(t) }} />
          ))}
        </div>
      )}

      <ImportTestimonialDialog open={importOpen} spaceId={space.id} onClose={() => setImportOpen(false)} onAdded={load} />
      <ConfirmDialog
        open={!!toDelete}
        loading={deleting}
        title="Delete this testimonial?"
        description={`The testimonial from ${toDelete?.name ?? ""} will be permanently removed, including any video.`}
        onConfirm={onDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
