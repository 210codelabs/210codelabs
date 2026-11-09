import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ExternalLink, Loader2, Radar, Search, ShieldAlert } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

const formatDate = (value) => value
  ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  : "Date unavailable";

export default function AdminLeadHunterPage() {
  const api = useAdminApi();
  const [leads, setLeads] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [form, setForm] = useState({ company_name: "", domain: "", prompt_notes: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(async () => {
    const [leadData, reportData] = await Promise.all([
      api("/admin/crm/leads?view=list"),
      api("/admin/crm/research"),
    ]);
    setLeads(leadData.items || []);
    setReports(reportData.items || []);
  }, [api]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api("/admin/crm/leads?view=list"),
      api("/admin/crm/research"),
    ]).then(([leadData, reportData]) => {
      if (!active) return;
      setLeads(leadData.items || []);
      setReports(reportData.items || []);
    }).catch((e) => {
      if (active) setError(e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [api]);

  useEffect(() => {
    if (!selectedReport || selectedReport.status !== "running") return undefined;
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const report = await api(`/admin/crm/research/${selectedReport.id}`);
        if (!active) return;
        setSelectedReport(report);
        await loadWorkspace();
      } catch (e) {
        if (active) setError(e.message);
      }
    }, 2500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [api, loadWorkspace, selectedReport]);

  const startResearch = async (event) => {
    event.preventDefault();
    setError("");
    const companyName = form.company_name.trim();
    const domain = form.domain.trim();
    if (!companyName && !domain) {
      setError("Enter a company name or website to start research.");
      return;
    }
    setSubmitting(true);
    try {
      const { id } = await api("/admin/crm/research", {
        method: "POST",
        body: { ...form, company_name: companyName, domain },
      });
      setForm({ company_name: "", domain: "", prompt_notes: "" });
      setSelectedReport({ id, company_name: companyName, domain, status: "running", step: "Starting research" });
      await loadWorkspace();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="leadhunter" data-testid="admin-leadhunter">
      <header className="leadhunter__header">
        <div>
          <p className="eyebrow">CRM INTELLIGENCE</p>
          <h1>LeadHunter AI</h1>
          <p className="muted">Research companies and review the leads already in your CRM.</p>
        </div>
        <Link className="btn btn-secondary btn-sm" to="/admin/leads">
          <ArrowUpRight aria-hidden="true" /> Open CRM pipeline
        </Link>
      </header>

      <div className="leadhunter__notice" role="note">
        <ShieldAlert aria-hidden="true" />
        <p><strong>Research is not buying-intent verification.</strong> This workspace researches a company you provide using the existing public-page research service. Multi-source opportunity discovery, contact enrichment, and outbound outreach are not configured here. Reports must not be treated as verified purchase signals.</p>
      </div>

      {error && <p className="form-status form-status--error" role="alert">{error}</p>}

      <div className="leadhunter__grid">
        <section className="panel" aria-labelledby="leadhunter-search-title">
          <header className="panel__head">
            <h3 id="leadhunter-search-title"><Radar aria-hidden="true" /> Research a company</h3>
          </header>
          <p className="muted">Review publicly accessible company pages and generate a sourced research brief. This does not search for companies with active buying intent.</p>
          <form onSubmit={startResearch}>
            <div className="field">
              <label htmlFor="leadhunter-company">Company name</label>
              <input id="leadhunter-company" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} maxLength={160} />
            </div>
            <div className="field">
              <label htmlFor="leadhunter-domain">Company website</label>
              <input id="leadhunter-domain" placeholder="example.com" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} maxLength={200} />
            </div>
            <div className="field">
              <label htmlFor="leadhunter-notes">Research questions <span className="muted">(optional)</span></label>
              <textarea id="leadhunter-notes" rows={4} maxLength={4000} placeholder="What should the research focus on?" value={form.prompt_notes} onChange={(e) => setForm({ ...form, prompt_notes: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting} data-testid="leadhunter-research-submit">
              {submitting ? <Loader2 className="spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
              {submitting ? "Starting research…" : "Start company research"}
            </button>
          </form>
        </section>

        <section className="panel" aria-labelledby="leadhunter-reports-title">
          <header className="panel__head">
            <h3 id="leadhunter-reports-title">Research activity</h3>
            <span className="tag tag--soft">{reports.length} reports</span>
          </header>
          {loading ? <p className="muted">Loading saved reports…</p> : reports.length === 0 ? (
            <p className="muted">No company research reports yet.</p>
          ) : (
            <ul className="leadhunter__reports">
              {reports.map((report) => (
                <li key={report.id}>
                  <button type="button" className="leadhunter__report" onClick={() => setSelectedReport(report)}>
                    <span><strong>{report.company_name || report.domain || "Company research"}</strong><small>{formatDate(report.created_at)}</small></span>
                    <span className="tag tag--soft">{report.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedReport && (
            <article className="leadhunter__detail" aria-live="polite">
              <div className="panel__head">
                <h4>{selectedReport.company_name || selectedReport.domain || "Company research"}</h4>
                {selectedReport.status === "running" && <Loader2 className="spin" aria-label="Research in progress" />}
              </div>
              {selectedReport.status === "running" && <p className="muted">{selectedReport.step || "Research is running…"}</p>}
              {selectedReport.status === "error" && <p className="form-status form-status--error" role="alert">{selectedReport.error || "Research failed."}</p>}
              {selectedReport.status === "done" && <>
                {selectedReport.summary && <p>{selectedReport.summary}</p>}
                {selectedReport.brief && <pre className="research-brief">{selectedReport.brief}</pre>}
                <p className="muted">Sources fetched during research; retrieval time is not the source publication date.</p>
                {selectedReport.sources?.length ? <ul className="panel__list">{selectedReport.sources.map((source) => (
                  <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.url} <ExternalLink aria-hidden="true" /></a> <span className="muted">Fetched {formatDate(source.fetched_at)}</span></li>
                ))}</ul> : <p className="muted">No public pages were retrieved for this report.</p>}
              </>}
            </article>
          )}
        </section>
      </div>

      <section className="panel" aria-labelledby="leadhunter-leads-title">
        <header className="panel__head">
          <h3 id="leadhunter-leads-title">Existing CRM leads</h3>
          <Link className="text-link" to="/admin/leads">View pipeline <ArrowUpRight aria-hidden="true" /></Link>
        </header>
        {loading ? <p className="muted">Loading CRM leads…</p> : leads.length === 0 ? (
          <p className="muted">There are no leads in the CRM yet. No prospect records have been generated by this module.</p>
        ) : (
          <div className="leadhunter__table-wrap">
            <table className="atable">
              <thead><tr><th>Contact</th><th>Company / service</th><th>Stage</th><th>CRM score</th><th>Updated</th></tr></thead>
              <tbody>{leads.slice(0, 12).map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.contact_name || lead.contact_email || "Contact unavailable"}</td>
                  <td>{lead.contact_company || lead.service || "Not specified"}</td>
                  <td><span className="tag tag--soft">{lead.stage || "new"}</span></td>
                  <td>{lead.score ?? "—"}</td>
                  <td>{formatDate(lead.updated_at || lead.created_at)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}