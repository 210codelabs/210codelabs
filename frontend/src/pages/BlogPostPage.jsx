import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { useJsonLd, useSeo } from "@/hooks/useSeo";
import { API_BASE, SITE } from "@/config/site";
import { PageHero } from "@/components/site/PageHero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NotFoundPage from "@/pages/NotFoundPage";
import { PostCard, fmtDate, imgUrl } from "@/pages/BlogPage";

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const bodyRef = useRef(null);

  useEffect(() => {
    setStatus("loading");
    fetch(`${API_BASE}/blog/posts/${encodeURIComponent(slug)}`)
      .then((r) => (r.status === 404 ? Promise.reject(404) : r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { setPost(d); setStatus("ok"); })
      .catch((e) => setStatus(e === 404 ? "missing" : "error"));
  }, [slug]);

  useSeo(post ? {
    title: post.meta_title || post.title,
    description: post.meta_description,
    image: post.cover_url ? imgUrl(post.cover_url) : undefined,
    type: "article",
  } : { title: "Blog" });

  const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
  const ld = post && {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting", headline: post.title, description: post.meta_description, datePublished: post.published_at, dateModified: post.updated_at,
        image: post.cover_url ? imgUrl(post.cover_url) : undefined, keywords: [post.keyword, ...(post.tags || [])].join(", "), mainEntityOfPage: url,
        author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name },
      },
      ...(post.faq?.length ? [{ "@type": "FAQPage", mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Blog", item: url.replace(/\/blog\/.*$/, "/blog") }, { "@type": "ListItem", position: 2, name: post.title, item: url }] },
    ],
  };
  useJsonLd("post-jsonld", ld);

  // Route internal links inside the article through the SPA router
  const onBodyClick = (e) => {
    const a = e.target.closest("a");
    if (a && a.getAttribute("href")?.startsWith("/")) {
      e.preventDefault();
      navigate(a.getAttribute("href"));
    }
  };

  if (status === "missing") return <NotFoundPage />;
  if (status !== "ok") {
    return (
      <div className="container section" data-testid="blog-post-loading">
        {status === "error" ? <p className="form-status form-status--error" role="alert">We couldn’t load this article. Please try again shortly.</p> : <div className="post-skeleton post-skeleton--tall" aria-busy="true" />}
      </div>
    );
  }

  return (
    <article data-testid="blog-post-page">
      <PageHero eyebrow={post.category.toUpperCase()} title={post.title} lead={post.excerpt} crumbs={[{ label: "Blog", to: "/blog" }, { label: post.title }]} testId="blog-post-hero">
        <p className="post-meta"><span>{post.author}</span> · <time dateTime={post.published_at}>{fmtDate(post.published_at)}</time> · <Clock aria-hidden="true" /> {post.reading_minutes} min read</p>
      </PageHero>
      <div className="container post-layout section">
        <div className="post-main">
          {post.cover_url && <img className="post-cover" src={imgUrl(post.cover_url)} alt={post.cover_alt} width="1600" height="900" decoding="async" data-testid="blog-post-cover" />}
          {post.key_takeaways?.length > 0 && (
            <aside className="takeaways" aria-labelledby="takeaways-title" data-testid="blog-post-takeaways">
              <h2 id="takeaways-title"><Sparkles aria-hidden="true" /> Key takeaways</h2>
              <ul>{post.key_takeaways.map((t) => <li key={t}>{t}</li>)}</ul>
            </aside>
          )}
          {/* body_html is rendered server-side from Markdown with raw HTML disabled */}
          <div ref={bodyRef} className="prose" onClick={onBodyClick} dangerouslySetInnerHTML={{ __html: post.body_html }} data-testid="blog-post-body" />
          {post.faq?.length > 0 && (
            <section className="post-faq" aria-labelledby="faq-title" data-testid="blog-post-faq">
              <h2 id="faq-title">Frequently asked questions</h2>
              <Accordion type="multiple" className="faq-acc">
                {post.faq.map((f, i) => (
                  <AccordionItem key={f.q} value={`q${i}`}>
                    <AccordionTrigger data-testid={`blog-faq-trigger-${i}`}>{f.q}</AccordionTrigger>
                    <AccordionContent>{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}
        </div>
        <aside className="post-side" aria-label="Article details">
          <div className="post-side__card">
            <p className="eyebrow">TOPICS</p>
            <ul className="post-tags">{(post.tags || []).map((t) => <li key={t} className="chip chip--sm chip--static">{t}</li>)}</ul>
          </div>
          <div className="post-side__card post-side__cta">
            <p className="post-side__cta-title">Bring your ambition. We bring the engineering.</p>
            <Link to="/contact" className="btn btn-primary btn-pill btn-sm" data-testid="blog-post-contact-button">Start a Conversation <ArrowRight aria-hidden="true" /></Link>
          </div>
        </aside>
      </div>
      {post.related?.length > 0 && (
        <section className="section section--ice" aria-labelledby="related-title">
          <div className="container">
            <h2 id="related-title" className="section-title" style={{ marginBottom: 20 }}>More from the blog</h2>
            <div className="blog-grid">{post.related.map((p) => <PostCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}
    </article>
  );
}
