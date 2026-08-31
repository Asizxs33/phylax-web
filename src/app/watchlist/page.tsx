"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { QUERY_TYPE_LABELS, type QueryType, type WatchlistEntry } from "@/lib/types";

const TONE = (score: number) =>
  score >= 60 ? "text-danger" : score >= 30 ? "text-accent-bright" : "text-safe";

function parseDate(created_at: string): Date {
  return new Date(created_at.replace(" ", "T") + "Z");
}

const MONTH_NAMES = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];

function periodKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function periodLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export default function WatchlistPage() {
  const [entries, setEntries] = useState<WatchlistEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(30);
  const [period, setPeriod] = useState<string | null>(null);
  const [liveIds, setLiveIds] = useState<Set<number>>(new Set());
  const [liveOn, setLiveOn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/registry?min_score=${minScore}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Не удалось загрузить реестр");
        if (!cancelled) setEntries(payload as WatchlistEntry[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      });
    return () => {
      cancelled = true;
    };
  }, [minScore]);

  // Живая лента: автомониторинг CertStream шлёт по WebSocket каждую свою
  // находку — новые записи появляются в реестре сразу, без перезагрузки.
  useEffect(() => {
    // WebSocket идёт к бэкенду напрямую (прокси Next.js для upgrade-запросов
    // не нужен): адрес настраивается через NEXT_PUBLIC_WS_URL для деплоя.
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:8000/ws/live`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setLiveOn(true);
    ws.onclose = () => setLiveOn(false);
    ws.onerror = () => setLiveOn(false);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type !== "investigation") return;
        const entry: WatchlistEntry = {
          id: msg.id,
          query: msg.query,
          query_type: msg.query_type,
          risk_score: msg.risk_score,
          risk_flags: msg.risk_flags ?? [],
          connectors_run: [],
          created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        };
        // фильтр по текущему порогу — не подсовываем то, что пользователь скрыл
        setEntries((prev) => {
          if (!prev) return prev;
          if (entry.risk_score < minScore) return prev;
          if (prev.some((e) => e.id === entry.id)) return prev;
          return [entry, ...prev];
        });
        setLiveIds((s) => new Set(s).add(entry.id));
      } catch {
        /* некорректный кадр — игнорируем */
      }
    };

    return () => ws.close();
  }, [minScore]);

  const periods = useMemo(() => {
    if (!entries) return [];
    const counts = new Map<string, number>();
    for (const e of entries) {
      const key = periodKey(parseDate(e.created_at));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [entries]);

  const visibleEntries = useMemo(() => {
    if (!entries) return entries;
    if (!period) return entries;
    return entries.filter((e) => periodKey(parseDate(e.created_at)) === period);
  }, [entries, period]);

  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          index="06"
          eyebrow="Реестр"
          title="Watchlist"
          lead="Живой реестр всех проверок, накопленных через SAQ. Один и тот же домен, кошелёк или канал, всплывший в разных расследованиях, здесь виден сразу — это то самое «уже встречалось», которое обычно есть только у институциональной памяти спецслужб, но на открытых данных."
        />

        <section className="px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracked text-ink-faint">
                Минимальный risk score:
              </span>
              <div className="flex gap-1.5">
                {[0, 30, 60].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setEntries(null);
                      setPeriod(null);
                      setMinScore(s);
                    }}
                    className={`rounded-full border px-3 py-1 font-mono text-xs transition ${
                      minScore === s
                        ? "border-accent bg-accent text-bg"
                        : "border-border-strong text-ink-muted hover:text-ink"
                    }`}
                  >
                    {s === 0 ? "все" : `≥${s}`}
                  </button>
                ))}
              </div>

              <span
                title={
                  liveOn
                    ? "Живая лента подключена: находки автомониторинга появляются здесь сразу"
                    : "Живая лента недоступна — запущен ли бэкенд?"
                }
                className={`ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracked ${
                  liveOn ? "text-safe" : "text-ink-faint"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${liveOn ? "animate-pulse bg-safe" : "bg-ink-faint"}`}
                />
                {liveOn ? "живая лента" : "офлайн"}
              </span>
            </div>

            {periods.length > 1 && (
              <div className="mb-8">
                <p className="mb-2 font-mono text-xs uppercase tracked text-ink-faint">Хронология</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setPeriod(null)}
                    className={`shrink-0 rounded-xl border px-3.5 py-2 text-left transition ${
                      period === null
                        ? "border-accent bg-accent/10"
                        : "border-border-strong hover:border-accent/50"
                    }`}
                  >
                    <p className="font-mono text-xs text-ink">все периоды</p>
                    <p className="font-mono text-[10px] text-ink-faint">{entries?.length ?? 0} записей</p>
                  </button>
                  {periods.map(([key, count]) => (
                    <button
                      key={key}
                      onClick={() => setPeriod(period === key ? null : key)}
                      className={`shrink-0 rounded-xl border px-3.5 py-2 text-left transition ${
                        period === key
                          ? "border-accent bg-accent/10"
                          : "border-border-strong hover:border-accent/50"
                      }`}
                    >
                      <p className="font-mono text-xs capitalize text-ink">{periodLabel(key)}</p>
                      <p className="font-mono text-[10px] text-ink-faint">{count} записей</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            {!entries && !error && (
              <div className="flex flex-col items-center gap-3 py-16 font-mono text-xs uppercase tracked text-ink-faint">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
                Загружаю реестр…
              </div>
            )}

            {entries && entries.length === 0 && (
              <div className="stamped rounded-lg border border-border bg-bg-card p-8 text-center">
                <p className="text-ink-muted">
                  Пока пусто на этом уровне риска. Реестр пополняется с каждой проверкой —{" "}
                  <Link href="/investigate" className="text-accent-bright underline underline-offset-2">
                    начните расследование
                  </Link>
                  , и оно появится здесь.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {visibleEntries?.map((e, i) => (
                <div
                  key={e.id}
                  className="reveal stamped card-lift transition-all duration-300 flex flex-col gap-4 rounded-2xl border border-border/80 bg-bg-card/75 p-5 sm:flex-row sm:items-center sm:justify-between backdrop-blur-sm shadow-sm hover:shadow-md"
                  style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-mono text-sm text-ink">{e.query}</p>
                      <span className="shrink-0 font-mono text-[9px] text-ink-faint/80">
                        PHX-{String(e.id).padStart(6, "0")}
                      </span>
                      {liveIds.has(e.id) && (
                        <span className="shrink-0 rounded-full bg-safe/15 px-1.5 py-0.5 font-mono text-[8px] uppercase tracked text-safe">
                          только что
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      {QUERY_TYPE_LABELS[e.query_type as QueryType] ?? e.query_type} ·{" "}
                      {new Date(e.created_at.replace(" ", "T") + "Z").toLocaleString("ru-RU")}
                    </p>
                    {e.risk_flags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {e.risk_flags.slice(0, 5).map((f) => (
                          <span
                            key={f}
                            className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-danger font-medium border border-danger/20"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4 sm:border-l sm:border-border/60 sm:pl-6 pl-0">
                    <div className="text-left sm:text-right">
                      <p className={`font-display text-3xl font-extrabold tracking-tight ${TONE(e.risk_score)}`}>{e.risk_score}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
