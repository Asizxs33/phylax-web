"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { AqylMark } from "@/components/SaqMark";

type Tip = {
  id: number;
  target: string;
  note: string;
  contact: string | null;
  status: string;
  risk_score: number | null;
  investigation_id: number | null;
  created_at: string;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Aqyl проверяет…", cls: "bg-accent/10 text-accent-bright" },
  confirmed: { label: "подтверждено · в чёрном списке", cls: "bg-danger/10 text-danger" },
  rejected: { label: "риск не подтвердился", cls: "bg-safe/10 text-safe" },
};

function statusMeta(status: string) {
  return STATUS_META[status] ?? STATUS_META.pending;
}

export default function CommunityPage() {
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [target, setTarget] = useState("");
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function loadTips() {
    try {
      const res = await fetch("/api/tips");
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Не удалось загрузить ленту");
      setTips(payload as Tip[]);
      setFeedError(null);
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setTips([]);
    }
  }

  useEffect(() => {
    loadTips();
  }, []);

  // пока есть непроверенные наводки — лента сама подтягивает вердикты Aqyl
  useEffect(() => {
    if (!tips?.some((t) => t.status === "pending")) return;
    const timer = setInterval(loadTips, 10_000);
    return () => clearInterval(timer);
  }, [tips]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!target.trim() || !note.trim()) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), note: note.trim(), contact: contact.trim() || null }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Не удалось отправить");
      setStatus("done");
      setTarget("");
      setNote("");
      setContact("");
      loadTips();
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setStatus("error");
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          eyebrow="Сообщество"
          title="Люди замечают — Aqyl проверяет"
          lead="Видели подозрительную компанию, сайт или канал — расскажите здесь. Каждая наводка проходит через Aqyl: он опрашивает открытые источники, строит граф связей и считает risk score. Подтверждённые случаи попадают в общий реестр и предупреждают следующего человека."
        />

        <section className="px-6 pb-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[380px_1fr]">
            {/* SUBMIT FORM */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="soft-shadow rounded-2xl border border-border/80 bg-bg-card/75 p-6 backdrop-blur-sm shadow-md">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10">
                    <AqylMark className="h-7 w-7" mood="happy" />
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-ink">Сообщить о подозрении</p>
                    <p className="text-xs text-ink-muted">Aqyl проанализирует и добавит в ленту</p>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="card-label !mb-2 block">Объект (домен / кошелёк / @канал / название)</label>
                    <input
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="например, easy-profit.example или @quick_x10"
                      className="w-full rounded-xl border border-border bg-bg-elevated/40 px-3.5 py-2.5 text-sm outline-none placeholder:text-ink-faint focus:border-accent focus:bg-bg-card focus:shadow-inner focus:ring-3 focus:ring-accent/10 transition-all duration-300 text-ink"
                      required
                    />
                  </div>
                  <div>
                    <label className="card-label !mb-2 block">Почему это похоже на пирамиду</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                      placeholder="Обещания доходности, реферальная схема, задержки выплат…"
                      className="w-full rounded-xl border border-border bg-bg-elevated/40 px-3.5 py-2.5 text-sm outline-none placeholder:text-ink-faint focus:border-accent focus:bg-bg-card focus:shadow-inner focus:ring-3 focus:ring-accent/10 transition-all duration-300 resize-none text-ink"
                      required
                    />
                  </div>
                  <div>
                    <label className="card-label !mb-2 block">Контакт (необязательно)</label>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="email или telegram"
                      className="w-full rounded-xl border border-border bg-bg-elevated/40 px-3.5 py-2.5 text-sm outline-none placeholder:text-ink-faint focus:border-accent focus:bg-bg-card focus:shadow-inner focus:ring-3 focus:ring-accent/10 transition-all duration-300 text-ink"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                      {error}
                    </div>
                  )}
                  {status === "done" && (
                    <div className="rounded-lg border border-safe/40 bg-safe/10 px-4 py-3 text-sm text-safe">
                      Спасибо! Наводка принята и появится в ленте.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending" || !target.trim() || !note.trim()}
                    className="btn-shine rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status === "sending" ? "Отправляю…" : "Отправить наводку"}
                  </button>
                </form>
              </div>

              <p className="mt-4 px-2 text-xs leading-relaxed text-ink-faint">
                Наводки видны всем. Не публикуйте персональные данные третьих
                лиц — только объект и факты, которые вы наблюдали.
              </p>
            </div>

            {/* FEED */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-2xl font-extrabold">Лента наводок</h2>
                <span className="font-mono text-xs uppercase tracked text-ink-faint">
                  {tips ? `${tips.length} записей` : "загрузка…"}
                </span>
              </div>

              {feedError && (
                <div className="rounded-2xl border border-danger/40 bg-danger/10 px-5 py-4 text-sm text-danger">
                  {feedError} Лента появится, когда бэкенд будет запущен.
                </div>
              )}

              {tips && tips.length === 0 && !feedError && (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-strong bg-bg-card/60 px-6 py-16 text-center">
                  <AqylMark className="h-16 w-16 float-soft" mood="surprised" />
                  <p className="max-w-sm text-sm text-ink-muted">
                    Пока тихо. Будьте первым: если встречали подозрительный
                    проект — сообщите, и Aqyl его разберёт.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {tips?.map((tip) => {
                  const meta = statusMeta(tip.status);
                  return (
                    <article
                      key={tip.id}
                      className="card-lift soft-shadow rounded-2xl border border-border/80 bg-bg-card/75 p-5 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="truncate font-mono text-sm font-bold text-ink">{tip.target}</p>
                        <div className="flex items-center gap-2">
                          {tip.risk_score != null && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracked ${
                                tip.risk_score >= 40
                                  ? "bg-danger/10 text-danger"
                                  : "bg-safe/10 text-safe"
                              }`}
                            >
                              риск {tip.risk_score}/100
                            </span>
                          )}
                          <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracked ${meta.cls}`}>
                            {meta.label}
                          </span>
                          <span className="font-mono text-[10px] text-ink-faint">
                            {tip.created_at?.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{tip.note}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="font-mono text-[10px] uppercase tracked text-ink-faint">
                          #{String(tip.id).padStart(4, "0")} · от сообщества
                        </span>
                        <Link
                          href={`/investigate?q=${encodeURIComponent(tip.target)}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs font-medium text-accent-bright transition hover:border-accent hover:bg-accent/5"
                        >
                          <AqylMark className="h-3.5 w-3.5" />
                          Проверить через Aqyl →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
