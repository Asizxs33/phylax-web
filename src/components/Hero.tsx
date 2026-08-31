"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DossierDemo } from "./DossierDemo";
import { HeroAqyl } from "./HeroAqyl";
import { IconScan, IconShield, IconLens, IconBroadcast, IconGraduation } from "./icons";

/* примеры, которые Aqyl «печатает» в командной строке */
const SAMPLES = [
  "profit-x10.example",
  "@easy_money_daily",
  "1A1zP1eP5Q…DivfNa",
  "Global MLM Invest",
];

/* четыре казахских глагола — суть SAQ */
const VERBS = [
  { kaz: "Қорғайды", ru: "защищает", Icon: IconShield },
  { kaz: "Анықтайды", ru: "выявляет", Icon: IconLens },
  { kaz: "Ескертеді", ru: "предупреждает", Icon: IconBroadcast },
  { kaz: "Үйретеді", ru: "учит", Icon: IconGraduation },
];

/* парящие сигнальные чипы вокруг досье */
const CHIPS = [
  { label: "WHOIS", value: "домену 6 дней", tone: "danger", pos: "-left-6 top-10", rot: "-6deg", delay: "0s" },
  { label: "CRT.SH", value: "14 клонов", tone: "danger", pos: "-right-8 top-28", rot: "5deg", delay: "1.2s" },
  { label: "РЕЕСТР", value: "юрлицо не найдено", tone: "warn", pos: "-left-10 bottom-24", rot: "4deg", delay: "0.6s" },
] as const;

function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  const state = useRef({ w: 0, c: 0, deleting: false });

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!alive) return;
      const s = state.current;
      const word = words[s.w % words.length];
      if (!s.deleting) {
        s.c++;
        setText(word.slice(0, s.c));
        if (s.c === word.length) {
          s.deleting = true;
          timer = setTimeout(tick, 1600);
          return;
        }
      } else {
        s.c--;
        setText(word.slice(0, s.c));
        if (s.c === 0) {
          s.deleting = false;
          s.w++;
        }
      }
      timer = setTimeout(tick, s.deleting ? 45 : 95);
    };

    timer = setTimeout(tick, 700);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [words]);

  return text;
}

export function Hero() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const typed = useTypewriter(SAMPLES);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/investigate?q=${encodeURIComponent(q)}` : "/investigate");
  }

  return (
    <section className="hero-grain relative overflow-hidden px-6 pb-20 pt-10 sm:pt-16">
      {/* фон: меш + сетка */}
      <div className="hero-mesh pointer-events-none absolute inset-0 opacity-90" aria-hidden />
      <div className="hero-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        {/* ── ЛЕВО: имя + командная строка ── */}
        <div className="flex flex-col items-start text-left">
          {/* статус-строка агента */}
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-border bg-bg-card/70 px-3.5 py-1.5 font-mono text-[11px] uppercase tracked text-accent-bright backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Aqyl · живой агент · 16+ источников
          </div>

          {/* казахский тэглайн — НАВЕРХУ, над именем */}
          <div
            className="reveal hero-underline-kaz mt-7 pl-1 font-mono text-[11px] uppercase text-accent-bright sm:text-xs"
            style={{ animationDelay: "120ms" }}
          >
            қаржы қорғаушысы
          </div>

          {/* ОГРОМНОЕ имя SAQ — красивый дисплейный шрифт */}
          <h1 className="font-wordmark mt-2 select-none text-[5.5rem] font-black leading-[0.9] tracking-[-0.03em] sm:text-[9.5rem] xl:text-[10.5rem]">
            <span className="text-hero-gradient">
              {["S", "A", "Q"].map((ch, i) => (
                <span key={ch} className="letter-drop" style={{ animationDelay: `${120 + i * 130}ms` }}>
                  {ch}
                </span>
              ))}
            </span>
          </h1>

          {/* ёмкая подпись */}
          <p
            className="reveal mt-5 max-w-md font-display text-2xl font-extrabold leading-[1.15] sm:text-[2rem]"
            style={{ animationDelay: "540ms" }}
          >
            Между вами и{" "}
            <span className="text-accent-bright">следующей пирамидой</span>
          </p>
          <p
            className="reveal mt-3 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base"
            style={{ animationDelay: "600ms" }}
          >
            Домен, кошелёк или @канал — Aqyl проверит по открытым источникам и
            вернёт досье с оценкой риска.
          </p>

          {/* КОМАНДНАЯ СТРОКА */}
          <form
            onSubmit={onSubmit}
            className="reveal command-glow mt-7 flex w-full max-w-md items-center gap-2 rounded-2xl border border-border bg-bg-card/90 p-2 pl-4 backdrop-blur"
            style={{ animationDelay: "660ms" }}
          >
            <IconScan className="h-5 w-5 shrink-0 text-accent" />
            <div className="relative min-w-0 flex-1 text-left">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label="Объект для проверки"
                className="w-full bg-transparent py-3 font-mono text-sm text-ink outline-none placeholder:text-transparent sm:text-base"
                placeholder="запрос"
              />
              {value === "" && (
                <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 font-mono text-sm text-ink-faint sm:text-base">
                  {typed}
                  <span className="caret-blink ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-accent align-middle" />
                </span>
              )}
            </div>
            <button
              type="submit"
              className="btn-shine group inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white"
            >
              Спросить
              <span className="transition group-hover:translate-x-0.5">→</span>
            </button>
          </form>

          {/* слим-лента глаголов */}
          <div
            className="reveal mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6"
            style={{ animationDelay: "760ms" }}
          >
            {VERBS.map((v, i) => (
              <div key={v.kaz} className="flex items-center gap-5 sm:gap-6">
                <span className="flex items-center gap-2">
                  <v.Icon className="h-4 w-4 text-accent" />
                  <span className="font-display text-sm font-extrabold">{v.kaz}</span>
                  <span className="hidden text-[10px] uppercase tracked text-ink-faint sm:inline">{v.ru}</span>
                </span>
                {i < VERBS.length - 1 && <span className="verb-dot h-1 w-1 rounded-full bg-accent" style={{ animationDelay: `${i * 0.4}s` }} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── ПРАВО: большой живой Aqyl + его досье с чипами ── */}
        <div className="reveal relative flex flex-col items-center gap-6" style={{ animationDelay: "300ms" }}>
          {/* большой Aqyl — меняет выражения и движения */}
          <HeroAqyl className="h-52 w-52 sm:h-60 sm:w-60" />

          {/* живое досье под ним */}
          <div className="relative">
            <div className="float-soft rotate-[2deg]">
              <DossierDemo />
            </div>

            {/* парящие сигнальные чипы */}
            {CHIPS.map((c) => (
              <div
                key={c.label}
                className={`chip-float absolute ${c.pos} hidden select-none rounded-xl border bg-bg-card/95 px-3 py-2 text-left shadow-lg backdrop-blur sm:block ${
                  c.tone === "danger" ? "border-danger/40" : "border-accent/40"
                }`}
                style={{ ["--rot" as string]: c.rot, animationDelay: c.delay }}
              >
                <div
                  className={`font-mono text-[9px] uppercase tracked ${
                    c.tone === "danger" ? "text-danger" : "text-accent-bright"
                  }`}
                >
                  {c.label}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-ink">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
