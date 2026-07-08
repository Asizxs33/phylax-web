"use client";

import { useState, type FormEvent } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { PhylaxMark } from "@/components/PhylaxMark";

export default function ReportPage() {
  const [target, setTarget] = useState("");
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!target.trim() || !note.trim()) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), note: note.trim(), contact: contact.trim() || null }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Не удалось отправить");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setStatus("error");
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1">
        <PageHeader
          index="07"
          eyebrow="Наводка"
          title="Сообщить о подозрении"
          lead="Видели подозрительный проект — присылайте. Наводка попадает на модерацию и, после проверки, пополняет общий реестр Phylax, помогая следующему человеку, который наткнётся на тот же домен или канал."
        />

        <section className="px-6 py-16">
          <div className="mx-auto max-w-xl">
            {status === "done" ? (
              <div className="stamped-accent flex flex-col items-center gap-4 rounded-lg border border-border bg-bg-card p-10 text-center">
                <PhylaxMark className="h-10 w-10" glow />
                <p className="font-display text-xl">Спасибо, наводка принята</p>
                <p className="text-sm text-ink-muted">
                  Мы рассмотрим её и, если подтвердится, объект появится в{" "}
                  <a href="/watchlist" className="text-accent-bright underline underline-offset-2">
                    Watchlist
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="card-label !mb-2 block">Объект (домен / кошелёк / @канал / название)</label>
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="например, easy-profit.example или @quick_x10"
                    className="input-underline w-full px-1 py-2.5 text-sm placeholder:text-ink-faint"
                    required
                  />
                </div>
                <div>
                  <label className="card-label !mb-2 block">Почему это похоже на пирамиду</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    placeholder="Что видели: обещания доходности, реферальная схема, задержки выплат…"
                    className="input-underline w-full resize-none px-1 py-2.5 text-sm placeholder:text-ink-faint"
                    required
                  />
                </div>
                <div>
                  <label className="card-label !mb-2 block">Контакт (необязательно)</label>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="email или telegram, если готовы уточнить детали"
                    className="input-underline w-full px-1 py-2.5 text-sm placeholder:text-ink-faint"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending" || !target.trim() || !note.trim()}
                  className="btn-shine stamped self-start rounded-full bg-accent px-7 py-3.5 font-mono text-sm uppercase tracked text-bg transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === "sending" ? "Отправляю…" : "Отправить наводку"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
