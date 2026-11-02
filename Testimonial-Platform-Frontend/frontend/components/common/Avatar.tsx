/* eslint-disable @next/next/no-img-element */
import { assetUrl, cn, initials } from "@/lib/utils";

interface Props {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  color?: string;
}

export function Avatar({ name, src, size = 40, className, color }: Props) {
  const url = assetUrl(src);
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38, backgroundColor: color || undefined }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white",
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
