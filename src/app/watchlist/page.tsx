"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { QUERY_TYPE_LABELS, type QueryType, type WatchlistEntry } from "@/lib/types";

const TONE = (score: number) =>
  score >= 60 ? "text-danger" : score >= 30 ? "text-accent-bright" : "text-safe";

export default function WatchlistPage() {
  const [entries, setEntries] = useState<WatchlistEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(30);

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

  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          index="06"
          eyebrow="Реестр"
          title="Watchlist"
          lead="Живой реестр всех проверок, накопленных через Phylax. Один и тот же домен, кошелёк или канал, всплывший в разных расследованиях, здесь виден сразу — это то самое «уже встречалось», которое обычно есть только у институциональной памяти спецслужб, но на открытых данных."
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
            </div>

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
              {entries?.map((e, i) => (
                <div
                  key={e.id}
                  className="reveal stamped flex flex-col gap-3 rounded-lg border border-border bg-bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                  style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm text-ink">{e.query}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {QUERY_TYPE_LABELS[e.query_type as QueryType] ?? e.query_type} ·{" "}
                      {new Date(e.created_at.replace(" ", "T") + "Z").toLocaleString("ru-RU")}
                    </p>
                    {e.risk_flags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {e.risk_flags.slice(0, 5).map((f) => (
                          <span
                            key={f}
                            className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[10px] uppercase text-danger"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <p className={`font-display text-2xl ${TONE(e.risk_score)}`}>{e.risk_score}</p>
                      <p className="font-mono text-[10px] uppercase tracked text-ink-faint">score</p>
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
