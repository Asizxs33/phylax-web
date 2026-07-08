import { NavBar } from "@/components/NavBar";
import { Hero } from "@/components/Hero";
import { QueryTicker } from "@/components/QueryTicker";
import { HowItWorks } from "@/components/HowItWorks";
import { SourcesBoard } from "@/components/SourcesBoard";
import { Principles } from "@/components/Principles";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <Hero />
        <QueryTicker />
        <HowItWorks />
        <SourcesBoard />
        <Principles />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
