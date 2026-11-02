import { Code2, Heart, Link2, Mail, ShieldCheck, Video } from "lucide-react";

const features = [
  { icon: Link2, title: "One simple link", text: "Create a Space, share the link, and customers can submit a testimonial from any device." },
  { icon: Video, title: "Video testimonials", text: "Customers record straight from the browser — no app, no sign-up — or upload an existing clip." },
  { icon: Heart, title: "Wall of Love", text: "Heart your favourites and they appear on a gorgeous wall you can share or embed." },
  { icon: Code2, title: "Embed anywhere", text: "Copy one line of code and drop the wall into Webflow, WordPress, Framer, Next.js — anywhere." },
  { icon: Mail, title: "E-mail alerts", text: "Get notified the moment a new testimonial arrives so you can reply while it is fresh." },
  { icon: ShieldCheck, title: "You stay in control", text: "Archive, hide or delete anything. Only testimonials you approve are ever shown publicly." },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to collect social proof</h2>
          <p className="mt-3 text-muted-foreground">From the first request to the final embed, it just works.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-3xl border bg-background p-6 shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
