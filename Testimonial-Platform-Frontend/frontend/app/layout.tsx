import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Collect text and video testimonials with a simple link, then show them off with a beautiful Wall of Love you can embed anywhere.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
