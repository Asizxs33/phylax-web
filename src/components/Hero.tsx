import Link from "next/link";
import { DossierDemo } from "./DossierDemo";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-20 sm:pt-28">
      {/* live dossier: the product demos itself while the visitor reads */}
      <div
        className="reveal absolute right-8 top-16 hidden rotate-[3deg] lg:block xl:right-[6%]"
        style={{ animationDelay: "300ms" }}
      >
        <div className="float-soft">
          <DossierDemo />
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="reveal inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-card/60 px-4 py-1.5 text-xs uppercase tracked text-accent-bright backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          OSINT · AI-ассистент · Досье за секунды
        </div>

        <h1
          className="reveal mt-8 max-w-4xl font-display text-7xl leading-[0.98] tracking-tight sm:text-8xl md:text-9xl"
          style={{ animationDelay: "80ms" }}
        >
          <span className="text-gradient">Phylax</span>
          <span className="mt-4 block font-display text-3xl font-normal italic text-ink-muted sm:text-4xl md:text-5xl">
            страж между вами и <span className="text-accent-bright not-italic">следующей пирамидой</span>
          </span>
        </h1>

        <p
          className="reveal mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          Просто спросите в чате — пришлите домен, кошелёк, telegram-канал или
          название фонда. Phylax параллельно опросит десятки открытых
          источников и ответит прозрачным досье с фактами и risk score. Как
          разговор с аналитиком, только за секунды.
        </p>

        <div
          className="reveal mt-10 flex flex-wrap items-center gap-4"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/investigate"
            className="btn-shine group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-bg transition hover:bg-accent-bright"
          >
            Спросить Phylax
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-ink-muted transition hover:text-ink"
          >
            Как это устроено
          </Link>
        </div>

        <dl
          className="reveal soft-shadow mt-20 grid max-w-2xl grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-bg-card"
          style={{ animationDelay: "320ms" }}
        >
          {[
            ["16+", "открытых источников"],
            ["6", "типов объекта проверки"],
            ["0", "ботов и фейковых аккаунтов"],
          ].map(([n, label]) => (
            <div key={label} className="px-5 py-6">
              <dt className="font-display text-4xl text-gradient">{n}</dt>
              <dd className="mt-2 text-[11px] uppercase tracked text-ink-faint">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
