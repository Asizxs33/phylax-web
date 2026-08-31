import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { AqylLive } from "@/components/AqylLive";
import { PyramidQuiz } from "@/components/learn/PyramidQuiz";
import { LectureModules } from "@/components/learn/LectureModules";

export const metadata: Metadata = {
  title: "Обучение — SAQ",
  description:
    "Школа финансовой защиты SAQ: модули для взрослых о признаках пирамид и проверке проектов, детский трек с Aqyl и игра «Пирамида или нет?».",
};

const KID_LESSONS = [
  {
    icon: "🌱",
    title: "Деньги не растут в телефоне",
    text: "Почему «вложи 1000 — получи 10 000» не работает, объясняем на примере копилки и волшебных бобов.",
    age: "7+",
  },
  {
    icon: "🎁",
    title: "Секрет «бесплатного» подарка",
    text: "Если игра или сайт дарит деньги «просто так» — чем на самом деле платишь ты? Спойлер: данными и доверием.",
    age: "9+",
  },
  {
    icon: "🤝",
    title: "«Приведи друга» — почему это ловушка",
    text: "Разбираем цепочку: кто в пирамиде получает деньги, а кто остаётся последним. С рисунками и без скучных слов.",
    age: "10+",
  },
  {
    icon: "🕵️",
    title: "Стань стражем, как Aqyl",
    text: "Мини-миссии: найди подозрительные слова в объявлении, проверь «супер-акцию» вместе с родителями.",
    age: "12+",
  },
];

export default function LearnPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          eyebrow="Обучение · Сақ бол!"
          title="Школа финансовой защиты"
          lead="Лучшая защита от пирамиды — та, что сработала до перевода денег. Здесь SAQ учит замечать ловушки: серьёзные модули для взрослых и игровой трек для детей. Знания те же, что использует Aqyl, — только по-человечески."
        />

        {/* ADULT TRACK */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracked text-accent-bright">Трек 01 · для взрослых</span>
                <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                  Шесть модулей против пирамид
                </h2>
              </div>
              <Link
                href="/investigate"
                className="hidden shrink-0 rounded-full border border-border-strong bg-bg-card px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent hover:text-accent-bright sm:inline-block"
              >
                Практика с Aqyl →
              </Link>
            </div>

            <LectureModules />
          </div>
        </section>

        {/* KIDS TRACK */}
        <section className="section-ink relative overflow-hidden px-6 py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background: "radial-gradient(ellipse 60% 60% at 20% 0%, rgba(123,163,245,0.16), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="aqyl-bob shrink-0">
                <AqylLive className="h-24 w-24" mood="excited" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracked text-accent-soft">Трек 02 · для детей</span>
                <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                  SAQ балалар — учимся играя
                </h2>
                <p className="mt-3 max-w-2xl text-white/60">
                  Финансовые ловушки давно добрались до игр, стримов и школьных
                  чатов. Aqyl объясняет детям то же самое, что взрослым, — но
                  через истории и миссии. Отличный материал для классного часа.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {KID_LESSONS.map((l) => (
                <article
                  key={l.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-accent-soft/40 hover:bg-white/8"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{l.icon}</span>
                    <span className="rounded-full bg-accent-soft/15 px-2 py-0.5 font-mono text-[10px] text-accent-soft">
                      {l.age}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-extrabold">{l.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{l.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* QUIZ */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <span className="font-mono text-xs uppercase tracked text-accent-bright">Проверь себя</span>
              <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                Игра: пирамида или нет?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-muted">
                Пять реальных сценариев. Решайте сами — а Aqyl объяснит, где
                пряталась ловушка. Подходит и взрослым, и детям.
              </p>
            </div>
            <PyramidQuiz />
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24">
          <div className="soft-shadow mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-3xl border border-border bg-bg-card px-8 py-12 text-center">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Теория — хорошо. Практика — лучше.
            </h2>
            <p className="max-w-lg text-sm text-ink-muted">
              Встретили «слишком выгодное» предложение? Проверьте его прямо
              сейчас через Aqyl или предупредите других в сообществе.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/investigate"
                className="btn-shine rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-bright"
              >
                Спросить Aqyl →
              </Link>
              <Link
                href="/community"
                className="rounded-full border border-border-strong px-6 py-3 text-sm font-medium text-ink transition hover:border-accent hover:text-accent-bright"
              >
                В сообщество
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
