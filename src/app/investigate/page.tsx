"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { NavBar } from "@/components/NavBar";
import { PhylaxMark } from "@/components/PhylaxMark";
import { RiskGauge } from "@/components/RiskGauge";
import { TypingDots } from "@/components/chat/TypingDots";
import { EntityGraph } from "@/components/graph/EntityGraph";
import { RadarBackdrop } from "@/components/graph/RadarBackdrop";
import { NodeDetail } from "@/components/graph/NodeDetail";
import { KIND_META, type EntityKind, type GraphNode } from "@/lib/graph";
import { QUERY_TYPE_LABELS, type InvestigateResponse } from "@/lib/types";

type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; kind: "text"; text: string }
  | { id: number; role: "assistant"; kind: "typing" };

const SUGGESTIONS = ["profit-guarantee.example", "@easy_x10_daily", "Global MLM Invest"];
const LEGEND: EntityKind[] = ["target", "source", "domain", "wallet", "ip", "profile", "org"];

let counter = 0;
const nextId = () => ++counter;

export default function InvestigatePage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: nextId(),
      role: "assistant",
      kind: "text",
      text: "Пришлите объект — домен, кошелёк, @канал, username или название фонда. Я соберу досье, а связи покажу графом справа.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [dossier, setDossier] = useState<InvestigateResponse | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasUserMsg = messages.some((m) => m.role === "user");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(raw: string) {
    const query = raw.trim();
    if (!query || busy) return;
    setInput("");
    setBusy(true);
    const typingId = nextId();
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "user", text: query },
      { id: typingId, role: "assistant", kind: "typing" },
    ]);

    try {
      const res = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, query_type: null, synthesize: true }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? payload.detail ?? "Запрос не выполнен");
      const d = payload as InvestigateResponse;
      setDossier(d);
      setSelected(null);
      setShowReport(false);
      const okCount = d.results.filter((r) => r.ok).length;
      setMessages((m) =>
        m.map((msg) =>
          msg.id === typingId
            ? {
                id: typingId,
                role: "assistant",
                kind: "text",
                text: `Готово: risk ${d.risk_score}/100, ${d.risk_flags.length} сигнал(ов), ответили ${okCount} из ${d.connectors_run.length}. Граф связей — справа.`,
              }
            : msg
        )
      );
    } catch (err) {
      const text = err instanceof Error ? err.message : "Неизвестная ошибка";
      setMessages((m) =>
        m.map((msg) => (msg.id === typingId ? { id: typingId, role: "assistant", kind: "text", text } : msg))
      );
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex h-dvh flex-col">
      <NavBar />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* CHAT RAIL */}
        <aside className="flex min-h-0 shrink-0 flex-col border-b border-border bg-bg-elevated/60 lg:w-[380px] lg:border-b-0 lg:border-r xl:w-[440px]">
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-card">
              <PhylaxMark className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm leading-tight">Phylax</p>
              <p className="flex items-center gap-1 font-mono text-[10px] uppercase tracked text-safe">
                <span className="h-1.5 w-1.5 rounded-full bg-safe" />
                на связи
              </p>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5">
            <div className="flex flex-col gap-4">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-3.5 py-2 text-sm text-bg">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-2.5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-bg-card">
                      <PhylaxMark className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-bg-card px-3.5 py-2.5">
                      {m.kind === "typing" ? (
                        <div className="flex items-center gap-2 py-0.5 text-ink-muted">
                          <TypingDots />
                          <span className="font-mono text-[10px] uppercase tracked">
                            опрашиваю…
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-ink">{m.text}</p>
                      )}
                    </div>
                  </div>
                )
              )}

              {!hasUserMsg && (
                <div className="flex flex-col gap-2 pl-9">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-border-strong bg-bg-card px-3 py-1.5 text-left font-mono text-xs text-ink-muted transition hover:border-accent/50 hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите Phylax…"
                className="input-underline flex-1 px-1 py-2.5 text-sm placeholder:text-ink-faint"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Отправить"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-bg transition hover:bg-accent-bright disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </aside>

        {/* GRAPH STAGE */}
        <main
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 40%, var(--bg-elevated), var(--bg))" }}
        >
          <RadarBackdrop />
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracked text-ink-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Граф связей
          </div>
          {dossier ? (
            <>
              <div className="relative h-full w-full">
                <EntityGraph data={dossier} onSelect={setSelected} selectedId={selected?.id ?? null} />
              </div>

              {/* HUD: verdict */}
              <div className="stamped pointer-events-auto absolute left-4 top-12 z-10 w-64 rounded-lg border border-border bg-bg-card p-4">
                <p className="card-label">Объект</p>
                <p className="truncate font-mono text-sm text-ink">{dossier.query}</p>
                <p className="text-xs text-ink-muted">{QUERY_TYPE_LABELS[dossier.detected_type]}</p>
                {dossier.recurrence.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="font-mono text-[10px] uppercase tracked text-accent-bright">
                      уже встречался {dossier.recurrence.length}×
                    </span>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <div className="scale-90">
                    <RiskGauge score={dossier.risk_score} />
                  </div>
                </div>
                {dossier.risk_flags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dossier.risk_flags.slice(0, 6).map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[9px] uppercase text-danger"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                {dossier.summary && (
                  <button
                    onClick={() => setShowReport((v) => !v)}
                    className="mt-3 w-full rounded-lg border border-border-strong py-1.5 font-mono text-[10px] uppercase tracked text-ink-muted transition hover:text-ink"
                  >
                    {showReport ? "скрыть отчёт" : "показать отчёт"}
                  </button>
                )}
              </div>

              {/* report panel */}
              {showReport && dossier.summary && (
                <div className="stamped absolute bottom-4 left-4 z-10 w-80 max-w-[calc(100%-2rem)] rounded-lg border border-border bg-bg-card p-4">
                  <p className="card-label">Отчёт</p>
                  <p className="max-h-52 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-ink-muted">
                    {dossier.summary}
                  </p>
                </div>
              )}

              {/* detail panel (selected node) or legend */}
              {selected ? (
                <NodeDetail node={selected} dossier={dossier} onClose={() => setSelected(null)} />
              ) : (
                <div className="stamped absolute right-4 top-4 z-10 rounded-lg border border-border bg-bg-card p-3">
                  <p className="card-label">Легенда · кликните узел</p>
                  <div className="flex flex-col gap-1.5">
                    {LEGEND.map((k) => (
                      <div key={k} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full border"
                          style={{ borderColor: KIND_META[k].color, background: KIND_META[k].color + "33" }}
                        />
                        <span className="font-mono text-[10px] text-ink-muted">{KIND_META[k].label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <PhylaxMark className={`h-20 w-20 ${busy ? "pulse-slow" : "float-soft"}`} glow />
              <p className="max-w-sm text-ink-muted">
                {busy
                  ? "Собираю данные и связи…"
                  : "Спросите слева — и здесь появится граф связей: источники, домены, кошельки, профили и юрлица вокруг объекта."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
