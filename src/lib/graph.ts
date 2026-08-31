import createGraph from "ngraph.graph";
import createLayout from "ngraph.forcelayout";

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
  flagCount?: number;
  corroboration?: number;
  /** сколько РАЗНЫХ проверенных объектов ссылаются на эту сущность.
   *  >1 означает мост: общий кошелёк/домен/IP у нескольких пирамид —
   *  самый сильный признак единого оператора. */
  bridge?: number;
  meta?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  strong?: boolean;
  /** глагол связи, показывается на самом ребре — "СОВПАДЕНИЕ", "ПРОВЕРЕНО" и т.д. */
  label?: string;
}

const KIND_EDGE_LABEL: Record<EntityKind, string> = {
  target: "",
  source: "",
  domain: "СВЯЗАННЫЙ ДОМЕН",
  wallet: "КОШЕЛЁК",
  ip: "IP-АДРЕС",
  profile: "ПРОФИЛЬ",
  org: "ЮРЛИЦО",
};

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
  opensanctions_lists: "Санкции",
  occrp_aleph: "Расследования",
  shodan_internetdb: "Инфраструктура",
  gleif_lei_registry: "LEI-реестр",
  openphish_feed: "Фишинг-фид",
  blockchain_info_btc: "BTC",
  blockchair_multichain: "Blockchair",
  etherscan_eth: "ETH",
  chainabuse_scam_reports: "Chainabuse",
  username_enumeration: "Профили",
  telegram_public_preview: "Telegram",
  threat_actor_username_search: "Ник в утечках",
  onionclaw_darknet_search: "Даркнет",
};

