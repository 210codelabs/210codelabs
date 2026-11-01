import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminCompaniesPage() {
  const api = useAdminApi();
  const [data, setData] = useState({ items: [] });
  const [q, setQ] = useState("");
  const load = () => api(`/admin/crm/companies?q=${encodeURIComponent(q)}`).then(setData);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  return (
    <div data-testid="admin-companies">
      <form role="search" className="admin__search" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <SearchIcon aria-hidden="true" />
        <input type="search" placeholder="Search by name or domain" value={q} onChange={(e) => setQ(e.target.value)} data-testid="companies-search" />
      </form>
      <section className="panel">
        <table className="atable" data-testid="companies-table">
          <thead><tr><th>Name</th><th>Domain</th><th>Industry</th><th>Contacts</th></tr></thead>
          <tbody>
            {data.items.length === 0 && <tr><td colSpan={4} className="muted">No companies yet.</td></tr>}
            {data.items.map((c) => (
              <tr key={c.id} data-testid="company-row"><td><Link to={`/admin/companies/${c.id}`} className="text-link">{c.name}</Link></td><td>{c.domain || "—"}</td><td>{c.industry || "—"}</td><td>{(c.contact_ids || []).length}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
