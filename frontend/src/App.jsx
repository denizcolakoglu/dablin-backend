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
import QueryCheck from "./components/QueryCheck";
import Dashboard from "./components/Dashboard";
import PageGenerate from "./components/pages/PageGenerate";
import PageSeoAudit from "./components/pages/PageSeoAudit";
import PageAiAudit from "./components/pages/PageAiAudit";
import PageAiCheck from "./components/pages/PageAiCheck";
import PagePricing from "./components/pages/PagePricing";
import SharedResult from "./components/SharedResult";

// ── Google March 2026 Popup ───────────────────────────────────
function GoogleUpdatePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("g2026popup")) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    sessionStorage.setItem("g2026popup", "1");
    setVisible(false);
  }

  function handleCTA() {
    sessionStorage.setItem("g2026popup", "1");
    window.location.href = "/dashboard/seo-audit";
  }

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.5)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "24px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "420px", width: "100%", borderRadius: "20px",
          overflow: "hidden", position: "relative",
          background: "linear-gradient(135deg, #0f2a1a 0%, #1a4a2a 50%, #2d6a3a 100%)",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ position: "relative", padding: "32px" }}>

          {/* Close */}
          <button onClick={dismiss} style={{
            position: "absolute", top: "16px", right: "16px",
            background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
            width: "26px", height: "26px", color: "rgba(255,255,255,0.6)",
            cursor: "pointer", fontSize: "12px", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>✕</button>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)",
            borderRadius: "20px", padding: "4px 12px", fontSize: "11px",
            fontWeight: "500", letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: "18px", border: "0.5px solid rgba(255,255,255,0.15)",
          }}>
            ⚡ Google March 2026
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: "26px", fontWeight: "700", color: "#ffffff",
            lineHeight: "1.15", margin: "0 0 10px", letterSpacing: "-0.5px",
          }}>
            Does your site pass<br />the new ranking signals?
          </h2>

          {/* Body */}
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.6)",
            lineHeight: "1.6", margin: "0 0 24px", fontWeight: "300",
          }}>
            Dablin now checks <span style={{ color: "#fff", fontWeight: "500" }}>Information Gain</span> and <span style={{ color: "#fff", fontWeight: "500" }}>AI Overview eligibility</span> — the 2 signals from Google's fastest update ever.
          </p>

          {/* CTA */}
          <button onClick={handleCTA} style={{
            width: "100%", background: "#ffffff", color: "#0f2a1a",
            border: "none", borderRadius: "12px", padding: "15px",
            fontSize: "15px", fontWeight: "700", cursor: "pointer",
            marginBottom: "10px", letterSpacing: "-0.2px",
          }}>
            Run free SEO Audit →
          </button>

          <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            Free · No card needed · 7 credits on signup
          </p>

        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [prevUserId, setPrevUserId] = useState(null);
  const [creditKey, setCreditKey] = useState(0);

  const path = location.pathname.replace('/dashboard', '') || '/';
  const page = path === '/' || path === '' ? 'dashboard'
    : path === '/visibility'   ? 'visibility'
    : path === '/query-check'  ? 'querycheck'
    : path === '/ai-audit'     ? 'ai'
    : path === '/seo-audit'    ? 'audit'
    : path === '/generate'     ? 'generate'
    : path === '/history'      ? 'history'
    : path === '/credits'      ? 'pricing'
    : 'dashboard';

  function setPage(p) {
    const routes = {
      dashboard:  '/dashboard',
      visibility: '/dashboard/visibility',
      querycheck: '/dashboard/query-check',
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
      <aside className="sidebar">
        <div className="sidebar-logo">
          <a href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'10px' }}>
            <img src="/logo.svg" alt="Dablin" height="32" />
            <span style={{ color:'white', fontWeight:'700', fontSize:'16px', letterSpacing:'-0.3px' }}>dablin</span>
          </a>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-group">
            <div className="sidebar-group-label">Overview</div>
            <button className={`sidebar-link ${page==='dashboard'?'active':''}`} onClick={() => setPage('dashboard')}>
              <span className="sidebar-link-icon">⊞</span>Dashboard
            </button>
            <button className={`sidebar-link ${page==='history'?'active':''}`} onClick={() => setPage('history')}>
              <span className="sidebar-link-icon">☰</span>History
            </button>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-label">AI Tools</div>
            <button className={`sidebar-link ${page==='visibility'?'active':''}`} onClick={() => setPage('visibility')}>
              <span className="sidebar-link-icon">✳</span>AI Visibility Check
            </button>
            <button className={`sidebar-link ${page==='querycheck'?'active':''}`} onClick={() => setPage('querycheck')}>
              <span className="sidebar-link-icon">↗</span>AI Query Check
            </button>
            <button className={`sidebar-link ${page==='ai'?'active':''}`} onClick={() => setPage('ai')}>
              <span className="sidebar-link-icon">◈</span>AI Visibility Audit
            </button>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-label">SEO Tools</div>
            <button className={`sidebar-link ${page==='audit'?'active':''}`} onClick={() => setPage('audit')}>
              <span className="sidebar-link-icon">⊕</span>SEO Audit
            </button>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-label">E-commerce</div>
            <button className={`sidebar-link ${page==='generate'?'active':''}`} onClick={() => setPage('generate')}>
              <span className="sidebar-link-icon">⊟</span>Description Generator
            </button>
          </div>
        </nav>
        <div className="sidebar-bottom">
          <button className={`sidebar-balance-btn ${page==='pricing'?'active':''}`} onClick={() => setPage('pricing')}>
            <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'13px' }}>◑</span>
              <span>Balance</span>
            </span>
            <span className="sidebar-balance-amount">€—</span>
          </button>
          <div className="sidebar-account">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </aside>
      <main className="main-content">
        {page === "visibility" && <VisibilityChecker setPage={setPage} />}
        {page === "querycheck" && <QueryCheck setPage={setPage} />}
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
      <Route path="/generate-product-description" element={<PageGenerate />} />
      <Route path="/seo-audit" element={<PageSeoAudit />} />
      <Route path="/ai-visibility-audit" element={<PageAiAudit />} />
      <Route path="/ai-visibility-check" element={<PageAiCheck />} />
      <Route path="/pricing" element={<PagePricing />} />
      <Route path="/results/:token" element={<SharedResult />} />

      <Route path="/dashboard/*" element={
        <>
          <SignedOut><Navigate to="/" replace /></SignedOut>
          <SignedIn><AppShell /></SignedIn>
        </>
      } />

      <Route path="/" element={
        <>
          <SignedOut>
            <Landing />
            <GoogleUpdatePopup />
          </SignedOut>
          <SignedIn>
            <Navigate to="/dashboard" replace />
          </SignedIn>
        </>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
