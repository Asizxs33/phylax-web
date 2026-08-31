export type QueryType =
  | "domain"
  | "btc_address"
  | "eth_address"
  | "telegram_handle"
  | "username"
  | "name_or_org";

export interface ConnectorResult {
  source: string;
  ok: boolean;
  data: unknown;
  error: string | null;
  red_flags: string[];
}

export interface RecurrenceEntry {
  id: number;
  query: string;
  query_type: string;
  risk_score: number;
  created_at: string;
}

export interface InvestigateResponse {
  investigation_id: number;
  query: string;
  detected_type: QueryType;
  connectors_run: string[];
  results: ConnectorResult[];
  risk_score: number;
  risk_flags: string[];
  summary: string | null;
  recurrence: RecurrenceEntry[];
}

export interface WatchlistEntry {
  id: number;
  query: string;
  query_type: string;
  risk_score: number;
  risk_flags: string[];
  connectors_run: string[];
  created_at: string;
}

export const QUERY_TYPE_LABELS: Record<"auto" | QueryType, string> = {
  auto: "Авто-определение",
  domain: "Домен",
  btc_address: "BTC-адрес",
  eth_address: "ETH-адрес",
  telegram_handle: "Telegram-хэндл",
  username: "Username",
  name_or_org: "Имя / организация",
};
