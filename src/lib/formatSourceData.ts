// Человекочитаемое представление сырых данных коннектора для панели узла —
// раньше там был необработанный JSON.stringify(data, null, 2), который
// нормальный человек читать не станет. Каждый источник отдаёт данные в
// своей форме (см. app/connectors/*.py), поэтому форматирование — по
// конкретному источнику, с общим запасным вариантом для новых/неизвестных
// коннекторов, чтобы они тоже не показывали голый JSON.

export interface FriendlyField {
  label: string;
  value: string;
}

export interface FriendlyListItem {
  title: string;
  subtitle?: string;
  url?: string;
  tag?: string;
}

export type FriendlyData =
  | { kind: "fields"; fields: FriendlyField[] }
  | { kind: "list"; items: FriendlyListItem[] }
  | { kind: "text"; text: string };

function rec(x: unknown): Record<string, unknown> {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : {};
}
function arr(x: unknown): unknown[] {
  return Array.isArray(x) ? x : [];
}
function str(x: unknown, fallback = "—"): string {
  if (x === null || x === undefined || x === "") return fallback;
  return String(x);
}
function strList(x: unknown): string[] {
  return arr(x).map(String).filter(Boolean);
}
const EMPTY_FIELDS: FriendlyData = { kind: "fields", fields: [] };

