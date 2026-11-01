import React from "react";
import { ArrowUpRight, BookOpen, GraduationCap, MapPin } from "lucide-react";
import { LEADER } from "@/config/company";
import { SocialLinks } from "@/components/site/SocialLinks";

const fmtDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric" });

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
    </div>
  </section>
);
