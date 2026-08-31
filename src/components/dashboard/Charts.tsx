"use client";

/**
 * Лёгкие SVG-графики без внешних библиотек — тот же подход, что у графа
 * связей (EntityGraph.tsx рисует SVG руками). Цвета берутся из тех же
 * CSS-переменных, что и весь сайт, поэтому графики не "выпадают" из темы
 * и сами переключаются между светлой/тёмной темой.
 */

interface TimelinePoint {
  label: string;
  count: number;
}

/** Area-график расследований по дням — как "Total Revenue" в типовых
 * admin-дашбордах, но на реальных данных пользователя, без заглушек. */
export function InvestigationsTimelineChart({ points }: { points: TimelinePoint[] }) {
  const W = 600;
  const H = 180;
  const PAD = 8;
  const max = Math.max(1, ...points.map((p) => p.count));
  const stepX = points.length > 1 ? (W - PAD * 2) / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - (p.count / max) * (H - PAD * 2 - 14);
    return { x, y, ...p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x ?? 0} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  const allZero = max <= 1 && points.every((p) => p.count === 0);

  // сетка: 4 линии от 0 до max — без них линия «висит» в пустоте
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const frac = i / gridCount;
    return {
      y: H - PAD - frac * (H - PAD * 2 - 14),
      value: Math.round(max * frac),
    };
  });

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex shrink-0 flex-col-reverse justify-between py-[2px] font-mono text-[9px] tabular-nums text-ink-faint">
          {gridLines.map((g, i) => (
            <span key={i}>{g.value}</span>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[180px] w-full">
          <defs>
            <linearGradient id="tl-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {gridLines.map((g, i) => (
            <line
              key={i}
              x1={PAD}
              y1={g.y}
              x2={W - PAD}
              y2={g.y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={i === 0 ? undefined : "3 4"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {!allZero && (
            <>
              <path d={areaPath} fill="url(#tl-fill)" className="chart-area" />
              <path
                d={linePath}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="chart-line"
                style={{ ["--dash-len" as string]: W * 2 }}
              />
            </>
          )}
        </svg>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-ink-faint">
        {points
          .filter((_, i) => i % Math.ceil(points.length / 7) === 0)
          .map((p, i) => (
            <span key={i}>{p.label}</span>
          ))}
      </div>
    </div>
  );
}

interface WeekdayBucket {
  label: string;
  high: number;
  rest: number;
}

/** Столбики по дням недели, разбитые на высокий/остальной риск — как
 * "Profit this week" (Sales/Revenue), только про реальные проверки. */
export function WeekdayRiskChart({ buckets }: { buckets: WeekdayBucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.high + b.rest));
  const TRACK = 132;

  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height: TRACK }}>
        {buckets.map((b, i) => {
          const total = b.high + b.rest;
          const highH = (b.high / max) * TRACK;
          const restH = (b.rest / max) * TRACK;
          return (
            <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1">
              {total > 0 && (
                <span className="font-mono text-[10px] tabular-nums text-ink-muted">{total}</span>
              )}
              <div
                className="bar-grow flex w-full max-w-[44px] flex-col justify-end overflow-hidden rounded-md"
                style={{ animationDelay: `${300 + i * 60}ms` }}
              >
                {b.rest > 0 && (
                  <div style={{ height: restH, background: "var(--accent-soft)" }} />
                )}
                {b.high > 0 && (
                  <div style={{ height: highH, background: "var(--danger)" }} />
                )}
                {total === 0 && (
                  <div className="h-[2px] rounded-full" style={{ background: "var(--border-strong)" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-border pt-2">
        {buckets.map((b, i) => (
          <span key={i} className="flex-1 text-center font-mono text-[10px] text-ink-faint">
            {b.label}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
          <span className="h-2 w-2 rounded-sm" style={{ background: "var(--danger)" }} />
          высокий риск
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
          <span className="h-2 w-2 rounded-sm" style={{ background: "var(--accent-soft)" }} />
          остальные
        </span>
      </div>
    </div>
  );
}

/** Donut риска — тот же высокий/средний/низкий, что раньше был линейной
 * полосой, но в форме круга, ближе к тому, что просил взять за образец. */
export function RiskDonut({ high, mid, low }: { high: number; mid: number; low: number }) {
  const total = high + mid + low;
  const R = 46;
  const CX = 60;
  const CY = 60;
  const CIRC = 2 * Math.PI * R;

  const segments = [
    { value: high, color: "var(--danger)" },
    { value: mid, color: "var(--accent-bright)" },
    { value: low, color: "var(--safe)" },
  ];

  const legend = [
    { label: "высокий", value: high, color: "var(--danger)" },
    { label: "средний", value: mid, color: "var(--accent-bright)" },
    { label: "низкий", value: low, color: "var(--safe)" },
  ];

  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative shrink-0">
        <svg viewBox="0 0 120 120" className="h-[132px] w-[132px] -rotate-90">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
          {total > 0 &&
            segments.map((s, i) => {
              if (s.value === 0) return null;
              const frac = s.value / total;
              const dash = frac * CIRC;
              const el = (
                <circle
                  key={i}
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="10"
                  strokeDasharray={`${dash} ${CIRC - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  className="donut-seg"
                  style={{ ["--circ" as string]: CIRC }}
                />
              );
              offset += dash;
              return el;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-extrabold tabular-nums leading-none text-ink">
            {total}
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-ink-faint">
            проверок
          </span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: l.color }} />
            <span className="text-ink-muted">{l.label}</span>
            <span className="ml-auto tabular-nums font-bold text-ink">{l.value}</span>
            <span className="w-9 shrink-0 text-right tabular-nums text-ink-faint">
              {total > 0 ? Math.round((l.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
