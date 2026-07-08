import { RiskGauge } from "@/components/RiskGauge";
import { ConnectorCard } from "@/components/ConnectorCard";
import { QUERY_TYPE_LABELS, type InvestigateResponse } from "@/lib/types";

export function DossierBubble({ data }: { data: InvestigateResponse }) {
  const okCount = data.results.filter((r) => r.ok).length;

  const verdict =
    data.risk_score >= 60
      ? "Есть заметные признаки риска — стоит отнестись с осторожностью."
      : data.risk_score >= 30
        ? "Есть отдельные сигналы. Рекомендую проверить первоисточники ниже."
        : "Явных сигналов по открытым источникам не видно — но это не гарантия.";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink">
        Собрал досье по{" "}
        <span className="font-mono text-accent-bright">{data.query}</span> —
        это {QUERY_TYPE_LABELS[data.detected_type].toLowerCase()}. Опросил{" "}
        {data.connectors_run.length} источников, ответили {okCount}. {verdict}
      </p>

      <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-bg-elevated/70 p-5 sm:flex-row sm:justify-between">
        <RiskGauge score={data.risk_score} />
        <div className="flex-1 text-sm">
          {data.risk_flags.length > 0 ? (
            <>
              <p className="mb-2 font-mono text-[11px] uppercase tracked text-ink-faint">
                Сработавшие сигналы
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.risk_flags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-full bg-danger/10 px-2.5 py-1 font-mono text-[10px] uppercase tracked text-danger"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-ink-muted">
              Ни одного red-flag маркера в ответах источников.
            </p>
          )}
        </div>
      </div>

      {data.summary && (
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracked text-ink-faint">
            Отчёт
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
            {data.summary}
          </p>
        </div>
      )}

      <details className="group rounded-2xl border border-border bg-bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-mono text-[11px] uppercase tracked text-ink-muted">
          Источники ({data.results.length})
          <span className="text-ink-faint transition group-open:rotate-180">▾</span>
        </summary>
        <div className="flex flex-col gap-2 border-t border-border p-3">
          {data.results.map((r) => (
            <ConnectorCard key={r.source} result={r} />
          ))}
        </div>
      </details>
    </div>
  );
}
