"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Scene {
  id: number;
  duration: number; // in seconds
  tagline: string;
  titleLine1: string;
  titleLine2: string;
  highlightText: string;
  type: "text_hook" | "text_solution" | "brand_reveal" | "carousel" | "outro";
  highlightColor?: string;
  pillHighlight?: boolean;
}

const SCENES: Scene[] = [
  {
    id: 1,
    duration: 3,
    tagline: "SAQ • Финансовый OSINT-Щит",
    titleLine1: "Хотите защитить себя",
    titleLine2: "от финансовых пирамид?",
    highlightText: "от финансовых пирамид?",
    type: "text_hook",
    highlightColor: "#FF416C",
  },
  {
    id: 2,
    duration: 3,
    tagline: "Сайт • Telegram • Крипто-кошелёк",
    titleLine1: "Проверьте любой проект",
    titleLine2: "ДО того, как вложите деньги",
    highlightText: "ДО того,",
    type: "text_solution",
    pillHighlight: true,
    highlightColor: "#00F2FE",
  },
  {
    id: 3,
    duration: 3,
    tagline: "Умный ассистент расследований",
    titleLine1: "Представляем",
    titleLine2: "SAQ",
    highlightText: "SAQ",
    type: "brand_reveal",
    highlightColor: "#00F2FE",
  },
  {
    id: 4,
    duration: 6,
    tagline: "Единая платформа OSINT-защиты",
    titleLine1: "Автоматический разбор угроз",
    titleLine2: "в режиме реального времени",
    highlightText: "OSINT-защита",
    type: "carousel",
    highlightColor: "#00F2FE",
  },
  {
    id: 5,
    duration: 3,
    tagline: "15+ Источников • ИИ Aqyl • Watchlist",
    titleLine1: "Проверь до того,",
    titleLine2: "как вложишь деньги!",
    highlightText: "Проверь до того,",
    type: "outro",
    highlightColor: "#00F2FE",
  },
];

const CAROUSEL_CARDS = [
  {
    id: 1,
    title: "1. ИИ-Расследователь Aqyl",
    subtitle: "Claude tool-use • 15+ источников",
    desc: "Параллельный опрос Whois, OpenCorporates, RDAP, Blockchair и соцсетей с автоматическим синтезом отчёта.",
    badge: "AI Agent",
    gradient: "from-cyan-500/20 to-blue-600/20",
    border: "border-cyan-500/40",
  },
  {
    id: 2,
    title: "2. Интерактивный Граф Связей",
    subtitle: "Визуализация рисков 0-100",
    desc: "Каждый сигнал риска отслеживается до конкретного факта. Интерактивная карта узлов с аномалиями.",
    badge: "Graph OSINT",
    gradient: "from-red-500/20 to-rose-600/20",
    border: "border-red-500/40",
  },
  {
    id: 3,
    title: "3. Watchlist & Автомониторинг",
    subtitle: "CertStream сканирование",
    desc: "Живой поток сканирования новых доменов. Автоматическое выявление ловушек и пополнение публичного реестра.",
    badge: "Live Watchlist",
    gradient: "from-amber-500/20 to-orange-600/20",
    border: "border-amber-500/40",
  },
  {
    id: 4,
    title: "4. Школа Защиты & SAQ Балалар",
    subtitle: "Обучение взрослых и детей",
    desc: "6 интерактивных модулей, психологический разбор скам-схем и викторина 'Пирамида или нет?'.",
    badge: "Education",
    gradient: "from-emerald-500/20 to-teal-600/20",
    border: "border-emerald-500/40",
  },
];

