import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { trackEvent } from "../analytics";

const BASE = "https://dablin-backend-production.up.railway.app";

const ONPAGE_CHECKS = [
  { key: "meta",         label: "Meta description",       desc: "Present, unique and between 120–155 characters",                    what: "We read the <meta name=\"description\"> tag and check length and uniqueness." },
  { key: "headings",     label: "Heading structure",      desc: "Single H1, no skipped heading levels",                             what: "We check for exactly one H1 and verify no heading levels are skipped (e.g. H1 → H3)." },
  { key: "wordCount",    label: "Word count",             desc: "At least 300 words for meaningful content",                        what: "We count visible text on the page. Thin pages rank poorly — 300+ words is the baseline." },
  { key: "alt",          label: "Image alt text",         desc: "All images have descriptive alt attributes",                       what: "We scan every <img> tag and check that none are missing the alt attribute." },
  { key: "og",           label: "Open Graph tags",        desc: "og:title, og:description, og:image all present",                  what: "We check for og:title, og:description, and og:image in the <head> — required for social sharing previews." },
  { key: "schema",       label: "Schema markup",          desc: "At least one JSON-LD structured data block",                      what: "We look for at least one <script type=\"application/ld+json\"> block in the page HTML." },
  { key: "productSchema",label: "Product schema",         desc: "Product type schema for Google Shopping eligibility",             what: "We check for @type: Product in JSON-LD — required to appear in Google Shopping results." },
  { key: "breadcrumb",   label: "Breadcrumb schema",      desc: "BreadcrumbList for navigation context",                          what: "We look for @type: BreadcrumbList schema — helps Google understand your site structure." },
  { key: "reviewSchema", label: "Review / rating schema", desc: "Star ratings eligible in search results",                        what: "We check for AggregateRating in your schema — enables star ratings to show in search snippets." },
  { key: "canonical",    label: "Canonical URL",          desc: "Self-referencing canonical — AI engines index the correct version", what: "We read <link rel=\"canonical\"> and verify it points to the current page, not a different URL." },
  { key: "internalLinks",label: "Internal links",         desc: "At least 3 internal links for crawlability and topical authority", what: "We count links pointing to other pages on the same domain. 3+ is the minimum for good crawlability." },
];

const TECHNICAL_CHECKS = [
  { key: "renderBlocking", label: "Render-blocking scripts", desc: "No synchronous scripts in <head> slowing page load",               what: "We check for <script src=...> in <head> without async or defer attributes." },
  { key: "imageOpt",       label: "Image optimisation",      desc: "All images have width, height and loading=lazy for Core Web Vitals", what: "We scan every <img> for width, height, and loading attributes — missing these causes layout shift (CLS)." },
  { key: "sitemap",        label: "Sitemap",                 desc: "sitemap.xml accessible for Google to discover pages",               what: "We fetch /sitemap.xml and check it returns a valid response." },
  { key: "robots",         label: "Robots tag",              desc: "Page is not accidentally set to noindex",                           what: "We read the <meta name=\"robots\"> tag and check it doesn't contain noindex." },
  { key: "viewport",       label: "Mobile viewport",         desc: "Viewport meta tag present for mobile-first indexing",               what: "We check for <meta name=\"viewport\"> — required for Google's mobile-first indexing." },
];

const ALGORITHM_CHECKS = [
  { key: "informationGain", label: "Information Gain",        desc: "600+ words with original signals: author, date, data or structured lists", what: "Google's March 2026 update. We check word count (600+) plus at least 2 signals: author byline, publish date, stats, or structured lists." },
  { key: "aiOverview",      label: "AI Overview eligibility", desc: "FAQPage or HowTo schema, or question-structured H2s for Google SGE",       what: "We check for FAQPage/HowTo schema or H2s phrased as questions — both make your page eligible for Google's AI Overviews." },
];

const ALL_CHECKS = [...ONPAGE_CHECKS, ...TECHNICAL_CHECKS, ...ALGORITHM_CHECKS];

const TABS = [
  { id: "onpage",    label: "On-Page SEO",  free: true  },
  { id: "offpage",   label: "Off-Page SEO", free: false },
  { id: "technical", label: "Technical SEO",free: false },
  { id: "algorithm", label: "Algorithm",    free: false },
];

