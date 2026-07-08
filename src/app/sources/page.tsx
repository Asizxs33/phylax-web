import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Источники — Phylax",
  description: "Полный каталог из 16+ открытых OSINT-источников, которые опрашивает Phylax: что даёт каждый и требует ли ключа.",
};

type Source = {
  name: string;
  desc: string;
  cost: "free" | "key" | "optin";
};

const GROUPS: { group: string; sources: Source[] }[] = [
  {
    group: "Метапоиск",
    sources: [
      { name: "SearXNG", desc: "Один инстанс агрегирует выдачу десятков поисковиков (Google, Bing, DuckDuckGo, Yandex, Brave). Так и реализуется «поиск по N системам».", cost: "free" },
      { name: "DuckDuckGo Instant Answer", desc: "Быстрая справка по известным сущностям: описание, категория, связанные темы.", cost: "free" },
    ],
  },
  {
    group: "Домены и инфраструктура",
    sources: [
      { name: "crt.sh", desc: "Логи Certificate Transparency: связанные поддомены и клоны сайтов, выпущенные под одним оператором.", cost: "free" },
      { name: "RDAP / WHOIS", desc: "Дата регистрации, регистратор, статус домена. Свежий домен под видом «годами работающего» — красный флаг.", cost: "free" },
      { name: "DNS (A/MX/TXT/NS)", desc: "Общие IP и nameservers между «независимыми» проектами выдают единого владельца.", cost: "free" },
      { name: "urlscan.io", desc: "Прошлые сканы: скриншоты, цепочки редиректов, IP, страна, серверный стек.", cost: "free" },
      { name: "Wayback Machine", desc: "Исторические снимки сайта — когда появился, как менялся питч, что чистили.", cost: "free" },
      { name: "Common Crawl", desc: "Независимый краулер: страницы, которые могли удалить или скрыть из живой выдачи.", cost: "free" },
    ],
  },
  {
    group: "Реестры и регуляторы",
    sources: [
      { name: "OpenCorporates", desc: "Регистрация юрлица: юрисдикция, статус, дата инкорпорации.", cost: "free" },
      { name: "SEC EDGAR", desc: "Фильтрации в SEC. Отсутствие записи у «регулируемого фонда» — сигнал сам по себе.", cost: "free" },
      { name: "Блэклист регуляторов", desc: "Локальные снимки списков ЦБ и других регуляторов по нелицензированным участникам рынка.", cost: "free" },
    ],
  },
  {
    group: "Криптовалюты",
    sources: [
      { name: "blockchain.info", desc: "Баланс, число транзакций и контрагенты BTC-адреса. Кошелёк-сборщик выдаёт схему.", cost: "free" },
      { name: "Blockchair", desc: "Кросс-чек BTC и ETH из одного API.", cost: "free" },
      { name: "Etherscan", desc: "Баланс и последние транзакции ETH-адреса.", cost: "key" },
    ],
  },
  {
    group: "Публичные соцсети",
    sources: [
      { name: "Username enumeration", desc: "Проверка наличия профиля на GitHub, Instagram, X, TikTok, Telegram, Reddit, YouTube.", cost: "free" },
      { name: "Telegram public preview", desc: "Последние посты публичного канала через t.me/s/… — без бот-аккаунта и входа.", cost: "free" },
    ],
  },
  {
    group: "Даркнет",
    sources: [
      { name: "OnionClaw (12 движков)", desc: "Поиск по darknet-поисковикам через локальный Tor. Всплывает ли объект в жалобах, скам-отчётах, объявлениях.", cost: "optin" },
    ],
  },
];

const BADGE: Record<Source["cost"], { label: string; cls: string }> = {
  free: { label: "бесплатно", cls: "border-safe/40 text-safe" },
  key: { label: "нужен ключ", cls: "border-accent/40 text-accent-bright" },
  optin: { label: "opt-in", cls: "border-ink-faint/40 text-ink-faint" },
};

export default function SourcesPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          index="02"
          eyebrow="Источники"
          title="Каталог источников"
          lead="16+ открытых источников. По умолчанию — никаких платных API и серых схем: публичные реестры, блокчейн-эксплореры и страницы, не требующие входа."
        />

        <section className="px-6 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-14">
            {GROUPS.map((g, gi) => (
              <div key={g.group} className="reveal" style={{ animationDelay: `${gi * 60}ms` }}>
                <div className="mb-6 flex items-center gap-4">
                  <h2 className="font-display text-2xl">{g.group}</h2>
                  <span className="h-px flex-1 bg-border" />
                  <span className="font-mono text-xs text-ink-faint">{g.sources.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {g.sources.map((s) => {
                    const badge = BADGE[s.cost];
                    return (
                      <div
                        key={s.name}
                        className="group rounded-xl border border-border bg-bg-card/50 p-5 transition hover:border-border-strong hover:bg-bg-card"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium">{s.name}</h3>
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracked ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
