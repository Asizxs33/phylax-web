import Link from "next/link";
import { DossierDemo } from "./DossierDemo";

const POINTS = [
  ["Автодетект типа", "домен, кошелёк, @канал, username или название — Aqyl сам понимает, что ему прислали."],
  ["Параллельный обход", "16+ открытых источников опрашиваются одновременно: WHOIS, сертификаты, реестры, блокчейн, соцсети."],
  ["Прозрачный score", "каждый балл риска объясняется конкретным фактом с первоисточником — никаких «чёрных ящиков»."],
] as const;

export function LiveDemo() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="order-2 flex justify-center lg:order-1">
          <div className="float-soft rotate-[-2deg]">
            <DossierDemo />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracked text-accent-bright">
            <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Живое досье
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
            Aqyl демонстрирует себя сам
          </h2>
          <p className="mt-4 max-w-lg text-ink-muted">
            Слева — настоящий цикл проверки в миниатюре: так выглядит ответ на
            подозрительный домен. Попробуйте с любым своим объектом.
          </p>
          <ul className="mt-7 flex flex-col gap-4">
            {POINTS.map(([title, text]) => (
              <li key={title} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <p className="text-sm leading-relaxed text-ink-muted">
                  <span className="font-semibold text-ink">{title}.</span> {text}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/investigate"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent-bright transition hover:gap-3"
          >
            Проверить свой объект →
          </Link>
        </div>
      </div>
    </section>
  );
}
