import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowWorks } from "@/components/landing/howWorks";
import { WallDemo } from "@/components/landing/wallDemo";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowWorks />
        <WallDemo />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