// Человеческое объяснение для панели узла: что этот источник проверяет
// и почему его ответ важен для вердикта.
export const SOURCE_EXPLAIN: Record<string, string> = {
  searx_metasearch:
    "Метапоиск по десяткам поисковиков сразу (Google, Bing, Yandex…). Показывает, что интернет уже знает об объекте: отзывы, разоблачения, упоминания в СМИ.",
  duckduckgo_instant_answer:
    "Быстрая справка по известным сущностям. Если объект знаменит (как Finiko) — тут будет краткое описание.",
  wayback_machine:
    "Веб-архив: сколько лет сайту на самом деле. «Компания с 2015 года» без единого снепшота до прошлого месяца — ложь о возрасте.",
  common_crawl:
    "Независимый архив интернета. Второе мнение к Wayback: находил ли краулер этот сайт раньше.",
  crtsh_cert_transparency:
    "Журнал SSL-сертификатов. Вскрывает сеть связанных доменов одного оператора — клоны и «запасные» сайты пирамиды.",
  rdap_whois:
    "Регистрационные данные домена: когда создан, у какого регистратора. Свежий домен у «многолетней компании» — ключевая улика.",
  dns_records:
    "DNS-записи: на каких IP живёт сайт. Общий хостинг с другими скам-проектами — признак одной инфраструктуры.",
  urlscan_search:
    "Прошлые сканы сайта: скриншоты, IP, страна хостинга. Показывает, как сайт выглядел и куда вёл.",
  opencorporates_registry:
    "Мировой реестр юрлиц. Существует ли компания вообще, где зарегистрирована, кто директор.",
  sec_edgar_registry:
    "Реестр американского регулятора SEC. «Международный инвестфонд» без единой фильтрации в SEC — не фонд.",
  regulator_blacklist_local:
    "Чёрные списки: АФМ РК и наводки сообщества SAQ, подтверждённые автопроверкой. Совпадение здесь — самый тяжёлый сигнал (+50 к скору).",
  opensanctions_lists:
    "Санкционные списки и PEP со всего мира (ЕС, ООН, OFAC, Великобритания и десятки других) — 277 тыс. имён со всеми алиасами и транслитерациями. Точное совпадение по имени организатора или юрлица — сигнал совсем другого веса, чем рекламные красные флаги.",
  occrp_aleph:
    "База расследовательской журналистики OCCRP: утечки, корпоративные реестры, судебные дела. Если объект уже фигурировал в журналистском расследовании — здесь будет ссылка на материал.",
  shodan_internetdb:
    "Открытый индекс Shodan по IP: какие порты открыты, какой софт, известные уязвимости и — главное — какие ещё домены живут на том же адресе. Десяток «инвест-проектов» на одном IP означает одну ферму, а не совпадение.",
  gleif_lei_registry:
    "Глобальный реестр юрлиц (LEI), созданный по инициативе G20. «Международный фонд» без записи здесь не ведёт той деятельности, о которой заявляет. Просроченный статус LEI (LAPSED) — тоже сигнал.",
  openphish_feed:
    "Открытый фид активных фишинговых URL. Совпадение — прямая улика: на этом хосте зафиксирована фишинговая страница. Отсутствие ничего не доказывает — бесплатный фид покрывает лишь свежий срез базы.",
  blockchain_info_btc:
    "Публичный блокчейн BTC: сколько денег прошло через кошелёк, от скольких людей. Кошелёк-«сборщик» — узор активной пирамиды.",
  blockchair_multichain:
    "Кросс-проверка кошелька по нескольким блокчейнам сразу.",
  etherscan_eth:
    "Транзакции ETH-кошелька: приток, отток, контрагенты.",
  chainabuse_scam_reports:
    "База жалоб на крипто-кошельки. Каждый репорт — реальный пострадавший, сообщивший об этом адресе.",
  username_enumeration:
    "На каких платформах существует этот ник. Профиль, живущий только в Telegram без следов где-либо ещё, — типично для скама.",
  telegram_public_preview:
    "Последние посты публичного Telegram-канала: что и как обещают прямо сейчас.",
  threat_actor_username_search:
    "Поиск ника в утечках и на киберфорумах: не всплывал ли оператор в других тёмных историях.",
  onionclaw_darknet_search:
    "Поиск упоминаний в даркнете (выключен по умолчанию).",
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

interface ExtractedEntity {
  label: string;
  full: string;
  kind: EntityKind;
  /** true when this occurrence alone is a hard accusation (blacklist hit,
   *  scam report) — not just a related fact like a DNS record. */
  flagged?: boolean;
}

function extractEntities(result: ConnectorResult): ExtractedEntity[] {
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
    case "regulator_blacklist_local": {
      // Самый тяжёлый источник — совпадение с чёрным списком регулятора
      // раньше вообще не попадало на граф, только в сырые данные панели.
      const out: ExtractedEntity[] = [];
      for (const m of arr(d.matches)) {
        const match = rec(m);
        const name = String(match.name ?? "").trim();
        if (name) out.push({ label: shorten(name, 20), full: name, kind: "org", flagged: true });
        for (const dom of arr(match.domains)) {
          const domain = String(dom);
          if (domain) out.push({ label: shorten(domain, 20), full: domain, kind: "domain", flagged: true });
        }
      }
      return out.slice(0, 6);
    }
    case "chainabuse_scam_reports": {
      // Каждый связанный домен в жалобе — реальный пострадавший назвал
      // этот сайт при подаче репорта на кошелёк.
      const out: ExtractedEntity[] = [];
      for (const r of arr(d.reports)) {
        for (const dom of arr(rec(r).related_domains)) {
          const domain = String(dom);
          if (domain) out.push({ label: shorten(domain, 20), full: domain, kind: "domain", flagged: true });
        }
      }
      return out.slice(0, 6);
    }
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
  const n = sources.length || 1;
  const sourceAngle = new Map<string, number>();

  sources.forEach((src, i) => {
    const angle = -Math.PI / 2 + (i / n) * TAU;
    sourceAngle.set(src.source, angle);
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
      r: 15,
      ok: src.ok,
      flagged: src.red_flags.length > 0,
      flagCount: src.red_flags.length,
      meta: src.ok ? `${src.red_flags.length} сигн.` : src.error ?? "нет ответа",
    });
    const edgeLabel = !src.ok ? "НЕ ОТВЕТИЛ" : src.red_flags.length > 0 ? "СИГНАЛ РИСКА" : "ПРОВЕРЕНО";
    edges.push({ from: "target", to: sid, strong: src.red_flags.length > 0, label: edgeLabel });
  });

  // Одна и та же сущность (домен, кошелёк...) часто всплывает у нескольких
  // источников одновременно — раньше это рисовалось как N отдельных узлов.
  // Схлопываем по (тип + значение) в один узел: чем больше источников его
  // подтвердили, тем он крупнее и заметнее — это и есть смысл "графа связей",
  // а не просто веер из источника.
  type EntityAcc = {
    label: string;
    full: string;
    kind: EntityKind;
    flagged: boolean;
    sources: string[];
    angleSum: number;
  };
  const entities = new Map<string, EntityAcc>();

  const queryLower = data.query.trim().toLowerCase();

  sources.forEach((src) => {
    const angle = sourceAngle.get(src.source) ?? 0;
    for (const e of extractEntities(src)) {
      // Пропускаем сущность, если она — это сам объект под другим именем
      // (например блэклист подтвердил ровно то название, что искали):
      // такой узел ничего не добавляет к графу, только дублирует центр.
      if (e.full.trim().toLowerCase() === queryLower) continue;
      const key = `${e.kind}:${e.full.toLowerCase()}`;
      let acc = entities.get(key);
      if (!acc) {
        acc = { label: e.label, full: e.full, kind: e.kind, flagged: false, sources: [], angleSum: 0 };
        entities.set(key, acc);
      }
      acc.flagged = acc.flagged || !!e.flagged;
      acc.sources.push(src.source);
      acc.angleSum += angle;
    }
  });

  // Стартовая раскладка сущностей — среднее направление от подтвердивших
  // источников (найденная и WHOIS, и блэклистом ложится между ними). Это
  // лишь seed: финальные координаты считает физика ниже.
  const placed = [...entities.entries()]
    .map(([key, acc]) => ({ key, angle: acc.angleSum / acc.sources.length, ...acc }))
    .sort((a, b) => a.angle - b.angle);

  for (const e of placed) {
    const ex = cx + Math.cos(e.angle) * R2;
    const ey = cy + Math.sin(e.angle) * R2;
    const corroborated = e.sources.length > 1;
    nodes.push({
      id: e.key,
      label: e.label,
      full: e.full,
      kind: e.kind,
      x: ex,
      y: ey,
      r: e.flagged ? 12 : corroborated ? 11.5 : 10,
      flagged: e.flagged,
      corroboration: corroborated ? e.sources.length : undefined,
      meta: e.sources.map((s) => SOURCE_LABELS[s] ?? s).join(" · "),
    });
    const entityLabel = e.flagged ? "СОВПАДЕНИЕ" : KIND_EDGE_LABEL[e.kind];
    for (const s of e.sources) {
      edges.push({ from: `s_${s}`, to: e.key, strong: e.flagged, label: entityLabel });
    }
  }

  relaxLayout(nodes, edges, cx, cy);
  return { nodes, edges };
}