// ── CHECK ROW ──────────────────────────────────────────────────
function CheckRow({ check, result, fix, expanded, onToggle }) {
  const passed = result?.checks?.[check.key];
  const issueMsg = result?.issues?.[check.key];
  return (
    <div style={{ borderBottom: "1px solid #eef2ee" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 0", cursor: issueMsg ? "pointer" : "default" }}>
        <span style={{ fontSize: "15px", flexShrink: 0, marginTop: "1px" }}>{passed ? "✅" : "❌"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#0d1f0e", marginBottom: "2px" }}>{check.label}</div>
          <div style={{ fontSize: "12px", color: passed ? "#4a6b4c" : "#c0392b", lineHeight: "1.5" }}>{issueMsg || check.desc}</div>
        </div>
        {issueMsg && <span style={{ fontSize: "11px", color: "#1a7a3a", flexShrink: 0, marginTop: "3px" }}>{expanded ? "▲" : "▼"}</span>}
      </div>
      {expanded && fix && (
        <div style={{ background: "#f0f7f0", border: "1px solid #d0e8d4", borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#1a7a3a", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>✦ AI Fix</div>
          <pre style={{ fontSize: "12px", color: "#0d1f0e", whiteSpace: "pre-wrap", fontFamily: "'Roboto Mono', monospace", lineHeight: "1.6", margin: 0 }}>{fix}</pre>
        </div>
      )}
    </div>
  );
}

// ── SCORE CIRCLE ───────────────────────────────────────────────
function ScoreCircle({ score, size = 80 }) {
  const color = score >= 80 ? "#1a7a3a" : score >= 60 ? "#b45309" : "#c0392b";
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eef2ee" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        style={{ transform: `rotate(90deg) translate(0px, -${size}px)`, transformOrigin: `${size/2}px ${size/2}px` }}
        fill={color} fontSize={size === 80 ? "18" : "14"} fontWeight="700" fontFamily="Roboto Condensed">{score}</text>
    </svg>
  );
}

// ── LOCKED TAB ─────────────────────────────────────────────────
function LockedTab({ tab, onUpgrade, checks }) {
  const descriptions = {
    offpage: {
      intro: "Domain authority, backlink analysis, and referring domain tracking — the signals that tell Google how trusted your site is.",
      items: ["Domain Authority score out of 100", "Total backlinks count", "Referring domains analysis", "Social signals and brand mentions"],
    },
    technical: {
      intro: "Under-the-hood checks that affect how fast Google crawls and renders your page — and how well it scores on Core Web Vitals.",
      items: TECHNICAL_CHECKS.map(c => `${c.label} — ${c.desc}`),
    },
    algorithm: {
      intro: "Google's March 2026 core update introduced two new ranking signals. Failing them pushes pages out of top positions.",
      items: ALGORITHM_CHECKS.map(c => `${c.label} — ${c.desc}`),
    },
  };
  const d = descriptions[tab.id];
  return (
    <div style={{ padding: "32px 0" }}>
      <p style={{ fontSize: "14px", color: "#4a6b4c", marginBottom: "20px", lineHeight: "1.65", maxWidth: "520px" }}>{d.intro}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" , border: "1px solid #eef2ee", borderRadius: "10px", overflow: "hidden", marginBottom: "24px", maxWidth: "520px" }}>
        {d.items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px", borderBottom: i < d.items.length - 1 ? "1px solid #eef2ee" : "none", background: "white" }}>
            <span style={{ color: "#d0e8d4", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>○</span>
            <span style={{ fontSize: "13px", color: "#4a6b4c", lineHeight: "1.5", filter: "blur(3.5px)", userSelect: "none" }}>{item}</span>
          </div>
        ))}
      </div>
      <button onClick={onUpgrade} style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "9px", padding: "11px 24px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Roboto', sans-serif" }}>
        Upgrade to Pro →
      </button>
    </div>
  );
}

// ── ON-PAGE EMPTY STATE ────────────────────────────────────────
function OnPageEmptyState() {
  return (
    <div style={{ paddingTop: "20px" }}>
      <p style={{ fontSize: "13px", color: "#4a6b4c", marginBottom: "20px", lineHeight: "1.6" }}>
        We'll check these 11 on-page signals and show you exactly what's passing, what's failing, and the AI-generated fix for each issue.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {ONPAGE_CHECKS.map(check => (
          <div key={check.key} style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "1.5px solid #d0e8d4", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d0e8d4" }} />
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0d1f0e" }}>{check.label}</span>
            </div>
            <p style={{ fontSize: "11px", color: "#9ab09c", lineHeight: "1.5", margin: "0 0 0 26px" }}>{check.desc}</p>
            <p style={{ fontSize: "11px", color: "#b8c8b9", lineHeight: "1.4", margin: "6px 0 0 26px", fontStyle: "italic" }}>{check.what}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function Audit({ setPage }) {
  const { getToken } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [activeTab, setActiveTab] = useState("onpage");
  const [currentPlan, setCurrentPlan] = useState("free");
  const [noCredits, setNoCredits] = useState(false);

  useEffect(() => { fetchPlan(); }, []);

  async function fetchPlan() {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/plan`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCurrentPlan(data.plan || "free");
    } catch {}
  }

  function toggleExpanded(key) {
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  }

  async function runAudit() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setNoCredits(false);
    setExpanded({});
    setActiveTab("onpage");
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setNoCredits(true);
        if (data.error) setError(data.error);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data);
      trackEvent("seo_audit_completed", { url });
      window.dataLayer = window.dataLayer || [];
      const passed = Object.values(data.checks || {}).filter(Boolean).length;
      const total = Object.keys(data.checks || {}).length;
      window.dataLayer.push({ event: "seo_audit_completed", url, score: Math.round(passed / total * 100), passed, total });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const onpagePassed = result ? ONPAGE_CHECKS.filter(c => result.checks[c.key]).length : 0;
  const techPassed   = result ? TECHNICAL_CHECKS.filter(c => result.checks[c.key]).length : 0;
  const algoPassed   = result ? ALGORITHM_CHECKS.filter(c => result.checks[c.key]).length : 0;
  const totalPassed  = result ? ALL_CHECKS.filter(c => result.checks[c.key]).length : 0;
  const totalChecks  = ALL_CHECKS.length;
  const overallScore = result ? Math.round((totalPassed / totalChecks) * 100) : null;
  const canAccessTab = (tab) => tab.free || currentPlan === "pro" || currentPlan === "agency";

  const tabBtn = (tab) => {
    const isActive = activeTab === tab.id;
    const locked = !canAccessTab(tab);
    return {
      display: "flex", alignItems: "center", gap: "7px",
      padding: "11px 18px", border: "none", cursor: "pointer",
      fontFamily: "'Roboto', sans-serif", fontSize: "13px", fontWeight: "600",
      borderBottom: isActive ? "2px solid #1a7a3a" : "2px solid transparent",
      background: "transparent",
      color: isActive ? "#1a7a3a" : locked ? "#c0c8c0" : "#4a6b4c",
      transition: "color 0.15s, border-color 0.15s",
      whiteSpace: "nowrap",
    };
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", maxWidth: "860px", margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@700;800&family=Roboto+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* ── URL INPUT ── */}
      <div style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
        <p style={{ fontSize: "13px", color: "#4a6b4c", marginBottom: "12px", lineHeight: "1.5" }}>
          Paste your website URL. Dablin runs 18 SEO checks across On-Page, Off-Page, Technical SEO and Algorithm signals — with AI fixes for every issue.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAudit()}
            placeholder="https://yourwebsite.com"
            style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #d0e8d4", borderRadius: "8px", fontSize: "14px", fontFamily: "'Roboto', sans-serif", color: "#0d1f0e", outline: "none" }}
          />
          <button
            onClick={runAudit}
            disabled={loading || !url.trim()}
            style={{ background: loading ? "#d0e8d4" : "#1a7a3a", color: "white", border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Roboto', sans-serif", whiteSpace: "nowrap", transition: "background 0.2s" }}
          >
            {loading ? "Auditing…" : "Audit SEO"}
          </button>
        </div>
        {error && <div style={{ marginTop: "10px", fontSize: "13px", color: "#c0392b" }}>{error}</div>}
        {noCredits && (
          <div style={{ marginTop: "10px", background: "#fff8e8", border: "1px solid #fcd34d", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#b45309" }}>
            You've reached your plan limit.{" "}
            <button onClick={() => setPage?.("pricing")} style={{ background: "none", border: "none", color: "#1a7a3a", fontWeight: "700", cursor: "pointer", fontSize: "13px", padding: 0, textDecoration: "underline" }}>Upgrade →</button>
          </div>
        )}
      </div>

      {/* ── MAIN PANEL ── */}
      <div style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "14px", overflow: "hidden" }}>

        {/* Score header — only when result */}
        {result && (
          <div style={{ background: "#0d1f0e", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <ScoreCircle score={overallScore} />
            <div>
              <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "22px", fontWeight: "800", color: "white", marginBottom: "4px" }}>
                {overallScore >= 80 ? "Good SEO health" : overallScore >= 60 ? "Needs improvement" : "Critical issues found"}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontFamily: "'Roboto Mono', monospace" }}>{result.url}</div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{totalPassed}/{totalChecks} checks passed</span>
                {result.pageSpeed && <span style={{ fontSize: "12px", color: result.pageSpeed >= 70 ? "#6fcf8a" : "#f09595" }}>PageSpeed: {result.pageSpeed}/100</span>}
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { label: "On-Page", val: `${onpagePassed}/${ONPAGE_CHECKS.length}`, ok: true },
                { label: "Technical", val: canAccessTab(TABS[2]) ? `${techPassed}/${TECHNICAL_CHECKS.length}` : "🔒", ok: canAccessTab(TABS[2]) },
                { label: "Algorithm", val: canAccessTab(TABS[3]) ? `${algoPassed}/${ALGORITHM_CHECKS.length}` : "🔒", ok: canAccessTab(TABS[3]) },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.07)", borderRadius: "8px", padding: "8px 14px", minWidth: "64px" }}>
                  <div style={{ fontSize: "17px", fontWeight: "800", color: s.ok ? "#6fcf8a" : "rgba(255,255,255,0.2)", fontFamily: "'Roboto Condensed', sans-serif" }}>{s.val}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #eef2ee", overflowX: "auto" }}>
          {TABS.map(tab => {
            const locked = !canAccessTab(tab);
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabBtn(tab)}>
                {tab.label}
                {locked && (
                  <span style={{ fontSize: "9px", background: "#f3f4f6", color: "#9ca3af", borderRadius: "4px", padding: "1px 5px", fontWeight: "700", letterSpacing: "0.03em" }}>PRO</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: "0 24px 28px" }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: "13px", color: "#4a6b4c" }}>Auditing {url}…</div>
              <div style={{ fontSize: "11px", color: "#9ab09c", marginTop: "6px" }}>Running 18 checks · usually under 30 seconds</div>
            </div>
          )}

          {/* ON-PAGE */}
          {!loading && activeTab === "onpage" && (
            result ? (
              <div>
                <div style={{ padding: "16px 0 8px", fontSize: "12px", color: "#4a6b4c", borderBottom: "1px solid #eef2ee", marginBottom: "4px", fontWeight: "600" }}>
                  {onpagePassed}/{ONPAGE_CHECKS.length} on-page checks passed
                </div>
                {ONPAGE_CHECKS.map(check => (
                  <div key={check.key}>
                    <CheckRow check={check} result={result} fix={result.fixes?.[check.key]}
                      expanded={expanded[check.key]} onToggle={() => result.issues?.[check.key] && toggleExpanded(check.key)} />
                    {check.key === "productSchema" && !result.checks["productSchema"] && (
                      <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "8px", padding: "8px 12px", marginBottom: "8px", fontSize: "11px", color: "#6b7280", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                        <span style={{ color: "#b45309", flexShrink: 0 }}>ℹ</span>
                        <span><strong style={{ color: "#4a6b4c" }}>Not selling products?</strong> If this is a blog, SaaS, or service site you can safely ignore this check — Product schema is only needed for e-commerce pages.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <OnPageEmptyState />
            )
          )}

          {/* OFF-PAGE */}
          {!loading && activeTab === "offpage" && (
            canAccessTab(TABS[1]) ? (
              <div style={{ paddingTop: "24px" }}>
                <p style={{ fontSize: "13px", color: "#4a6b4c", marginBottom: "20px", lineHeight: "1.6" }}>
                  Here is what your Off-Page SEO data will look like once this feature launches. Real data for your domain is coming soon.
                </p>
                <div style={{ position: "relative" }}>
                  {/* Blurred mock data */}
                  <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
                      {[{ label: "Domain Authority", val: "34", sub: "out of 100" }, { label: "Total Backlinks", val: "1,247", sub: "external links" }, { label: "Referring Domains", val: "89", sub: "unique domains" }].map(m => (
                        <div key={m.label} style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                          <div style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: "28px", fontWeight: "800", color: "#0d1f0e", marginBottom: "2px" }}>{m.val}</div>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", marginBottom: "2px" }}>{m.label}</div>
                          <div style={{ fontSize: "10px", color: "#9ab09c" }}>{m.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ border: "1px solid #eef2ee", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ padding: "10px 16px", background: "#f8faf8", borderBottom: "1px solid #eef2ee", display: "grid", gridTemplateColumns: "1fr 120px 80px", fontSize: "11px", fontWeight: "700", color: "#9ab09c", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <span>Referring domain</span><span>Target page</span><span style={{ textAlign: "center" }}>Authority</span>
                      </div>
                      {[
                        { domain: "productreview.com.au", page: "/products/...", auth: "72" },
                        { domain: "techcrunch.com", page: "/blog/...", auth: "91" },
                        { domain: "shopify.com", page: "/home", auth: "88" },
                        { domain: "g2.com", page: "/products/...", auth: "79" },
                        { domain: "capterra.com", page: "/blog/...", auth: "75" },
                      ].map((r, i) => (
                        <div key={i} style={{ padding: "10px 16px", borderBottom: i < 4 ? "1px solid #eef2ee" : "none", display: "grid", gridTemplateColumns: "1fr 120px 80px", alignItems: "center", background: "white" }}>
                          <span style={{ fontSize: "13px", color: "#0d1f0e", fontWeight: "500" }}>{r.domain}</span>
                          <span style={{ fontSize: "12px", color: "#9ab09c", fontFamily: "'Roboto Mono',monospace" }}>{r.page}</span>
                          <span style={{ textAlign: "center" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", background: "#eef8f0", color: "#1a7a3a", borderRadius: "20px", padding: "2px 8px" }}>{r.auth}/100</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Overlay */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <div style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "12px", padding: "16px 24px", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#0d1f0e", marginBottom: "4px" }}>Coming soon for Pro users</div>
                      <div style={{ fontSize: "12px", color: "#4a6b4c" }}>Real domain authority, backlinks and referring domain data for your URL</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <LockedTab tab={TABS[1]} onUpgrade={() => setPage?.("pricing")} />
            )
          )}

          {/* TECHNICAL */}
          {!loading && activeTab === "technical" && (
            canAccessTab(TABS[2]) ? (
              result ? (
                <div>
                  <div style={{ padding: "16px 0 8px", fontSize: "12px", color: "#4a6b4c", borderBottom: "1px solid #eef2ee", marginBottom: "4px", fontWeight: "600" }}>
                    {techPassed}/{TECHNICAL_CHECKS.length} technical checks passed
                    {result.pageSpeed && <span style={{ marginLeft: "12px", color: result.pageSpeed >= 70 ? "#1a7a3a" : "#c0392b" }}>PageSpeed: {result.pageSpeed}/100</span>}
                  </div>
                  {TECHNICAL_CHECKS.map(check => (
                    <CheckRow key={check.key} check={check} result={result} fix={result.fixes?.[check.key]}
                      expanded={expanded[check.key]} onToggle={() => result.issues?.[check.key] && toggleExpanded(check.key)} />
                  ))}
                </div>
              ) : (
                <div style={{ paddingTop: "20px" }}>
                  <p style={{ fontSize: "13px", color: "#4a6b4c", marginBottom: "20px", lineHeight: "1.6" }}>
                    We'll run 5 technical checks and show you exactly what's slowing your page down, what's misconfigured, and the AI fix for each issue.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0", border: "1px solid #eef2ee", borderRadius: "10px", overflow: "hidden", maxWidth: "520px" }}>
                    {TECHNICAL_CHECKS.map((c, i) => (
                      <div key={c.key} style={{ padding: "14px 16px", borderBottom: i < TECHNICAL_CHECKS.length - 1 ? "1px solid #eef2ee" : "none", background: "white" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0d1f0e", marginBottom: "2px" }}>{c.label}</div>
                        <div style={{ fontSize: "11px", color: "#9ab09c" }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <LockedTab tab={TABS[2]} onUpgrade={() => setPage?.("pricing")} />
            )
          )}

          {/* ALGORITHM */}
          {!loading && activeTab === "algorithm" && (
            canAccessTab(TABS[3]) ? (
              result ? (
                <div>
                  <div style={{ padding: "16px 0 8px", fontSize: "12px", color: "#4a6b4c", borderBottom: "1px solid #eef2ee", marginBottom: "4px", fontWeight: "600" }}>
                    {algoPassed}/{ALGORITHM_CHECKS.length} Google March 2026 signals passing
                  </div>
                  <div style={{ background: "#eef8f0", border: "1px solid #d0e8d4", borderRadius: "8px", padding: "10px 14px", margin: "12px 0", fontSize: "12px", color: "#1a7a3a" }}>
                    ⚡ Google's March 2026 core update introduced 2 new ranking signals. These are opportunities — passing them can significantly boost your ranking potential.
                  </div>
                  {ALGORITHM_CHECKS.map(check => (
                    <CheckRow key={check.key} check={check} result={result} fix={result.fixes?.[check.key]}
                      expanded={expanded[check.key]} onToggle={() => result.issues?.[check.key] && toggleExpanded(check.key)} />
                  ))}
                  {result.word_count && (
                    <div style={{ marginTop: "16px", background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "8px", padding: "14px" }}>
                      <div style={{ fontSize: "12px", color: "#4a6b4c", marginBottom: "8px", fontWeight: "600" }}>Page signals detected</div>
                      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                        <div><div style={{ fontSize: "11px", color: "#9ab09c" }}>Word count</div><div style={{ fontSize: "16px", fontWeight: "700", color: result.word_count >= 600 ? "#1a7a3a" : "#c0392b" }}>{result.word_count}</div></div>
                        <div><div style={{ fontSize: "11px", color: "#9ab09c" }}>Images</div><div style={{ fontSize: "16px", fontWeight: "700", color: "#0d1f0e" }}>{result.images_total ?? "—"}</div></div>
                        <div><div style={{ fontSize: "11px", color: "#9ab09c" }}>Missing alt</div><div style={{ fontSize: "16px", fontWeight: "700", color: result.images_missing_alt > 0 ? "#c0392b" : "#1a7a3a" }}>{result.images_missing_alt ?? "—"}</div></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ paddingTop: "20px" }}>
                  <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#b45309", maxWidth: "520px" }}>
                    ⚡ Google's March 2026 update introduced 2 new ranking signals. Enter a URL above to check if your page passes.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0", border: "1px solid #eef2ee", borderRadius: "10px", overflow: "hidden", maxWidth: "520px" }}>
                    {ALGORITHM_CHECKS.map((c, i) => (
                      <div key={c.key} style={{ padding: "14px 16px", borderBottom: i < ALGORITHM_CHECKS.length - 1 ? "1px solid #eef2ee" : "none", background: "white" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0d1f0e", marginBottom: "2px" }}>{c.label}</div>
                        <div style={{ fontSize: "11px", color: "#9ab09c" }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <LockedTab tab={TABS[3]} onUpgrade={() => setPage?.("pricing")} />
            )
          )}
        </div>

        {/* Footer */}
        {result && (
          <div style={{ borderTop: "1px solid #eef2ee", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ fontSize: "12px", color: "#9ab09c" }}>
              {totalChecks - totalPassed} issue{totalChecks - totalPassed !== 1 ? "s" : ""} found · click any failed check to see the AI fix
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/seo-audit-sample-report`)}
              style={{ background: "none", border: "1px solid #d0e8d4", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", color: "#1a7a3a", cursor: "pointer", fontFamily: "'Roboto', sans-serif" }}
            >
              ↗ Share results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
