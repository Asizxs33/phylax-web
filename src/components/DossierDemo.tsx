"use client";

import { useEffect, useState } from "react";
import { AqylMark } from "./SaqMark";

const LINES: [string, string][] = [
  ["whois", "домену 6 дней — при заявленных «5 лет»"],
  ["crt.sh", "14 доменов-клонов под одним сертификатом"],
  ["реестры", "юрлицо не найдено ни в одном реестре"],
  ["телеграм", "«+3% в день, приведи друга»"],
];

const SCORE = 82;
const STAMP_STEP = LINES.length + 1;
const CYCLE_MS = 12000;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DossierDemo() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (prefersReducedMotion()) {
      setStep(STAMP_STEP);
      setScore(SCORE);
      return;
    }

    let alive = true;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const runCycle = () => {
      timers = [];
      setStep(0);
      setScore(0);

      LINES.forEach((_, i) =>
        timers.push(setTimeout(() => alive && setStep(i + 1), 800 + i * 900))
      );

      const scoreAt = 800 + LINES.length * 900;
      timers.push(
        setTimeout(() => {
          const t0 = performance.now();
          const tick = (t: number) => {
            if (!alive) return;
            const p = Math.min(1, (t - t0) / 1200);
            setScore(Math.round(SCORE * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, scoreAt)
      );
      timers.push(setTimeout(() => alive && setStep(STAMP_STEP), scoreAt + 1400));
      timers.push(setTimeout(() => alive && runCycle(), CYCLE_MS));
    };

    runCycle();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  const done = mounted && step >= STAMP_STEP;

  return (
    <div className="soft-shadow w-[320px] rounded-2xl border border-border bg-bg-card p-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <AqylMark className="h-5 w-5" mood={done ? "alert" : "thinking"} />
          <span className="text-xs uppercase tracked text-ink-faint">Aqyl</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
          <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-safe" : "bg-accent pulse-slow"}`} />
          {done ? "готово" : "сканирую"}
        </span>
      </div>

      <p className="mt-4 truncate text-sm text-ink">profit-guarantee.example</p>
      <p className="text-[11px] uppercase tracked text-ink-faint">домен · авто-детект</p>

      <ul className="mt-4 flex min-h-[104px] flex-col gap-2.5">
        {LINES.map(([src, finding], i) => (
          <li
            key={src}
            className={`flex items-baseline gap-2 text-[13px] leading-snug transition-all duration-500 ${
              step > i ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
          >
            <span className="shrink-0 text-[11px] uppercase text-accent-bright">{src}</span>
            <span className="text-ink-muted">{finding}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracked text-ink-faint">risk score</span>
          <span className={`font-display text-3xl tabular-nums transition-colors duration-500 ${done ? "text-danger" : "text-ink"}`}>
            {score}
            <span className="text-sm text-ink-faint">/100</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-all duration-300 ${done ? "bg-danger" : "bg-accent"}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p
          className={`mt-3 text-[13px] font-medium transition-opacity duration-500 ${
            done ? "opacity-100 text-danger" : "opacity-0"
          }`}
        >
          Высокий риск — маркеры пирамиды
        </p>
      </div>
    </div>
  );
}
