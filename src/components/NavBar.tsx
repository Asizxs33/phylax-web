"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PhylaxMark } from "./PhylaxMark";

const LINKS = [
  { href: "/methodology", label: "Метод" },
  { href: "/sources", label: "Источники" },
  { href: "/watchlist", label: "Реестр" },
  { href: "/cases", label: "Кейсы" },
  { href: "/about", label: "О проекте" },
  { href: "/faq", label: "FAQ" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <PhylaxMark className="h-6 w-6" />
          <span className="font-display text-lg tracking-tight">Phylax</span>
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
          <Link
            href="/investigate"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg transition hover:bg-accent-bright sm:inline-block"
          >
            Спросить Phylax
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
              className="mt-2 rounded-full bg-accent px-4 py-2 text-center font-medium text-bg"
            >
              Спросить Phylax
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
