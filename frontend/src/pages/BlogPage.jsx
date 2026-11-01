import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Rss } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { API_BASE, CAPABILITIES } from "@/config/site";
import { PageHero, ComingSoon } from "@/components/site/PageHero";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
export const imgUrl = (u) => (u ? `${BACKEND}${u}` : null);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "");

export const PostCard = ({ p, featured = false }) => (
  <article className={`post-card ${featured ? "post-card--featured" : ""} reveal`} data-testid={`blog-post-card-${p.slug}`}>
    <div className="post-card__media">
      {p.cover_url ? <img src={imgUrl(p.cover_url)} alt={p.cover_alt || ""} loading={featured ? "eager" : "lazy"} decoding="async" width="1600" height="900" /> : <div className="post-card__ph" aria-hidden="true" />}
      <span className="tag">{p.category}</span>
    </div>
    <div className="post-card__body">
      <p className="post-card__meta"><time dateTime={p.published_at}>{fmtDate(p.published_at)}</time> · <Clock aria-hidden="true" /> {p.reading_minutes} min read</p>
      <h2 className="post-card__title"><Link to={`/blog/${p.slug}`} className="stretched-link" data-testid={`blog-post-link-${p.slug}`}>{p.title}</Link></h2>
      <p className="post-card__excerpt">{p.excerpt || p.meta_description}</p>
      <span className="text-link post-card__more">Read article <ArrowRight aria-hidden="true" /></span>
    </div>
  </article>
);

export default function BlogPage() {
  useSeo({ title: "Blog", description: "Practical insights from 210Codelabs on AI engineering, cloud-native systems, SaaS platforms and emerging technology." });
  const [data, setData] = useState(null);
  const [cat, setCat] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
    fetch(`${API_BASE}/blog/posts?page_size=30${cat ? `&category=${encodeURIComponent(cat)}` : ""}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, [cat]);
  const items = data ? data.items : [];
  const [first, ...rest] = items;
  return (
    <div data-testid="blog-page">
      <PageHero eyebrow="BLOG" title="Insights on what’s next" lead="Practical guides on AI engineering, cloud-native systems, SaaS platforms and emerging technology — new articles every morning." crumbs={[{ label: "Blog" }]}>
        <div className="chip-nav" role="group" aria-label="Filter by category">
          <button type="button" className={`chip ${!cat ? "is-active" : ""}`} aria-pressed={!cat} onClick={() => setCat("")} data-testid="blog-filter-all">All</button>
          {(data?.categories || []).map((c) => (
            <button key={c} type="button" className={`chip ${cat === c ? "is-active" : ""}`} aria-pressed={cat === c} onClick={() => setCat(c)} data-testid={`blog-filter-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{c}</button>
          ))}
          <a href={`${API_BASE}/blog/rss.xml`} className="chip" data-testid="blog-rss-link"><Rss aria-hidden="true" style={{ width: 14, height: 14, marginRight: 6 }} /> RSS</a>
        </div>
      </PageHero>
      <section className="section">
        <div className="container">
          {error && <p className="form-status form-status--error" role="alert">We couldn’t load articles right now. Please try again shortly.</p>}
          {!data && !error && <div className="blog-grid" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="post-skeleton" />)}</div>}
          {data && items.length === 0 && (
            <ComingSoon title="No articles published yet" testId="blog-empty-state"><p>New articles are published every morning. Explore our <Link to="/capabilities">capabilities</Link> in the meantime.</p></ComingSoon>
          )}
          {first && <PostCard p={first} featured />}
          {rest.length > 0 && <div className="blog-grid">{rest.map((p) => <PostCard key={p.id} p={p} />)}</div>}
          <div className="topic-list reveal" style={{ marginTop: 40 }}>
            <h2 className="eyebrow">TOPICS WE WRITE ABOUT</h2>
            <ul>{CAPABILITIES.map((c) => <li key={c.slug}><Link to={`/capabilities#${c.slug}`} className="chip">{c.title}</Link></li>)}</ul>
          </div>
        </div>
      </section>
    </div>
  );
}
