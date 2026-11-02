import Link from "next/link";
import { MessageSquareHeart } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-white">
        <MessageSquareHeart className="size-4.5" />
      </span>
      <span className="text-lg">{APP_NAME}</span>
    </Link>
  );
}