/* ─────────────────────────────────────────────────────────────────────
 * Общий граф нескольких объектов.
 *
 * Когда Aqyl за один ход проверила несколько компаний, интереснее не три
 * отдельные картинки, а одна общая: если у двух пирамид совпал кошелёк,
 * IP или домен — это видно сразу как узел, к которому идут связи от обоих
 * объектов. Именно такие пересечения и выдают общего оператора.
 *
 * Схема: каждый объект получает свой сектор круга, источники внутри
 * сектора, а найденные сущности — общие для всего графа и схлопываются
 * по (тип + значение), как и в одиночном графе.
 * ───────────────────────────────────────────────────────────────────── */
export function buildMultiGraph(items: InvestigateResponse[]): GraphModel {
  if (items.length === 1) return buildGraph(items[0]);

  const cx = 500;
  const cy = 390;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const targetIds = items.map((_, i) => `target_${i}`);
  const sectorSize = TAU / items.length;

  // сколько объектов подтвердили каждую сущность — ключевой сигнал
  // общего графа: сущность, найденная у двух целей сразу, их связывает
  type SharedAcc = {
    label: string;
    full: string;
    kind: EntityKind;
    flagged: boolean;
    /** от каких источников пришла: "targetIdx:sourceName" */
    links: { targetIdx: number; source: string }[];
    angleSum: number;
  };
  const shared = new Map<string, SharedAcc>();

  items.forEach((data, ti) => {
    const base = -Math.PI / 2 + ti * sectorSize;
    const tx = cx + Math.cos(base + sectorSize / 2) * 170;
    const ty = cy + Math.sin(base + sectorSize / 2) * 140;

    nodes.push({
      id: targetIds[ti],
      label: shorten(data.query, 20),
      full: data.query,
      kind: "target",
      x: tx,
      y: ty,
      r: 24,
      flagged: data.risk_score >= 30,
      meta: `risk ${data.risk_score}/100`,
    });

    const srcs = data.results;
    srcs.forEach((src, si) => {
      // источники раскладываем внутри сектора своего объекта
      const angle = base + ((si + 0.5) / Math.max(srcs.length, 1)) * sectorSize;
      const sid = `s${ti}_${src.source}`;
      nodes.push({
        id: sid,
        label: SOURCE_LABELS[src.source] ?? src.source,
        full: src.source,
        kind: "source",
        x: cx + Math.cos(angle) * 300,
        y: cy + Math.sin(angle) * 250,
        r: 11,
        ok: src.ok,
        flagged: src.red_flags.length > 0,
        flagCount: src.red_flags.length,
        meta: src.ok ? `${src.red_flags.length} сигн.` : src.error ?? "нет ответа",
      });
      edges.push({
        from: targetIds[ti],
        to: sid,
        strong: src.red_flags.length > 0,
        label: !src.ok ? "НЕ ОТВЕТИЛ" : src.red_flags.length > 0 ? "СИГНАЛ РИСКА" : "ПРОВЕРЕНО",
      });

      const queryLower = data.query.trim().toLowerCase();
      for (const e of extractEntities(src)) {
        if (e.full.trim().toLowerCase() === queryLower) continue;
        const key = `${e.kind}:${e.full.toLowerCase()}`;
        let acc = shared.get(key);
        if (!acc) {
          acc = {
            label: e.label,
            full: e.full,
            kind: e.kind,
            flagged: false,
            links: [],
            angleSum: 0,
          };
          shared.set(key, acc);
        }
        acc.flagged = acc.flagged || !!e.flagged;
        acc.links.push({ targetIdx: ti, source: src.source });
        acc.angleSum += angle;
      }
    });
  });

  for (const [key, acc] of shared) {
    const distinctTargets = new Set(acc.links.map((l) => l.targetIdx));
    const isBridge = distinctTargets.size > 1; // связывает разные объекты
    const angle = acc.angleSum / acc.links.length;
    // мост тянем к центру — он принадлежит не одному объекту, а всем сразу
    const radius = isBridge ? 120 : 430;

    nodes.push({
      id: key,
      label: acc.label,
      full: acc.full,
      kind: acc.kind,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * (isBridge ? radius * 0.8 : radius * 0.78),
      r: isBridge ? 13 : acc.flagged ? 9 : 7,
      flagged: acc.flagged,
      corroboration: acc.links.length > 1 ? acc.links.length : undefined,
      bridge: isBridge ? distinctTargets.size : undefined,
      meta: [...new Set(acc.links.map((l) => SOURCE_LABELS[l.source] ?? l.source))].join(" · "),
    });

    for (const l of acc.links) {
      edges.push({
        from: `s${l.targetIdx}_${l.source}`,
        to: key,
        strong: acc.flagged || isBridge,
        label: isBridge ? "ОБЩИЙ ОБЪЕКТ" : acc.flagged ? "СОВПАДЕНИЕ" : KIND_EDGE_LABEL[acc.kind],
      });
    }
  }

  relaxLayout(nodes, edges, cx, cy, targetIds);
  return { nodes, edges };
}

