import Link from "next/link";
import { ArrowRight, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[500px] bg-[radial-gradient(ellipse_at_center,var(--color-indigo-200),transparent_70%)] opacity-60" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" /> No code. No design skills. No hassle.
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Get testimonials from your customers <span className="text-primary">with ease</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Collect text and video testimonials with a single link. Pick the best ones, and show them
            off on your website with a beautiful Wall of Love in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button size="lg" className="h-12 px-6 text-base">
                Try it for free <ArrowRight />
              </Button>
            </Link>
            <Link href="/#how">
              <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                <Play /> See how it works
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Free to start · No credit card required</p>
        </div>

        {/* mock of the collection page */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border bg-background p-8 shadow-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
              A
            </div>
            <h3 className="mt-5 text-center text-xl font-bold">Share your experience with Acme</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              We would love to hear what you think. It only takes a minute!
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">•</span> How has Acme helped you?</li>
              <li className="flex gap-2"><span className="text-primary">•</span> What is the best thing about it?</li>
            </ul>
            <div className="mt-6 space-y-3">
              <div className="flex h-11 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                Record a video
              </div>
              <div className="flex h-11 items-center justify-center rounded-full border text-sm font-medium">
                Send a text
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border bg-background p-3 shadow-lg sm:block">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} className="size-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">&ldquo;Setup took 2 minutes!&rdquo;</p>
          </div>
        </div>
      </div>
    </section>
  );
}
