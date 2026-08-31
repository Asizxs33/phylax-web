"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { apiJson, isAdmin, useAuth } from "@/lib/auth";

interface Stats {
  users: number;
  investigations: number;
  tips: number;
  chat_sessions: number;
  queries_24h: number;
  watchlist_high_risk: number;
}

interface AdminUser {
  id: number;
  email: string;
  role: string;
  created_at: string;
  last_login: string | null;
  login_count: number;
  investigations_count: number;
  chats_count: number;
}

interface BlacklistFile {
  file: string;
  regulator?: string | null;
  updated?: string | null;
  entries?: number;
  error?: string;
}

interface Tip {
  id: number;
  target: string;
  note: string;
  status: string;
  risk_score: number | null;
  created_at: string;
  source: string;
}

interface MonitorSettings {
  watcher_enabled_in_env: boolean;
  paused: boolean;
}

interface Candidate {
  id: number;
  domain: string;
  matched_markers: string[];
  status: string;
  investigation_id: number | null;
  first_seen: string;
}

interface MobileFinding {
  id: string;
  kind: "content" | "signal";
  platform: string | null;
  category: string | null;
  author: string | null;
  text: string | null;
  risk_score: number | null;
  risk_level: string | number | null;
  reasons: string[];
  detected_via: string[];
  views: string | null;
  blocked: boolean;
  user_decision: string | null;
  url?: string | null;
  created_at: string | null;
  is_test: boolean;
}

interface MobileFeed {
  stats: { content: number; signals: number; high_risk: number; blocked: number; available: boolean };
  items: MobileFinding[];
}

type Tab = "stats" | "users" | "blacklist" | "tips" | "monitor" | "mobile";

const TIP_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "на проверке", cls: "bg-accent/10 text-accent-bright" },
  confirmed: { label: "подтвердилось", cls: "bg-danger/10 text-danger" },
  rejected: { label: "не подтвердилось", cls: "bg-safe/10 text-safe" },
};

const TIP_SOURCE: Record<string, { label: string; cls: string }> = {
  web: { label: "сайт", cls: "bg-bg-elevated text-ink-muted" },
  guardian_app: { label: "guardian", cls: "bg-accent/10 text-accent-bright" },
};

const CANDIDATE_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "в очереди", cls: "bg-accent/10 text-accent-bright" },
  claimed: { label: "проверяется", cls: "bg-accent/10 text-accent-bright" },
  done: { label: "проверено", cls: "bg-safe/10 text-safe" },
  failed: { label: "ошибка", cls: "bg-danger/10 text-danger" },
};

const TABS: { id: Tab; label: string }[] = [
  { id: "stats", label: "Обзор" },
  { id: "users", label: "Пользователи" },
  { id: "blacklist", label: "Чёрные списки" },
  { id: "tips", label: "Наводки" },
  { id: "monitor", label: "Автомониторинг" },
  { id: "mobile", label: "Мобильное приложение" },
];

/** Suspense-обёртка обязательна: useSearchParams внутри клиентского
 *  компонента без неё роняет production-сборку ("Missing Suspense boundary
 *  with useSearchParams"). В dev-режиме проблема не проявляется, поэтому
 *  легко пропустить — см. node_modules/next/dist/docs/.../use-search-params.md */
export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="font-mono text-xs uppercase tracked text-ink-faint">загрузка…</p>
        </main>
      }
    >
      <AdminPageInner />
    </Suspense>
  );
}

function AdminPageInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [loginHistory, setLoginHistory] = useState<Record<number, string[]>>({});
  const [blacklist, setBlacklist] = useState<{ lists: BlacklistFile[]; total_entries: number } | null>(null);
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [monitorSettings, setMonitorSettings] = useState<MonitorSettings | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [mobile, setMobile] = useState<MobileFeed | null>(null);
  const [candidateFilter, setCandidateFilter] = useState<string>("");
  const [togglingMonitor, setTogglingMonitor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/admin");
    else if (!isAdmin(user)) router.replace("/dashboard");
  }, [loading, user, router]);

  // ссылки из бокового меню ведут на /admin?tab=monitor и т.п. — без этого
  // они бы просто открывали панель на вкладке "Обзор"
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && TABS.some((x) => x.id === t)) setTab(t as Tab);
  }, [searchParams]);

  const load = useCallback(async () => {
    try {
      const [s, u, b, t, ms, c, mf] = await Promise.all([
        apiJson<Stats>("/admin/stats"),
        apiJson<AdminUser[]>("/admin/users"),
        apiJson<{ lists: BlacklistFile[]; total_entries: number }>("/admin/blacklist"),
        apiJson<Tip[]>("/admin/tips"),
        apiJson<MonitorSettings>("/admin/monitor/settings"),
        apiJson<Candidate[]>("/admin/monitor/candidates?limit=100"),
        apiJson<MobileFeed>("/admin/mobile/findings?limit=100"),
      ]);
      setStats(s);
      setUsers(u);
      setBlacklist(b);
      setTips(t);
      setMonitorSettings(ms);
      setCandidates(c);
      setMobile(mf);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить данные");
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin(user)) load();
  }, [user, load]);

  async function changeRole(id: number, role: string) {
    try {
      await apiJson(`/admin/users/${id}/role`, {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      setUsers((us) => us?.map((x) => (x.id === id ? { ...x, role } : x)) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить роль");
    }
  }

  async function toggleMonitorPause() {
    if (!monitorSettings) return;
    setTogglingMonitor(true);
    try {
      const next = !monitorSettings.paused;
      await apiJson(`/admin/monitor/certstream?paused=${next}`, { method: "POST" });
      setMonitorSettings({ ...monitorSettings, paused: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось переключить автомониторинг");
    } finally {
      setTogglingMonitor(false);
    }
  }

  async function toggleLoginHistory(id: number) {
    if (expandedUserId === id) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(id);
    if (!loginHistory[id]) {
      try {
        const res = await apiJson<{ logins: string[] }>(`/admin/users/${id}/logins`);
        setLoginHistory((h) => ({ ...h, [id]: res.logins }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить историю входов");
      }
    }
  }

  async function setTipStatus(id: number, status: string) {
    try {
      await apiJson(`/admin/tips/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      setTips((ts) => ts?.map((t) => (t.id === id ? { ...t, status } : t)) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить статус наводки");
    }
  }

  async function exportForAfm(minScore: number) {
    try {
      const token = localStorage.getItem("saq_token");
      const res = await fetch(`/api/backend/admin/export/afm?min_score=${minScore}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Экспорт не удался (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `saq_export_afm_${minScore}plus.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выгрузить CSV");
    }
  }

  if (loading || !user || !isAdmin(user)) {
    return (
      <>
        <NavBar />
        <main className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs uppercase tracked text-ink-faint">проверяю доступ…</p>
        </main>
      </>
    );
  }

  return (
    <DashboardShell title="Управление SAQ" subtitle="админ-панель">
      <div className="mx-auto max-w-7xl">
        <>
          <div className="mb-6 flex gap-1.5 overflow-x-auto">
            {TABS.map((t) => {
              const pendingCount =
                t.id === "tips" ? tips?.filter((x) => x.status === "pending").length ?? 0 : 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs transition ${
                    tab === t.id
                      ? "border-accent bg-accent/10 text-accent-bright"
                      : "border-border-strong text-ink-muted hover:text-ink"
                  }`}
                >
                  {t.label}
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-danger px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {tab === "stats" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Пользователей", value: stats?.users },
                { label: "Расследований", value: stats?.investigations },
                { label: "Высокий риск (≥60)", value: stats?.watchlist_high_risk, tone: "text-danger" },
                { label: "Наводок", value: stats?.tips },
                { label: "Диалогов", value: stats?.chat_sessions },
                { label: "Запросов за 24ч", value: stats?.queries_24h, tone: "text-accent-bright" },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-border bg-bg-card/60 p-5">
                  <p className="card-label">{c.label}</p>
                  <p className={`font-display text-3xl font-extrabold ${c.tone ?? "text-ink"}`}>
                    {c.value ?? "—"}
                  </p>
                </div>
              ))}

              {/* доля высокорисковых объектов — визуально, не просто число */}
              {stats && stats.investigations > 0 && (
                <div className="rounded-2xl border border-border bg-bg-card/60 p-5 sm:col-span-2 lg:col-span-3">
                  <p className="card-label mb-3">Доля высокого риска от всех расследований</p>
                  <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-bg">
                    <div
                      className="h-full bg-danger transition-all"
                      style={{
                        width: `${Math.min(100, (stats.watchlist_high_risk / stats.investigations) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="font-mono text-xs text-ink-muted">
                    {stats.watchlist_high_risk} из {stats.investigations} (
                    {((stats.watchlist_high_risk / stats.investigations) * 100).toFixed(1)}%)
                  </p>
                </div>
              )}

              {/* экспорт для АФМ — структурированный CSV, не скриншот интерфейса */}
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5 sm:col-span-2 lg:col-span-3">
                <p className="card-label mb-1 text-accent-bright">Экспорт для АФМ РК</p>
                <p className="mb-4 text-xs leading-relaxed text-ink-muted">
                  Выгрузка объектов высокого риска в CSV (объект, тип, risk-score, сигналы риска,
                  источники, дата) — готовый формат для передачи в Агентство по финансовому
                  мониторингу, без ручного оформления.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => exportForAfm(60)}
                    className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-accent-bright"
                  >
                    Скачать CSV — риск ≥60
                  </button>
                  <button
                    onClick={() => exportForAfm(80)}
                    className="rounded-full border border-border-strong px-4 py-2 text-xs text-ink-muted transition hover:border-danger hover:text-danger"
                  >
                    Только критический риск ≥80
                  </button>
                  <button
                    onClick={() => exportForAfm(0)}
                    className="rounded-full border border-border-strong px-4 py-2 text-xs text-ink-muted transition hover:text-ink"
                  >
                    Весь реестр
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="flex flex-col gap-2">
              {users?.map((u) => {
                const online = u.last_login
                  ? Date.now() - new Date(u.last_login.replace(" ", "T") + "Z").getTime() < 15 * 60 * 1000
                  : false;
                return (
                  <div
                    key={u.id}
                    className="rounded-xl border border-border bg-bg-card/60 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${online ? "bg-safe" : "bg-ink-faint"}`}
                            title={online ? "заходил(а) менее 15 мин назад" : ""}
                          />
                          <p className="truncate text-sm text-ink">{u.email}</p>
                        </div>
                        <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
                          #{u.id} · регистрация{" "}
                          {new Date(u.created_at.replace(" ", "T") + "Z").toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracked ${
                            u.role === "admin"
                              ? "bg-accent/15 text-accent-bright"
                              : "bg-bg-elevated text-ink-muted"
                          }`}
                        >
                          {u.role}
                        </span>
                        <button
                          onClick={() => changeRole(u.id, u.role === "admin" ? "user" : "admin")}
                          disabled={u.id === user.id}
                          title={u.id === user.id ? "Нельзя изменить свою роль" : ""}
                          className="rounded-lg border border-border-strong px-2.5 py-1 font-mono text-[10px] text-ink-muted transition hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {u.role === "admin" ? "снять админа" : "сделать админом"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border pt-2.5">
                      <p className="font-mono text-[10px] text-ink-muted">
                        <span className="text-ink-faint">последний вход:</span>{" "}
                        {u.last_login
                          ? new Date(u.last_login.replace(" ", "T") + "Z").toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "ни разу"}
                      </p>
                      <p className="font-mono text-[10px] text-ink-muted">
                        <span className="text-ink-faint">входов:</span> {u.login_count}
                      </p>
                      <p className="font-mono text-[10px] text-ink-muted">
                        <span className="text-ink-faint">расследований:</span> {u.investigations_count}
                      </p>
                      <p className="font-mono text-[10px] text-ink-muted">
                        <span className="text-ink-faint">диалогов:</span> {u.chats_count}
                      </p>
                      {u.login_count > 0 && (
                        <button
                          onClick={() => toggleLoginHistory(u.id)}
                          className="ml-auto font-mono text-[10px] text-accent-bright underline underline-offset-2"
                        >
                          {expandedUserId === u.id ? "скрыть историю" : "история входов"}
                        </button>
                      )}
                    </div>

                    {expandedUserId === u.id && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
                        {loginHistory[u.id] === undefined && (
                          <p className="font-mono text-[10px] text-ink-faint">загрузка…</p>
                        )}
                        {loginHistory[u.id]?.map((t, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-bg-elevated px-2 py-1 font-mono text-[10px] text-ink-muted"
                          >
                            {new Date(t.replace(" ", "T") + "Z").toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "blacklist" && (
            <div>
              <p className="mb-4 text-sm text-ink-muted">
                Всего записей во всех списках:{" "}
                <span className="font-display text-lg font-extrabold text-ink">
                  {blacklist?.total_entries ?? "—"}
                </span>
                . Файлы лежат в <code className="font-mono text-xs">data/blacklists/</code> — правятся
                на диске, здесь видно, что реально загружено.
              </p>
              <div className="flex flex-col gap-2">
                {blacklist?.lists.map((f) => (
                  <div key={f.file} className="rounded-xl border border-border bg-bg-card/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-sm text-ink">{f.file}</p>
                      <span className="shrink-0 font-mono text-xs text-accent-bright">
                        {f.entries ?? "—"} записей
                      </span>
                    </div>
                    {f.regulator && (
                      <p className="mt-1 text-xs leading-snug text-ink-muted">{f.regulator}</p>
                    )}
                    {f.updated && (
                      <p className="mt-1 font-mono text-[10px] text-ink-faint">обновлён {f.updated}</p>
                    )}
                    {f.error && <p className="mt-1 text-xs text-danger">Ошибка: {f.error}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "tips" && (
            <div className="flex flex-col gap-2">
              {tips?.length === 0 && <p className="text-sm text-ink-muted">Наводок пока нет.</p>}
              {tips?.map((t) => {
                const st = TIP_STATUS[t.status] ?? TIP_STATUS.pending;
                return (
                  <div key={t.id} className="rounded-xl border border-border bg-bg-card/60 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-ink">{t.target}</p>
                        {(() => {
                          const src = TIP_SOURCE[t.source] ?? TIP_SOURCE.web;
                          return (
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracked ${src.cls}`}
                              title="Откуда пришла наводка"
                            >
                              {src.label}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        {t.risk_score != null && (
                          <span
                            className={`font-display text-lg font-extrabold ${
                              t.risk_score >= 60 ? "text-danger" : "text-accent-bright"
                            }`}
                          >
                            {t.risk_score}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracked ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{t.note}</p>
                    {t.status === "pending" && (
                      <div className="mt-2.5 flex gap-2">
                        <button
                          onClick={() => setTipStatus(t.id, "confirmed")}
                          className="rounded-lg border border-danger/40 px-2.5 py-1 font-mono text-[10px] text-danger transition hover:bg-danger/10"
                        >
                          подтвердить
                        </button>
                        <button
                          onClick={() => setTipStatus(t.id, "rejected")}
                          className="rounded-lg border border-safe/40 px-2.5 py-1 font-mono text-[10px] text-safe transition hover:bg-safe/10"
                        >
                          отклонить
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "monitor" && (
            <div>
              <div className="mb-5 rounded-2xl border border-border bg-bg-card/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="card-label mb-1">Автомониторинг CertStream</p>
                    <p className="text-xs leading-relaxed text-ink-muted">
                      Робот сам ловит новые домены по маркерам пирамид (новые сертификаты) и
                      прогоняет их через тот же Aqyl. Найденное — ниже и в общем Watchlist.
                    </p>
                  </div>
                  {monitorSettings && !monitorSettings.watcher_enabled_in_env ? (
                    <span className="shrink-0 rounded-full bg-bg-elevated px-3 py-1.5 font-mono text-[10px] uppercase tracked text-ink-faint">
                      выключен в .env
                    </span>
                  ) : (
                    <button
                      onClick={toggleMonitorPause}
                      disabled={togglingMonitor || !monitorSettings}
                      className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs uppercase tracked transition disabled:opacity-50 ${
                        monitorSettings?.paused
                          ? "bg-safe text-white hover:bg-safe/90"
                          : "border border-danger/40 text-danger hover:bg-danger/10"
                      }`}
                    >
                      {monitorSettings?.paused ? "▶ включить" : "⏸ поставить на паузу"}
                    </button>
                  )}
                </div>
                {monitorSettings?.watcher_enabled_in_env && (
                  <p className="mt-3 font-mono text-[10px] text-ink-faint">
                    статус:{" "}
                    <span className={monitorSettings.paused ? "text-ink-muted" : "text-safe"}>
                      {monitorSettings.paused ? "на паузе" : "работает"}
                    </span>
                  </p>
                )}
              </div>

              <div className="mb-4 flex items-center gap-4">
                <h2 className="font-display text-lg font-extrabold">Что нашёл робот</h2>
                <span className="h-px flex-1 bg-border" />
                <div className="flex shrink-0 gap-1 rounded-full border border-border bg-bg-card/60 p-0.5">
                  {["", "new", "done", "failed"].map((s) => (
                    <button
                      key={s || "all"}
                      onClick={() => setCandidateFilter(s)}
                      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracked transition ${
                        candidateFilter === s ? "bg-accent text-white" : "text-ink-faint hover:text-ink"
                      }`}
                    >
                      {s === "" ? "все" : (CANDIDATE_STATUS[s]?.label ?? s)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {candidates?.length === 0 && (
                  <p className="text-sm text-ink-muted">Пока пусто — робот ничего не находил.</p>
                )}
                {candidates
                  ?.filter((c) => !candidateFilter || c.status === candidateFilter)
                  .map((c) => {
                    const cs = CANDIDATE_STATUS[c.status] ?? CANDIDATE_STATUS.new;
                    return (
                      <div key={c.id} className="rounded-xl border border-border bg-bg-card/60 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {c.investigation_id ? (
                            <Link
                              href={`/investigate?q=${encodeURIComponent(c.domain)}`}
                              className="font-mono text-sm text-accent-bright underline underline-offset-2"
                            >
                              {c.domain}
                            </Link>
                          ) : (
                            <p className="font-mono text-sm text-ink">{c.domain}</p>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracked ${cs.cls}`}
                          >
                            {cs.label}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-ink-faint">
                          {c.first_seen} · маркеры: {c.matched_markers.join(", ")}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {tab === "mobile" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Находки мобильного приложения</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Партнёрское приложение помечает опасный контент в соцсетях. База общая, данные читаются
                  напрямую — модерация остаётся на стороне приложения.
                </p>
              </div>

              {!mobile?.stats.available && (
                <div className="rounded-xl border border-border bg-bg-card/60 px-4 py-6 text-center text-sm text-ink-muted">
                  Таблицы приложения сейчас недоступны.
                </div>
              )}

              {mobile?.stats.available && (
                <>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      { label: "Контента помечено", value: mobile.stats.content, tone: "text-ink" },
                      { label: "Сигналов устройств", value: mobile.stats.signals, tone: "text-ink" },
                      { label: "Высокий риск (60+)", value: mobile.stats.high_risk, tone: "text-danger" },
                      { label: "Заблокировано", value: mobile.stats.blocked, tone: "text-accent-bright" },
                    ].map((k) => (
                      <div key={k.label} className="rounded-xl border border-border bg-bg-card/60 p-4">
                        <p className="font-mono text-[10px] uppercase tracked text-ink-faint">{k.label}</p>
                        <p className={`mt-2 font-display text-2xl font-extrabold tabular-nums ${k.tone}`}>
                          {k.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {mobile.items.length === 0 && (
                      <p className="rounded-xl border border-border bg-bg-card/60 px-4 py-6 text-center text-sm text-ink-muted">
                        Пока ничего не найдено.
                      </p>
                    )}
                    {mobile.items.map((m) => {
                      const score = m.risk_score ?? 0;
                      const tone =
                        score >= 60 ? "text-danger" : score >= 30 ? "text-warn" : "text-ink-muted";
                      return (
                        <div key={m.id} className="rounded-xl border border-border bg-bg-card/60 px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-bg-elevated px-2 py-0.5 font-mono text-[9px] uppercase tracked text-ink-muted">
                              {m.platform ?? "—"}
                            </span>
                            {m.category && (
                              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracked text-accent-bright">
                                {m.category}
                              </span>
                            )}
                            {m.blocked && (
                              <span className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[9px] uppercase tracked text-danger">
                                заблокировано
                              </span>
                            )}
                            <span className={`ml-auto font-display text-lg font-extrabold tabular-nums ${tone}`}>
                              {score}
                            </span>
                          </div>
                          {m.author && (
                            <p className="mt-2 font-mono text-xs text-ink-muted">{m.author}</p>
                          )}
                          {m.text && (
                            <p className="mt-1 line-clamp-2 text-sm text-ink">{m.text}</p>
                          )}
                          {m.reasons.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {m.reasons.slice(0, 6).map((r) => (
                                <span
                                  key={r}
                                  className="rounded bg-danger/10 px-1.5 py-0.5 font-mono text-[9px] text-danger"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="mt-2 font-mono text-[10px] text-ink-faint">
                            {m.created_at}
                            {m.views ? ` · ${m.views}` : ""}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      </div>
    </DashboardShell>
  );
}
