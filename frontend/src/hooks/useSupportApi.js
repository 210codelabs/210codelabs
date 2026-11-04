import { useCallback, useEffect, useState } from "react";

const BASE = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
const TOKEN_KEY = "210_support_token";
const USER_KEY = "210_support_user";

export function getSupportSession() {
  if (typeof window === "undefined") return { token: "", user: null };
  try {
    return {
      token: window.localStorage.getItem(TOKEN_KEY) || "",
      user: JSON.parse(window.localStorage.getItem(USER_KEY) || "null"),
    };
  } catch {
    return { token: "", user: null };
  }
}

export function setSupportSession(token, user) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function useSupportApi() {
  return useCallback(async (path, { method = "GET", body } = {}) => {
    const { token } = getSupportSession();
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch { /* empty */ }
    if (!res.ok) {
      const detail = data && (data.detail || data.message);
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join("; ")
        : detail;
      const err = new Error(msg || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }, []);
}

export function useSupportAuth() {
  const [session, setSession] = useState(() => getSupportSession());
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) setSession(getSupportSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const signIn = useCallback((token, user) => {
    setSupportSession(token, user);
    setSession({ token, user });
  }, []);
  const signOut = useCallback(() => {
    setSupportSession("", null);
    setSession({ token: "", user: null });
  }, []);
  return { ...session, signIn, signOut };
}
