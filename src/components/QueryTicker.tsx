import { IconAlert, IconWarning, IconCheck } from "./icons";

const ITEMS: { q: string; verdict: "high" | "mid" | "low" }[] = [
  { q: "profit-guarantee.example", verdict: "high" },
  { q: "@easy_x10_daily", verdict: "mid" },
  { q: "1A1zP1eP5Q…DivfNa", verdict: "high" },
  { q: "trust-capital.fund", verdict: "low" },
  { q: "0x8f3a…c21b", verdict: "mid" },
  { q: "global-mlm-invest", verdict: "high" },
  { q: "safe-yield.io", verdict: "low" },
  { q: "@crypto_doubler", verdict: "high" },
];

const ICON = {
  high: IconAlert,
  mid: IconWarning,
  low: IconCheck,
};

const TONE: Record<string, string> = {
  high: "border-danger/25 hover:border-danger/50 text-danger",
  mid: "border-accent/25 hover:border-accent/50 text-accent-bright",
  low: "border-safe/25 hover:border-safe/50 text-safe",
};

const LABEL: Record<string, string> = {
  high: "высокий риск",
  mid: "средний риск",
  low: "низкий риск",
};

export function QueryTicker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="border-y border-border bg-bg-elevated/60 py-4">
      <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracked text-ink-faint">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-safe" />
        </span>
        Живая лента · недавние проверки
      </div>
      <div className="marquee-mask">
        <div className="marquee-track flex w-max gap-3">
          {doubled.map((item, i) => {
            const Icon = ICON[item.verdict];
            return (
              <div
                key={i}
                className={`soft-shadow flex items-center gap-2.5 rounded-full border bg-bg-card px-4 py-2 transition-colors ${TONE[item.verdict]}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-mono text-sm text-ink">{item.q}</span>
                <span className="text-xs text-ink-faint">{LABEL[item.verdict]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
