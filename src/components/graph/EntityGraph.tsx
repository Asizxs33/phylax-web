"use client";

import { useMemo, useState } from "react";
import { buildGraph, KIND_META, type GraphNode } from "@/lib/graph";
import type { InvestigateResponse } from "@/lib/types";

export function EntityGraph({
  data,
  onSelect,
  selectedId,
}: {
  data: InvestigateResponse;
  onSelect?: (node: GraphNode) => void;
  selectedId?: string | null;
}) {
  const model = useMemo(() => buildGraph(data), [data]);
  const [hover, setHover] = useState<string | null>(null);
  const active = hover ?? selectedId ?? null;

  const byId = useMemo(() => {
    const m = new Map<string, GraphNode>();
    model.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [model]);

  const neighbors = useMemo(() => {
    if (!active) return null;
    const set = new Set<string>([active]);
    model.edges.forEach((e) => {
      if (e.from === active) set.add(e.to);
      if (e.to === active) set.add(e.from);
    });
    return set;
  }, [active, model]);

  const dim = (id: string) => (neighbors && !neighbors.has(id) ? 0.18 : 1);

  const targetTone =
    data.risk_score >= 60 ? "var(--danger)" : data.risk_score >= 30 ? "var(--accent)" : "var(--safe)";

  return (
    <svg viewBox="0 0 1000 780" className="h-full w-full">
      <defs>
        <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#211d17" floodOpacity="0.18" />
        </filter>
      </defs>
      {/* edges */}
      <g>
        {model.edges.map((e, i) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const lit = neighbors ? neighbors.has(e.from) && neighbors.has(e.to) : false;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={e.strong ? "var(--danger)" : "var(--border-strong)"}
              strokeOpacity={neighbors ? (lit ? 0.9 : 0.08) : e.strong ? 0.5 : 0.35}
              strokeWidth={lit ? 1.6 : 1}
              style={{ transition: "stroke-opacity .25s" }}
            />
          );
        })}
      </g>

      {/* nodes */}
      <g>
        {model.nodes.map((n, i) => {
          const meta = KIND_META[n.kind];
          const isTarget = n.kind === "target";
          const isSource = n.kind === "source";
          const fill = isTarget ? targetTone : isSource ? "var(--bg-card)" : "var(--bg-card)";
          const stroke = isTarget
            ? targetTone
            : isSource
              ? n.ok
                ? n.flagged
                  ? "var(--danger)"
                  : "var(--accent)"
                : "var(--ink-faint)"
              : meta.color;
          const showLabel = isTarget || isSource || active === n.id || (neighbors?.has(n.id) ?? false);
          const labelRight = n.x >= 500;

          return (
            <g
              key={n.id}
              style={{
                opacity: dim(n.id),
                transition: "opacity .25s",
                cursor: "pointer",
                animation: "reveal .5s ease both",
                animationDelay: `${Math.min(i * 12, 400)}ms`,
              }}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(n)}
            >
              {selectedId === n.id && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r + 6}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              )}
              {isTarget && (
                <>
                  <circle cx={n.x} cy={n.y} r={n.r + 20} fill={targetTone} opacity={0.08} />
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r + 12}
                    fill="none"
                    stroke={targetTone}
                    strokeOpacity={0.35}
                    strokeWidth={1}
                    className="pulse-slow"
                  />
                </>
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={isTarget ? fill : "var(--bg-card)"}
                fillOpacity={isTarget ? 0.2 : 1}
                stroke={stroke}
                strokeWidth={isTarget ? 2.5 : isSource ? 2 : 1.5}
                filter={isTarget ? undefined : "url(#nodeShadow)"}
              />
              {!isTarget && !isSource && (
                <circle cx={n.x} cy={n.y} r={2.5} fill={meta.color} />
              )}
              {showLabel && (
                <text
                  x={labelRight ? n.x + n.r + 6 : n.x - n.r - 6}
                  y={n.y + (isTarget ? -n.r - 10 : 3.5)}
                  textAnchor={isTarget ? "middle" : labelRight ? "start" : "end"}
                  fontSize={isTarget ? 15 : isSource ? 11 : 10}
                  fontFamily="var(--font-mono), monospace"
                  fill={isTarget ? "var(--ink)" : "var(--ink-muted)"}
                  fontWeight={isTarget ? 600 : 400}
                  stroke="var(--bg)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                >
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
