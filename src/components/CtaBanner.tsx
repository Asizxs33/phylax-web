import Link from "next/link";
import { PhylaxMark } from "./PhylaxMark";

export function CtaBanner() {
  return (
    <section className="section-ink relative overflow-hidden px-6 py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 0%, rgba(232,185,138,0.16), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full opacity-25 blur-[100px]"
        style={{ background: "radial-gradient(circle, #e2954e, transparent 70%)" }}
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <PhylaxMark className="h-12 w-12" glow />
        <h2 className="reveal mt-7 max-w-2xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          Проверьте, <span className="text-gradient italic">прежде чем поверить</span>
        </h2>
        <p className="reveal mt-5 max-w-lg text-lg text-white/60" style={{ animationDelay: "80ms" }}>
          Секунды на запрос вместо часов ручного поиска. Спросите в чате — и
          перед вами прозрачное досье с фактами и risk score.
        </p>
        <Link
          href="/investigate"
          className="btn-shine reveal mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-bg transition hover:bg-accent-bright"
          style={{ animationDelay: "160ms" }}
        >
          Открыть чат с Phylax →
        </Link>
      </div>
    </section>
  );
}
