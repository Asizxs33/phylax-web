"use client";

/**
 * Каркас кабинета: боковое меню слева + топбар + контент справа —
 * привычная раскладка админ-панелей, вместо верхней навигации и узкой
 * центральной колонки, которые остались на публичных страницах сайта.
 *
 * Публичный сайт (лендинг, реестр, обучение) сознательно оставлен на
 * NavBar: там задача — рассказать и провести к действию, а не дать
 * плотную рабочую панель. Сайдбар включается только там, где человек
 * реально работает с данными: /dashboard и /admin.
 */

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SaqMark, AqylMark } from "@/components/SaqMark";
import { isAdmin, useAuth } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const I = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  radar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 12l6-4" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
};

const GROUPS: NavGroup[] = [
  {
    title: "Кабинет",
    items: [
      { href: "/dashboard", label: "Обзор", icon: I.grid },
      { href: "/investigate", label: "Спросить Aqyl", icon: I.search },
      { href: "/watchlist", label: "Реестр проверок", icon: I.list },
      { href: "/community", label: "Сообщество", icon: I.chat },
    ],
  },
  {
    title: "Администрирование",
    items: [
      { href: "/admin", label: "Админ-панель", icon: I.shield, adminOnly: true },
      { href: "/admin?tab=monitor", label: "Автомониторинг", icon: I.radar, adminOnly: true },
      { href: "/admin?tab=users", label: "Пользователи", icon: I.users, adminOnly: true },
      { href: "/admin?tab=tips", label: "Наводки", icon: I.flag, adminOnly: true },
    ],
  },
  {
    title: "Материалы",
    items: [
      { href: "/learn", label: "Обучение", icon: I.book },
      { href: "/methodology", label: "Метод", icon: I.book },
      { href: "/sources", label: "Источники", icon: I.list },
    ],
  },
];

interface ShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/** Suspense здесь, а не на каждой странице: внутри используется
 *  useSearchParams (подсветка активного пункта меню по ?tab=), а он без
 *  Suspense роняет production-сборку — в dev это не проявляется. */
export function DashboardShell(props: ShellProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <DashboardShellInner {...props} />
    </Suspense>
  );
}

function DashboardShellInner({ children, title, subtitle }: ShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setTheme((localStorage.getItem("theme") as "light" | "dark") || "dark");
  }, []);

  const toggleTheme = () => {
    if (!theme) return;
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const admin = isAdmin(user);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* затемнение под выехавшим меню на мобильных */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* ── сайдбар ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-bg-elevated transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <SaqMark className="h-7 w-7" />
            <span className="font-display text-lg font-extrabold tracking-wide">SAQ</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {GROUPS.map((g) => {
            const items = g.items.filter((it) => !it.adminOnly || admin);
            if (items.length === 0) return null;
            return (
              <div key={g.title} className="mb-6">
                <p className="mb-2 px-3 font-mono text-[9px] uppercase tracked text-ink-faint">
                  {g.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {items.map((it) => {
                    const [base, query] = it.href.split("?");
                    // без сравнения ?tab= подсвечивались бы разом все пункты
                    // админки — у них у всех один и тот же путь /admin
                    const itemTab = query ? new URLSearchParams(query).get("tab") : null;
                    const currentTab = searchParams.get("tab");
                    const active =
                      pathname === base &&
                      (itemTab ? itemTab === currentTab : !currentTab);
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                          active
                            ? "bg-accent/12 text-accent-bright"
                            : "text-ink-muted hover:bg-bg-card hover:text-ink"
                        }`}
                      >
                        <span className="h-4.5 w-4.5 shrink-0">{it.icon}</span>
                        {it.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* нижний блок сайдбара — квота видна всегда, без ухода на другую страницу */}
        <div className="shrink-0 border-t border-border p-4">
          <div className="rounded-xl border border-border bg-bg-card/60 p-3">
            <div className="flex items-center gap-2.5">
              <AqylMark className="h-8 w-8 shrink-0" mood="happy" />
              <div className="min-w-0">
                <p className="truncate text-xs text-ink">{user?.email ?? "—"}</p>
                <p className="font-mono text-[9px] uppercase tracked text-ink-faint">
                  {admin ? "администратор" : "пользователь"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── правая часть: топбар + контент ── */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-bg/85 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-border lg:hidden"
          >
            <span className="h-px w-4 bg-ink" />
            <span className="h-px w-4 bg-ink" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-extrabold leading-tight">{title}</h1>
            {subtitle && (
              <p className="truncate font-mono text-[10px] uppercase tracked text-ink-faint">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href="/investigate"
            className="hidden shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-bright sm:inline-block"
          >
            Спросить Aqyl
          </Link>

          {theme !== null && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Сменить тему"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-card text-ink transition hover:bg-bg-elevated hover:text-accent-bright"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.7.5-.1 1 .2 1.2.7.2.5.1 1.1-.3 1.4-2.8 2.2-4.2 5.7-3.6 9.3.6 3.7 3.5 6.6 7.2 7.2 3.6.6 7.1-.8 9.3-3.6.3-.4.9-.5 1.4-.3.5.2.8.7.7 1.2-.8 4.7-4.9 8.2-9.7 8.2z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>
          )}

          {/* профиль с выпадающим меню */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-border bg-bg-card py-1 pl-1 pr-2.5 transition hover:border-accent/50"
            >
              <AqylMark className="h-7 w-7" mood="happy" />
              <span className="hidden max-w-[140px] truncate text-xs text-ink-muted sm:inline">
                {user?.email ?? "—"}
              </span>
              <span className="text-[9px] text-ink-faint">▼</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-bg-card shadow-lg">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-ink-muted transition hover:bg-bg-elevated hover:text-ink"
                >
                  Мой кабинет
                </Link>
                {admin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink-muted transition hover:bg-bg-elevated hover:text-ink"
                  >
                    Админ-панель
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    router.push("/");
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-ink-muted transition hover:bg-danger/10 hover:text-danger"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
