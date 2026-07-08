import Link from "next/link";
import { PhylaxMark } from "./PhylaxMark";

const COLUMNS = [
  {
    title: "Платформа",
    links: [
      { href: "/methodology", label: "Метод" },
      { href: "/sources", label: "Источники" },
      { href: "/investigate", label: "Расследовать" },
      { href: "/watchlist", label: "Реестр" },
    ],
  },
  {
    title: "Проект",
    links: [
      { href: "/cases", label: "Кейсы" },
      { href: "/about", label: "О проекте" },
      { href: "/faq", label: "FAQ" },
      { href: "/report", label: "Сообщить о подозрении" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 border-t border-border pt-14 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <PhylaxMark className="mt-0.5 h-6 w-6" />
          <div>
            <p className="font-display text-lg">Phylax</p>
            <p className="mt-1 max-w-xs text-sm text-ink-muted">
              φύλαξ — «страж, часовой». OSINT-платформа для расследования
              финансовых пирамид и мошеннических схем.
            </p>
          </div>
        </div>

        <div className="flex gap-14">
          {COLUMNS.map((col) => (
            <nav key={col.title} className="flex flex-col gap-2.5 text-sm text-ink-muted">
              <span className="text-ink-faint">{col.title}</span>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href} className="transition hover:text-ink">
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-faint">
          © {new Date().getFullYear()} Phylax · OSINT Investigation Platform
        </p>
        <p className="max-w-md text-xs leading-relaxed text-ink-faint">
          Агрегирует только открытые публичные данные и не выдаёт юридических
          заключений. Результаты — основание для самостоятельной проверки.
        </p>
      </div>
    </footer>
  );
}
