"use client";

/* WebGL-рендер графа связей на PIXI.js — тот же подход, что у крупных
 * OSINT-платформ: узлы и рёбра рисуются на GPU, поэтому картинка держит
 * сотни узлов без просадки и позволяет живую физику.
 *
 * Цвета берутся из тех же CSS-переменных, что и весь сайт (--danger,
 * --accent...), и пересчитываются при переключении темы — иначе WebGL-слой
 * "отвалился" бы от остального интерфейса. Если WebGL недоступен
 * (старый браузер, отключённое ускорение) — компонент сообщает об этом
 * через onUnavailable, и страница откатывается на SVG-рендер. */

import { useEffect, useRef } from "react";
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

const VIEW_W = 1000;
const VIEW_H = 780;

/** CSS-переменную в число для PIXI: "#12265c" / "rgb(...)" → 0x12265c */
function cssColorToInt(varName: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return fallback;
  if (raw.startsWith("#")) {
    const hex = raw.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const n = parseInt(full, 16);
    return Number.isNaN(n) ? fallback : n;
  }
  const m = raw.match(/(\d+(\.\d+)?)/g);
  if (m && m.length >= 3) {
    const [r, g, b] = m.map(Number);
    return (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b);
  }
  return fallback;
}

interface Palette {
  bg: number;
  card: number;
  border: number;
  ink: number;
  inkMuted: number;
  inkFaint: number;
  accent: number;
  danger: number;
  safe: number;
}

function readPalette(): Palette {
  return {
    bg: cssColorToInt("--bg", 0x090e1c),
    card: cssColorToInt("--bg-card", 0x141f36),
    border: cssColorToInt("--border-strong", 0x334155),
    ink: cssColorToInt("--ink", 0xf1f5f9),
    inkMuted: cssColorToInt("--ink-muted", 0x94a3b8),
    inkFaint: cssColorToInt("--ink-faint", 0x64748b),
    accent: cssColorToInt("--accent", 0x3b82f6),
    danger: cssColorToInt("--danger", 0xef4444),
    safe: cssColorToInt("--safe", 0x10b981),
  };
}