export function formatSourceData(source: string, data: unknown): FriendlyData {
  const d = rec(data);

  // Общие случаи: явная ошибка/примечание от самого коннектора —
  // показываем его текст напрямую, это уже написано по-человечески.
  if (typeof d.note === "string" && d.note) return { kind: "text", text: d.note };

  switch (source) {
    case "searx_metasearch": {
      const results = arr(d.results);
      if (!results.length) return { kind: "text", text: "Метапоиск не нашёл ничего по этому запросу." };
      return {
        kind: "list",
        items: results.map((r) => {
          const rr = rec(r);
          return { title: str(rr.title, "без названия"), subtitle: str(rr.content, ""), url: rr.url ? String(rr.url) : undefined };
        }),
      };
    }

    case "duckduckgo_instant_answer": {
      const topics = strList(d.related_topics);
      const fields: FriendlyField[] = [];
      if (d.heading) fields.push({ label: "Заголовок", value: str(d.heading) });
      if (d.abstract) fields.push({ label: "Описание", value: str(d.abstract) });
      if (d.abstract_source) fields.push({ label: "Источник справки", value: str(d.abstract_source) });
      if (topics.length) fields.push({ label: "Связанные темы", value: topics.join(" · ") });
      if (!fields.length) return { kind: "text", text: "Готовой справки нет — DuckDuckGo не считает объект достаточно известным." };
      return { kind: "fields", fields };
    }

    case "wayback_machine": {
      const count = Number(d.snapshot_count ?? 0);
      if (!count) return { kind: "text", text: "Ни одного снепшота в веб-архиве. Если объект утверждает, что работает много лет, — это прямое противоречие." };
      return { kind: "fields", fields: [
        { label: "Первый снепшот", value: str(d.first_seen) },
        { label: "Всего снепшотов", value: String(count) },
      ] };
    }

    case "common_crawl": {
      const pages = arr(d.pages);
      if (!pages.length) return { kind: "text", text: "Независимый краулер Common Crawl не находил страниц этого домена." };
      return {
        kind: "list",
        items: pages.map((p) => {
          const pp = rec(p);
          return { title: str(pp.url, "—"), subtitle: pp.timestamp ? `просканировано ${pp.timestamp}` : undefined, url: pp.url ? String(pp.url) : undefined };
        }),
      };
    }

    case "crtsh_cert_transparency": {
      const names = strList(d.related_names).filter((n) => !n.startsWith("*"));
      if (!names.length) return { kind: "text", text: "Сертификаты не вскрыли связанных доменов." };
      return { kind: "list", items: names.map((n) => ({ title: n })) };
    }

    case "rdap_whois": {
      if (d.found === false) return { kind: "text", text: "WHOIS/RDAP не нашёл записи о домене." };
      const fields: FriendlyField[] = [
        { label: "Зарегистрирован", value: str(d.registered) },
        { label: "Регистратор", value: str(d.registrar) },
        { label: "Истекает", value: str(d.expires) },
      ];
      const ns = strList(d.nameservers);
      if (ns.length) fields.push({ label: "Nameservers", value: ns.join(", ") });
      const status = strList(d.status);
      if (status.length) fields.push({ label: "Статус", value: status.join(", ") });
      return { kind: "fields", fields };
    }

    case "dns_records": {
      const a = strList(d.A), mx = strList(d.MX), ns = strList(d.NS), txt = strList(d.TXT);
      if (!a.length && !mx.length && !ns.length) {
        return { kind: "text", text: "Домен не резолвится ни в один IP — нет активных A/MX/NS записей. Часто значит «спящую», ещё не запущенную инфраструктуру." };
      }
      const fields: FriendlyField[] = [];
      if (a.length) fields.push({ label: "IP-адреса (A)", value: a.join(", ") });
      if (mx.length) fields.push({ label: "Почтовые серверы (MX)", value: mx.join(", ") });
      if (ns.length) fields.push({ label: "Серверы имён (NS)", value: ns.join(", ") });
      if (txt.length) fields.push({ label: "TXT-записи", value: txt.slice(0, 3).join(" · ") });
      return { kind: "fields", fields };
    }

    case "urlscan_search": {
      const total = Number(d.total_scans ?? 0);
      if (!total) return { kind: "text", text: "urlscan.io ни разу не сканировал этот домен." };
      return {
        kind: "list",
        items: arr(d.recent_scans).map((s) => {
          const ss = rec(s);
          const meta = [ss.ip, ss.country].filter(Boolean).map(String).join(" · ");
          return { title: str(ss.task_url, "скан"), subtitle: meta || undefined, url: ss.task_url ? String(ss.task_url) : undefined };
        }),
      };
    }

    case "opencorporates_registry": {
      const companies = arr(d.companies);
      if (!companies.length) return { kind: "text", text: "Юрлицо не найдено ни в одном реестре компаний." };
      return {
        kind: "list",
        items: companies.map((c) => {
          const cc = rec(c);
          const meta = [cc.jurisdiction, cc.status, cc.incorporation_date].filter(Boolean).map(String).join(" · ");
          return { title: str(cc.name, "—"), subtitle: meta || undefined, url: cc.url ? String(cc.url) : undefined };
        }),
      };
    }

    case "sec_edgar_registry": {
      const entries = arr(d.entries);
      if (!entries.length) return { kind: "text", text: "SEC EDGAR не нашёл ни одной фильтрации на это имя — если объект называет себя «регулируемым американским фондом», это противоречие." };
      return {
        kind: "list",
        items: entries.map((e) => {
          const ee = rec(e);
          return { title: str(ee.title, "—"), url: ee.link ? String(ee.link) : undefined };
        }),
      };
    }

    case "regulator_blacklist_local": {
      const matches = arr(d.matches);
      if (!matches.length) return { kind: "text", text: "Совпадений с чёрными списками регуляторов не найдено." };
      return {
        kind: "list",
        items: matches.map((m) => {
          const mm = rec(m);
          const meta = [mm.article, mm.note].filter(Boolean).map(String).join(" · ");
          return { title: str(mm.name, "—"), subtitle: meta || undefined, tag: str(mm.regulator, "") || undefined };
        }),
      };
    }

    case "opensanctions_lists": {
      if (d.available === false) {
        return { kind: "text", text: str(d.note, "Санкционные списки недоступны.") };
      }
      if (d.exact_match === true) {
        return {
          kind: "fields",
          fields: [
            { label: "Результат", value: "ТОЧНОЕ СОВПАДЕНИЕ в санкционных списках" },
            { label: "Датасет", value: str(d.dataset) },
            { label: "Проверено имён", value: str(d.names_indexed) },
          ],
        };
      }
      const partial = strList(d.partial_matches);
      if (!partial.length) {
        return {
          kind: "text",
          text: `Совпадений в санкционных списках нет (проверено ${str(d.names_indexed, "?")} имён со всеми алиасами).`,
        };
      }
      return {
        kind: "list",
        items: [
          { title: "Точного совпадения нет — только похожие имена", subtitle: "однофамильцы вероятны, это не обвинение" },
          ...partial.map((p) => ({ title: p, subtitle: "частичное совпадение" })),
        ],
      };
    }

    case "occrp_aleph": {
      const results = arr(d.results);
      if (!results.length) {
        return { kind: "text", text: "В базе расследований OCCRP упоминаний не найдено." };
      }
      return {
        kind: "list",
        items: results.map((r) => {
          const rr = rec(r);
          const meta = [rr.schema, rr.collection, strList(rr.countries).join(", ")]
            .filter(Boolean)
            .map(String)
            .join(" · ");
          return {
            title: str(rr.name, "—"),
            subtitle: meta || undefined,
            url: rr.url ? String(rr.url) : undefined,
          };
        }),
      };
    }

    case "shodan_internetdb": {
      if (d.found === false) return { kind: "text", text: str(d.note, "Домен не резолвится.") };
      const items: FriendlyListItem[] = [];
      for (const r of arr(d.results)) {
        const rr = rec(r);
        if (rr.error) {
          items.push({ title: str(rr.ip), subtitle: `ошибка: ${str(rr.error)}` });
          continue;
        }
        if (rr.indexed === false) {
          items.push({ title: str(rr.ip), subtitle: "нет записи в индексе Shodan" });
          continue;
        }
        const ports = strList(rr.open_ports);
        const vulns = strList(rr.vulnerabilities);
        const neighbours = Number(rr.neighbour_count ?? 0);
        const parts = [
          ports.length ? `порты: ${ports.join(", ")}` : null,
          neighbours > 0 ? `соседних доменов на IP: ${neighbours}` : null,
          vulns.length ? `уязвимости: ${vulns.slice(0, 3).join(", ")}` : null,
        ].filter(Boolean);
        items.push({
          title: str(rr.ip),
          subtitle: parts.join(" · ") || "открытых портов не видно",
          tag: neighbours >= 5 ? "общий хостинг" : undefined,
        });
        for (const h of strList(rr.hostnames_on_ip).slice(0, 6)) {
          items.push({ title: h, subtitle: "на том же IP" });
        }
      }
      return items.length ? { kind: "list", items } : { kind: "text", text: "Данных по инфраструктуре нет." };
    }

    case "gleif_lei_registry": {
      const records = arr(d.records);
      if (!records.length) {
        return {
          kind: "text",
          text: "В глобальном реестре юрлиц (LEI) записей нет. Для «международного фонда» это довод против — но LEI обязателен не для всех, сам по себе не доказательство.",
        };
      }
      return {
        kind: "list",
        items: records.map((r) => {
          const rr = rec(r);
          const meta = [rr.jurisdiction, rr.city, rr.status].filter(Boolean).map(String).join(" · ");
          const leiStatus = str(rr.lei_status, "");
          return {
            title: str(rr.name, "—"),
            subtitle: meta || undefined,
            tag: leiStatus && leiStatus !== "ISSUED" ? `LEI ${leiStatus}` : undefined,
          };
        }),
      };
    }

    case "openphish_feed": {
      if (d.available === false) return { kind: "text", text: str(d.note, "Фид недоступен.") };
      if (d.listed === true) {
        const urls = strList(d.matching_urls);
        return {
          kind: "list",
          items: [
            { title: "ДОМЕН В ФИШИНГ-ФИДЕ", subtitle: "на этом хосте зафиксирована фишинговая страница" },
            ...urls.map((u) => ({ title: u, subtitle: "зафиксированный URL" })),
          ],
        };
      }
      return { kind: "text", text: str(d.note, "Совпадений в фишинг-фиде нет.") };
    }

    case "blockchain_info_btc": {
      if (d.found === false) return { kind: "text", text: "Адрес не найден в блокчейне или указан неверно." };
      return { kind: "fields", fields: [
        { label: "Получено всего", value: `${str(d.total_received_btc, "0")} BTC` },
        { label: "Отправлено всего", value: `${str(d.total_sent_btc, "0")} BTC` },
        { label: "Текущий баланс", value: `${str(d.final_balance_btc, "0")} BTC` },
        { label: "Всего транзакций", value: str(d.n_tx) },
        { label: "Независимых контрагентов", value: String(strList(d.distinct_counterparties_sample).length) },
      ] };
    }

    case "blockchair_multichain": {
      if (!d.transaction_count && d.transaction_count !== 0) return { kind: "text", text: "Данные по адресу недоступны." };
      return { kind: "fields", fields: [
        { label: "Сеть", value: str(d.chain) },
        { label: "Баланс", value: str(d.balance) },
        { label: "Транзакций", value: str(d.transaction_count) },
        { label: "Впервые замечен", value: str(d.first_seen) },
        { label: "Последняя активность", value: str(d.last_seen) },
      ] };
    }

    case "etherscan_eth": {
      if (d.balance_eth == null) return { kind: "text", text: "Данные по адресу недоступны." };
      const fields: FriendlyField[] = [
        { label: "Баланс", value: `${str(d.balance_eth, "0")} ETH` },
        { label: "Последних транзакций", value: str(d.recent_tx_count) },
      ];
      return { kind: "fields", fields };
    }

    case "chainabuse_scam_reports": {
      const reports = arr(d.reports);
      if (!reports.length) return { kind: "text", text: "Жалоб на этот адрес в базе Chainabuse нет." };
      return {
        kind: "list",
        items: reports.map((r) => {
          const rr = rec(r);
          const domains = strList(rr.related_domains);
          return {
            title: str(rr.category, "жалоба"),
            subtitle: [rr.reported_at ? `дата: ${rr.reported_at}` : null, domains.length ? `домены: ${domains.join(", ")}` : null]
              .filter(Boolean)
              .join(" · ") || undefined,
          };
        }),
      };
    }

    case "username_enumeration": {
      const entries = Object.entries(d).filter(([k]) => k !== "note");
      if (!entries.length) return { kind: "text", text: "Нет данных о профилях." };
      return {
        kind: "list",
        items: entries.map(([platform, v]) => {
          const vv = rec(v);
          const exists = vv.exists;
          return {
            title: platform,
            subtitle: exists === true ? "профиль найден" : exists === false ? "профиля нет" : "не удалось проверить",
            url: exists === true && vv.url ? String(vv.url) : undefined,
          };
        }),
      };
    }

    case "telegram_public_preview": {
      if (d.found === false) return { kind: "text", text: "Публичный канал не найден или закрыт." };
      const fields: FriendlyField[] = [];
      if (d.title) fields.push({ label: "Название канала", value: str(d.title) });
      if (d.member_count) fields.push({ label: "Подписчиков", value: str(d.member_count) });
      fields.push({ label: "Постов в выборке", value: str(d.recent_post_count, "0") });
      const posts = strList(d.recent_posts_sample);
      if (!posts.length) return { kind: "fields", fields };
      return {
        kind: "list",
        items: [
          ...fields.map((f) => ({ title: `${f.label}: ${f.value}` })),
          ...posts.slice(0, 5).map((p) => ({ title: p.length > 140 ? p.slice(0, 140) + "…" : p, subtitle: "пост канала" })),
        ],
      };
    }

    case "threat_actor_username_search": {
      const hits = Number(d.hit_count ?? 0);
      if (!hits) return { kind: "text", text: "Этот ник не встречался в известных утечках киберфорумов." };
      const forums = strList(d.forums);
      return { kind: "fields", fields: [
        { label: "Найдено упоминаний", value: String(hits) },
        { label: "Форумы", value: forums.join(", ") || "—" },
        { label: "Надёжность совпадения", value: d.low_confidence ? "низкая (короткий/частый ник)" : "обычная" },
      ] };
    }

    case "onionclaw_darknet_search": {
      if (d.enabled === false) return { kind: "text", text: "Даркнет-поиск выключен." };
      const results = arr(d.results);
      if (!results.length) return { kind: "text", text: "По даркнет-поисковикам ничего не найдено." };
      return {
        kind: "list",
        items: results.map((r) => {
          const rr = rec(r);
          return { title: str(rr.title, "без названия"), subtitle: rr.engine ? `движок: ${rr.engine}` : undefined, url: rr.url ? String(rr.url) : undefined };
        }),
      };
    }

    default: {
      // Незнакомый/будущий коннектор — не показываем сырой JSON, а
      // раскладываем верхний уровень объекта на простые строки насколько
      // это возможно.
      const fields: FriendlyField[] = [];
      for (const [key, value] of Object.entries(d)) {
        if (value === null || value === undefined) continue;
        if (Array.isArray(value)) {
          if (!value.length) continue;
          fields.push({ label: key, value: value.length > 6 ? `${value.length} записей` : value.map(String).join(", ") });
        } else if (typeof value === "object") {
          continue; // вложенные объекты пропускаем, а не сериализуем как JSON
        } else {
          fields.push({ label: key, value: String(value) });
        }
      }
      if (!fields.length) return EMPTY_FIELDS;
      return { kind: "fields", fields };
    }
  }
}
