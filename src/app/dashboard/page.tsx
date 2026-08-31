"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { apiJson, useAuth, type Quota, type User } from "@/lib/auth";
import { InvestigationsTimelineChart, RiskDonut, WeekdayRiskChart } from "@/components/dashboard/Charts";

interface Profile {
  user: User;
  quota: Quota;
  investigations_count: number;
  tips_count: number;
}

interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface MyInvestigation {
  id: number;
  query: string;
  query_type: string;
  risk_score: number;
  risk_flags: string[];
  created_at: string;
}

interface MyTip {
  id: number;
  target: string;
  note: string;
  status: string;
  risk_score: number | null;
  investigation_id: number | null;
  created_at: string;
}

interface BridgeAlert {
  my_id: number;
  my_query: string;
  shared_kind: string;
  shared_value: string;
  other_id: number;
  other_query: string;
  other_risk_score: number;
  other_created_at: string;
}

type SortMode = "date" | "risk";

const StatIcon = {
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
};

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "accent",
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  tone?: "accent" | "danger";
  delay?: number;
}) {
  const accentText = tone === "danger" ? "text-danger" : "text-ink";
  const iconBox =
    tone === "danger"
      ? "bg-danger/12 text-danger ring-danger/20 group-hover:bg-danger/20"
      : "bg-accent/12 text-accent-bright ring-accent/20 group-hover:bg-accent/20";
  return (
    <div
      className="panel-rise group rounded-xl border border-border bg-bg-card/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-bg-card hover:shadow-lg hover:shadow-black/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
          {label}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors duration-200 ${iconBox}`}
        >
          <span className="h-[18px] w-[18px]">{icon}</span>
        </span>
      </div>
      <p className={`mt-5 font-display text-[2rem] font-extrabold tabular-nums leading-none ${accentText}`}>
        {value}
      </p>
      {hint && <p className="mt-2.5 text-xs leading-snug text-ink-faint">{hint}</p>}
    </div>
  );
}

/** Топ сигналов риска по проверкам пользователя — какие красные флаги
 *  срабатывают чаще всего, чтобы человек видел закономерность, а не только
 *  итоговые баллы. */
function TopSignals({ checks }: { checks: MyInvestigation[] }) {
  const counts = new Map<string, number>();
  for (const c of checks) {
    for (const f of c.risk_flags ?? []) {
      counts.set(f, (counts.get(f) ?? 0) + 1);
    }
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  if (top.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-ink-faint">
        Сигналов пока нет — по вашим проверкам красные флаги не срабатывали.
      </p>
    );
  }

  const max = top[0][1];
  return (
    <div className="flex flex-col gap-3">
      {top.map(([flag, n], i) => (
        <div key={flag} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-xs text-ink-muted" title={flag}>
              {flag}
            </span>
            <span className="shrink-0 font-mono text-[11px] tabular-nums font-bold text-ink">{n}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="bar-slide h-full rounded-full bg-danger/70"
              style={{ width: `${(n / max) * 100}%`, animationDelay: `${500 + i * 80}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Panel({
  title,
  meta,
  className = "",
  delay = 0,
  children,
}: {
  title: string;
  meta?: string;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`panel-rise rounded-xl border border-border bg-bg-card/60 p-5 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="mb-5 flex items-baseline justify-between gap-3 border-b border-border pb-3">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">{title}</h3>
        {meta && <span className="font-mono text-[10px] text-ink-faint/70">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

const TIP_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "на проверке", cls: "bg-accent/10 text-accent-bright" },
  confirmed: { label: "подтвердилось", cls: "bg-danger/10 text-danger" },
  rejected: { label: "не подтвердилось", cls: "bg-safe/10 text-safe" },
};

const scoreTone = (s: number) =>
  s >= 60 ? "text-danger" : s >= 30 ? "text-accent-bright" : "text-safe";

function fmtDate(s: string) {
  return new Date(s.replace(" ", "T") + "Z").toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseUtc(s: string) {
  return new Date(s.replace(" ", "T") + "Z");
}

/** Последние 14 дней, включая дни без единой проверки (нулём) — иначе
 * график "скачет" и не показывает реальные паузы в активности. */
function buildTimeline(checks: MyInvestigation[]) {
  const days: { key: string; label: string; count: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
      count: 0,
    });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const c of checks) {
    const key = parseUtc(c.created_at).toISOString().slice(0, 10);
    const bucket = byKey.get(key);
    if (bucket) bucket.count += 1;
  }
  return days;
}

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/** Проверки за последние 7 дней, сгруппированные по дню недели — сколько
 * из них высокого риска, сколько остальных. */
function buildWeekdayBuckets(checks: MyInvestigation[]) {
  const buckets = WEEKDAYS.map((label) => ({ label, high: 0, rest: 0 }));
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const c of checks) {
    const d = parseUtc(c.created_at);
    if (d.getTime() < weekAgo) continue;
    const idx = (d.getDay() + 6) % 7; // 0=Пн ... 6=Вс
    if (c.risk_score >= 60) buckets[idx].high += 1;
    else buckets[idx].rest += 1;
  }
  return buckets;
}

export default function DashboardPage() {
  // logout/профиль живут в шапке DashboardShell — здесь только данные
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<ChatSession[] | null>(null);
  const [checks, setChecks] = useState<MyInvestigation[] | null>(null);
  const [myTips, setMyTips] = useState<MyTip[] | null>(null);
  const [bridges, setBridges] = useState<BridgeAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [rechecking, setRechecking] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/dashboard");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    try {
      const [p, s, inv, tips, br] = await Promise.all([
        apiJson<Profile>("/me/profile"),
        apiJson<ChatSession[]>("/me/chats"),
        apiJson<MyInvestigation[]>("/me/investigations"),
        apiJson<MyTip[]>("/me/tips"),
        apiJson<BridgeAlert[]>("/me/bridges"),
      ]);
      setProfile(p);
      setSessions(s);
      setChecks(inv);
      setMyTips(tips);
      setBridges(br);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить данные");
    }
  }, []);

  async function recheck(query: string, queryType: string) {
    setRechecking(query);
    setError(null);
    try {
      await apiJson("/me/recheck", {
        method: "POST",
        body: JSON.stringify({ query, query_type: queryType, synthesize: true }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось перепроверить объект");
    } finally {
      setRechecking(null);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function removeSession(id: string) {
    try {
      await apiJson(`/me/chats/${id}`, { method: "DELETE" });
      setSessions((s) => s?.filter((x) => x.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить диалог");
    }
  }

  if (loading || !user) {
    return (
      <>
        <NavBar />
        <main className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs uppercase tracked text-ink-faint">загрузка…</p>
        </main>
      </>
    );
  }

  const q = profile?.quota;

  return (
    <DashboardShell
      title="Обзор"
      subtitle={profile ? `аккаунт с ${fmtDate(profile.user.created_at)}` : undefined}
    >
      <div className="mx-auto max-w-7xl">
        <>
          {error && (
            <div className="mb-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* показатели */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Лимит Aqyl"
              icon={StatIcon.bolt}
              value={
                q?.unlimited ? (
                  <span className="text-[1.35rem] leading-tight text-safe">без ограничений</span>
                ) : (
                  <>
                    {q?.remaining ?? "—"}
                    <span className="ml-1 text-base font-normal text-ink-faint">/ {q?.limit ?? "—"}</span>
                  </>
                )
              }
              hint={q?.unlimited ? "администратор" : "обращений осталось сегодня"}
              delay={0}
            />
            <StatCard
              label="Мои расследования"
              icon={StatIcon.search}
              value={profile?.investigations_count ?? "—"}
              hint="проверок за всё время"
              delay={60}
            />
            <StatCard
              label="Мои наводки"
              icon={StatIcon.flag}
              value={profile?.tips_count ?? "—"}
              hint="отправлено на модерацию"
              delay={120}
            />
            <StatCard
              label="Высокий риск"
              icon={StatIcon.alert}
              tone="danger"
              value={checks?.filter((c) => c.risk_score >= 60).length ?? "—"}
              hint="объектов с оценкой 60+"
              delay={180}
            />
          </div>

          {/* графики — активность по дням и разбивка риска, на реальных
              данных пользователя, а не заглушках */}
          {checks && checks.length > 0 && (
            <div className="mb-8 grid gap-3 lg:grid-cols-3">
              <Panel title="Динамика проверок" meta="14 дней" className="lg:col-span-2" delay={240}>
                <InvestigationsTimelineChart points={buildTimeline(checks)} />
              </Panel>
              <Panel title="Распределение риска" meta="всего" delay={300}>
                {(() => {
                  const high = checks.filter((c) => c.risk_score >= 60).length;
                  const mid = checks.filter((c) => c.risk_score >= 30 && c.risk_score < 60).length;
                  const low = checks.length - high - mid;
                  return <RiskDonut high={high} mid={mid} low={low} />;
                })()}
              </Panel>
              <Panel title="Активность по дням недели" meta="7 дней" className="lg:col-span-2" delay={360}>
                <WeekdayRiskChart buckets={buildWeekdayBuckets(checks)} />
              </Panel>
              <Panel title="Частые сигналы" meta="по моим проверкам" delay={420}>
                <TopSignals checks={checks} />
              </Panel>
            </div>
          )}

          {/* найденные связи — общая инфраструктура с другими пирамидами */}
          {bridges && bridges.length > 0 && (
            <div className="mb-8 rounded-2xl border border-danger/40 bg-danger/5 p-5">
              <p className="card-label mb-3 text-danger">Найдены связи с другими объектами</p>
              <div className="flex flex-col gap-2">
                {bridges.map((b, i) => (
                  <div key={i} className="text-sm text-ink">
                    <span className="font-mono text-ink-muted">{b.my_query}</span>
                    {" — общий "}
                    <span className="text-danger">{b.shared_kind}</span>
                    {" "}
                    <span className="font-mono text-xs text-ink-faint">({b.shared_value})</span>
                    {" с "}
                    <Link
                      href={`/investigate?q=${encodeURIComponent(b.other_query)}`}
                      className="font-mono text-accent-bright underline underline-offset-2"
                    >
                      {b.other_query}
                    </Link>
                    <span className={`ml-2 font-display font-bold ${scoreTone(b.other_risk_score)}`}>
                      {b.other_risk_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* мои проверки — то, чего нет в общем реестре */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <h2 className="font-display text-xl font-extrabold">Мои проверки</h2>
              <span className="h-px flex-1 bg-border" />
              {checks && checks.length > 1 && (
                <div className="flex shrink-0 gap-1 rounded-full border border-border bg-bg-card/60 p-0.5">
                  <button
                    onClick={() => setSortMode("date")}
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracked transition ${
                      sortMode === "date" ? "bg-accent text-white" : "text-ink-faint hover:text-ink"
                    }`}
                  >
                    по дате
                  </button>
                  <button
                    onClick={() => setSortMode("risk")}
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracked transition ${
                      sortMode === "risk" ? "bg-accent text-white" : "text-ink-faint hover:text-ink"
                    }`}
                  >
                    по риску
                  </button>
                </div>
              )}
              <Link
                href="/investigate"
                className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-accent-bright"
              >
                + Новая
              </Link>
            </div>

            {checks && checks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border-strong bg-bg-card/40 px-6 py-10 text-center">
                <p className="text-sm text-ink-muted">
                  Вы ещё ничего не проверяли. Спросите Aqyl про домен, номер телефона, кошелёк или
                  название компании — результат появится здесь.
                </p>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {[...(checks ?? [])]
                .sort((a, b) =>
                  sortMode === "risk"
                    ? b.risk_score - a.risk_score
                    : b.created_at.localeCompare(a.created_at)
                )
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/investigate?q=${encodeURIComponent(c.query)}`}
                    className="card-lift group flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-card/60 px-4 py-3 transition hover:border-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-ink">{c.query}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
                        {fmtDate(c.created_at)}
                        {c.risk_flags.length > 0 && ` · ${c.risk_flags.length} сигн.`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          recheck(c.query, c.query_type);
                        }}
                        disabled={rechecking === c.query}
                        aria-label="Проверить заново"
                        title="Проверить заново"
                        className="opacity-0 transition group-hover:opacity-100 text-ink-faint hover:text-accent-bright disabled:opacity-100"
                      >
                        {rechecking === c.query ? (
                          <span className="font-mono text-[10px]">…</span>
                        ) : (
                          <span className="text-sm">↻</span>
                        )}
                      </button>
                      <p className={`font-display text-2xl font-extrabold ${scoreTone(c.risk_score)}`}>
                        {c.risk_score}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* мои наводки — обратная связь по отправленному в сообщество */}
          {myTips && myTips.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-4">
                <h2 className="font-display text-xl font-extrabold">Мои наводки</h2>
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-xs text-ink-faint">{myTips.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {myTips.map((t) => {
                  const st = TIP_STATUS[t.status] ?? TIP_STATUS.pending;
                  return (
                    <div
                      key={t.id}
                      className="rounded-xl border border-border bg-bg-card/60 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="truncate font-mono text-sm text-ink">{t.target}</p>
                        <div className="flex items-center gap-2">
                          {t.risk_score != null && (
                            <span className={`font-display text-lg font-extrabold ${scoreTone(t.risk_score)}`}>
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
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{t.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* история диалогов */}
          <div>
            <div className="mb-4 flex items-center gap-4">
              <h2 className="font-display text-xl font-extrabold">История диалогов</h2>
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-xs text-ink-faint">{sessions?.length ?? 0}</span>
            </div>

            {sessions && sessions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border-strong bg-bg-card/40 px-6 py-12 text-center">
                <p className="text-sm text-ink-muted">
                  Диалогов пока нет.{" "}
                  <Link href="/investigate" className="text-accent-bright underline underline-offset-2">
                    Спросите Aqyl
                  </Link>{" "}
                  — переписка сохранится здесь и будет доступна с любого устройства.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {sessions?.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg-card/60 px-4 py-3 transition hover:border-accent/40"
                >
                  <Link href={`/investigate?session=${s.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{s.title || "Без названия"}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
                      {fmtDate(s.updated_at)} · {s.message_count} сообщ.
                    </p>
                  </Link>
                  <button
                    onClick={() => removeSession(s.id)}
                    aria-label="Удалить диалог"
                    className="shrink-0 text-ink-faint transition hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      </div>
    </DashboardShell>
  );
}
