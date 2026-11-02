/* eslint-disable @next/next/no-img-element */
"use client";

import { Archive, ArchiveRestore, Heart, Trash2, Video } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { StarRating } from "@/components/common/StarRating";
import { Badge } from "@/components/ui/badge";
import { assetUrl, cn, timeAgo } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";

interface Props {
  t: Testimonial;
  theme?: "light" | "dark";
  showRating?: boolean;
  showDate?: boolean;
  /** dashboard mode shows heart / archive / delete buttons */
  manage?: {
    onLike: () => void;
    onArchive: () => void;
    onDelete: () => void;
  };
}

export function TestimonialCard({ t, theme = "light", showRating = true, showDate = true, manage }: Props) {
  const dark = theme === "dark";
  const role = [t.job_title, t.company].filter(Boolean).join(" at ");

  return (
    <article
      className={cn(
        "rounded-3xl border p-5 shadow-sm",
        dark ? "border-white/10 bg-neutral-900 text-neutral-100" : "border-neutral-200 bg-white text-neutral-900",
      )}
    >
      {manage && (
        <div className="mb-3 flex items-center gap-2">
          <Badge variant={t.type === "video" ? "default" : "secondary"}>
            {t.type === "video" ? <Video className="size-3" /> : null}
            {t.type === "video" ? "Video" : "Text"}
          </Badge>
          {t.source === "imported" && <Badge variant="warning">Imported</Badge>}
          {t.is_liked && <Badge variant="destructive">On wall</Badge>}
        </div>
      )}

      {showRating && t.rating ? <StarRating value={t.rating} size={16} className="mb-3" /> : null}

      {t.type === "video" && t.video && (
        <video
          src={assetUrl(t.video)}
          controls
          preload="metadata"
          className="mb-3 aspect-video w-full rounded-2xl bg-black object-cover"
        />
      )}

      {t.message && (
        <p className={cn("text-[15px] leading-relaxed whitespace-pre-line", dark ? "text-neutral-200" : "text-neutral-700")}>
          {t.message}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Avatar name={t.name} src={t.photo} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{t.name}</p>
          {role && <p className={cn("truncate text-xs", dark ? "text-neutral-400" : "text-neutral-500")}>{role}</p>}
        </div>
        {showDate && (
          <span className={cn("ml-auto shrink-0 text-xs", dark ? "text-neutral-500" : "text-neutral-400")}>
            {timeAgo(t.created_at)}
          </span>
        )}
      </div>

      {manage && (
        <div className="mt-4 flex items-center gap-1 border-t border-neutral-100 pt-3">
          {t.email && <span className="mr-auto truncate text-xs text-neutral-400">{t.email}</span>}
          {!t.email && <span className="mr-auto" />}
          {!t.is_archived && (
            <button
              onClick={manage.onLike}
              title={t.is_liked ? "Remove from Wall of Love" : "Add to Wall of Love"}
              className={cn(
                "rounded-full p-2 transition-colors hover:bg-rose-50",
                t.is_liked ? "text-rose-500" : "text-neutral-400",
              )}
            >
              <Heart className={cn("size-4.5", t.is_liked && "fill-rose-500")} />
            </button>
          )}
          <button
            onClick={manage.onArchive}
            title={t.is_archived ? "Restore" : "Archive"}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            {t.is_archived ? <ArchiveRestore className="size-4.5" /> : <Archive className="size-4.5" />}
          </button>
          <button
            onClick={manage.onDelete}
            title="Delete"
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="size-4.5" />
          </button>
        </div>
      )}
    </article>
  );
}
