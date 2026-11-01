// Lead attribution helpers — captures UTM parameters and source page.
// Lightweight cookie keeps the first-touch landing for 90 days.
const COOKIE = "c210_attr";
const UTMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

function readCookie(name) {
  const row = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  if (!row) return null;
  try { return JSON.parse(decodeURIComponent(row.split("=")[1])); } catch { return null; }
}

function writeCookie(name, value) {
  const v = encodeURIComponent(JSON.stringify(value));
  const d = new Date(); d.setDate(d.getDate() + 90);
  document.cookie = `${name}=${v}; expires=${d.toUTCString()}; path=/; samesite=lax`;
}

/** Call once per page load (e.g. from Layout). */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const utm = {};
  UTMS.forEach((k) => { const v = url.searchParams.get(k); if (v) utm[k] = v; });
  const existing = readCookie(COOKIE) || {};
  const next = {
    landing_page: existing.landing_page || url.pathname + url.search,
    first_referrer: existing.first_referrer ?? (document.referrer || null),
    utm: Object.keys(utm).length ? utm : (existing.utm || null),
    first_seen_at: existing.first_seen_at || new Date().toISOString(),
  };
  writeCookie(COOKIE, next);
}

/** Snapshot of the current attribution context for form submissions. */
export function attributionPayload() {
  const stored = readCookie(COOKIE) || {};
  return {
    source_page: typeof window !== "undefined" ? window.location.pathname + window.location.search : null,
    landing_page: stored.landing_page || null,
    referrer: stored.first_referrer || (typeof document !== "undefined" ? document.referrer || null : null),
    utm: stored.utm || null,
  };
}
