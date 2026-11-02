import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { APP_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <Logo />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">Log in</Link>
          <Link href="/register" className="hover:text-foreground">Sign up</Link>
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
