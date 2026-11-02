import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-primary px-6 py-14 text-center text-white">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to collect your first testimonial?</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Create your free account and have your collection page live in under two minutes.
        </p>
        <Link href="/register">
          <Button size="lg" className="mt-8 h-12 bg-white px-8 text-base text-primary hover:bg-white/90">
            Get started free
          </Button>
        </Link>
      </div>
    </section>
  );
}
