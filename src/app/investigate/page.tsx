"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { NavBar } from "@/components/NavBar";
import { AqylMark, type AqylMood } from "@/components/SaqMark";
import { AqylLive } from "@/components/AqylLive";
import { RiskGauge } from "@/components/RiskGauge";
import { TypingDots } from "@/components/chat/TypingDots";
import { EntityGraph } from "@/components/graph/EntityGraph";
import { EntityGraphGL } from "@/components/graph/EntityGraphGL";
import { RadarBackdrop } from "@/components/graph/RadarBackdrop";
import { NodeDetail } from "@/components/graph/NodeDetail";
import { KIND_META, type EntityKind, type GraphNode } from "@/lib/graph";
import { QUERY_TYPE_LABELS, type InvestigateResponse } from "@/lib/types";
import { apiFetch, useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  AuditPanel,
  PANELS,
  RegistriesPanel,
  SourcesPanel,
  VaultPanel,
  type AuditEvent,
  type PanelId,
  type VaultItem,
} from "@/components/chat/InvestigatePanels";

type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; kind: "text"; text: string; suggestions?: string[] }
  | { id: number; role: "assistant"; kind: "typing"; status?: string };

/** один источник в живом списке прогресса проверки */
export interface SourceTick {
  name: string;
  ok: boolean;
  flags: number;
}

