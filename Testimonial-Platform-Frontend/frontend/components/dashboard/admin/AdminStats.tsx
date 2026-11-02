import { FolderKanban, Heart, MessageSquareText, Users, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminStats as Stats } from "@/lib/types";

export function AdminStatCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Users", value: stats.total_users, icon: Users },
    { label: "Spaces", value: stats.total_spaces, icon: FolderKanban },
    { label: "Testimonials", value: stats.total_testimonials, icon: MessageSquareText },
    { label: "Video", value: stats.video_testimonials, icon: Video },
    { label: "On walls", value: stats.liked_testimonials, icon: Heart },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <c.icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{c.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