export function EntityGraphGL({
  data,
  items,
  onSelect,
  selectedId,
  onUnavailable,
}: {
  data: InvestigateResponse;
  /** несколько объектов за один ход — общий граф с мостами между ними */
  items?: InvestigateResponse[];
  onSelect?: (node: GraphNode) => void;
  selectedId?: string | null;
  onUnavailable?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  // держим последние колбэки в ref — иначе смена onSelect пересоздавала бы
  // всю WebGL-сцену на каждый рендер родителя
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const host = hostRef.current;
      if (!host) return;

      let PIXI: typeof import("pixi.js");
      try {
        PIXI = await import("pixi.js");
      } catch {
        onUnavailable?.();
        return;
      }

      const app = new PIXI.Application();
      try {
        await app.init({
          width: VIEW_W,
          height: VIEW_H,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          preference: "webgl",
        });
      } catch {
        onUnavailable?.();
        return;
      }
      if (disposed) {
        app.destroy(true);
        return;
      }

      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.display = "block";
      host.appendChild(app.canvas);

      const model = items && items.length > 1 ? buildMultiGraph(items) : buildGraph(data);
      const byId = new Map(model.nodes.map((n) => [n.id, n]));

      let palette = readPalette();
      let hovered: string | null = null;

      const edgeLayer = new PIXI.Container();
      const nodeLayer = new PIXI.Container();
      const labelLayer = new PIXI.Container();
      app.stage.addChild(edgeLayer, nodeLayer, labelLayer);

      const targetTone = () =>
        data.risk_score >= 60 ? palette.danger : data.risk_score >= 30 ? palette.accent : palette.safe;

      /** соседи подсвеченного узла — остальное приглушаем */
      const neighborsOf = (id: string | null) => {
        if (!id) return null;
        const set = new Set<string>([id]);
        for (const e of model.edges) {
          if (e.from === id) set.add(e.to);
          if (e.to === id) set.add(e.from);
        }
        return set;
      };

      function draw() {
        const active = hovered ?? selectedRef.current ?? null;
        const near = neighborsOf(active);

        edgeLayer.removeChildren().forEach((c) => c.destroy());
        nodeLayer.removeChildren().forEach((c) => c.destroy());
        labelLayer.removeChildren().forEach((c) => c.destroy());

        /* ── рёбра ── */
        for (const e of model.edges) {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) continue;
          const lit = near ? near.has(e.from) && near.has(e.to) : false;
          const alpha = near ? (lit ? 0.9 : 0.06) : e.strong ? 0.5 : 0.3;
          const g = new PIXI.Graphics();
          g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({
            width: lit ? 1.8 : 1,
            color: e.strong ? palette.danger : palette.border,
            alpha,
          });
          edgeLayer.addChild(g);

          if (e.label && (lit || (e.strong && !near))) {
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            let ang = Math.atan2(b.y - a.y, b.x - a.x);
            if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
            const t = new PIXI.Text({
              text: e.label,
              style: {
                fontFamily: "monospace",
                fontSize: 9,
                fontWeight: "600",
                letterSpacing: 0.5,
                fill: e.strong ? palette.danger : palette.inkFaint,
              },
            });
            t.anchor.set(0.5, 1.4);
            t.position.set(mx, my);
            t.rotation = ang;
            labelLayer.addChild(t);
          }
        }

        /* ── узлы ── */
        for (const n of model.nodes) {
          const dim = near && !near.has(n.id) ? 0.18 : 1;
          const isTarget = n.kind === "target";
          const isSource = n.kind === "source";
          const meta = KIND_META[n.kind];
          const kindColor = cssColorToInt(
            meta.color.startsWith("var(") ? meta.color.slice(4, -1) : "",
            typeof meta.color === "string" && meta.color.startsWith("#")
              ? parseInt(meta.color.slice(1), 16)
              : palette.accent
          );
          const stroke = isTarget
            ? targetTone()
            : isSource
              ? n.ok
                ? n.flagged
                  ? palette.danger
                  : palette.accent
                : palette.inkFaint
              : n.flagged
                ? palette.danger
                : kindColor;

          const g = new PIXI.Graphics();
          g.alpha = dim;

          if (isTarget) {
            g.circle(n.x, n.y, n.r + 20).fill({ color: targetTone(), alpha: 0.08 });
            g.circle(n.x, n.y, n.r + 12).stroke({ width: 1, color: targetTone(), alpha: 0.35 });
          }
          if (selectedRef.current === n.id) {
            g.circle(n.x, n.y, n.r + 6).stroke({ width: 1.5, color: palette.accent, alpha: 0.9 });
          }
          g.circle(n.x, n.y, n.r)
            .fill({ color: isTarget ? targetTone() : palette.card, alpha: isTarget ? 0.2 : 1 })
            .stroke({ width: isTarget ? 2.5 : isSource ? 2 : n.flagged || n.corroboration ? 2 : 1.5, color: stroke });

          // иконка узла: те же path-данные, что и в SVG-рендере
          const iconKey = isSource ? sourceIconKey(n.full) : KIND_ICON[n.kind];
          const paths = NODE_ICON_PATHS[iconKey];
          if (paths) {
            const size = n.r * 1.15;
            const scale = size / 24;
            const icon = new PIXI.Graphics();
            icon.svg(`<svg>${paths.map((d) => `<path d="${d}"/>`).join("")}</svg>`);
            icon.position.set(n.x - size / 2, n.y - size / 2);
            icon.scale.set(scale);
            icon.alpha = dim * 0.9;
            // svg() заливает по умолчанию — перекрашиваем в обводочный цвет
            icon.tint = stroke;
            nodeLayer.addChild(icon);
          }

          // счётчик сигналов / подтверждений
          const badge = isSource ? (n.flagged ? n.flagCount : undefined) : n.corroboration;
          if (badge != null && badge > 0) {
            const bx = n.x + n.r - 1;
            const by = n.y - n.r + 1;
            g.circle(bx, by, isSource ? 7 : 6.5).fill({
              color: n.flagged ? palette.danger : palette.accent,
            });
            const bt = new PIXI.Text({
              text: String(badge),
              style: { fontFamily: "monospace", fontSize: 9, fontWeight: "700", fill: 0xffffff },
            });
            bt.anchor.set(0.5);
            bt.position.set(bx, by);
            bt.alpha = dim;
            labelLayer.addChild(bt);
          }

          g.eventMode = "static";
          g.cursor = "pointer";
          g.hitArea = new PIXI.Circle(n.x, n.y, n.r + 6);
          g.on("pointerover", () => {
            hovered = n.id;
            draw();
          });
          g.on("pointerout", () => {
            hovered = null;
            draw();
          });
          g.on("pointertap", () => selectRef.current?.(n));
          nodeLayer.addChild(g);

          // подпись
          const show = isTarget || isSource || n.flagged || active === n.id || (near?.has(n.id) ?? false);
          if (show) {
            const right = n.x >= VIEW_W / 2;
            const t = new PIXI.Text({
              text: n.label,
              style: {
                fontFamily: "monospace",
                fontSize: isTarget ? 15 : isSource ? 11 : 10,
                fontWeight: isTarget ? "600" : "400",
                fill: isTarget ? palette.ink : palette.inkMuted,
              },
            });
            t.alpha = dim;
            if (isTarget) {
              t.anchor.set(0.5, 1);
              t.position.set(n.x, n.y - n.r - 8);
            } else {
              t.anchor.set(right ? 0 : 1, 0.5);
              t.position.set(right ? n.x + n.r + 6 : n.x - n.r - 6, n.y);
            }
            labelLayer.addChild(t);
          }
        }
      }

      draw();

      // тема переключается классом на <html> — пересчитываем палитру
      const themeObserver = new MutationObserver(() => {
        palette = readPalette();
        draw();
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      cleanup = () => {
        themeObserver.disconnect();
        app.destroy(true, { children: true });
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, items]);

  // перерисовка выделения без пересоздания сцены недоступна снаружи —
  // selectedId читается из ref внутри draw() при следующем взаимодействии
  return <div ref={hostRef} className="h-full w-full" />;
}
