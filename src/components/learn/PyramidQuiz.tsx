"use client";

import { useState } from "react";
import { AqylMark } from "@/components/SaqMark";
import { AqylLive } from "@/components/AqylLive";

type Question = {
  scenario: string;
  isPyramid: boolean;
  explain: string;
};

const QUESTIONS: Question[] = [
  {
    scenario:
      "«Инвест-клуб» обещает 30% в месяц гарантированно. Чтобы забрать прибыль, нужно привести двух друзей.",
    isPyramid: true,
    explain:
      "Гарантированная доходность + выплаты за приведённых людей — классическая пирамида. Доход платят из денег новичков.",
  },
  {
    scenario:
      "Банк предлагает депозит под 14% годовых. Есть лицензия регулятора, деньги застрахованы.",
    isPyramid: false,
    explain:
      "Лицензия, страхование вкладов и реалистичная ставка — признаки легального продукта. Но проверить лицензию всё равно стоит!",
  },
  {
    scenario:
      "Telegram-канал продаёт «сигналы»: скрины прибыли, отзывы, а вывести деньги можно только после «комиссии за разблокировку».",
    isPyramid: true,
    explain:
      "Платить, чтобы забрать свои же деньги, — верный признак скама. Скрины и отзывы легко подделать.",
  },
  {
    scenario:
      "Приложение для накоплений: без обещаний доходности, деньги лежат в госбумагах, комиссия прописана в договоре.",
    isPyramid: false,
    explain:
      "Прозрачные условия, понятный источник дохода и договор — так выглядит нормальный финансовый сервис.",
  },
  {
    scenario:
      "«Криптостартап» без юрлица и команды на сайте: «застейкай монету — получай 2% в день», а раньше выйти нельзя.",
    isPyramid: true,
    explain:
      "2% в день — это 700%+ в год, анонимная команда и запрет на вывод. Такие проекты исчезают вместе с деньгами (rug pull).",
  },
];

export function PyramidQuiz() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const correct = picked !== null && picked === q.isPyramid;

  function pick(answer: boolean) {
    if (picked !== null) return;
    setPicked(answer);
    if (answer === q.isPyramid) setScore((s) => s + 1);
  }

  function next() {
    setPicked(null);
    setStep((s) => s + 1);
  }

  function restart() {
    setStep(0);
    setPicked(null);
    setScore(0);
  }

  if (done) {
    const perfect = score === QUESTIONS.length;
    return (
      <div className="soft-shadow flex flex-col items-center gap-4 rounded-3xl border border-border bg-bg-card p-10 text-center">
        <div className="aqyl-bob">
          <AqylLive
            className="h-24 w-24"
            mood={perfect ? "excited" : score >= 3 ? "happy" : "sad"}
          />
        </div>
        <p className="font-display text-3xl font-extrabold">
          {perfect ? "🏆 " : score >= 3 ? "🎉 " : "💪 "}
          {score} из {QUESTIONS.length}
        </p>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          {perfect
            ? "Жарайсың! Отличный результат — вас так просто не обмануть. Расскажите близким, что вы узнали: защита работает лучше, когда она общая."
            : score >= 3
              ? "Хорошо! Большинство ловушек вы видите. Пройдите модули выше — и станете настоящим стражем для своей семьи."
              : "Мошенники хитрее, чем кажется. Прочитайте модули выше и попробуйте ещё раз — Aqyl верит в вас!"}
        </p>
        <button
          onClick={restart}
          className="mt-2 rounded-full border border-border-strong px-6 py-2.5 text-sm font-medium text-ink transition hover:border-accent hover:text-accent-bright"
        >
          Пройти ещё раз
        </button>
      </div>
    );
  }

  return (
    <div className="soft-shadow rounded-3xl border border-border/80 bg-bg-card/75 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AqylMark className="h-8 w-8" />
          <span className="font-display font-extrabold text-ink">Пирамида или нет?</span>
        </div>
        <span className="font-mono text-xs uppercase tracked text-ink-faint">
          {step + 1} / {QUESTIONS.length} · счёт {score}
        </span>
      </div>

      <div className="mb-1 flex gap-1.5">
        {QUESTIONS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition ${
              i < step ? "bg-accent" : i === step ? "bg-accent/40" : "bg-border"
            }`}
          />
        ))}
      </div>

      <p className="mt-6 min-h-20 text-base font-medium leading-relaxed text-ink sm:text-lg">{q.scenario}</p>

      {picked === null ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => pick(true)}
            className="flex-1 rounded-2xl border-2 border-danger/25 bg-danger/5 px-5 py-4 text-sm font-semibold text-danger transition hover:border-danger hover:bg-danger/10 cursor-pointer hover:shadow-sm"
          >
            🚨 Пирамида!
          </button>
          <button
            onClick={() => pick(false)}
            className="flex-1 rounded-2xl border-2 border-safe/25 bg-safe/5 px-5 py-4 text-sm font-semibold text-safe transition hover:border-safe hover:bg-safe/10 cursor-pointer hover:shadow-sm"
          >
            ✅ Выглядит честно
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <div
            className={`flex gap-3 rounded-2xl border p-4.5 ${
              correct ? "border-safe/30 bg-safe/5" : "border-danger/30 bg-danger/5"
            }`}
          >
            <AqylMark className="h-9 w-9 shrink-0" mood={correct ? "wink" : "alert"} />
            <div>
              <p className={`text-sm font-bold ${correct ? "text-safe" : "text-danger"}`}>
                {correct ? "😉 Дұрыс! Верно." : "😨 Осторожно, это ловушка!"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{q.explain}</p>
            </div>
          </div>
          <button
            onClick={next}
            className="btn-shine mt-5 w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-bright cursor-pointer"
          >
            {step + 1 === QUESTIONS.length ? "Показать результат" : "Дальше →"}
          </button>
        </div>
      )}
    </div>
  );
}
