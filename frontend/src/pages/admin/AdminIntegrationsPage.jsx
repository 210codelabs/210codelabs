import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminIntegrationsPage() {
  const api = useAdminApi();
  const [data, setData] = useState(null);
  useEffect(() => { api("/admin/crm/integrations").then(setData); }, [api]);
  if (!data) return <p>Loading…</p>;
  const row = (key, label) => (
    <li key={key}>
      {data[key].connected ? <CheckCircle2 aria-hidden="true" style={{ color: "#05603a" }} /> : <Clock aria-hidden="true" style={{ color: "#93370d" }} />}
      <strong>{label}</strong>
      <p className="muted" style={{ margin: 0 }}>{data[key].note}</p>
    </li>
  );
  return (
    <div data-testid="admin-integrations">
      <section className="panel"><h3>External connections</h3><ul className="panel__list integrations-list">{row("google_calendar", "Google Calendar")}{row("microsoft_365", "Microsoft 365 · Outlook · Teams")}{row("mailbox", "Outbound mailbox for Inbox replies")}</ul><p className="muted" style={{ marginTop: 14 }}>When you’re ready to connect a provider, share your OAuth app credentials and we’ll enable live sync.</p></section>
    </div>
  );
}
