import { useEffect } from "react";
import { SITE } from "@/config/site";

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, key, name] = selector.match(/\[(name|property)="([^"]+)"\]/) || [];
    if (key) el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export function useSeo({ title, description, noindex = false } = {}) {
  useEffect(() => {
    const t = title ? `${title} | ${SITE.name}` : SITE.title;
    const d = description || SITE.description;
    document.title = t;
    setMeta('meta[name="description"]', "content", d);
    setMeta('meta[property="og:title"]', "content", t);
    setMeta('meta[property="og:description"]', "content", d);
    setMeta('meta[property="og:url"]', "content", window.location.href);
    setMeta('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");
  }, [title, description, noindex]);
}