type StreamEvent =
  | { type: "status"; label: string }
  | { type: "delta"; text: string }
  | { type: "source"; name: string; ok: boolean; flags: number; done: number; total: number }
  | { type: "dossier"; dossier: InvestigateResponse }
  | {
      type: "done";
      reply: string;
      dossier: InvestigateResponse | null;
      dossiers?: InvestigateResponse[];
      suggestions?: string[];
    };

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
      text: "Спросите меня о чём угодно — домен, кошелёк, @канал, username, название. Я сама решаю, какие источники проверить, и держу в памяти весь разговор — можно уточнять и спрашивать дальше.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mood, setMood] = useState<AqylMood>("happy");
  const [dossier, setDossier] = useState<InvestigateResponse | null>(null);
  // все объекты, проверенные последним ответом — из них строится общий граф
  const [dossiers, setDossiers] = useState<InvestigateResponse[]>([]);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [panel, setPanel] = useState<PanelId>("chat");
  // WebGL-рендер графа (PIXI) с автоматическим откатом на SVG, если
  // ускорение недоступно — и с ручным переключателем для сравнения
  const [webgl, setWebgl] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [vault, setVault] = useState<VaultItem[]>([]);
  // живой список опрошенных источников + счётчик «сколько из скольких»
  const [sources, setSources] = useState<SourceTick[]>([]);
  const [sourceTotal, setSourceTotal] = useState(0);
  // сколько секунд уже идёт проверка — чтобы ожидание не было вслепую
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");
  if (!sessionIdRef.current) {
    sessionIdRef.current = crypto.randomUUID();
  }

  const hasUserMsg = messages.some((m) => m.role === "user");

  const nowLabel = () =>
    new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const logAudit = (kind: AuditEvent["kind"], text: string) =>
    setAudit((a) => [...a, { id: nextId(), at: nowLabel(), kind, text }]);

  const saveToVault = (item: Omit<VaultItem, "id" | "at">) => {
    setVault((v) => [...v, { ...item, id: nextId(), at: nowLabel() }]);
    logAudit("done", `Сохранено в улики: ${item.label}`);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // секундомер проверки: полный прогон занимает ~40 секунд, и без счётчика
  // ожидание выглядит как зависание
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  // deep link: /investigate?q=<объект> — из «Сообщества» и обучающих страниц,
  // либо ?session=<id> — открыть сохранённый диалог из истории кабинета
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedSession = params.get("session");
    if (savedSession) {
      sessionIdRef.current = savedSession;
      apiFetch(`/me/chats/${savedSession}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((msgs: { role: string; content: string }[]) => {
          setMessages(
            msgs.map((m) =>
              m.role === "user"
                ? { id: nextId(), role: "user" as const, text: m.content }
                : { id: nextId(), role: "assistant" as const, kind: "text" as const, text: m.content }
            )
          );
        })
        .catch(() => undefined);
      return;
    }
    const q = params.get("q");
    if (q) send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(raw: string) {
    const query = raw.trim();
    if (!query || busy || !user) return;
    setInput("");
    setBusy(true);
    setSources([]);
    setSourceTotal(0);
    setElapsed(0);
    abortRef.current = new AbortController();
    const typingId = nextId();
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "user", text: query },
      { id: typingId, role: "assistant", kind: "typing" },
    ]);

    logAudit("query", `Запрос: «${query}»`);

    const applyResult = (
      reply: string,
      d: InvestigateResponse | null,
      suggestions?: string[],
      all?: InvestigateResponse[]
    ) => {
      setDossiers(all && all.length ? all : d ? [d] : []);
      if (d) {
        setDossier(d);
        setSelected(null);
        setShowReport(false);
        setMood(d.risk_score >= 70 ? "alert" : d.risk_score >= 40 ? "surprised" : "happy");
        logAudit(
          "done",
          `Досье готово: ${d.query} — риск ${d.risk_score}/100, источников: ${d.results.length}`
        );
      } else {
        logAudit("done", "Ответ получен (без нового досье)");
      }
      setMessages((m) =>
        m.map((msg) =>
          msg.id === typingId
            ? { id: typingId, role: "assistant", kind: "text", text: reply, suggestions }
            : msg
        )
      );
    };

    const setStatus = (status: string) => {
      logAudit("status", status);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === typingId ? { id: typingId, role: "assistant", kind: "typing", status } : msg
        )
      );
    };

    try {
      const res = await apiFetch("/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionIdRef.current, message: query }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        // стрим недоступен (старый бэкенд?) — обычный запрос как раньше
        const fallback = await apiFetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionIdRef.current, message: query }),
        });
        const payload = await fallback.json();
        if (!fallback.ok) throw new Error(payload.error ?? payload.detail ?? "Запрос не выполнен");
        applyResult(payload.reply, payload.dossier, payload.suggestions, payload.dossiers);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let finished = false;
      let streamedReply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let sep;
        while ((sep = buf.indexOf("\n\n")) >= 0) {
          const frame = buf.slice(0, sep);
          buf = buf.slice(sep + 2);
          const dataLine = frame.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          const ev = JSON.parse(dataLine.slice(6)) as StreamEvent;
          if (ev.type === "status") {
            setStatus(ev.label);
          } else if (ev.type === "source") {
            // источник отозвался — сразу в список, не дожидаясь остальных
            setSourceTotal(ev.total);
            setSources((s) =>
              s.some((x) => x.name === ev.name)
                ? s
                : [...s, { name: ev.name, ok: ev.ok, flags: ev.flags }]
            );
          } else if (ev.type === "dossier") {
            // граф и risk-gauge рисуем до того, как модель допишет текст
            setDossier(ev.dossier);
            setDossiers((prev) =>
              prev.some((d) => d.investigation_id === ev.dossier.investigation_id)
                ? prev
                : [...prev, ev.dossier]
            );
            setSelected(null);
            setShowReport(false);
            setMood(
              ev.dossier.risk_score >= 70
                ? "alert"
                : ev.dossier.risk_score >= 40
                  ? "surprised"
                  : "happy"
            );
          } else if (ev.type === "delta") {
            // текст ответа печатается по мере генерации: пузырь «печатает…»
            // заменяется на растущий текст
            streamedReply += ev.text;
            const text = streamedReply;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === typingId
                  ? { id: typingId, role: "assistant", kind: "text", text }
                  : msg
              )
            );
          } else if (ev.type === "done") {
            applyResult(ev.reply, ev.dossier, ev.suggestions, ev.dossiers);
            finished = true;
          }
        }
      }
      if (!finished) throw new Error("Стрим оборвался — попробуйте ещё раз");
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      if (aborted) {
        logAudit("status", "Проверка отменена");
        setMessages((m) => m.filter((msg) => msg.id !== typingId));
        setInput(query); // запрос не теряем — можно поправить и отправить снова
        return;
      }
      setMood("sad");
      const text = err instanceof Error ? err.message : "Неизвестная ошибка";
      logAudit("error", text);
      setMessages((m) =>
        m.map((msg) => (msg.id === typingId ? { id: typingId, role: "assistant", kind: "text", text } : msg))
      );
      // сорванный запрос возвращаем в поле, иначе его приходится набирать заново
      setInput(query);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function cancelSearch() {
    abortRef.current?.abort();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex h-dvh flex-col">
      <NavBar />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ICON RAIL — переключение рабочих панелей расследования */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-bg-elevated/80 px-2 py-2 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:px-1.5 lg:py-3">
          {PANELS.map((p) => {
            const active = panel === p.id;
            const badge =
              p.id === "sources"
                ? dossier?.results.length
                : p.id === "vault"
                  ? vault.length || undefined
                  : p.id === "audit"
                    ? audit.length || undefined
                    : undefined;
            return (
              <button
                key={p.id}
                onClick={() => setPanel(p.id)}
                title={p.title}
                aria-label={p.title}
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                  active
                    ? "bg-accent/15 text-accent-bright"
                    : "text-ink-faint hover:bg-bg-card hover:text-ink-muted"
                }`}
              >
                <p.Icon className="h-[18px] w-[18px]" />
                {badge != null && badge > 0 && (
                  <span
                    className={`absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 font-mono text-[8px] font-bold leading-none ${
                      p.id === "vault" ? "bg-accent text-white" : "bg-border-strong text-ink"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* PANEL — чат либо одна из рабочих панелей */}
        <aside className="flex min-h-0 shrink-0 flex-col border-b border-border bg-bg-elevated/60 lg:w-[380px] lg:border-b-0 lg:border-r xl:w-[440px]">
          {panel === "sources" && <SourcesPanel dossier={dossier} onSave={saveToVault} />}
          {panel === "registries" && <RegistriesPanel />}
          {panel === "vault" && (
            <VaultPanel items={vault} onRemove={(id) => setVault((v) => v.filter((x) => x.id !== id))} />
          )}
          {panel === "audit" && <AuditPanel events={audit} />}

          {panel === "chat" && (
            <>
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-card">
              <AqylMark className="h-6 w-6" mood={busy ? "thinking" : mood} />
            </div>
            <div>
              <p className="font-display text-sm leading-tight">Aqyl</p>
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
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-accent to-indigo-600 dark:from-accent-bright dark:to-indigo-500 shadow-sm px-4 py-2.5 text-sm text-white">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-2.5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-bg-card">
                      <AqylMark className="h-4.5 w-4.5" mood={m.kind === "typing" ? "thinking" : "neutral"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl rounded-tl-sm border border-border/80 bg-bg-card/75 shadow-sm backdrop-blur-sm px-4 py-3">
                        {m.kind === "typing" ? (
                          <div className="flex items-center gap-2 py-0.5 text-ink-muted">
                            <TypingDots />
                            <span className="font-mono text-[10px] uppercase tracked">
                              {m.status ?? "опрашиваю…"}
                            </span>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{m.text}</p>
                        )}
                      </div>
                      {m.kind === "text" && !!m.suggestions?.length && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {m.suggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              disabled={busy}
                              onClick={() => send(s)}
                              className="rounded-xl border border-border-strong/70 bg-bg-card/60 px-3 py-2 text-left text-xs text-ink-muted transition hover:border-accent hover:bg-accent/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
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
                      className="rounded-full border border-border-strong bg-bg-card px-3.5 py-2 text-left font-mono text-xs text-ink-muted transition hover:border-accent hover:text-ink cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!authLoading && !user ? (
            <div className="border-t border-border bg-bg-elevated/40 p-4">
              <p className="mb-3 text-xs leading-relaxed text-ink-muted">
                Чтобы спросить Aqyl, нужен аккаунт — каждое расследование опрашивает десятки
                источников, и вход помогает держать нагрузку под контролем. Регистрация бесплатна.
              </p>
              <Link
                href="/login?next=/investigate"
                className="btn-shine block rounded-full bg-accent px-6 py-2.5 text-center text-sm font-medium text-white transition hover:bg-accent-bright"
              >
                Войти или зарегистрироваться
              </Link>
            </div>
          ) : (
          <form onSubmit={onSubmit} className="border-t border-border p-4 bg-bg-elevated/40">
            <div className="flex items-center gap-2 rounded-2xl border border-border-strong/60 bg-bg-card px-3 py-1.5 shadow-sm focus-within:border-accent focus-within:shadow-md focus-within:ring-3 focus-within:ring-accent/10 transition-all duration-300">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите Aqyl…"
                className="flex-1 border-none bg-transparent py-1.5 text-sm outline-none placeholder:text-ink-faint"
              />
              {busy ? (
                // пока идёт проверка кнопка «отправить» всё равно заблокирована —
                // полезнее отдать это место под отмену, чем показывать серую стрелку
                <button
                  type="button"
                  onClick={cancelSearch}
                  aria-label="Отменить проверку"
                  title="Отменить проверку"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border text-ink-muted shadow-sm transition hover:border-danger hover:text-danger"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Отправить"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-bright disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </form>
          )}
            </>
          )}
        </aside>

        {/* GRAPH STAGE */}
        <main
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 40%, var(--bg-elevated), var(--bg))" }}
        >
          <RadarBackdrop />
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracked text-ink-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {dossiers.length > 1 ? `Общий граф · ${dossiers.length} объекта` : "Граф связей"}
          </div>
          {dossier ? (
            <>
              <div className="relative h-full w-full">
                {webgl ? (
                  <EntityGraphGL
                    data={dossier}
                    items={dossiers}
                    onSelect={setSelected}
                    selectedId={selected?.id ?? null}
                    onUnavailable={() => setWebgl(false)}
                  />
                ) : (
                  <EntityGraph
                    data={dossier}
                    items={dossiers}
                    onSelect={setSelected}
                    selectedId={selected?.id ?? null}
                  />
                )}
              </div>

              <button
                onClick={() => setWebgl((v) => !v)}
                title="Переключить движок отрисовки графа"
                className="absolute bottom-4 right-4 z-10 rounded-lg border border-border/80 bg-bg-card/90 px-2.5 py-1.5 font-mono text-[9px] uppercase tracked text-ink-faint shadow-lg backdrop-blur-md transition hover:text-ink"
              >
                {webgl ? "WebGL · PIXI" : "SVG"}
              </button>

              {/* HUD: verdict */}
              <div className="stamped pointer-events-auto absolute left-4 top-12 z-10 w-64 rounded-2xl border border-border/80 bg-bg-card/90 p-5 shadow-xl backdrop-blur-md">
                <p className="card-label justify-between">
                  <span>Объект</span>
                  <span className="normal-case tracking-normal text-ink-faint/80">
                    SAQ-{String(dossier.investigation_id).padStart(6, "0")}
                  </span>
                </p>
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
                    className="mt-3 w-full rounded-lg border border-border-strong py-1.5 font-mono text-[10px] uppercase tracked text-ink-muted transition hover:text-ink cursor-pointer"
                  >
                    {showReport ? "скрыть отчёт" : "показать отчёт"}
                  </button>
                )}
              </div>

              {/* report panel */}
              {showReport && dossier.summary && (
                <div className="stamped absolute bottom-4 left-4 z-10 w-80 max-w-[calc(100%-2rem)] rounded-2xl border border-border/80 bg-bg-card/90 p-5 shadow-xl backdrop-blur-md">
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
                <div className="stamped absolute right-4 top-4 z-10 rounded-2xl border border-border/80 bg-bg-card/90 p-4 shadow-lg backdrop-blur-md">
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
              <div className={busy ? "pulse-slow" : "float-soft"}>
                <AqylLive className="h-24 w-24" mood={busy ? "thinking" : "happy"} />
              </div>
              {busy ? (
                <div className="w-full max-w-md">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm text-ink-muted">
                      {sourceTotal
                        ? `Опрашиваю источники — ${sources.length} из ${sourceTotal}`
                        : "Собираю данные и связи…"}
                    </p>
                    <span className="font-mono text-[11px] tabular-nums text-ink-faint">
                      {elapsed}s
                    </span>
                  </div>
                  {sourceTotal > 0 && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg-elevated">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${(sources.length / sourceTotal) * 100}%` }}
                      />
                    </div>
                  )}
                  {sources.length > 0 && (
                    <ul className="mt-4 max-h-[38vh] space-y-1.5 overflow-y-auto text-left">
                      {sources.map((s) => (
                        <li
                          key={s.name}
                          className="panel-rise flex items-center gap-2.5 rounded-lg border border-border/60 bg-bg-card/40 px-3 py-1.5"
                        >
                          <span
                            className={`font-mono text-xs ${s.ok ? "text-emerald-400" : "text-ink-faint"}`}
                          >
                            {s.ok ? "✓" : "—"}
                          </span>
                          <span className="flex-1 truncate text-xs text-ink-muted">{s.name}</span>
                          {s.flags > 0 && (
                            <span className="shrink-0 rounded-full bg-danger/15 px-2 py-0.5 font-mono text-[10px] text-danger">
                              {s.flags} сигн.
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-4 text-[11px] text-ink-faint">
                    Полная проверка обычно занимает 30–60 секунд
                  </p>
                  <button
                    onClick={cancelSearch}
                    className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs text-ink-muted transition hover:border-danger hover:text-danger"
                  >
                    Отменить
                  </button>
                </div>
              ) : (
                <p className="max-w-sm text-ink-muted">
                  Спросите слева — и здесь появится граф связей: источники, домены, кошельки, профили и юрлица вокруг объекта.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
