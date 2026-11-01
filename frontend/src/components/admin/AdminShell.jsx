import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Show, UserButton, useAuth, useUser } from "@clerk/react";
import {
  LayoutDashboard, Users, Building2, Kanban, Target, Inbox, Calendar, CalendarCheck,
  CheckSquare, Search, BarChart3, Workflow, Plug, Settings, Mail, FileText, LogIn,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSeo } from "@/hooks/useSeo";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, testId: "admin-nav-dashboard" },
  { to: "/admin/crm", label: "CRM Overview", icon: Kanban, testId: "admin-nav-crm" },
  { to: "/admin/contacts", label: "Contacts", icon: Users, testId: "admin-nav-contacts" },
  { to: "/admin/companies", label: "Companies", icon: Building2, testId: "admin-nav-companies" },
  { to: "/admin/leads", label: "Leads", icon: Kanban, testId: "admin-nav-leads" },
  { to: "/admin/opportunities", label: "Opportunities", icon: Target, testId: "admin-nav-opportunities" },
  { to: "/admin/inbox", label: "Inbox", icon: Inbox, testId: "admin-nav-inbox" },
  { to: "/admin/calendar", label: "Calendar", icon: Calendar, testId: "admin-nav-calendar" },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck, testId: "admin-nav-appointments" },
  { to: "/admin/tasks", label: "Tasks", icon: CheckSquare, testId: "admin-nav-tasks" },
  { to: "/admin/research", label: "Research", icon: Search, testId: "admin-nav-research" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, testId: "admin-nav-analytics" },
  { to: "/admin/automations", label: "Automations", icon: Workflow, testId: "admin-nav-automations" },
  { to: "/admin/integrations", label: "Integrations", icon: Plug, testId: "admin-nav-integrations" },
  { to: "/admin/settings", label: "Settings", icon: Settings, testId: "admin-nav-settings" },
];

const LEGACY = [
  { to: "/admin/messages", label: "Website Messages", icon: Mail, testId: "admin-nav-messages-legacy" },
  { to: "/admin/blog", label: "Blog Engine", icon: FileText, testId: "admin-nav-blog-legacy" },
];

function UnauthorizedScreen({ email }) {
  return (
    <div className="admin-login" data-testid="admin-unauthorized">
      <div className="admin-login__card">
        <div className="admin-login__logo"><Logo testId="unauth-logo-link" /></div>
        <h1 className="admin-login__title">Not authorized</h1>
        <p className="muted">The account {email ? <strong>{email}</strong> : "you are signed in with"} is not permitted to open the 210Codelabs admin workspace.</p>
        <UserButton />
      </div>
    </div>
  );
}

export default function AdminShell() {
  useSeo({ title: "Admin workspace", noindex: true });
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const api = useAdminApi();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { navigate("/sign-in", { replace: true }); return; }
    let cancelled = false;
    api("/admin/crm/me")
      .then(() => { if (!cancelled) setStatus("ok"); })
      .catch((e) => { if (!cancelled) setStatus(e.status === 403 ? "forbidden" : "error"); });
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, api, navigate]);

  if (!isLoaded || status === "checking") {
    return <div className="admin-login" data-testid="admin-loading"><div className="admin-login__card"><p>Loading workspace…</p></div></div>;
  }
  if (status === "forbidden") return <UnauthorizedScreen email={user?.primaryEmailAddress?.emailAddress} />;
  if (status === "error") {
    return (
      <div className="admin-login"><div className="admin-login__card">
        <h1 className="admin-login__title">Workspace unavailable</h1>
        <p className="muted">We couldn’t reach the admin API. Please refresh in a moment.</p>
      </div></div>
    );
  }

  return (
    <div className="adminx" data-testid="admin-shell">
      <aside className="adminx__side" aria-label="Admin navigation">
        <div className="adminx__brand"><Logo testId="admin-shell-logo" variant="light" /></div>
        <nav>
          <ul className="adminx__nav">
            {NAV.map(({ to, label, icon: Icon, end, testId }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => `adminx__link ${isActive ? "is-active" : ""}`} data-testid={testId}>
                  <Icon aria-hidden="true" /> <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="adminx__nav-head">Legacy admin</p>
          <ul className="adminx__nav">
            {LEGACY.map(({ to, label, icon: Icon, testId }) => (
              <li key={to}>
                <NavLink to={to} className="adminx__link adminx__link--legacy" data-testid={testId}>
                  <Icon aria-hidden="true" /> <span>{label}</span><LogIn aria-hidden="true" className="adminx__link-ext" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="adminx__main">
        <header className="adminx__topbar">
          <div><span className="eyebrow">210CODELABS</span><h2 className="adminx__title">Internal Workspace</h2></div>
          <div className="adminx__user"><UserButton afterSignOutUrl="/" /></div>
        </header>
        <div className="adminx__body" id="main">
          <Show when="signed-in"><Outlet /></Show>
        </div>
      </main>
    </div>
  );
}
