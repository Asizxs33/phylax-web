"use client";

import { useEffect, useRef } from "react";
import { AqylMark, type AqylMood } from "./SaqMark";

/*
 * Большой «живой» Aqyl: зрачки следят за курсором.
 * Смещение пишется в CSS-переменные, их читает .aqyl-look в globals.css.
 */
export function AqylLive({
  className = "",
  mood = "happy",
  glow = true,
}: {
  className?: string;
  mood?: AqylMood;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        // максимум ~1.8px в координатах viewBox — глаза не «выпадают»
        const k = Math.min(1, d / 240) * 1.8;
        el.style.setProperty("--aqyl-look-x", `${(dx / d) * k}px`);
        el.style.setProperty("--aqyl-look-y", `${(dy / d) * k}px`);
      });
    };
    const onLeave = () => {
      el.style.setProperty("--aqyl-look-x", "0px");
      el.style.setProperty("--aqyl-look-y", "0px");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="inline-flex">
      <AqylMark className={className} mood={mood} glow={glow} />
    </div>
  );
}
