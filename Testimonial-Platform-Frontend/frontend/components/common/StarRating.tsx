"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  className?: string;
}

/** Read-only stars when `onChange` is missing, clickable stars otherwise */
export function StarRating({ value, onChange, size = 18, className }: Props) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Star
            style={{ width: size, height: size }}
            className={cn(
              n <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-300",
            )}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}
