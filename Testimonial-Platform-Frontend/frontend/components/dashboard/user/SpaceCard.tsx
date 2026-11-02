import Link from "next/link";
import { ExternalLink, MessageSquareText, Settings } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { CopyButton } from "@/components/common/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { siteUrl } from "@/lib/utils";
import type { Space } from "@/lib/types";

export function SpaceCard({ space }: { space: Space }) {
  const link = `${siteUrl()}/s/${space.slug}`;
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar name={space.name} src={space.logo} size={44} color={space.button_color} className="rounded-2xl" />
          <div className="min-w-0 flex-1">
            <Link href={`/dashboard/spaces/${space.id}`} className="block truncate text-base font-semibold hover:text-primary">
              {space.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">/s/{space.slug}</p>
          </div>
          <Badge variant={space.is_active ? "success" : "secondary"}>{space.is_active ? "Live" : "Paused"}</Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquareText className="size-4" />
          {space.testimonials_count ?? 0} testimonial{space.testimonials_count === 1 ? "" : "s"}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/spaces/${space.id}`} className="inline-flex">
            <span className="inline-flex h-8 items-center rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">
              Open inbox
            </span>
          </Link>
          <CopyButton text={link} label="Copy link" />
          <a href={`/s/${space.slug}`} target="_blank" rel="noreferrer" title="Open collection page"
            className="inline-flex size-8 items-center justify-center rounded-full border hover:bg-muted">
            <ExternalLink className="size-4" />
          </a>
          <Link href={`/dashboard/spaces/${space.id}/settings`} title="Settings"
            className="inline-flex size-8 items-center justify-center rounded-full border hover:bg-muted">
            <Settings className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
