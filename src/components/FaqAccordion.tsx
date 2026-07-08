"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "Phylax сам решает, что это пирамида?",
    a: "Нет. Платформа собирает факты из открытых источников и считает прозрачный risk score по видимым маркерам. Это основание для проверки, а не вердикт — окончательное решение остаётся за человеком.",
  },
  {
    q: "Нужны ли платные API-ключи?",
    a: "По умолчанию нет. Подавляющее большинство источников бесплатны и публичны. Ключ повышает надёжность лишь для отдельных коннекторов (например Etherscan), а LLM-синтез отчёта включается опционально своим ключом.",
  },
  {
    q: "Откуда берутся данные?",
    a: "Метапоиск, реестры компаний, логи сертификатов, WHOIS/DNS, блокчейн-эксплореры, архивы сайтов и публичные страницы соцсетей. Полный список — на странице «Источники».",
  },
  {
    q: "Используются ли боты или фейковые аккаунты?",
    a: "Нет. Соцсети читаются только через публичные, не требующие входа страницы. Никаких sock puppet-аккаунтов и обхода анти-бот защиты платформ.",
  },
  {
    q: "Что с даркнет-поиском?",
    a: "Модуль на базе OnionClaw выключен по умолчанию и требует явной настройки (Tor + переменные окружения). Автоматический доступ к .onion может быть незаконен в вашей юрисдикции — включение остаётся осознанным выбором.",
  },
  {
    q: "Сколько занимает одна проверка?",
    a: "Обычно секунды: применимые источники опрашиваются параллельно. Дольше — только если включён даркнет-поиск, так как Tor медленный по своей природе.",
  },
  {
    q: "Низкий score означает, что всё честно?",
    a: "Нет. Отсутствие сигналов означает лишь, что открытые источники их не показали. Это снижает, но не исключает риск — здравый смысл всё ещё нужен.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-border border-y border-border">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="reveal" style={{ animationDelay: `${i * 50}ms` }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className={`font-display text-lg transition ${isOpen ? "text-ink" : "text-ink-muted"}`}>
                {item.q}
              </span>
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border-strong font-mono text-accent transition ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-12 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
