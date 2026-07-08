const STEPS = [
  {
    n: "01",
    title: "Запрос",
    body:
      "Домен, BTC/ETH-адрес, telegram-хэндл, username или название организации — Phylax сам определяет тип объекта.",
  },
  {
    n: "02",
    title: "Параллельный обход",
    body:
      "Метапоиск, реестры компаний, блокчейн-эксплореры, сертификаты, DNS, публичные соцсети опрашиваются одновременно, за секунды.",
  },
  {
    n: "03",
    title: "Скоринг",
    body:
      "Каждый источник сканируется на маркеры пирамид — гарантированная доходность, реферальные бонусы, отсутствие лицензии. Score считается прозрачно.",
  },
  {
    n: "04",
    title: "Досье",
    body:
      "Единый отчёт с risk score, сработавшими red flags и первоисточниками по каждому пункту — для самостоятельной проверки, не готовый вердикт.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Метод" title="Как устроено расследование" />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="reveal card-lift relative rounded-2xl border border-border bg-bg-card p-7"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="font-display text-sm text-accent">{step.n}</span>
              <h3 className="mt-4 font-display text-xl">{step.title}</h3>
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
      <span className="text-sm font-medium uppercase tracked text-accent-bright">{eyebrow}</span>
      <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-lg text-ink-muted leading-relaxed">{description}</p>}
    </div>
  );
}
