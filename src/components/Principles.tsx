import { SectionHeading } from "./HowItWorks";
import { IconBot, IconWeb, IconScale, IconUnlock } from "./icons";

const PRINCIPLES = [
  {
    Icon: IconBot,
    title: "Без ботов и обхода банов",
    body: "Соцсети опрашиваются только через публичные, не требующие входа страницы. Никаких sock puppet-аккаунтов и автоматизации, нарушающей условия платформ.",
  },
  {
    Icon: IconWeb,
    title: "Даркнет — осознанный opt-in",
    body: "Модуль на базе OnionClaw выключен по умолчанию и требует явной настройки. Автоматический доступ к .onion может быть незаконен в вашей юрисдикции.",
  },
  {
    Icon: IconScale,
    title: "Досье, а не приговор",
    body: "Risk score и red flags — повод для дальнейшей проверки, не финальное обвинение. Каждый пункт отчёта ведёт к первоисточнику.",
  },
  {
    Icon: IconUnlock,
    title: "Прозрачный скоринг",
    body: "Правила скоринга открыты и читаемы в коде — никакой чёрной коробки. LLM-синтез опционален и явно помечается как таковой.",
  },
];

export function Principles() {
  return (
    <section id="principles" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Принципы" title="Инструмент для расследования, не для слежки" />

        <div className="mt-16 grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              className="card-lift reveal flex gap-5 rounded-2xl border border-transparent p-2 transition hover:border-border hover:bg-bg-card"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="icon-badge h-11 w-11 shrink-0">
                <p.Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
