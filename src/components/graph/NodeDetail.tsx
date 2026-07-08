import { KIND_META, SOURCE_LABELS, type GraphNode } from "@/lib/graph";
import { RiskGauge } from "@/components/RiskGauge";
import { QUERY_TYPE_LABELS, type InvestigateResponse } from "@/lib/types";

function parentSourceKey(id: string): string | null {
  // entity ids look like: s_<source>_e<index>
  if (!id.startsWith("s_")) return null;
  const cut = id.lastIndexOf("_e");
  if (cut < 0) return null;
  return id.slice(2, cut);
}

export function NodeDetail({
  node,
  dossier,
  onClose,
}: {
  node: GraphNode;
  dossier: InvestigateResponse;
  onClose: () => void;
}) {
  const meta = KIND_META[node.kind];

  let body: React.ReactNode = null;

  if (node.kind === "target") {
    body = (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracked text-ink-faint">Тип объекта</p>
            <p className="text-sm text-ink">{QUERY_TYPE_LABELS[dossier.detected_type]}</p>
          </div>
          <div className="scale-90">
            <RiskGauge score={dossier.risk_score} />
          </div>
        </div>
        {dossier.risk_flags.length > 0 ? (
          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracked text-ink-faint">Сигналы</p>
            <div className="flex flex-wrap gap-1">
              {dossier.risk_flags.map((f) => (
                <span key={f} className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[10px] text-danger">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Red-flag маркеров не найдено.</p>
        )}
        {dossier.summary && (
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracked text-ink-faint">Отчёт</p>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-muted">{dossier.summary}</p>
          </div>
        )}
        {dossier.recurrence.length > 0 && (
          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracked text-ink-faint">
              Уже встречалось в реестре ({dossier.recurrence.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {dossier.recurrence.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-mono text-ink-muted">{r.query}</span>
                  <span className="shrink-0 text-ink-faint">{new Date(r.created_at.replace(" ", "T") + "Z").toLocaleDateString("ru-RU")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else if (node.kind === "source") {
    const result = dossier.results.find((r) => r.source === node.full);
    body = result ? (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${result.ok ? "bg-safe" : "bg-danger"}`} />
          <span className="text-ink">{result.ok ? "Ответил" : "Не ответил"}</span>
        </div>
        {result.error && <p className="text-xs text-danger">Ошибка: {result.error}</p>}
        {result.red_flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.red_flags.map((f) => (
              <span key={f} className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[10px] text-danger">
                {f}
              </span>
            ))}
          </div>
        )}
        {result.ok && (
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracked text-ink-faint">Данные</p>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-bg-elevated p-3 font-mono text-[11px] leading-relaxed text-ink-muted">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    ) : (
      <p className="text-sm text-ink-muted">Нет данных.</p>
    );
  } else {
    const parent = parentSourceKey(node.id);
    body = (
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="font-mono text-[10px] uppercase tracked text-ink-faint">Значение</p>
          <p className="break-all font-mono text-ink">{node.full}</p>
        </div>
        {parent && (
          <div>
            <p className="font-mono text-[10px] uppercase tracked text-ink-faint">Найдено источником</p>
            <p className="text-ink-muted">{SOURCE_LABELS[parent] ?? parent}</p>
          </div>
        )}
        <p className="text-xs leading-relaxed text-ink-muted">
          Связанная сущность типа «{meta.label.toLowerCase()}», обнаруженная в ходе проверки объекта.
          Может указывать на общего оператора или инфраструктуру.
        </p>
      </div>
    );
  }

  return (
    <div className="stamped-accent pointer-events-auto absolute right-4 top-4 z-20 flex max-h-[calc(100%-2rem)] w-80 max-w-[calc(100%-2rem)] flex-col rounded-lg border border-border bg-bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full border"
            style={{ borderColor: meta.color, background: meta.color + "33" }}
          />
          <span className="font-mono text-[10px] uppercase tracked text-ink-faint">{meta.label}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint transition hover:bg-bg-elevated hover:text-ink"
        >
          ✕
        </button>
      </div>
      <div className="border-b border-border px-4 py-2.5">
        <p className="break-all font-mono text-sm text-ink">{node.full}</p>
      </div>
      <div className="overflow-y-auto px-4 py-4">{body}</div>
    </div>
  );
}
