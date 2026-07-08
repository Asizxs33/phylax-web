import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Кейсы — Phylax",
  description: "Иллюстративные сценарии: что вскрывает досье Phylax при проверке домена, кошелька и telegram-канала.",
};

const CASES = [
  {
    tag: "Домен",
    score: 82,
    tone: "text-danger",
    title: "«Инвест-платформа» недельной свежести",
    query: "profit-guarantee.example",
    findings: [
      "WHOIS: домен зарегистрирован 6 дней назад — при заявлении «5 лет на рынке».",
      "crt.sh: 14 почти идентичных доменов под одним сертификатом — сеть клонов.",
      "Метапоиск: тексты «гарантированный доход 3% в день», «приведи друга».",
      "OpenCorporates / SEC: юрлицо не найдено ни в одном реестре.",
    ],
  },
  {
    tag: "Крипто",
    score: 67,
    tone: "text-danger",
    title: "Кошелёк-сборщик из нескольких «проектов»",
    query: "1A1zP1...DivfNa",
    findings: [
      "blockchain.info: сотни мелких входящих, почти нет исходящих — паттерн сбора.",
      "Blockchair: адрес засветился в трёх внешне не связанных «фондах».",
      "Метапоиск: адрес упоминается в жалобах на скам-форумах.",
    ],
  },
  {
    tag: "Telegram",
    score: 41,
    tone: "text-accent-bright",
    title: "Канал с реферальной воронкой",
    query: "@easy_x10_daily",
    findings: [
      "Публичный превью: посты с «удвоением за 24 часа» и лимитом мест.",
      "Username enumeration: одноимённые свежие профили на 4 платформах.",
      "Нет упоминаний в реестрах — но и явного блэклиста пока нет.",
    ],
  },
];

export default function CasesPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          index="03"
          eyebrow="Кейсы"
          title="Что вскрывает досье"
          lead="Иллюстративные сценарии на обезличенных данных — как разные типы объектов складываются в общую картину риска."
        />

        <section className="px-6 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            {CASES.map((c, i) => (
              <article
                key={c.title}
                className="reveal corner-frame card-lift grid gap-6 rounded-2xl border border-border bg-bg-card/50 p-7 sm:grid-cols-[160px_1fr] sm:p-9"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="flex flex-row items-center gap-5 sm:flex-col sm:items-start">
                  <span className="rounded-full border border-border-strong px-3 py-1 font-mono text-[10px] uppercase tracked text-ink-muted">
                    {c.tag}
                  </span>
                  <div>
                    <div className={`font-display text-5xl ${c.tone}`}>{c.score}</div>
                    <div className="font-mono text-[10px] uppercase tracked text-ink-faint">
                      risk score
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-2xl">{c.title}</h2>
                  <p className="mt-1 font-mono text-xs text-ink-faint">запрос: {c.query}</p>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {c.findings.map((f) => (
                      <li key={f} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-5xl rounded-xl border border-border bg-bg-elevated/60 p-6 text-center">
            <p className="text-sm text-ink-muted">
              Сценарии обезличены и приведены для иллюстрации логики скоринга.
              Реальное досье строится по вашему запросу в момент проверки.
            </p>
            <Link
              href="/investigate"
              className="btn-shine stamped stamped-press mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-sm uppercase tracked text-bg hover:bg-accent-bright"
            >
              Запустить своё расследование →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
