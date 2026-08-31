"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SaqMark } from "./SaqMark";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { href: "/community", label: "Сообщество" },
  { href: "/learn", label: "Обучение" },
  { href: "/watchlist", label: "Реестр" },
  { href: "/methodology", label: "Метод" },
  { href: "/sources", label: "Источники" },
  { href: "/about", label: "О проекте" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const t = (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(t);
  }, []);

  const toggleTheme = () => {
    if (!theme) return;
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <SaqMark className="h-7 w-7" />
          <span className="font-display text-lg font-extrabold tracking-wide">SAQ</span>
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] text-ink-muted lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative transition hover:text-ink ${active ? "text-ink" : ""}`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {theme !== null && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Сменить тему"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-card text-ink transition hover:bg-bg-elevated hover:text-accent-bright cursor-pointer"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
                  <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.7.5-.1 1 .2 1.2.7.2.5.1 1.1-.3 1.4-2.8 2.2-4.2 5.7-3.6 9.3.6 3.7 3.5 6.6 7.2 7.2 3.6.6 7.1-.8 9.3-3.6.3-.4.9-.5 1.4-.3.5.2.8.7.7 1.2-.8 4.7-4.9 8.2-9.7 8.2z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>
          )}
          <Link
            href={user ? "/dashboard" : "/login"}
            className="hidden rounded-full border border-border-strong px-3.5 py-2 text-sm text-ink-muted transition hover:border-accent hover:text-ink sm:inline-block"
          >
            {user ? "Кабинет" : "Войти"}
          </Link>
          <Link
            href="/investigate"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-bright sm:inline-block"
          >
            Спросить Aqyl
          </Link>
          <button
            type="button"
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md border border-border lg:hidden"
          >
            <span className={`h-px w-4 bg-ink transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px w-4 bg-ink transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-bg-elevated px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-base text-ink-muted">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1 transition hover:text-ink">
                {l.label}
              </Link>
            ))}
            <Link
              href="/investigate"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-4 py-2 text-center font-medium text-white"
            >
              Спросить Aqyl
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