export default function PromoVideoPage() {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const scene = SCENES[currentSceneIdx];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 50;
    const sceneDurationMs = scene.duration * 1000;
    const step = (intervalMs / sceneDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // move to next scene
          setCurrentSceneIdx((s) => (s + 1) % SCENES.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, sceneIndexKey(currentSceneIdx)]);

  function sceneIndexKey(idx: number) {
    return `${idx}-${scene.duration}`;
  }

  // Smooth carousel animation during scene 4
  useEffect(() => {
    if (currentSceneIdx === 3 && isPlaying) {
      const interval = setInterval(() => {
        setCarouselOffset((prev) => (prev + 1) % 400);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [currentSceneIdx, isPlaying]);

  return (
    <main className="min-h-screen bg-[#070A12] text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 mb-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg text-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-400 transition">
              SAQ Promo Reel
            </h1>
            <p className="text-xs text-slate-400">
              Визуальный видеообзор в стиле TikTok / Shorts / Reels (9:16)
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="/saq_promo_review.mp4"
            download
            className="px-4 py-2 text-xs sm:text-sm font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl flex items-center gap-2 transition shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Скачать MP4 видео (18 сек)
          </a>
        </div>
      </header>

      {/* Main container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Video Player Preview (9:16 frame) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-[340px] sm:w-[380px] h-[680px] sm:h-[720px] bg-[#0B0F19] rounded-[40px] border-4 border-slate-800 shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col justify-between p-6 select-none group">
            {/* Top Phone Notch / Bar */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full flex items-center justify-center border border-white/5 z-40">
              <div className="w-3 h-3 rounded-full bg-slate-950 border border-cyan-500/40" />
            </div>

            {/* Glowing radial background animation inside video frame */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1A] via-[#0D1322] to-[#060810] z-0" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none z-0 animate-pulse" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-500/10 blur-[90px] rounded-full pointer-events-none z-0" />

            {/* Scene Content */}
            <div className="relative z-10 h-full flex flex-col justify-between pt-10 pb-6">
              {/* Scene Progress Indicators */}
              <div className="flex gap-1.5 w-full z-30">
                {SCENES.map((sc, i) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setCurrentSceneIdx(i);
                      setProgress(0);
                    }}
                    className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden transition"
                  >
                    <div
                      className="h-full bg-cyan-400 transition-all ease-linear"
                      style={{
                        width:
                          i === currentSceneIdx
                            ? `${progress}%`
                            : i < currentSceneIdx
                            ? "100%"
                            : "0%",
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic Scene Renderer */}
              <div className="flex-1 flex flex-col justify-center my-auto transition-all duration-500">
                {/* Scene 1: Hook */}
                {scene.type === "text_hook" && (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <p className="text-sm font-semibold text-cyan-400 tracking-wider uppercase">
                      {scene.tagline}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                      {scene.titleLine1}
                    </h2>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight relative inline-block">
                      <span className="relative z-10">{scene.titleLine2}</span>
                      <span className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full z-0" />
                    </h2>
                  </div>
                )}

                {/* Scene 2: Solution */}
                {scene.type === "text_solution" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                      {scene.titleLine1}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-4 py-1.5 bg-cyan-400 text-slate-950 font-extrabold text-2xl rounded-2xl shadow-lg shadow-cyan-400/30">
                        {scene.highlightText}
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        как вложите деньги
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 pt-2 border-t border-white/10">
                      {scene.tagline}
                    </p>
                  </div>
                )}

                {/* Scene 3: Brand Reveal & Mascot Aqyl */}
                {scene.type === "brand_reveal" && (
                  <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-400">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-widest">
                      {scene.titleLine1}
                    </span>
                    <h2 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                      {scene.titleLine2}
                    </h2>
                    <p className="text-xs text-cyan-300 font-medium">
                      {scene.tagline}
                    </p>

                    {/* Cute Mascot Avatar Badge */}
                    <div className="relative w-44 h-44 mx-auto rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20 bg-slate-900 flex items-center justify-center my-4 group">
                      <div className="text-center p-4">
                        <div className="text-5xl mb-2 animate-bounce">🦉</div>
                        <p className="text-xs font-extrabold text-cyan-400">
                          Маскот Aqyl
                        </p>
                        <p className="text-[10px] text-slate-400">ИИ-Детектив</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scene 4: 3D Horizontal Carousel */}
                {scene.type === "carousel" && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div>
                      <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-wide">
                        {scene.tagline}
                      </p>
                      <h3 className="text-xl font-black text-white">
                        Ключевые модули SAQ
                      </h3>
                    </div>

                    {/* Sliding cards list */}
                    <div className="space-y-2.5 overflow-hidden py-1">
                      {CAROUSEL_CARDS.map((card, i) => (
                        <div
                          key={card.id}
                          className={`p-3.5 rounded-2xl border ${card.border} bg-gradient-to-r ${card.gradient} backdrop-blur-md transition-all duration-300 transform`}
                          style={{
                            transform: `translateX(${
                              Math.sin((carouselOffset + i * 40) / 30) * 8
                            }px)`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-extrabold text-sm text-white">
                              {card.title}
                            </h4>
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-white/10 text-cyan-300 rounded-full border border-cyan-400/30">
                              {card.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium">
                            {card.subtitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene 5: Outro & Call to Action */}
                {scene.type === "outro" && (
                  <div className="text-center space-y-5 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black text-3xl mx-auto shadow-xl shadow-cyan-400/40">
                      S
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                      Проверь до того,
                      <br />
                      <span className="text-cyan-400">как вложишь деньги!</span>
                    </h2>

                    <div className="inline-block px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-400/30">
                      saq-kz.org • Начать проверку
                    </div>

                    <p className="text-xs text-slate-400 font-medium">
                      {scene.tagline}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Playback Bar */}
              <div className="relative z-30 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="text-[11px] font-mono text-slate-400">
                  Сцена {currentSceneIdx + 1} / {SCENES.length}
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95"
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Scene Breakdown & Details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              Структура рекламного видеоролика SAQ
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Видеоролик создан в точном соответствии с шаблоном динамичного
              Shorts/Reels коммерческого обзора: кинетическая типографика,
              неоновые акценты, плавная прокрутка фич-карт и финальный Call to
              Action.
            </p>

            {/* Scene Selector Grid */}
            <div className="space-y-3">
              {SCENES.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    setProgress(0);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between ${
                    idx === currentSceneIdx
                      ? "bg-cyan-500/10 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
                      <span>Сцена {sc.id}</span>
                      <span>•</span>
                      <span>{sc.duration} сек</span>
                    </div>
                    <p className="font-bold text-sm text-white">
                      {sc.titleLine1} {sc.titleLine2}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {sc.tagline}
                    </p>
                  </div>

                  {idx === currentSceneIdx && (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-cyan-400 text-slate-950 rounded-full">
                      Активна
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Badge */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">
                Формат видео
              </p>
              <p className="text-base font-bold text-white">
                Vertical 9:16 • 1080×1920 • 30 FPS MP4
              </p>
            </div>
            <a
              href="/saq_promo_review.mp4"
              download
              className="px-4 py-2.5 bg-white text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition"
            >
              Скачать файл
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
