import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import Generator from "./components/Generator";
import History from "./components/History";
import Pricing from "./components/Pricing";
import Landing from "./components/Landing";
import Audit from "./components/Audit";
import AiAudit from "./components/AiAudit";
import VisibilityChecker from "./components/VisibilityChecker";
import Dashboard from "./components/Dashboard";
import PageGenerate from "./components/pages/PageGenerate";
import PageSeoAudit from "./components/pages/PageSeoAudit";
import PageAiAudit from "./components/pages/PageAiAudit";
import PageAiCheck from "./components/pages/PageAiCheck";
import PagePricing from "./components/pages/PagePricing";
import SharedResult from "./components/SharedResult";

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [prevUserId, setPrevUserId] = useState(null);
  const [creditKey, setCreditKey] = useState(0);

  // Derive active page from URL
  const path = location.pathname.replace('/dashboard', '') || '/';
  const page = path === '/' || path === '' ? 'dashboard'
    : path === '/visibility'  ? 'visibility'
    : path === '/ai-audit'    ? 'ai'
    : path === '/seo-audit'   ? 'audit'
    : path === '/generate'    ? 'generate'
    : path === '/history'     ? 'history'
    : path === '/credits'     ? 'pricing'
    : 'dashboard';

  function setPage(p) {
    const routes = {
      dashboard:  '/dashboard',
      visibility: '/dashboard/visibility',
      ai:         '/dashboard/ai-audit',
      audit:      '/dashboard/seo-audit',
      generate:   '/dashboard/generate',
      history:    '/dashboard/history',
      pricing:    '/dashboard/credits',
    };
    navigate(routes[p] || '/dashboard');
  }

  useEffect(() => {
    if (user) {
      if (!prevUserId && user.id) {
        const isNewUser = (Date.now() - new Date(user.createdAt).getTime()) < 60000;
        if (isNewUser) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'sign_up_completed', method: 'clerk' });
        }
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'login', method: 'clerk' });
        setPrevUserId(user.id);
      }
      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
      if (email) {
        getToken().then(token => {
          fetch("https://dablin-backend-production.up.railway.app/api/sync-email", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ email }),
          }).catch(() => {});
        });
      }
    }
  }, [user]);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'page_view', page_title: page, page_location: window.location.href });
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", "/dashboard/credits");
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'purchase_completed' });
      setTimeout(() => setCreditKey(k => k + 1), 4000);
    }
  }, []);

  return (
    <div className="app-shell">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <a href="/" style={{ textDecoration:'none', display:'flex' }}>
            <img src="/logo.svg" alt="Dablin" height="40" />
          </a>
        </div>
        <nav className="sidebar-nav">
          {[
            { key:'dashboard',  label:'Dashboard'           },
            { key:'visibility', label:'AI Visibility Check' },
            { key:'ai',         label:'AI Visibility Audit' },
            { key:'audit',      label:'SEO Audit'           },
            { key:'generate',   label:'Generate'            },
            { key:'history',    label:'History'             },
            { key:'pricing',    label:'Balance'             },
          ].map(item => (
            <button
              key={item.key}
              className={`sidebar-link ${page === item.key ? 'active' : ''}`}
              onClick={() => setPage(item.key)}
            >
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {page === "visibility" && <VisibilityChecker setPage={setPage} />}
        {page === "ai"         && <AiAudit setPage={setPage} />}
        {page === "audit"      && <Audit setPage={setPage} />}
        {page === "generate"   && <Generator key={creditKey} />}
        {page === "dashboard"  && <Dashboard setPage={setPage} />}
        {page === "history"    && <History />}
        {page === "pricing"    && <Pricing setPage={setPage} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route path="/generate-product-description" element={<PageGenerate />} />
      <Route path="/seo-audit" element={<PageSeoAudit />} />
      <Route path="/ai-visibility-audit" element={<PageAiAudit />} />
      <Route path="/ai-visibility-check" element={<PageAiCheck />} />
      <Route path="/pricing" element={<PagePricing />} />
      <Route path="/results/:token" element={<SharedResult />} />

      {/* Dashboard routes — requires auth */}
      <Route path="/dashboard/*" element={
        <>
          <SignedOut>
            <Navigate to="/" replace />
          </SignedOut>
          <SignedIn>
            <AppShell />
          </SignedIn>
        </>
      } />

      {/* Root — landing or redirect to dashboard */}
      <Route path="/" element={
        <>
          <SignedOut>
            <Landing />
          </SignedOut>
          <SignedIn>
            <Navigate to="/dashboard" replace />
          </SignedIn>
        </>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
