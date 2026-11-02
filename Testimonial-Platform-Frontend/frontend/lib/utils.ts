import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNowStrict } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

/** Public origin of the frontend (used for share links + embed code) */
export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5000";
}

/** "videos/abc.webm" -> "http://localhost:7000/uploads/videos/abc.webm" */
export function assetUrl(path?: string | null) {
  if (!path) return undefined;
  return `${API_URL}/uploads/${path}`;
}

export function timeAgo(date: string | Date) {
  return `${formatDistanceToNowStrict(new Date(date))} ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Turns an axios / Nest error into a readable string */
export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  if (e?.message === "Network Error") return "Cannot reach the server. Is the backend running?";
  return fallback;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
