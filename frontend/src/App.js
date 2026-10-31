import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/site/Layout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import CapabilitiesPage from "@/pages/CapabilitiesPage";
import WorkPage from "@/pages/WorkPage";
import WorkDetailPage from "@/pages/WorkDetailPage";
import InvestorsPage from "@/pages/InvestorsPage";
import BlogPage from "@/pages/BlogPage";
import ContactPage from "@/pages/ContactPage";
import LegalPage from "@/pages/LegalPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminMessagesPage from "@/pages/AdminMessagesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="capabilities" element={<CapabilitiesPage />} />
          <Route path="work" element={<WorkPage />} />
          <Route path="work/:slug" element={<WorkDetailPage />} />
          <Route path="investors" element={<InvestorsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="legal/:slug" element={<LegalPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="admin/messages" element={<AdminMessagesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
