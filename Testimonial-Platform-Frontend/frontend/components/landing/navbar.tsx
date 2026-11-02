"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how" },
  { label: "Wall of Love", href: "/#wall" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((i) => (
            <Link key={i.href} href={i.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {i.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <Link href="/dashboard">
              <Button>Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Get started free</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t px-4 py-4 md:hidden">
          {navItems.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="text-sm">
              {i.label}
            </Link>
          ))}
          <Link href={loggedIn ? "/dashboard" : "/login"}>
            <Button variant="outline" className="w-full">
              {loggedIn ? "Dashboard" : "Log in"}
            </Button>
          </Link>
          {!loggedIn && (
            <Link href="/register">
              <Button className="w-full">Get started free</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
