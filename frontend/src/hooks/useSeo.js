import { useEffect } from "react";
import { SITE } from "@/config/site";

/**
 * SEO + Open Graph + Twitter + canonical for the current route.
 *
 * We mutate <head> on route changes so the SPA still produces unique,
 * crawler-friendly per-page metadata. Server-side rendering is not required
 * because Google now renders JS; the tags below cover search snippets, social
 * share previews, and canonical/robots directives.
 */

const DEFAULT_OG_IMAGE = "/assets/og-image.jpg";

function setMeta(selector, attr, value) {
  if (value == null) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const m = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (m) el.setAttribute(m[1], m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function absoluteUrl(path) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === "undefined") return path;
  try {
    return new URL(path, window.location.origin).toString();
  } catch {
    return path;
  }
}

function canonicalOfCurrent() {
  if (typeof window === "undefined") return undefined;
  // Strip hash + query so canonical reflects the canonical content URL.
  const u = new URL(window.location.href);
  u.hash = "";
  u.search = "";
  return u.toString();
}

export function useSeo({
  title,
  titleSuffix = SITE.name,
  description,
  noindex = false,
  image,
  type, // "article" for blog posts, otherwise defaults to "website"
  canonical, // override canonical when needed; default is current path
} = {}) {
  useEffect(() => {
    const t = title ? `${title}${titleSuffix ? ` | ${titleSuffix}` : ""}` : SITE.title;
    const d = description || SITE.description;
    const ogType = type || "website";
    const img = absoluteUrl(image || DEFAULT_OG_IMAGE);
    const url = canonical ? absoluteUrl(canonical) : canonicalOfCurrent();

    document.title = t;
    setMeta('meta[name="description"]', "content", d);
    setMeta('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta('meta[property="og:type"]', "content", ogType);
    setMeta('meta[property="og:site_name"]', "content", SITE.name);
    setMeta('meta[property="og:title"]', "content", t);
    setMeta('meta[property="og:description"]', "content", d);
    if (url) setMeta('meta[property="og:url"]', "content", url);
    if (img) setMeta('meta[property="og:image"]', "content", img);

    // Twitter cards
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", t);
    setMeta('meta[name="twitter:description"]', "content", d);
    if (img) setMeta('meta[name="twitter:image"]', "content", img);

    // Canonical: only emit for indexable pages
    if (!noindex && url) {
      setLink("canonical", url);
    } else {
      const existing = document.head.querySelector('link[rel="canonical"]');
      if (existing && noindex) existing.remove();
    }
  }, [title, titleSuffix, description, noindex, image, type, canonical]);
}

/**
 * Mounts a <script type="application/ld+json"> block in <head> and
 * removes it on unmount. Pass a stable id and a plain object (or null to skip).
 */
export function useJsonLd(id, data) {
  useEffect(() => {
    if (!data || !id) return undefined;
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    el.text = JSON.stringify(data);
    document.head.appendChild(el);
    return () => {
      const node = document.getElementById(id);
      if (node) node.remove();
    };
  }, [id, data]);
}
