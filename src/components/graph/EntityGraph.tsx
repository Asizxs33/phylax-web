"use client";

import { useMemo, useState } from "react";
import {
  buildGraph,
  buildMultiGraph,
  KIND_ICON,
  KIND_META,
  NODE_ICON_PATHS,
  sourceIconKey,
  type GraphNode,
} from "@/lib/graph";
import type { InvestigateResponse } from "@/lib/types";

/** Рисует иконку узла по центру кружка: 24×24 path'ы масштабируются под радиус. */
function NodeIcon({ node, color }: { node: GraphNode; color: string }) {
  const key = node.kind === "source" ? sourceIconKey(node.full) : KIND_ICON[node.kind];
  const paths = NODE_ICON_PATHS[key];
  if (!paths) return null;
  // иконка занимает ~1.15×r, чтобы визуально «сидеть» внутри круга с полями
  const size = node.r * 1.15;
  const scale = size / 24;
  return (
    <g
      transform={`translate(${node.x - size / 2} ${node.y - size / 2}) scale(${scale})`}
      fill="none"
      stroke={color}
      strokeWidth={1.4 / scale}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.9}
      pointerEvents="none"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  );
}

export function EntityGraph({
  data,
  items,
  onSelect,
  selectedId,
}: {
  data: InvestigateResponse;
  /** несколько объектов, проверенных за один ход — строится общий граф */
  items?: InvestigateResponse[];
  onSelect?: (node: GraphNode) => void;
  selectedId?: string | null;
}) {
  const model = useMemo(
    () => (items && items.length > 1 ? buildMultiGraph(items) : buildGraph(data)),
    [data, items]
  );
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
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#12265c" floodOpacity="0.18" />
        </filter>
      </defs>
      {/* edges */}
      <g>
        {model.edges.map((e, i) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const lit = neighbors ? neighbors.has(e.from) && neighbors.has(e.to) : false;
          // подпись ребра показываем только когда есть смысл её читать —
          // при наведении/выборе, или всегда для сигналов риска (их немного
          // и они самые важные), иначе на графе с 15+ источниками будет каша
          const showEdgeLabel = !!e.label && (lit || (e.strong && !neighbors));
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
          if (angle > 90 || angle < -90) angle += 180; // текст не должен читаться вверх ногами
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={e.strong ? "var(--danger)" : "var(--border-strong)"}
                strokeOpacity={neighbors ? (lit ? 0.9 : 0.08) : e.strong ? 0.5 : 0.35}
                strokeWidth={lit ? 1.6 : 1}
                style={{ transition: "stroke-opacity .25s" }}
              />
              {showEdgeLabel && (
                <text
                  x={mx}
                  y={my}
                  transform={`rotate(${angle} ${mx} ${my})`}
                  textAnchor="middle"
                  dy={-4}
                  fontSize={8.5}
                  fontFamily="var(--font-mono), monospace"
                  fontWeight={600}
                  fill={e.strong ? "var(--danger)" : "var(--ink-faint)"}
                  stroke="var(--bg)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  letterSpacing={0.5}
                  style={{ transition: "opacity .25s" }}
                >
                  {e.label}
                </text>
              )}
            </g>
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
              : n.flagged
                ? "var(--danger)"
                : meta.color;
          const showLabel =
            isTarget || isSource || n.flagged || active === n.id || (neighbors?.has(n.id) ?? false);
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
                strokeWidth={isTarget ? 2.5 : isSource ? 2 : n.flagged || n.corroboration ? 2 : 1.5}
                filter={isTarget ? undefined : "url(#nodeShadow)"}
              />
              <NodeIcon node={n} color={isTarget ? targetTone : stroke} />
              {isSource && n.flagged && n.flagCount != null && n.flagCount > 0 && (
                <g>
                  <circle
                    cx={n.x + n.r - 1}
                    cy={n.y - n.r + 1}
                    r={7}
                    fill="var(--danger)"
                    stroke="var(--bg)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={n.x + n.r - 1}
                    y={n.y - n.r + 4}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={700}
                    fontFamily="var(--font-mono), monospace"
                    fill="#fff"
                  >
                    {n.flagCount}
                  </text>
                </g>
              )}
              {/* мост — сущность, общая для нескольких проверенных объектов:
                  пульсирующее кольцо, чтобы её нельзя было не заметить */}
              {n.bridge != null && (
                <>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r + 9}
                    fill="var(--danger)"
                    opacity={0.1}
                  />
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r + 5}
                    fill="none"
                    stroke="var(--danger)"
                    strokeOpacity={0.5}
                    strokeWidth={1.2}
                    className="pulse-slow"
                  />
                </>
              )}
              {!isTarget && !isSource && n.corroboration != null && (
                <g>
                  <circle
                    cx={n.x + n.r - 1}
                    cy={n.y - n.r + 1}
                    r={6.5}
                    fill={n.flagged ? "var(--danger)" : "var(--accent)"}
                    stroke="var(--bg)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={n.x + n.r - 1}
                    y={n.y - n.r + 3.5}
                    textAnchor="middle"
                    fontSize={8}
                    fontWeight={700}
                    fontFamily="var(--font-mono), monospace"
                    fill="#fff"
                  >
                    {n.corroboration}
                  </text>
                </g>
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
