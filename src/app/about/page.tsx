import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { SaqMark } from "@/components/SaqMark";

export const metadata: Metadata = {
  title: "О проекте — SAQ",
  description: "История, значение имени, этика и технологический стек платформы SAQ.",
};

const STACK = [
  ["Бэкенд", "Python · FastAPI · httpx (async)"],
  ["Оркестрация", "Асинхронный опрос коннекторов с таймаутами"],
  ["Фронтенд", "Next.js 16 · TypeScript · Tailwind"],
  ["LLM (опц.)", "Anthropic Claude — синтез отчёта"],
  ["Даркнет (opt-in)", "OnionClaw · Tor Expert Bundle"],
];

const ETHICS = [
  {
    title: "Без ботов и обхода банов",
    body: "Соцсети опрашиваются только через публичные страницы. Никаких sock puppet-аккаунтов и автоматизации, нарушающей условия платформ.",
  },
  {
    title: "Даркнет — осознанный выбор",
    body: "Модуль выключен по умолчанию и требует явной настройки. Автоматический доступ к .onion может быть незаконен в вашей юрисдикции.",
  },
  {
    title: "Досье, а не приговор",
    body: "Risk score — повод для проверки, не обвинение. Каждый пункт ведёт к первоисточнику, решение остаётся за человеком.",
  },
];

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          index="04"
          eyebrow="О проекте"
          title="Страж на границе доверия"
          lead="SAQ появился из простой идеи: проверить незнакомый «инвест-проект» должно быть так же легко, как вбить его название в строку поиска."
        />

        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div className="reveal">
              <div className="corner-frame flex flex-col items-center gap-5 rounded-2xl border border-border bg-bg-card/50 p-10 text-center">
                <SaqMark className="h-20 w-20" glow />
                <div>
                  <p className="font-display text-2xl">φύλαξ</p>
                  <p className="mt-1 font-mono text-xs uppercase tracked text-ink-faint">
                    греч. «страж, часовой»
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Часовой не выносит приговор — он замечает и предупреждает.
                  Финальное решение остаётся за тем, кого он охраняет.
                </p>
              </div>
            </div>

            <div className="reveal flex flex-col gap-6 text-base leading-relaxed text-ink-muted" style={{ animationDelay: "80ms" }}>
              <p>
                Финансовые пирамиды живут за счёт скорости: новый сайт, новый
                telegram-канал, новый кошелёк появляются быстрее, чем жертва
                успевает навести справки. Информация для проверки почти всегда
                открыта — она просто разбросана по десяткам сервисов.
              </p>
              <p>
                SAQ собирает эти разрозненные следы в одно место. Один
                запрос — и реестры, блокчейн-эксплореры, архивы сайтов и
                публичные соцсети опрашиваются параллельно, а результат
                сводится в читаемое досье с прозрачным risk score.
              </p>
              <p>
                Это не сервис доносов и не автоматический обвинитель. Это
                ускоритель здравого смысла: то, на что у аналитика уходят часы
                ручного поиска, платформа делает за секунды — оставляя выводы
                человеку.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="reveal font-display text-3xl">Принципы</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {ETHICS.map((e, i) => (
                <div key={e.title} className="reveal" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="mb-4 flex h-2 w-2 rounded-full bg-accent" />
                  <h3 className="font-display text-xl">{e.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{e.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="reveal font-display text-3xl">Технологии</h2>
            <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
              {STACK.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[150px_1fr] gap-4 py-4">
                  <span className="font-mono text-xs uppercase tracked text-ink-faint">{k}</span>
                  <span className="text-sm text-ink">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 rounded-xl border border-border bg-bg-elevated/60 p-5 text-xs leading-relaxed text-ink-faint">
              SAQ агрегирует только открытые публичные данные и не выдаёт
              юридических заключений. Результаты — основание для дальнейшей
              самостоятельной проверки, а не готовое обвинение. Ответственность
              за использование инструмента и соблюдение локального
              законодательства лежит на пользователе.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
