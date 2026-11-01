import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ClerkAuthProvider from "@/components/auth/ClerkAuthProvider";
import Layout from "@/components/site/Layout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import CapabilitiesPage from "@/pages/CapabilitiesPage";
import WorkPage from "@/pages/WorkPage";
import WorkDetailPage from "@/pages/WorkDetailPage";
import InvestorsPage from "@/pages/InvestorsPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ContactPage from "@/pages/ContactPage";
import LegalPage from "@/pages/LegalPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminMessagesPage from "@/pages/AdminMessagesPage";
import AdminBlogPage from "@/pages/AdminBlogPage";
import SolutionDetailPage from "@/pages/SolutionDetailPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import AdminShell from "@/components/admin/AdminShell";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminContactsPage from "@/pages/admin/AdminContactsPage";
import AdminContactDetailPage from "@/pages/admin/AdminContactDetailPage";
import AdminCompaniesPage from "@/pages/admin/AdminCompaniesPage";
import AdminCompanyDetailPage from "@/pages/admin/AdminCompanyDetailPage";
import AdminLeadsPage from "@/pages/admin/AdminLeadsPage";
import AdminOpportunitiesPage from "@/pages/admin/AdminOpportunitiesPage";
import AdminTasksPage from "@/pages/admin/AdminTasksPage";
import AdminCalendarPage from "@/pages/admin/AdminCalendarPage";
import AdminAppointmentsPage from "@/pages/admin/AdminAppointmentsPage";
import AdminInboxPage from "@/pages/admin/AdminInboxPage";
import AdminResearchPage from "@/pages/admin/AdminResearchPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminAutomationsPage from "@/pages/admin/AdminAutomationsPage";
import AdminIntegrationsPage from "@/pages/admin/AdminIntegrationsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import { captureAttribution } from "@/lib/attribution";

function AttributionCapture() {
  const location = useLocation();
  useEffect(() => { captureAttribution(); }, [location.pathname, location.search]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ClerkAuthProvider>
        <AttributionCapture />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="capabilities" element={<CapabilitiesPage />} />
            <Route path="work" element={<WorkPage />} />
            <Route path="work/:slug" element={<WorkDetailPage />} />
            <Route path="solutions/:slug" element={<SolutionDetailPage />} />
            <Route path="investors" element={<InvestorsPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="legal/:slug" element={<LegalPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="sign-in/*" element={<SignInPage />} />
          <Route path="sign-up/*" element={<SignUpPage />} />
          <Route path="admin" element={<AdminShell />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="crm" element={<AdminDashboardPage />} />
            <Route path="contacts" element={<AdminContactsPage />} />
            <Route path="contacts/:id" element={<AdminContactDetailPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="companies/:id" element={<AdminCompanyDetailPage />} />
            <Route path="leads" element={<AdminLeadsPage />} />
            <Route path="opportunities" element={<AdminOpportunitiesPage />} />
            <Route path="tasks" element={<AdminTasksPage />} />
            <Route path="calendar" element={<AdminCalendarPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="inbox" element={<AdminInboxPage />} />
            <Route path="research" element={<AdminResearchPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="automations" element={<AdminAutomationsPage />} />
            <Route path="integrations" element={<AdminIntegrationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
          {/* Legacy password-protected admin pages (preserved) */}
          <Route path="admin/messages" element={<AdminMessagesPage />} />
          <Route path="admin/blog" element={<AdminBlogPage />} />
        </Routes>
      </ClerkAuthProvider>
    </BrowserRouter>
  );
}

export default App;
