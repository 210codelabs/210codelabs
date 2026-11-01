import { useCallback } from "react";
import { useAuth } from "@clerk/react";

const BASE = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

export function useAdminApi() {
  const { getToken } = useAuth();
  return useCallback(async (path, { method = "GET", body, signal } = {}) => {
    const token = await getToken();
    const res = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch { /* empty */ }
    if (!res.ok) {
      const err = new Error((data && (data.detail || data.message)) || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }, [getToken]);
}
