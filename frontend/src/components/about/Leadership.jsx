import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck, BookOpen, GraduationCap, MapPin, ShieldCheck } from "lucide-react";
import { CREDENTIALS_META } from "@/config/credentials";
import { LEADER } from "@/config/company";
import { API_BASE } from "@/config/site";
import { SocialLinks } from "@/components/site/SocialLinks";

const fmtDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric" });

/** Verified-degree badges marked "Show on About page" in the admin OpenBadges section. */
function FounderCredentials() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE}/badges/featured`).then((r) => (r.ok ? r.json() : { items: [] })).then((d) => setItems(d.items || [])).catch(() => setItems([]));
  }, []);
  if (items !== null && items.length === 0) return null; // nothing featured: hide the card entirely
  return (
    <div className="founder-creds" data-testid="founder-credentials">
      <div className="founder-creds__head">
        <h3 className="leader-extra__title"><ShieldCheck aria-hidden="true" /> Verified academic credentials</h3>
        <p className="muted">Degree equivalencies by USCES, LLC and university records, reviewed by 210Codelabs. Open any badge to see what was verified.</p>
      </div>
      <ul className="founder-creds__grid">
        {items === null && [0, 1, 2].map((i) => <li key={i} className="founder-creds__item founder-creds__item--skeleton" aria-hidden="true" />)}
        {items && items.map((b) => (
          <li key={b.id}>
            <Link to={`/credentials/${b.id}`} className="founder-creds__item" data-testid={`founder-credential-${b.slug}`}>
              <img src={`${API_BASE}${b.paths.image}`} alt="" width="120" height="120" loading="lazy" />
              <span className="founder-creds__name">{b.short}</span>
              <span className="founder-creds__link">View verification <ArrowUpRight aria-hidden="true" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Leadership = () => (
  <section id="leadership" className="section leadership" aria-labelledby="leadership-title" data-testid="leadership-section">
    <div className="container">
      <div className="section-head reveal">
        <p className="eyebrow">LEADERSHIP</p>
        <h2 id="leadership-title" className="section-title section-title--lg">The engineering mind behind 210Codelabs</h2>
      </div>

      <article className="leader" data-testid="leader-card">
        <figure className="leader__media reveal">
          <img
            src={LEADER.photo.src}
            srcSet={LEADER.photo.srcSet}
            sizes="(max-width: 767px) 100vw, 420px"
            alt={LEADER.photo.alt}
            width="800"
            height="800"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="leader__badge">
            <span className="leader__badge-name">{LEADER.name}</span>
            <span className="leader__badge-role">{LEADER.role}</span>
          </figcaption>
        </figure>

        <div className="leader__body reveal">
          <h3 className="leader__name" data-testid="leader-name">{LEADER.name}</h3>
          <p className="leader__role">{LEADER.role} · 210Codelabs Corporation</p>
          <p className="leader__headline">{LEADER.headline}</p>

          <ul className="leader__meta">
            <li><MapPin aria-hidden="true" /> San Antonio, Texas</li>
            <li><GraduationCap aria-hidden="true" /> {LEADER.education}</li>
            <li><BadgeCheck aria-hidden="true" /> <a href="#openai-credentials" data-testid="leader-credentials-link">{CREDENTIALS_META.count} OpenAI professional certifications</a></li>
          </ul>

          {LEADER.bio.map((p) => <p key={p.slice(0, 24)} className="leader__bio">{p}</p>)}

          <h4 className="leader__subtitle">Leadership roles</h4>
          <ul className="leader__roles" data-testid="leader-roles">
            {LEADER.roles.map((r) => (
              <li key={r.org}>
                <span className="leader__roles-org">{r.org}</span>
                <span className="leader__roles-title">{r.title}</span>
              </li>
            ))}
          </ul>

          <h4 className="leader__subtitle">Areas of focus</h4>
          <ul className="leader__focus">
            {LEADER.focus.map((f) => <li key={f} className="chip chip--static">{f}</li>)}
          </ul>

          <div className="leader__social">
            <span className="leader__social-label">Connect with Ernesto</span>
            <SocialLinks items={LEADER.social} testPrefix="leader-social" label="Ernesto Couso on social media" />
          </div>
        </div>
      </article>

      <div className="leader-extra">
        <div className="leader-extra__col reveal">
          <h3 className="leader-extra__title"><BookOpen aria-hidden="true" /> Books & publications</h3>
          <ul className="pub-list">
            {LEADER.publications.map((p) => (
              <li key={p.title}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="pub" data-testid="leader-publication-link">
                  <span className="pub__type">{p.type}</span>
                  <span className="pub__title">{p.title}<ArrowUpRight aria-hidden="true" /></span>
                  <span className="pub__text">{p.text}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="leader-extra__col reveal">
          <h3 className="leader-extra__title">Recent articles on LinkedIn</h3>
          <ul className="article-list">
            {LEADER.articles.map((a) => (
              <li key={a.url}>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="article-link" data-testid="leader-article-link">
                  <time dateTime={a.date}>{fmtDate(a.date)}</time>
                  <span>{a.title}</span>
                  <ArrowUpRight aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <FounderCredentials />
    </div>
  </section>
);
