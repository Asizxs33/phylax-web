import Link from "next/link";
import { AqylMark } from "./SaqMark";
import { IconLens, IconBroadcast, IconGraduation } from "./icons";

const PILLARS = [
  {
    href: "/investigate",
    Icon: IconLens,
    kaz: "Анықтайды",
    title: "Aqyl проверяет",
    text: "ИИ-ассистент опрашивает 16+ открытых источников, строит граф связей и отвечает досье с прозрачным risk score.",
    cta: "Спросить Aqyl",
  },
  {
    href: "/community",
    Icon: IconBroadcast,
    kaz: "Ескертеді",
    title: "Сообщество предупреждает",
    text: "Люди присылают подозрительные компании, сайты и каналы. Каждая наводка проходит проверку и пополняет общий реестр.",
    cta: "Открыть ленту",
  },
  {
    href: "/learn",
    Icon: IconGraduation,
    kaz: "Үйретеді",
    title: "Школа защищает заранее",
    text: "Модули для взрослых и игровой трек для детей: как распознать пирамиду до того, как отдали деньги.",
    cta: "Начать учиться",
  },
];

export function Ecosystem() {
  return (
    <section className="section-glow relative overflow-hidden px-6 py-24">
      <div className="cyber-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex items-center gap-4">
          <span className="icon-badge h-14 w-14">
            <AqylMark className="h-9 w-9" mood="wink" />
          </span>
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracked text-accent-bright">
              <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-accent" />
              Экосистема SAQ
            </span>
            <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
              Три линии обороны
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              className="card-lift soft-shadow reveal group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-card p-7"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
              />
              <span className="icon-badge relative h-12 w-12 transition-transform duration-300 group-hover:scale-110">
                <p.Icon className="h-6 w-6" />
              </span>
              <span className="mt-4 font-mono text-[10px] uppercase tracked text-ink-faint">{p.kaz}</span>
              <h3 className="mt-2 font-display text-2xl font-extrabold">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{p.text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-bright">
                {p.cta}
                <span className="transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
