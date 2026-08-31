import { KIND_META, SOURCE_EXPLAIN, type GraphNode } from "@/lib/graph";
import { formatSourceData, type FriendlyData } from "@/lib/formatSourceData";
import { RiskGauge } from "@/components/RiskGauge";
import { QUERY_TYPE_LABELS, type InvestigateResponse } from "@/lib/types";

function FriendlyDataView({ data }: { data: FriendlyData }) {
  if (data.kind === "text") {
    return <p className="text-xs leading-relaxed text-ink-muted">{data.text}</p>;
  }

  if (data.kind === "fields") {
    if (!data.fields.length) return <p className="text-xs text-ink-muted">Нет данных.</p>;
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-bg-elevated p-3">
        {data.fields.map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5">
            <span className="font-mono text-[9px] uppercase tracked text-ink-faint">{f.label}</span>
            <span className="break-words text-xs leading-relaxed text-ink">{f.value}</span>
          </div>
        ))}
      </div>
    );
  }

  // kind === "list"
  if (!data.items.length) return <p className="text-xs text-ink-muted">Ничего не найдено.</p>;
  return (
    <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
      {data.items.slice(0, 15).map((item, i) => {
        const content = (
          <>
            <p className="truncate text-xs font-medium text-ink">{item.title}</p>
            {item.subtitle && <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-muted">{item.subtitle}</p>}
            {item.tag && (
              <span className="mt-1 inline-block rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent-bright">
                {item.tag}
              </span>
            )}
          </>
        );
        return item.url ? (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-bg-elevated px-3 py-2 transition hover:bg-accent/5"
          >
            {content}
          </a>
        ) : (
          <div key={i} className="rounded-lg bg-bg-elevated px-3 py-2">
            {content}
          </div>
        );
      })}
    </div>
  );
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
        {SOURCE_EXPLAIN[node.full] && (
          <p className="rounded-lg bg-accent/5 px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
            {SOURCE_EXPLAIN[node.full]}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${result.ok ? "bg-safe" : "bg-danger"}`} />
          <span className="text-ink">
            {result.ok
              ? result.red_flags.length > 0
                ? `Ответил — ${result.red_flags.length} сигнал(а) риска`
                : "Ответил — сигналов риска нет"
              : "Не ответил"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {result.ok ? (
            <span className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-[9px] uppercase tracked text-ink-muted">
              прочитано
            </span>
          ) : (
            <span className="rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 font-mono text-[9px] uppercase tracked text-danger">
              не прочитано
            </span>
          )}
          {result.red_flags.length > 0 && (
            <span className="rounded-full border border-danger/40 bg-danger/10 px-2 py-0.5 font-mono text-[9px] uppercase tracked text-danger">
              использовано в выводе
            </span>
          )}
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
            <p className="mb-1.5 font-mono text-[10px] uppercase tracked text-ink-faint">Данные</p>
            <FriendlyDataView data={formatSourceData(node.full, result.data)} />
          </div>
        )}
      </div>
    ) : (
      <p className="text-sm text-ink-muted">Нет данных.</p>
    );
  } else {
    // node.meta для сущностей — список источников, которые её нашли
    // ("Метапоиск · Блэклист"), собранный в buildGraph.
    const foundBy = node.meta ? node.meta.split(" · ") : [];
    body = (
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="font-mono text-[10px] uppercase tracked text-ink-faint">Значение</p>
          <p className="break-all font-mono text-ink">{node.full}</p>
        </div>
        {node.flagged && (
          <div className="rounded-lg bg-danger/10 px-3 py-2.5 text-xs leading-relaxed text-danger">
            Прямое совпадение с чёрным списком регулятора или жалобой на скам — не косвенный
            признак, а конкретная запись о том, что этот объект уже фигурировал в деле.
          </div>
        )}
        {foundBy.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracked text-ink-faint">
              {foundBy.length > 1 ? `Подтверждено ${foundBy.length} источниками` : "Найдено источником"}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {foundBy.map((s) => (
                <span
                  key={s}
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                    foundBy.length > 1 ? "bg-accent/10 text-accent-bright" : "text-ink-muted"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs leading-relaxed text-ink-muted">
          {foundBy.length > 1
            ? "Один и тот же объект всплыл сразу у нескольких независимых источников — это сильнее, чем упоминание в одном месте, и обычно указывает на общего оператора или инфраструктуру."
            : `Связанная сущность типа «${meta.label.toLowerCase()}», обнаруженная в ходе проверки объекта. Может указывать на общего оператора или инфраструктуру.`}
        </p>
      </div>
    );
  }

  return (
    <div className="stamped-accent pointer-events-auto absolute right-4 top-4 z-20 flex max-h-[calc(100%-2rem)] w-80 max-w-[calc(100%-2rem)] flex-col rounded-2xl border border-border/80 bg-bg-card/90 shadow-xl backdrop-blur-md">
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
