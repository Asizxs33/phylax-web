"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { AqylMark } from "@/components/SaqMark";
import { useAuth } from "@/lib/auth";

function LoginForm() {
  const { login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить вход");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <AqylMark className="h-14 w-14" mood="happy" />
        <div>
          <h1 className="font-display text-2xl font-extrabold">
            {mode === "login" ? "Вход в SAQ" : "Регистрация"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {mode === "login"
              ? "Aqyl работает только для зарегистрированных — так мы держим нагрузку на источники под контролем."
              : "Бесплатно. После регистрации доступно 20 обращений к Aqyl в сутки."}
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-card/70 p-6 backdrop-blur-sm"
      >
        <div>
          <label className="card-label !mb-2 block">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-bg-elevated/40 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:bg-bg-card focus:ring-3 focus:ring-accent/10"
          />
        </div>
        <div>
          <label className="card-label !mb-2 block">Пароль</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="минимум 8 символов"
            className="w-full rounded-xl border border-border bg-bg-elevated/40 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:bg-bg-card focus:ring-3 focus:ring-accent/10"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-shine rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Секунду…" : mode === "login" ? "Войти" : "Создать аккаунт"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="text-center text-xs text-ink-muted transition hover:text-accent-bright"
        >
          {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Реестр, обучение и сообщество{" "}
        <Link href="/watchlist" className="text-accent-bright underline underline-offset-2">
          доступны без входа
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <NavBar />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <Suspense fallback={<div className="font-mono text-xs text-ink-faint">загрузка…</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
