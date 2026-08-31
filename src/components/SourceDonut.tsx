import type { ConnectorResult } from "@/lib/types";

export function SourceDonut({ results }: { results: ConnectorResult[] }) {
  const total = results.length || 1;
  const flagged = results.filter((r) => r.ok && r.red_flags.length > 0).length;
  const clean = results.filter((r) => r.ok && r.red_flags.length === 0).length;
  const failed = results.filter((r) => !r.ok).length;

  const cleanPct = (clean / total) * 100;
  const flaggedPct = (flagged / total) * 100;

  const gradient = `conic-gradient(
    var(--safe) 0% ${cleanPct}%,
    var(--danger) ${cleanPct}% ${cleanPct + flaggedPct}%,
    var(--border-strong) ${cleanPct + flaggedPct}% 100%
  )`;

  const rows = [
    { label: "чисто", value: clean, color: "var(--safe)" },
    { label: "есть сигналы", value: flagged, color: "var(--danger)" },
    { label: "не ответили", value: failed, color: "var(--border-strong)" },
  ].filter((r) => r.value > 0);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 shrink-0 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-[5px] flex flex-col items-center justify-center rounded-full bg-bg-card">
          <span className="font-display text-lg leading-none">{results.length}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-1.5 text-xs">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.color }} />
            <span className="text-ink-muted">{r.label}</span>
            <span className="font-mono text-ink-faint">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
