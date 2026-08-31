const CX = 60;
const CY = 62;
const R_TRACK = 50;
const R_NEEDLE = 40;

// angleDeg: -90 (left / score 0) .. 0 (top / score 50) .. 90 (right / score 100)
function toXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}
function scoreToAngle(score: number) {
  return -90 + (Math.min(Math.max(score, 0), 100) / 100) * 180;
}
function arcPath(a1: number, a2: number, r: number) {
  const p1 = toXY(a1, r);
  const p2 = toXY(a2, r);
  const large = a2 - a1 >= 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
}

const ZONES = [
  { from: 0, to: 30, color: "var(--safe)" },
  { from: 30, to: 60, color: "var(--accent)" },
  { from: 60, to: 100, color: "var(--danger)" },
];

export function RiskGauge({ score }: { score: number }) {
  const tone =
    score >= 60
      ? { text: "text-danger", label: "Высокий риск" }
      : score >= 30
        ? { text: "text-accent-bright", label: "Средний риск" }
        : { text: "text-safe", label: "Низкий риск" };

  const needleAngle = scoreToAngle(score);
  const needleTip = toXY(needleAngle, R_NEEDLE);
  const gap = 2.2; // deg gap between zone segments

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[76px] w-[120px]">
        <svg viewBox="0 0 120 74" className="h-full w-full overflow-visible">
          {/* baseline track */}
          <path
            d={arcPath(-90, 90, R_TRACK)}
            fill="none"
            stroke="var(--border)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* colored risk zones */}
          {ZONES.map((z) => (
            <path
              key={z.from}
              d={arcPath(
                scoreToAngle(z.from) + (z.from === 0 ? 0 : gap / 2),
                scoreToAngle(z.to) - (z.to === 100 ? 0 : gap / 2),
                R_TRACK
              )}
              fill="none"
              stroke={z.color}
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.35"
            />
          ))}
          {/* tick marks at 0/30/60/100 */}
          {[0, 30, 60, 100].map((t) => {
            const a = scoreToAngle(t);
            const inner = toXY(a, R_TRACK - 7);
            const outer = toXY(a, R_TRACK + 2);
            return (
              <line
                key={t}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--ink-faint)"
                strokeWidth="1"
              />
            );
          })}
          {/* needle */}
          <line
            x1={CX}
            y1={CY}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <circle cx={CX} cy={CY} r="4.5" fill="var(--ink)" />
          <circle cx={CX} cy={CY} r="4.5" fill="none" stroke="var(--bg-card)" strokeWidth="1.5" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="font-display text-[28px] leading-none">{score}</span>
          <span className="font-mono text-[9px] uppercase tracked text-ink-faint">/ 100</span>
        </div>
      </div>
      <span className={`font-mono text-xs uppercase tracked ${tone.text}`}>{tone.label}</span>
    </div>
  );
}
