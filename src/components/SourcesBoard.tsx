import { SectionHeading } from "./HowItWorks";
import { IconGlobe, IconNetwork, IconBank, IconCoin, IconUser, IconTor } from "./icons";

const CATEGORIES = [
  {
    Icon: IconGlobe,
    label: "Метапоиск",
    items: ["SearXNG", "DuckDuckGo"],
  },
  {
    Icon: IconNetwork,
    label: "Домены и инфраструктура",
    items: ["crt.sh", "RDAP / WHOIS", "DNS", "urlscan.io", "Wayback Machine", "Common Crawl"],
  },
  {
    Icon: IconBank,
    label: "Реестры и регуляторы",
    items: ["OpenCorporates", "SEC EDGAR", "Локальный blacklist регуляторов"],
  },
  {
    Icon: IconCoin,
    label: "Криптовалюты",
    items: ["blockchain.info", "Blockchair", "Etherscan"],
  },
  {
    Icon: IconUser,
    label: "Публичные соцсети",
    items: ["Username enumeration", "Telegram public preview"],
  },
  {
    Icon: IconTor,
    label: "Даркнет",
    items: ["OnionClaw · 12 движков через Tor"],
    muted: true,
    badge: "выключено по умолчанию",
  },
];

export function SourcesBoard() {
  return (
    <section id="sources" className="section-glow px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Источники"
          title="Только открытые данные"
          description="Никаких платных API по умолчанию и никаких серых схем — метапоиск, публичные реестры, блокчейн-эксплореры и страницы, не требующие входа."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.label}
              className="reveal card-lift rounded-2xl border border-border bg-bg-card p-6"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={`icon-badge h-9 w-9 ${cat.muted ? "opacity-70 grayscale" : ""}`}>
                    <cat.Icon className="h-[18px] w-[18px]" />
                  </span>
                  <h3 className="text-sm font-medium text-ink">{cat.label}</h3>
                </div>
                {cat.badge && (
                  <span className="shrink-0 rounded-full bg-bg-elevated px-2.5 py-0.5 text-[11px] text-ink-faint">
                    {cat.badge}
                  </span>
                )}
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className={`flex items-baseline text-sm ${cat.muted ? "text-ink-faint" : "text-ink-muted"}`}
                  >
                    <span className="mr-2.5 inline-block h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-accent-soft" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
