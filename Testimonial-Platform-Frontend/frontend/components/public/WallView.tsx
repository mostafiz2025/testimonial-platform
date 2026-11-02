"use client";

import { useEffect, useRef, useState } from "react";
import { WallOfLove } from "@/components/common/WallOfLove";
import { PageSpinner } from "@/components/ui/spinner";
import { getWall } from "@/app/(public)/_actions/publicApi";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/common/Avatar";
import type { WallData } from "@/lib/types";

/** Public Wall of Love page. `embed` removes the header and reports its height to the parent window. */
export default function WallView({ slug, embed = false }: { slug: string; embed?: boolean }) {
  const [data, setData] = useState<WallData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getWall(slug).then(setData).catch(() => setNotFound(true));
  }, [slug]);

  // tell embed.js how tall we are so the iframe can grow
  useEffect(() => {
    if (!embed || !rootRef.current) return;
    const el = rootRef.current;
    const send = () => window.parent?.postMessage({ type: "testimonial:height", slug, height: el.scrollHeight }, "*");
    const ro = new ResizeObserver(send);
    ro.observe(el);
    send();
    return () => ro.disconnect();
  }, [embed, slug, data]);

  if (notFound)
    return <p className="p-10 text-center text-sm text-muted-foreground">This Wall of Love is not available.</p>;
  if (!data) return <PageSpinner />;

  const { space } = data;
  const dark = space.wall_theme === "dark";

  return (
    <div ref={rootRef} className={cn(!embed && "min-h-screen", dark ? "bg-neutral-950" : "bg-neutral-50")}>
      {!embed && (
        <header className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 pt-12 text-center">
          <Avatar name={space.name} src={space.logo} size={56} color={space.button_color} className="rounded-2xl" />
          <h1 className={cn("text-3xl font-bold tracking-tight", dark ? "text-white" : "text-neutral-900")}>
            Wall of Love for {space.name}
          </h1>
          <p className={dark ? "text-neutral-400" : "text-neutral-500"}>
            {data.testimonials.length} happy customer{data.testimonials.length === 1 ? "" : "s"}
          </p>
        </header>
      )}
      <div className={cn(!embed && "mx-auto max-w-6xl py-6")}>
        <WallOfLove
          testimonials={data.testimonials}
          theme={space.wall_theme}
          layout={space.wall_layout}
          showRating={space.wall_show_rating}
          showDate={space.wall_show_date}
          showBranding={space.wall_show_branding}
        />
      </div>
    </div>
  );
}
