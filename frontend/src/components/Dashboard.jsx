import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const BASE = "https://dablin-backend-production.up.railway.app";
const STORAGE_KEY = "dablin_getstarted";

// ── STEP DEFINITIONS (mirror GetStarted) ──────────────────────
const STEP_DEFS = [
  { id: "gsc",          priority: "critical",  icon: "📊", label: "Connect Google Search Console",      labelOk: "Google Search Console connected",    desc: "Without GSC you have no data on how Google sees your site — which pages are indexed, what queries bring traffic, or what errors exist.", fix: "Go to search.google.com/search-console, add your site, then connect it to Dablin.", cta: { label: "Connect GSC →", page: "searchconsole" }, ctaExternal: { label: "Set up GSC →", url: "https://search.google.com/search-console" }, check: r => !r.gscConnected },
  { id: "llmstxt",      priority: "critical",  icon: "🤖", label: "No llms.txt — AI can't identify your brand", labelOk: "llms.txt found",                desc: "llms.txt tells ChatGPT, Gemini and Claude what your site is about. Without it, AI engines have to guess — and often get it wrong.",     fix: "Run the AI Visibility Audit and copy the generated llms.txt. Upload it to your site root.",  cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => r.llmsTxt === false },
  { id: "orgSchema",    priority: "critical",  icon: "🏢", label: "No Organization schema",              labelOk: "Organization schema present",        desc: "Without Organization schema, AI engines and Google can't confirm your brand is a real entity.",  fix: "Run the AI Visibility Audit to get the exact JSON-LD block to add to your homepage.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => r.orgSchema === false },
  { id: "https",        priority: "critical",  icon: "🔒", label: "HTTPS not enabled",                   labelOk: "HTTPS enabled",                      desc: "Your site is not served over HTTPS. Google penalises HTTP sites and AI engines distrust them.", fix: "Contact your hosting provider and enable SSL/TLS. Most hosts offer this for free.", cta: null, check: r => r.https === false },
  { id: "indexed",      priority: "critical",  icon: "🗂️", label: "Site may not be indexed by Google",   labelOk: "Site appears to be indexed",         desc: "Your homepage couldn't be confirmed as indexed. If Google hasn't indexed your site, you don't exist in search.", fix: "Submit your sitemap to Google Search Console and use the URL Inspection tool to request indexing.", cta: { label: "Check in Search Console →", page: "searchconsole" }, check: r => r.robotsBlocked === true },
  { id: "aiCrawlers",   priority: "important", icon: "🕷️", label: "AI crawlers blocked in robots.txt",  labelOk: "AI crawlers allowed",                desc: "GPTBot, ClaudeBot or PerplexityBot are blocked in your robots.txt. AI engines can't crawl your content.", fix: "Run the AI Visibility Audit to get the exact robots.txt rules to add.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => r.aiCrawlers === false },
  { id: "metaDesc",     priority: "important", icon: "📝", label: "Missing meta description",            labelOk: "Meta description present",           desc: "Without a meta description, Google writes its own — usually bad. This directly affects click-through rate.", fix: "Run the SEO Audit to get an AI-generated meta description for your page.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.metaDescription === false },
  { id: "productSchema",priority: "important", icon: "🛍️", label: "No Product schema",                  labelOk: "Product schema present",             desc: "Without Product schema, your listings don't qualify for Google Shopping and won't show star ratings or price.", fix: "Run the SEO Audit to get the exact JSON-LD Product schema block.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.productSchema === false },
  { id: "faqSchema",    priority: "important", icon: "❓", label: "No FAQPage schema",                   labelOk: "FAQPage schema present",             desc: "Without FAQPage schema or question headings, Google's AI won't summarise your content in AI Overviews.", fix: "Run the SEO Audit to check AI Overview eligibility and get a fix.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.faqSchema === false },
  { id: "openGraph",    priority: "important", icon: "🔗", label: "Missing Open Graph tags",             labelOk: "Open Graph tags present",            desc: "Missing og:title, og:description or og:image means your pages look broken when shared or cited by AI.", fix: "Run the AI Visibility Audit to get the missing OG tags generated.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => r.openGraph === false },
  { id: "infoGain",     priority: "important", icon: "📖", label: "Fails Information Gain (Mar 2026)",   labelOk: "Passes Information Gain",            desc: "Google's March 2026 update penalises pages with no original content. Your page may lack unique data or author signals.", fix: "Run the SEO Audit to see the full Information Gain score and what to add.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.infoGain === false },
  { id: "sitemap",      priority: "good",      icon: "🗺️", label: "No sitemap.xml found",               labelOk: "Sitemap.xml found",                  desc: "A sitemap helps Google discover all your pages faster, especially new ones.", fix: "Generate a sitemap using your CMS. Shopify and WordPress do this automatically. Submit in GSC.", cta: null, check: r => r.sitemap === false },
  { id: "canonical",    priority: "good",      icon: "🔁", label: "Missing canonical tag",              labelOk: "Canonical tag present",              desc: "Without a canonical tag, Shopify and similar platforms create duplicate URL penalties.", fix: "Run the SEO Audit for a canonical tag fix.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.canonical === false },
  { id: "aiVisibility", priority: "good",      icon: "✨", label: "AI Visibility Audit not run yet",    labelOk: "AI Visibility Audit completed",       desc: "You haven't audited whether ChatGPT, Gemini or Claude can find and understand your brand.", fix: "Run the AI Visibility Audit to check all 12 signals AI engines use to cite your brand.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => !r.hasRunAiAudit },
];

const PRIORITY_CONFIG = {
  critical:  { label: "Critical",    color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", pill: "#fef2f2", pillText: "#c0392b", pillBorder: "#fca5a5" },
  important: { label: "Important",   color: "#f59e0b", bg: "#fffbf0", border: "#fcd34d", pill: "#fffbf0", pillText: "#b45309", pillBorder: "#fcd34d" },
  good:      { label: "Good to have",color: "#1a7a3a", bg: "#eef8f0", border: "#d0e8d4", pill: "#eef8f0", pillText: "#1a7a3a", pillBorder: "#d0e8d4" },
};

const BLOG_POSTS = [
  { tag: "Google · SEO", title: "Google March 2026: What the Fastest Core Update Means for Your Site", date: "26 Mar 2026", url: "https://blog.dablin.co/google-march-2026-update" },
  { tag: "SEO · Backlinks", title: "Not All Backlinks Are Equal. Here's Why Most Link Building is a Waste of Time.", date: "23 Mar 2026", url: "https://blog.dablin.co/backlink-quality-vs-quantity" },
  { tag: "AI Visibility · GEO", title: "What Is Dablin? The Problem It Solves and How to Use It", date: "21 Mar 2026", url: "https://blog.dablin.co/what-is-dablin" },
];

// ── TICKET CARD ───────────────────────────────────────────────
function Ticket({ item, done, setPage, onExpand, isExpanded }) {
  const cfg = PRIORITY_CONFIG[item.priority];
  return (
    <div
      onClick={onExpand}
      style={{
        background: "white",
        border: `1px solid ${isExpanded ? cfg.border : "#eef2ee"}`,
        borderLeft: `3px solid ${done ? "#d0e8d4" : cfg.color}`,
        borderRadius: "10px",
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.15s",
        opacity: done ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{done ? "✅" : item.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: done ? "#4a6b4c" : "#0d1f0e", lineHeight: "1.35", textDecoration: done ? "line-through" : "none", marginBottom: "6px" }}>
            {done ? item.labelOk : item.label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ background: cfg.pill, color: cfg.pillText, border: `1px solid ${cfg.pillBorder}`, borderRadius: "20px", padding: "1px 8px", fontSize: "10px", fontWeight: "700" }}>
              {cfg.label}
            </span>
          </div>
        </div>
        <span style={{ fontSize: "10px", color: "#4a6b4c", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${cfg.border}` }} onClick={e => e.stopPropagation()}>
          <p style={{ fontSize: "13px", color: "#4a6b4c", lineHeight: "1.6", marginBottom: "10px" }}>{item.desc}</p>
          {!done && (
            <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>How to fix</div>
              <div style={{ fontSize: "12px", color: "#0d1f0e", lineHeight: "1.55" }}>{item.fix}</div>
            </div>
          )}
          {!done && item.cta && (
            <button
              onClick={() => {
                if (item.cta.page === "ai" || item.cta.page === "audit") {
                  // pass URL if available
                  try {
                    const saved = localStorage.getItem(STORAGE_KEY);
                    if (saved) {
                      const { url } = JSON.parse(saved);
                      if (url) sessionStorage.setItem("prefillUrl", url);
                    }
                  } catch {}
                }
                setPage(item.cta.page);
              }}
              style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "7px", padding: "8px 16px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
            >
              {item.cta.label}
            </button>
          )}
          {!done && item.ctaExternal && (
            <a href={item.ctaExternal.url} target="_blank" rel="noreferrer"
              style={{ display: "inline-block", marginLeft: item.cta ? "8px" : "0", background: "white", color: "#1a7a3a", border: "1.5px solid #d0e8d4", borderRadius: "7px", padding: "7px 14px", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>
              {item.ctaExternal.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── KANBAN COLUMN ─────────────────────────────────────────────
function Column({ title, subtitle, count, color, children, emptyMsg }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "12px", borderBottom: "2px solid " + color }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0d1f0e" }}>{title}</span>
        <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: "700" }}>{count}</span>
      </div>
      {subtitle && <p style={{ fontSize: "11px", color: "#4a6b4c", marginBottom: "12px", lineHeight: "1.4" }}>{subtitle}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {count === 0
          ? <div style={{ background: "#f8faf8", border: "1px dashed #eef2ee", borderRadius: "10px", padding: "24px 16px", textAlign: "center", fontSize: "12px", color: "#4a6b4c" }}>{emptyMsg}</div>
          : children
        }
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────
export default function Dashboard({ setPage }) {
  const { getToken } = useAuth();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Load saved GetStarted result
  const [gsResult, setGsResult] = useState(null);
  const [gsUrl, setGsUrl]       = useState("");

  useEffect(() => {
    fetchAuditData();
    loadGetStarted();
  }, []);

  function loadGetStarted() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Date.now() - saved.ts > 24 * 60 * 60 * 1000) return;
      setGsResult(saved.result);
      setGsUrl(saved.url);
    } catch {}
  }

  async function fetchAuditData() {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setAuditData(json);
    } catch {}
    finally { setLoading(false); }
  }

  function toggle(id) {
    setExpandedId(prev => prev === id ? null : id);
  }

  // Build ticket lists from saved GetStarted result
  const todoTickets = gsResult ? STEP_DEFS.filter(s => s.check(gsResult)) : [];
  const doneTickets = gsResult ? STEP_DEFS.filter(s => !s.check(gsResult)) : [];

  // Sort by priority order
  const priorityOrder = { critical: 0, important: 1, good: 2 };
  const sortByPriority = arr => [...arr].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const todoSorted = sortByPriority(todoTickets);
  const doneSorted = sortByPriority(doneTickets);

  const criticalCount  = todoSorted.filter(t => t.priority === "critical").length;
  const importantCount = todoSorted.filter(t => t.priority === "important").length;

  const score = gsResult ? Math.round((doneTickets.length / STEP_DEFS.length) * 100) : null;
  const scoreColor = score == null ? "#4a6b4c" : score >= 80 ? "#1a7a3a" : score >= 50 ? "#f59e0b" : "#ef4444";

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#4a6b4c" }}>Loading...</div>;

  return (
    <div style={{ padding: "28px 24px", fontFamily: "'Roboto', sans-serif", height: "100%", overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #d0e8d4; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "22px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.5px", marginBottom: "3px" }}>Dashboard</h2>
          {gsUrl && <p style={{ fontSize: "12px", color: "#4a6b4c" }}>{gsUrl}</p>}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {score != null && (
            <div style={{ textAlign: "center", background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "8px 16px" }}>
              <div style={{ fontSize: "20px", fontWeight: "800", color: scoreColor, fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: "10px", color: "#4a6b4c" }}>setup complete</div>
            </div>
          )}
          {criticalCount > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444", fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1 }}>{criticalCount}</div>
              <div style={{ fontSize: "10px", color: "#c0392b", fontWeight: "600" }}>critical</div>
            </div>
          )}
          {!gsResult && (
            <button onClick={() => setPage("getstarted")} style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              🚀 Run setup scan →
            </button>
          )}
          {gsResult && (
            <button onClick={() => setPage("getstarted")} style={{ background: "none", border: "1px solid #eef2ee", color: "#4a6b4c", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer" }}>
              ↺ Re-scan
            </button>
          )}
        </div>
      </div>

      {/* Main layout: Kanban + Blog */}
      <div style={{ display: "grid", gridTemplateColumns: gsResult ? "1fr 1fr 1fr 280px" : "1fr", gap: "20px", alignItems: "start" }}>

        {/* No GetStarted data yet */}
        {!gsResult && (
          <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "14px", padding: "56px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🚀</div>
            <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "20px", fontWeight: "800", color: "#0d1f0e", marginBottom: "8px" }}>Start with a site scan</h3>
            <p style={{ fontSize: "14px", color: "#4a6b4c", lineHeight: "1.65", maxWidth: "360px", margin: "0 auto 24px" }}>
              Enter your URL in Get Started and we'll scan 14 signals. Your fix list will appear here as a Kanban board — sorted by priority.
            </p>
            <button onClick={() => setPage("getstarted")} style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
              🚀 Go to Get Started →
            </button>
          </div>
        )}

        {/* TO DO column */}
        {gsResult && (
          <Column title="To Do" count={todoSorted.length} color="#ef4444"
            subtitle="Fix these to improve your SEO and AI visibility."
            emptyMsg="🎉 Nothing left to fix!">
            {todoSorted.map(item => (
              <Ticket key={item.id} item={item} done={false} setPage={setPage}
                isExpanded={expandedId === item.id}
                onExpand={() => toggle(item.id)} />
            ))}
          </Column>
        )}

        {/* IN PROGRESS — manual, just a placeholder column */}
        {gsResult && (
          <Column title="In Progress" count={0} color="#f59e0b"
            subtitle="Move tickets here as you work on them."
            emptyMsg="Click a ticket to start fixing it.">
          </Column>
        )}

        {/* DONE column */}
        {gsResult && (
          <Column title="Done" count={doneSorted.length} color="#1a7a3a"
            subtitle="Checks your site already passes."
            emptyMsg="Run a scan to see completed items.">
            {doneSorted.map(item => (
              <Ticket key={item.id} item={item} done={true} setPage={setPage}
                isExpanded={expandedId === item.id + "_done"}
                onExpand={() => toggle(item.id + "_done")} />
            ))}
          </Column>
        )}

        {/* Blog sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>From the blog</div>
          {BLOG_POSTS.map((post, i) => (
            <a key={i} href={post.url} target="_blank" rel="noreferrer"
              style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "10px", padding: "14px 16px", textDecoration: "none", display: "block", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#d0e8d4"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#eef2ee"}
            >
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#1a7a3a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{post.tag}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0d1f0e", lineHeight: "1.4", marginBottom: "8px" }}>{post.title}</div>
              <div style={{ fontSize: "11px", color: "#4a6b4c" }}>{post.date}</div>
            </a>
          ))}
          <a href="https://blog.dablin.co" target="_blank" rel="noreferrer"
            style={{ fontSize: "12px", color: "#1a7a3a", fontWeight: "600", textDecoration: "none", textAlign: "center", padding: "8px" }}>
            View all posts →
          </a>

          {/* Audit stats */}
          {auditData && (
            <div style={{ marginTop: "8px", background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Activity</div>
              {[
                { label: "Audits run", value: auditData.totalAudits },
                { label: "URLs tracked", value: auditData.urls?.length || 0 },
                { label: "Descriptions", value: auditData.totalDescriptions },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eef2ee" }}>
                  <span style={{ fontSize: "12px", color: "#4a6b4c" }}>{s.label}</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#1a7a3a", fontFamily: "'Roboto Condensed', sans-serif" }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
