"use client";

import { useEffect, useState } from "react";
import { AqylLive } from "./AqylLive";
import type { AqylMood } from "./SaqMark";

/* Aqyl «отыгрывает» цикл проверки лицом:
   спокоен → сканирует → находит риск → предупреждает → радуется. */
const MOODS: AqylMood[] = ["happy", "thinking", "surprised", "alert", "excited", "wink"];

/* спутники на орбите-нимбе */
const ORBIT_DOTS = [0, 120, 240];

export function HeroAqyl({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % MOODS.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* мягкое свечение-плита */}
      <div
        className="pointer-events-none absolute h-[130%] w-[130%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 38%, transparent), transparent 66%)" }}
        aria-hidden
      />

      {/* вращающийся радар-нимб со спутниками */}
      <div className="aqyl-orbit pointer-events-none absolute inset-[-14%]" aria-hidden>
        <div className="absolute inset-0 rounded-full border border-dashed border-accent/25" />
        {ORBIT_DOTS.map((deg) => (
          <div key={deg} className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
            {/* точка сидит на верхушке кольца; вращение слоя гонит её по орбите */}
            <div className="aqyl-orbit-dot left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />
          </div>
        ))}
      </div>

      {/* сам Aqyl: прыжок + покачивание + смена выражений */}
      <div className="aqyl-hop">
        <div className="aqyl-sway">
          <AqylLive className={className} mood={MOODS[i]} glow />
        </div>
      </div>
    </div>
  );
}
