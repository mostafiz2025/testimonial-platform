const steps = [
  { n: 1, title: "Create a Space", text: "Name your project, write a friendly message and pick the questions you want to ask." },
  { n: 2, title: "Share the link", text: "Send your unique collection page to customers by e-mail, chat or social media." },
  { n: 3, title: "Show your Wall of Love", text: "Heart the best testimonials and embed your wall on your website with one line of code." },
];

export function HowWorks() {
  return (
    <section id="how" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
