export function RiskGauge({ score }: { score: number }) {
  const tone =
    score >= 60
      ? { ring: "stroke-danger", text: "text-danger", label: "Высокий риск" }
      : score >= 30
        ? { ring: "stroke-accent-bright", text: "text-accent-bright", label: "Средний риск" }
        : { ring: "stroke-safe", text: "text-safe", label: "Низкий риск" };

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} className="stroke-border" strokeWidth="7" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${tone.ring} transition-all duration-700 ease-out`}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl">{score}</span>
          <span className="font-mono text-[10px] uppercase tracked text-ink-faint">/ 100</span>
        </div>
      </div>
      <span className={`font-mono text-xs uppercase tracked ${tone.text}`}>{tone.label}</span>
    </div>
  );
}
