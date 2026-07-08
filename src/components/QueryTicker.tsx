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

const DOT: Record<string, string> = {
  high: "bg-danger",
  mid: "bg-accent",
  low: "bg-safe",
};

const LABEL: Record<string, string> = {
  high: "высокий риск",
  mid: "средний риск",
  low: "низкий риск",
};

export function QueryTicker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-mask border-y border-border py-4">
      <div className="marquee-track flex w-max gap-3">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-full border border-border bg-bg-card px-4 py-2"
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[item.verdict]}`} />
            <span className="text-sm text-ink">{item.q}</span>
            <span className="text-xs text-ink-faint">{LABEL[item.verdict]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
