import Link from "next/link";
import { SaqMark } from "./SaqMark";

const COLUMNS = [
  {
    title: "Платформа",
    links: [
      { href: "/investigate", label: "Спросить Aqyl" },
      { href: "/community", label: "Сообщество" },
      { href: "/learn", label: "Обучение" },
      { href: "/watchlist", label: "Реестр" },
    ],
  },
  {
    title: "Проект",
    links: [
      { href: "/methodology", label: "Метод" },
      { href: "/sources", label: "Источники" },
      { href: "/cases", label: "Кейсы" },
      { href: "/about", label: "О проекте" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative px-6 py-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent-soft), transparent)" }}
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 border-t border-border pt-14 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <SaqMark className="mt-0.5 h-8 w-8" />
          <div>
            <p className="font-display text-lg font-extrabold tracking-wide">SAQ</p>
            <p className="mt-1 max-w-xs text-sm text-ink-muted">
              «сақ» — по-казахски «бдительный». Қаржы қорғаушысы — финансовый
              защитник: ИИ-ассистент Aqyl, сообщество наводок и школа защиты
              от финансовых пирамид.
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
          © {new Date().getFullYear()} SAQ · Қорғайды · Анықтайды · Ескертеді · Үйретеді
        </p>
        <p className="max-w-md text-xs leading-relaxed text-ink-faint">
          Агрегирует только открытые публичные данные и не выдаёт юридических
          заключений. Результаты — основание для самостоятельной проверки.
        </p>
      </div>
    </footer>
  );
}
