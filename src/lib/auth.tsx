"use client";

/* Клиентская сторона авторизации: токен в localStorage, состояние
 * пользователя в React-контексте, тонкая обёртка над fetch, которая сама
 * подставляет заголовок и разбирает ошибки бэкенда.
 *
 * Токен держим в localStorage, а не в httpOnly-cookie осознанно: тот же
 * API дергает мобильное приложение, и единый Bearer-заголовок одинаково
 * работает у обоих клиентов. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const TOKEN_KEY = "saq_token";
const API = "/api/backend";

export interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export interface Quota {
  unlimited: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** fetch к бэкенду с автоматическим Bearer-заголовком и понятной ошибкой. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${API}${path}`, { ...init, headers });
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.detail ?? payload.error ?? `Ошибка ${res.status}`);
  }
  return payload as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    setToken(t);
    try {
      const me = await apiJson<User>("/auth/me");
      setUser(me);
    } catch {
      // токен протух или сервер его не принял — чистим, чтобы интерфейс
      // не притворялся, что пользователь всё ещё вошёл
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const authenticate = useCallback(async (path: string, email: string, password: string) => {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.detail ?? payload.error ?? `Ошибка ${res.status}`);
    localStorage.setItem(TOKEN_KEY, payload.access_token);
    setToken(payload.access_token);
    setUser(payload.user);
  }, []);

  const login = useCallback(
    (email: string, password: string) => authenticate("/auth/login", email, password),
    [authenticate]
  );
  const register = useCallback(
    (email: string, password: string) => authenticate("/auth/register", email, password),
    [authenticate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refresh }),
    [user, token, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен вызываться внутри <AuthProvider>");
  return ctx;
}

export const isAdmin = (user: User | null) => user?.role === "admin";
