"use client";

/* Боковые панели рабочего стола расследования — то, что в аналогах вроде
 * Symphoria вынесено в вертикальный рельс иконок: источники этого прогона,
 * официальные реестры, сохранённые улики и журнал действий. Всё работает
 * поверх уже имеющегося досье, никаких новых запросов к бэкенду. */

import type { SVGProps } from "react";
import { SOURCE_EXPLAIN, SOURCE_LABELS } from "@/lib/graph";
import { REGISTRIES } from "@/lib/registries";
import type { InvestigateResponse } from "@/lib/types";
import { IconArchive, IconChat, IconClip, IconClock, IconGraduation } from "@/components/icons";

export type PanelId = "chat" | "sources" | "registries" | "vault" | "audit";

export interface AuditEvent {
  id: number;
  at: string;
  kind: "query" | "status" | "done" | "error";
  text: string;
}

export interface VaultItem {
  id: number;
  at: string;
  label: string;
  note: string;
  source: string;
}

export const PANELS: {
  id: PanelId;
  Icon: (p: SVGProps<SVGSVGElement>) => React.ReactElement;
  title: string;
}[] = [
  { id: "chat", Icon: IconChat, title: "Чат с Aqyl" },
  { id: "sources", Icon: IconClip, title: "Источники прогона" },
  { id: "registries", Icon: IconGraduation, title: "Реестры Казахстана" },
  { id: "vault", Icon: IconArchive, title: "Улики" },
  { id: "audit", Icon: IconClock, title: "Журнал действий" },
];

function PanelHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracked text-ink-faint">{title}</p>
      {count != null && (
        <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent-bright">
          {count}
        </span>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-xs leading-relaxed text-ink-muted">{text}</p>;
}

/* --- Источники: что реально опрашивалось в этом прогоне --- */
export function SourcesPanel({
  dossier,
  onSave,
}: {
  dossier: InvestigateResponse | null;
  onSave: (item: Omit<VaultItem, "id" | "at">) => void;
}) {
  const results = dossier?.results ?? [];
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="Источники прогона" count={results.length} />
      {!dossier ? (
        <Empty text="Пока нечего показать — задайте Aqyl объект для проверки, и здесь появятся все опрошенные источники." />
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-2">
            {results.map((r) => {
              const label = SOURCE_LABELS[r.source] ?? r.source;
              const used = r.ok && r.red_flags.length > 0;
              return (
                <div
                  key={r.source}
                  className="rounded-xl border border-border/80 bg-bg-card/60 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-ink">{label}</p>
                    <div className="flex shrink-0 gap-1">
                      <span
                        className={`rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracked ${
                          r.ok ? "border-border-strong text-ink-muted" : "border-danger/40 bg-danger/10 text-danger"
                        }`}
                      >
                        {r.ok ? "прочитано" : "нет ответа"}
                      </span>
                      {used && (
                        <span className="rounded-full border border-danger/40 bg-danger/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracked text-danger">
                          в выводе
                        </span>
                      )}
                    </div>
                  </div>
                  {SOURCE_EXPLAIN[r.source] && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-muted">
                      {SOURCE_EXPLAIN[r.source]}
                    </p>
                  )}
                  {r.red_flags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {r.red_flags.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-danger/10 px-1.5 py-0.5 font-mono text-[8px] text-danger"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.ok && (
                    <button
                      onClick={() =>
                        onSave({
                          label: `${label} · ${dossier.query}`,
                          note: r.red_flags.length ? r.red_flags.join(", ") : "без сигналов риска",
                          source: r.source,
                        })
                      }
                      className="mt-2 rounded-lg border border-border-strong px-2 py-1 font-mono text-[9px] uppercase tracked text-ink-muted transition hover:border-accent hover:text-ink"
                    >
                      + в улики
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Реестры: первоисточники, куда идти руками --- */
export function RegistriesPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="Реестры Казахстана" count={REGISTRIES.length} />
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="mb-3 px-1 text-[11px] leading-relaxed text-ink-muted">
          Aqyl проверяет открытые источники сам, но эти реестры — первичны. Сходите и убедитесь
          лично: Aqyl их не заменяет.
        </p>
        <div className="flex flex-col gap-2">
          {REGISTRIES.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border/80 bg-bg-card/60 px-3 py-2.5 transition hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-ink">{r.name}</p>
                <span className="shrink-0 text-ink-faint transition group-hover:text-accent-bright">↗</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-ink-muted">{r.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- Улики: то, что пользователь отложил вручную --- */
export function VaultPanel({
  items,
  onRemove,
}: {
  items: VaultItem[];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="Улики" count={items.length} />
      {items.length === 0 ? (
        <Empty text="Пусто. Откройте панель «Источники» и нажмите «+ в улики» у нужного источника — сохранённое останется здесь на время сессии." />
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-2">
            {items.map((it) => (
              <div key={it.id} className="rounded-xl border border-border/80 bg-bg-card/60 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-ink">{it.label}</p>
                  <button
                    onClick={() => onRemove(it.id)}
                    aria-label="Удалить"
                    className="shrink-0 text-ink-faint transition hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-ink-muted">{it.note}</p>
                <p className="mt-1 font-mono text-[9px] text-ink-faint">{it.at}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Журнал: полный след того, что делала система --- */
const AUDIT_TONE: Record<AuditEvent["kind"], string> = {
  query: "bg-accent",
  status: "bg-ink-faint",
  done: "bg-safe",
  error: "bg-danger",
};

export function AuditPanel({ events }: { events: AuditEvent[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="Журнал действий" count={events.length} />
      {events.length === 0 ? (
        <Empty text="Журнал пуст. Каждый запрос, каждый опрошенный источник и каждый результат будут записаны здесь по шагам." />
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-1.5">
            {events
              .slice()
              .reverse()
              .map((e) => (
                <div key={e.id} className="flex gap-2 rounded-lg px-2 py-1.5 hover:bg-bg-card/60">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${AUDIT_TONE[e.kind]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-snug text-ink">{e.text}</p>
                    <p className="font-mono text-[9px] text-ink-faint">{e.at}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
