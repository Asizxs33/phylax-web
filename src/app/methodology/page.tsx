import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Метод — SAQ",
  description: "Как Aqyl строит досье: конвейер источников, типы объектов, прозрачный risk score и маркеры финансовых пирамид.",
};

const STAGES = [
  {
    n: "01",
    title: "Определение объекта",
    body: "Строка запроса классифицируется по регулярным правилам: домен, BTC-адрес (Base58/Bech32), ETH-адрес (0x…), telegram-хэндл, username или свободное название организации. Тип можно задать и вручную.",
  },
  {
    n: "02",
    title: "Маршрутизация источников",
    body: "Каждый коннектор объявляет, к каким типам объектов он применим. Оркестратор берёт только релевантные источники — крипто-эксплореры не дёргаются для домена, а WHOIS не вызывается для кошелька.",
  },
  {
    n: "03",
    title: "Параллельный опрос",
    body: "Применимые источники запрашиваются одновременно, каждый со своим таймаутом. Падение одного (rate-limit, 403, недоступность) не роняет остальные — в досье он просто помечается как не ответивший.",
  },
  {
    n: "04",
    title: "Сканирование на маркеры",
    body: "Ответ каждого источника прогоняется по словарю red-flag маркеров пирамид. Совпадения собираются в единый список сигналов с указанием источника.",
  },
  {
    n: "05",
    title: "Скоринг и синтез",
    body: "Из уникальных сигналов и попаданий в блэклисты регуляторов считается risk score 0–100. Опционально LLM собирает читаемый отчёт поверх сырых данных — и явно помечается как синтез.",
  },
];

const MARKERS = [
  "гарантированный доход",
  "пассивный доход без риска",
  "приведи друга — бонус",
  "реферальная программа",
  "удвоение вложений",
  "инвестируй сейчас, места заканчиваются",
  "работа без лицензии",
  "matrix / HYIP схема",
  "guaranteed airdrop",
];

const TYPES = [
  ["Домен", "crt.sh, WHOIS, DNS, urlscan, архивы, реестры, метапоиск"],
  ["BTC-адрес", "blockchain.info, Blockchair, метапоиск по адресу"],
  ["ETH-адрес", "Etherscan, Blockchair, метапоиск"],
  ["Telegram", "публичный превью канала, username enumeration"],
  ["Username", "поиск профилей на платформах, метапоиск"],
  ["Организация", "OpenCorporates, SEC EDGAR, блэклисты, метапоиск"],
];

export default function MethodologyPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          index="01"
          eyebrow="Метод"
          title="Как Aqyl строит досье"
          lead="Не чёрная коробка и не готовый вердикт: конвейер из пяти прозрачных стадий, где каждый вывод можно проследить до первоисточника."
        />

        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <ol className="relative flex flex-col gap-0 border-l border-border pl-8">
              {STAGES.map((s, i) => (
                <li
                  key={s.n}
                  className="reveal relative pb-12 last:pb-0"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border border-accent/50 bg-bg font-mono text-[10px] text-accent-bright">
                    {s.n}
                  </span>
                  <h3 className="font-display text-2xl">{s.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
            <div>
              <span className="font-mono text-xs uppercase tracked text-accent-bright">
                Типы объектов → источники
              </span>
              <h2 className="mt-3 font-display text-3xl">Что и где ищется</h2>
              <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
                {TYPES.map(([type, sources]) => (
                  <div key={type} className="grid grid-cols-[110px_1fr] gap-4 py-4">
                    <span className="font-mono text-xs uppercase tracked text-ink">{type}</span>
                    <span className="text-sm text-ink-muted">{sources}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracked text-accent-bright">
                Словарь сигналов
              </span>
              <h2 className="mt-3 font-display text-3xl">Маркеры пирамид</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Текст ответа каждого источника сканируется на эти паттерны.
                Список открыт и расширяется — никакой скрытой логики.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {MARKERS.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-danger/30 bg-danger/5 px-3 py-1.5 font-mono text-xs text-danger/90"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="corner-frame rounded-2xl border border-border bg-bg-card/60 p-8 sm:p-12">
              <span className="font-mono text-xs uppercase tracked text-accent-bright">
                Как читается score
              </span>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {[
                  ["0–29", "Низкий", "text-safe", "Явных сигналов нет — но отсутствие сигналов не гарантия добросовестности."],
                  ["30–59", "Средний", "text-accent-bright", "Есть отдельные маркеры. Повод присмотреться и проверить первоисточники."],
                  ["60–100", "Высокий", "text-danger", "Множественные сигналы или попадание в блэклист регулятора. Требует осторожности."],
                ].map(([range, label, tone, desc]) => (
                  <div key={range as string} className="flex flex-col gap-2">
                    <span className="font-display text-3xl">{range}</span>
                    <span className={`font-mono text-xs uppercase tracked ${tone}`}>{label}</span>
                    <p className="text-sm leading-relaxed text-ink-muted">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/investigate"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-mono text-sm uppercase tracked text-bg transition hover:bg-accent-bright"
              >
                Попробовать на своём запросе →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
