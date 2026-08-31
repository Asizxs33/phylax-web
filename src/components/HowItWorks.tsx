import { IconTarget, IconSatellite, IconScore, IconReport } from "./icons";

const STEPS = [
  {
    n: "01",
    Icon: IconTarget,
    title: "Запрос",
    body:
      "Домен, BTC/ETH-адрес, telegram-хэндл, username или название организации — Aqyl сам определяет тип объекта.",
  },
  {
    n: "02",
    Icon: IconSatellite,
    title: "Параллельный обход",
    body:
      "Метапоиск, реестры компаний, блокчейн-эксплореры, сертификаты, DNS, публичные соцсети опрашиваются одновременно, за секунды.",
  },
  {
    n: "03",
    Icon: IconScore,
    title: "Скоринг",
    body:
      "Каждый источник сканируется на маркеры пирамид — гарантированная доходность, реферальные бонусы, отсутствие лицензии. Score считается прозрачно.",
  },
  {
    n: "04",
    Icon: IconReport,
    title: "Досье",
    body:
      "Единый отчёт с risk score, сработавшими red flags и первоисточниками по каждому пункту — для самостоятельной проверки, не готовый вердикт.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section-glow px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Метод" title="Как устроено расследование" />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`reveal card-lift relative rounded-2xl border border-border bg-bg-card p-7 ${
                i < STEPS.length - 1 ? "step-connector max-lg:after:hidden" : ""
              }`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="icon-badge h-11 w-11">
                  <step.Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-ink-faint">{step.n}</span>
              </div>
              <h3 className="mt-5 font-display text-xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="reveal max-w-2xl">
      <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracked text-accent-bright">
        <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-accent" />
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-lg text-ink-muted leading-relaxed">{description}</p>}
    </div>
  );
}
