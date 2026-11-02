import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { CAPABILITIES } from "@/config/site";
import { SOLUTIONS, TRACKS } from "@/config/solutions";
import { PageHero } from "@/components/site/PageHero";
import { BrowserFrame } from "@/components/solutions/SolutionCard";
import { CapIcon } from "@/components/site/Primitives";
import NotFoundPage from "@/pages/NotFoundPage";

export default function SolutionDetailPage() {
  const { slug } = useParams();
  const s = SOLUTIONS.find((x) => x.slug === slug && !x.pending);
  useSeo(s ? { title: `${s.name} — ${s.category}`, description: s.summary } : { title: "Not found", noindex: true });
  if (!s) return <NotFoundPage />;
  const track = TRACKS.find((t) => t.id === s.track);
  const live = SOLUTIONS.filter((x) => !x.pending);
  const idx = live.findIndex((x) => x.slug === s.slug);
  const prev = live[(idx - 1 + live.length) % live.length];
  const next = live[(idx + 1) % live.length];
  const siblings = SOLUTIONS.filter((x) => x.track === s.track && x.slug !== s.slug);

  return (
    <div data-testid="solution-detail-page">
      <PageHero
        eyebrow={`TRACK ${track.n} · ${track.title.toUpperCase()}`}
        title={s.name}
        lead={s.tagline}
        crumbs={[{ label: "Our Work", to: "/work" }, { label: "Solutions", to: "/work#solutions" }, { label: s.name }]}
        testId="solution-detail-hero"
      >
        <div className="page-hero__ctas">
          {s.url && (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-pill" data-testid="solution-visit-button">
              Visit {s.name} <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <Link to="/contact" className="btn btn-secondary btn-pill" data-testid="solution-contact-button">Build something similar</Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container sol-detail">
          <div className="sol-detail__media reveal"><BrowserFrame s={s} sizes="(max-width: 1023px) 100vw, 720px" eager /></div>
          <div className="sol-detail__body">
            <p className="sol-card__category">{s.category}</p>
            <p className="sol-detail__summary">{s.summary}</p>
            <span className="status"><i aria-hidden="true" />{s.status}</span>

            <h2 className="leader__subtitle">What it does</h2>
            <ul className="check-list" data-testid="solution-highlights">
              {s.highlights.map((h) => <li key={h}><Check aria-hidden="true" />{h}</li>)}
            </ul>

            <h2 className="leader__subtitle">Capabilities it demonstrates</h2>
            <ul className="sol-detail__caps">
              {s.capabilities.map((c) => {
                const cap = CAPABILITIES.find((k) => k.slug === c);
                return (
                  <li key={c}>
                    <Link to={`/capabilities#${c}`} className="sol-detail__cap" data-testid={`solution-capability-${c}-link`}>
                      <span className="sol-detail__cap-icon"><CapIcon name={cap.icon} /></span>
                      <span><strong>{cap.title}</strong><small>{cap.text}</small></span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {siblings.length > 0 && (
              <p className="sol-detail__siblings">
                Also in {track.title}:{" "}
                {siblings.map((x, i) => (
                  <React.Fragment key={x.slug}>
                    {i > 0 && ", "}
                    {x.pending ? <span>{x.name}</span> : <Link to={`/solutions/${x.slug}`}>{x.name}</Link>}
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
        </div>

        <nav className="container case-pager" aria-label="More solutions">
          <Link to={`/solutions/${prev.slug}`} className="case-pager__link" data-testid="solution-prev-link">
            <ArrowLeft aria-hidden="true" /><span><small>Previous</small>{prev.name}</span>
          </Link>
          <Link to={`/solutions/${next.slug}`} className="case-pager__link case-pager__link--next" data-testid="solution-next-link">
            <span><small>Next</small>{next.name}</span><ArrowRight aria-hidden="true" />
          </Link>
        </nav>
      </section>
    </div>
  );
}
