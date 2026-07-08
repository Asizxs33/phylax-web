import { SectionHeading } from "./HowItWorks";

const PRINCIPLES = [
  {
    title: "Без ботов и обхода банов",
    body: "Соцсети опрашиваются только через публичные, не требующие входа страницы. Никаких sock puppet-аккаунтов и автоматизации, нарушающей условия платформ.",
  },
  {
    title: "Даркнет — осознанный opt-in",
    body: "Модуль на базе OnionClaw выключен по умолчанию и требует явной настройки. Автоматический доступ к .onion может быть незаконен в вашей юрисдикции.",
  },
  {
    title: "Досье, а не приговор",
    body: "Risk score и red flags — повод для дальнейшей проверки, не финальное обвинение. Каждый пункт отчёта ведёт к первоисточнику.",
  },
  {
    title: "Прозрачный скоринг",
    body: "Правила скоринга открыты и читаемы в коде — никакой чёрной коробки. LLM-синтез опционален и явно помечается как таковой.",
  },
];

export function Principles() {
  return (
    <section id="principles" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Принципы" title="Инструмент для расследования, не для слежки" />

        <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="reveal" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="block h-2 w-2 rounded-full bg-accent-soft" />
              <h3 className="mt-4 font-display text-xl">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
