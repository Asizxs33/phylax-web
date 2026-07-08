import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { FaqAccordion } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — Phylax",
  description: "Частые вопросы о том, как работает Phylax, какие данные использует и где проходят его границы.",
};

export default function FaqPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          index="05"
          eyebrow="FAQ"
          title="Частые вопросы"
          lead="Коротко о том, как устроена проверка, откуда данные и где проходят границы инструмента."
        />

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <FaqAccordion />

            <div className="mt-14 rounded-xl border border-border bg-bg-elevated/60 p-6 text-center">
              <p className="text-sm text-ink-muted">Не нашли ответ? Проще всего — попробовать.</p>
              <Link
                href="/investigate"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-sm uppercase tracked text-bg transition hover:bg-accent-bright"
              >
                Открыть инструмент →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
