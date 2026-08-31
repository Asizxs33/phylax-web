"use client";

import { useState } from "react";
import type { ConnectorResult } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  searx_metasearch: "SearXNG (метапоиск)",
  duckduckgo_instant_answer: "DuckDuckGo",
  wayback_machine: "Wayback Machine",
  common_crawl: "Common Crawl",
  crtsh_cert_transparency: "crt.sh (сертификаты)",
  rdap_whois: "RDAP / WHOIS",
  dns_records: "DNS",
  urlscan_search: "urlscan.io",
  opencorporates_registry: "OpenCorporates",
  sec_edgar_registry: "SEC EDGAR",
  regulator_blacklist_local: "Локальный blacklist регуляторов",
  blockchain_info_btc: "blockchain.info (BTC)",
  blockchair_multichain: "Blockchair",
  etherscan_eth: "Etherscan (ETH)",
  chainabuse_scam_reports: "Chainabuse (скам-репорты)",
  username_enumeration: "Профили на платформах",
  telegram_public_preview: "Telegram (публичный превью)",
  threat_actor_username_search: "Ник в утечках киберфорумов",
  onionclaw_darknet_search: "OnionClaw (даркнет)",
};

export function ConnectorCard({ result }: { result: ConnectorResult }) {
  const [open, setOpen] = useState(false);
  const label = SOURCE_LABELS[result.source] ?? result.source;

  const disabledDarknet =
    result.source === "onionclaw_darknet_search" &&
    typeof result.data === "object" &&
    result.data !== null &&
    "enabled" in (result.data as Record<string, unknown>) &&
    (result.data as Record<string, unknown>).enabled === false;

  return (
    <div className="rounded-lg border border-border bg-bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <StatusDot ok={result.ok} disabled={disabledDarknet} />
          <span className="truncate text-sm font-medium">{label}</span>
          {result.red_flags.length > 0 && (
            <span className="shrink-0 rounded-full bg-danger/15 px-2 py-0.5 font-mono text-[10px] uppercase tracked text-danger">
              {result.red_flags.length} flag{result.red_flags.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <span className="shrink-0 font-mono text-[11px] uppercase tracked text-ink-faint">
          {open ? "свернуть" : "детали"}
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3">
          {result.error && <p className="mb-2 text-sm text-danger">Ошибка: {result.error}</p>}
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-bg-elevated p-3 font-mono text-xs text-ink-muted">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function StatusDot({ ok, disabled }: { ok: boolean; disabled: boolean }) {
  const color = disabled ? "bg-ink-faint" : ok ? "bg-safe" : "bg-danger";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />;
}
