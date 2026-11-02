import { Folder, Heart, MessageSquareText, Star, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { UserStats as Stats } from "@/lib/types";

export function UserStatCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Spaces", value: stats.total_spaces, icon: Folder },
    { label: "Testimonials", value: stats.total_testimonials, icon: MessageSquareText },
    { label: "Video", value: stats.video_testimonials, icon: Video },
    { label: "On Wall of Love", value: stats.liked_testimonials, icon: Heart },
    { label: "Average rating", value: stats.average_rating ? stats.average_rating.toFixed(1) : "–", icon: Star },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <c.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none">{c.value}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ActivityChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div>
      <div className="flex h-32 items-end gap-1.5">
        {data.map((d) => (
          <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end">
            <span className="absolute -top-6 hidden rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block">
              {d.count}
            </span>
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all group-hover:bg-primary"
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.25 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{data[0]?.day.slice(5)}</span>
        <span>{data[data.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}