/* Физическая укладка (ngraph.forcelayout): узлы отталкиваются друг от друга,
 * рёбра стягивают связанные. Вместо жёстких колец получается органичная
 * структура, где сущность, подтверждённая двумя источниками, естественно
 * встаёт между ними. Объект пришпилен в центре — он якорь всей картины. */
function relaxLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  cx: number,
  cy: number,
  pinIds: string[] = ["target"]
) {
  if (nodes.length < 3) return;

  const graph = createGraph();
  for (const n of nodes) graph.addNode(n.id);
  for (const e of edges) graph.addLink(e.from, e.to);

  const layout = createLayout(graph, {
    springLength: 90,
    springCoefficient: 0.0006,
    // отталкивание масштабируем по числу узлов: на разреженном графе оно
    // не должно разносить всё по углам, на плотном — не должно слипаться
    gravity: -repulsionFor(nodes.length),
    dragCoefficient: 0.02,
    theta: 0.8,
  });

  // seed из уже рассчитанных «кольцевых» позиций — физика стартует не с
  // хаоса, а с осмысленной картины, поэтому сходится быстрее и стабильнее
  for (const n of nodes) layout.setNodePosition(n.id, n.x - cx, n.y - cy);
  // якорим все объекты-цели: в общем графе их несколько, и без закрепления
  // физика стянула бы их в одну точку, потеряв разделение по секторам
  for (const id of pinIds) {
    const node = graph.getNode(id);
    if (node) layout.pinNode(node, true);
  }

  for (let i = 0; i < 320; i++) layout.step();

  // масштабируем результат физики в поле рисования с полями под подписи
  const pos = nodes.map((n) => layout.getNodePosition(n.id));
  const maxAbsX = Math.max(...pos.map((p) => Math.abs(p.x)), 1);
  const maxAbsY = Math.max(...pos.map((p) => Math.abs(p.y)), 1);
  const scale = Math.min(360 / maxAbsX, 300 / maxAbsY, 1.8);

  nodes.forEach((n, i) => {
    n.x = cx + pos[i].x * scale;
    n.y = cy + pos[i].y * scale;
  });
}

