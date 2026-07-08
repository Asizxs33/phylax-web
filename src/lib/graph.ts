import type { ConnectorResult, InvestigateResponse } from "./types";

export type EntityKind =
  | "target"
  | "source"
  | "domain"
  | "wallet"
  | "ip"
  | "profile"
  | "org";

export interface GraphNode {
  id: string;
  label: string;
  full: string;
  kind: EntityKind;
  x: number;
  y: number;
  r: number;
  ok?: boolean;
  flagged?: boolean;
  meta?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  strong?: boolean;
}

export interface GraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const SOURCE_LABELS: Record<string, string> = {
  searx_metasearch: "Метапоиск",
  duckduckgo_instant_answer: "DuckDuckGo",
  wayback_machine: "Wayback",
  common_crawl: "CommonCrawl",
  crtsh_cert_transparency: "Сертификаты",
  rdap_whois: "WHOIS",
  dns_records: "DNS",
  urlscan_search: "urlscan",
  opencorporates_registry: "Реестр",
  sec_edgar_registry: "SEC",
  regulator_blacklist_local: "Блэклист",
  blockchain_info_btc: "BTC",
  blockchair_multichain: "Blockchair",
  etherscan_eth: "ETH",
  username_enumeration: "Профили",
  telegram_public_preview: "Telegram",
  onionclaw_darknet_search: "Даркнет",
};

function rec(x: unknown): Record<string, unknown> {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : {};
}
function arr(x: unknown): unknown[] {
  return Array.isArray(x) ? x : [];
}
function shorten(s: string, n = 16): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 6) + "…" + s.slice(-4);
}

function extractEntities(result: ConnectorResult): { label: string; full: string; kind: EntityKind }[] {
  if (!result.ok) return [];
  const d = rec(result.data);

  switch (result.source) {
    case "crtsh_cert_transparency":
      return arr(d.related_names)
        .map((n) => String(n))
        .filter((n) => n && !n.startsWith("*"))
        .slice(0, 5)
        .map((n) => ({ label: shorten(n, 20), full: n, kind: "domain" as const }));
    case "dns_records":
      return arr(d.A)
        .map((ip) => String(ip))
        .slice(0, 3)
        .map((ip) => ({ label: ip, full: ip, kind: "ip" as const }));
    case "blockchain_info_btc":
      return arr(d.distinct_counterparties_sample)
        .map((a) => String(a))
        .slice(0, 5)
        .map((a) => ({ label: shorten(a), full: a, kind: "wallet" as const }));
    case "username_enumeration":
      return Object.entries(d)
        .filter(([, v]) => rec(v).exists === true)
        .slice(0, 6)
        .map(([p]) => ({ label: p, full: p, kind: "profile" as const }));
    case "opencorporates_registry":
      return arr(d.companies)
        .slice(0, 3)
        .map((c) => {
          const name = String(rec(c).name ?? "—");
          return { label: shorten(name, 18), full: name, kind: "org" as const };
        });
    default:
      return [];
  }
}

const TAU = Math.PI * 2;

export function buildGraph(data: InvestigateResponse): GraphModel {
  const cx = 500;
  const cy = 390;
  const R1 = 195;
  const R2 = 330;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  nodes.push({
    id: "target",
    label: shorten(data.query, 22),
    full: data.query,
    kind: "target",
    x: cx,
    y: cy,
    r: 30,
    flagged: data.risk_score >= 30,
    meta: `risk ${data.risk_score}/100`,
  });

  const sources = data.results;
  const n = sources.length;

  sources.forEach((src, i) => {
    const angle = -Math.PI / 2 + (i / n) * TAU;
    const sx = cx + Math.cos(angle) * R1;
    const sy = cy + Math.sin(angle) * R1;
    const sid = `s_${src.source}`;

    nodes.push({
      id: sid,
      label: SOURCE_LABELS[src.source] ?? src.source,
      full: src.source,
      kind: "source",
      x: sx,
      y: sy,
      r: 11,
      ok: src.ok,
      flagged: src.red_flags.length > 0,
      meta: src.ok ? `${src.red_flags.length} сигн.` : src.error ?? "нет ответа",
    });
    edges.push({ from: "target", to: sid, strong: src.red_flags.length > 0 });

    const ents = extractEntities(src);
    const spread = Math.min(0.5, ents.length * 0.14);
    ents.forEach((e, j) => {
      const off = ents.length > 1 ? -spread / 2 + (j / (ents.length - 1)) * spread : 0;
      const ea = angle + off;
      const ex = cx + Math.cos(ea) * R2;
      const ey = cy + Math.sin(ea) * R2;
      const eid = `${sid}_e${j}`;
      nodes.push({
        id: eid,
        label: e.label,
        full: e.full,
        kind: e.kind,
        x: ex,
        y: ey,
        r: 6,
      });
      edges.push({ from: sid, to: eid });
    });
  });

  return { nodes, edges };
}

export const KIND_META: Record<EntityKind, { color: string; label: string }> = {
  target: { color: "var(--accent)", label: "Объект" },
  source: { color: "var(--ink-muted)", label: "Источник" },
  domain: { color: "#c07a2b", label: "Домен" },
  wallet: { color: "#a15e18", label: "Кошелёк" },
  ip: { color: "#6c655b", label: "IP" },
  profile: { color: "#1f9d5c", label: "Профиль" },
  org: { color: "#b5701f", label: "Юрлицо" },
};
