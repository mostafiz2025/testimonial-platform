"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/common/CopyButton";
import { WallOfLove } from "@/components/common/WallOfLove";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { getSpace, updateSpace } from "@/app/(user)/_actions/spaceApi";
import { getTestimonials } from "@/app/(user)/_actions/testimonialApi";
import { cn, getErrorMessage, siteUrl } from "@/lib/utils";
import type { Space, Testimonial, WallLayout, WallTheme } from "@/lib/types";

function Segmented<T extends string>({
  value, options, onChange,
}: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-full bg-muted p-1">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn("rounded-full px-4 py-1.5 text-sm font-medium",
            value === o.value ? "bg-background shadow-sm" : "text-muted-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function WallSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);
  const [liked, setLiked] = useState<Testimonial[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all([getSpace(id), getTestimonials(id, { filter: "liked", limit: 100 })])
      .then(([s, t]) => { setSpace(s); setLiked(t.items); })
      .catch((e) => { toast.error(getErrorMessage(e, "Space not found")); router.replace("/dashboard"); });
  }, [id, router]);

  if (!space) return <PageSpinner />;

  function patch<K extends "wall_theme" | "wall_layout" | "wall_show_rating" | "wall_show_date" | "wall_show_branding">(
    k: K, v: Space[K],
  ) {
    setSpace((s) => (s ? { ...s, [k]: v } : s));
    setDirty(true);
  }

  async function save() {
    if (!space) return;
    setSaving(true);
    try {
      await updateSpace(space.id, {
        wall_theme: space.wall_theme, wall_layout: space.wall_layout,
        wall_show_rating: space.wall_show_rating, wall_show_date: space.wall_show_date,
        wall_show_branding: space.wall_show_branding,
      });
      toast.success("Wall of Love saved");
      setDirty(false);
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSaving(false); }
  }

  const origin = siteUrl();
  const wallUrl = `${origin}/w/${space.slug}`;
  const scriptCode = `<script src="${origin}/embed.js" data-slug="${space.slug}" async></script>`;
  const iframeCode = `<iframe src="${origin}/embed/${space.slug}" style="width:100%;height:700px;border:0" loading="lazy"></iframe>`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link href={`/dashboard/spaces/${space.id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to {space.name}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wall of Love</h1>
            <p className="text-muted-foreground">
              Testimonials you heart ❤️ in your inbox appear here ({liked.length} so far).
            </p>
          </div>
          <div className="flex gap-2">
            <a href={`/w/${space.slug}`} target="_blank" rel="noreferrer">
              <Button variant="outline"><ExternalLink /> Open public wall</Button>
            </a>
            <Button onClick={save} disabled={saving || !dirty}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium">Theme</p>
                <Segmented<WallTheme> value={space.wall_theme} onChange={(v) => patch("wall_theme", v)}
                  options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Layout</p>
                <Segmented<WallLayout> value={space.wall_layout} onChange={(v) => patch("wall_layout", v)}
                  options={[{ value: "masonry", label: "Masonry" }, { value: "grid", label: "Grid" }]} />
              </div>
              {([
                ["wall_show_rating", "Show star rating"],
                ["wall_show_date", "Show date"],
                ["wall_show_branding", "Show “Collected with” credit"],
              ] as const).map(([k, label]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <span className="text-sm">{label}</span>
                  <Switch aria-label={label} checked={space[k]} onCheckedChange={(v) => patch(k, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share & embed</CardTitle>
              <CardDescription>Paste this on any website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Script (auto-resizes)</p>
                <pre className="overflow-x-auto rounded-2xl bg-muted p-3 text-xs">{scriptCode}</pre>
                <CopyButton text={scriptCode} label="Copy script" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Or iframe</p>
                <pre className="overflow-x-auto rounded-2xl bg-muted p-3 text-xs whitespace-pre-wrap">{iframeCode}</pre>
                <CopyButton text={iframeCode} label="Copy iframe" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Public link</p>
                <p className="truncate text-sm">{wallUrl}</p>
                <CopyButton text={wallUrl} label="Copy link" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Preview</p>
          <div className="overflow-hidden rounded-3xl border">
            <WallOfLove
              testimonials={liked}
              theme={space.wall_theme}
              layout={space.wall_layout}
              showRating={space.wall_show_rating}
              showDate={space.wall_show_date}
              showBranding={space.wall_show_branding}
              emptyText="Heart a testimonial in your inbox and it will show up here."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
