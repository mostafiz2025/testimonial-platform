"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { TestimonialCard } from "@/components/common/TestimonialCard";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Testimonial, WallLayout, WallTheme } from "@/lib/types";

interface Props {
  testimonials: Testimonial[];
  theme: WallTheme;
  layout: WallLayout;
  showRating: boolean;
  showDate: boolean;
  showBranding: boolean;
  /** shown when there are no testimonials yet */
  emptyText?: string;
}

/** Used by the public wall page, the embed page and the dashboard preview */
export function WallOfLove({
  testimonials,
  theme,
  layout,
  showRating,
  showDate,
  showBranding,
  emptyText = "No testimonials on the wall yet.",
}: Props) {
  const dark = theme === "dark";

  return (
    <div className={cn("w-full p-4 sm:p-6", dark ? "bg-neutral-950" : "bg-neutral-50")}>
      {testimonials.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center gap-2 rounded-3xl border border-dashed py-16 text-center",
            dark ? "border-white/15 text-neutral-400" : "border-neutral-300 text-neutral-500",
          )}
        >
          <Heart className="size-8" />
          <p className="text-sm">{emptyText}</p>
        </div>
      ) : (
        <div
          className={cn(
            layout === "masonry"
              ? "masonry columns-1 sm:columns-2 lg:columns-3"
              : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} t={t} theme={theme} showRating={showRating} showDate={showDate} />
          ))}
        </div>
      )}

      {showBranding && (
        <p className={cn("mt-6 text-center text-xs", dark ? "text-neutral-500" : "text-neutral-400")}>
          Collected with{" "}
          <Link href="/" target="_blank" className="font-semibold underline-offset-2 hover:underline">
            {APP_NAME}
          </Link>
        </p>
      )}
    </div>
  );
}
