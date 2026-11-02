import { TestimonialCard } from "@/components/common/TestimonialCard";
import type { Testimonial } from "@/lib/types";

const demo: Testimonial[] = [
  { id: 1, type: "text", name: "Sarah Johnson", job_title: "Founder", company: "Bloom Studio", photo: null, video: null, rating: 5, message: "We started collecting testimonials in the morning and had our Wall of Love live on the website by lunch. Incredible.", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, type: "text", name: "Daniel Kim", job_title: "Product Manager", company: "Nova", photo: null, video: null, rating: 5, message: "Our customers love how easy it is to record a video. We get far more responses than with e-mail forms.", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 3, type: "text", name: "Aisha Rahman", job_title: "Marketing Lead", company: "Greenly", photo: null, video: null, rating: 4, message: "Clean, fast and no learning curve. The embed code worked on the first try.", created_at: new Date(Date.now() - 86400000 * 9).toISOString() },
];

export function WallDemo() {
  return (
    <section id="wall" className="bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A Wall of Love that sells for you</h2>
          <p className="mt-3 text-muted-foreground">Real words from real customers, displayed beautifully.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {demo.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