/** Сила отталкивания под размер графа. */
function repulsionFor(count: number): number {
  if (count <= 8) return 6;
  if (count <= 16) return 12;
  return 20;
}

/* Иконки узлов графа — path-данные под viewBox 24×24, stroke-стиль тот же,
 * что у общего набора иконок сайта. Рисуются прямо внутри кружка узла,
 * чтобы граф читался с одного взгляда: где поиск, где реестр, где кошелёк. */
export const NODE_ICON_PATHS: Record<string, string[]> = {
  search: ["M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12", "m19.5 19.5-4-4"],
  archive: ["M4 6.5h16", "M6 6.5V17a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 17V6.5", "M10 10.5h4"],
  globe: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17", "M3.5 12h17", "M12 3.5a12 12 0 0 1 0 17M12 3.5a12 12 0 0 0 0 17"],
  bank: ["M4 9.5 12 5l8 4.5", "M6 10v8M10 10v8M14 10v8M18 10v8", "M3.5 19.5h17"],
  coin: ["M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15", "M12 8v8", "M9.8 10.2h4a1.6 1.6 0 0 1 0 3.2h-4h4a1.6 1.6 0 0 1 0 3.2h-4"],
  user: ["M12 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7", "M5.5 19.5a6.5 6.5 0 0 1 13 0"],
  tor: ["M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16", "M12 4v16", "M12 7a5 5 0 0 1 0 10"],
  server: ["M4 5.5h16v5H4zM4 13.5h16v5H4z", "M7.5 8h.01M7.5 16h.01"],
  target: ["M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16", "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7"],
  flag: ["M6 20V5", "M6 5.5h11l-2.2 3.4L17 12.5H6"],
};

/** Какой иконкой рисовать узел-источник — по смыслу коннектора. */
export function sourceIconKey(source: string): string {
  if (source.includes("searx") || source.includes("duckduckgo")) return "search";
  if (source.includes("wayback") || source.includes("common_crawl")) return "archive";
  if (source.includes("crtsh") || source.includes("whois") || source.includes("dns") || source.includes("urlscan"))
    return "globe";
  if (source.includes("blacklist") || source.includes("sanctions")) return "flag";
  if (source.includes("aleph")) return "archive";
  if (source.includes("internetdb") || source.includes("shodan")) return "server";
  if (source.includes("gleif")) return "bank";
  if (source.includes("openphish") || source.includes("phish")) return "flag";
  if (source.includes("registry") || source.includes("edgar") || source.includes("corporates")) return "bank";
  if (source.includes("blockchain") || source.includes("blockchair") || source.includes("etherscan") || source.includes("chainabuse"))
    return "coin";
  if (source.includes("username") || source.includes("telegram") || source.includes("threat_actor")) return "user";
  if (source.includes("onionclaw") || source.includes("darknet")) return "tor";
  return "search";
}

/** Иконка для узла-сущности по её типу. */
export const KIND_ICON: Record<EntityKind, string> = {
  target: "target",
  source: "search",
  domain: "globe",
  wallet: "coin",
  ip: "server",
  profile: "user",
  org: "bank",
};

export const KIND_META: Record<EntityKind, { color: string; label: string }> = {
  target: { color: "var(--accent)", label: "Объект" },
  source: { color: "var(--ink-muted)", label: "Источник" },
  domain: { color: "#2f6ae8", label: "Домен" },
  wallet: { color: "#7c53d6", label: "Кошелёк" },
  ip: { color: "#5b73aa", label: "IP" },
  profile: { color: "#1f9d5c", label: "Профиль" },
  org: { color: "#0ea5c4", label: "Юрлицо" },
};
