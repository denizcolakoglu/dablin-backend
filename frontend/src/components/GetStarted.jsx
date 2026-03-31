import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API = "https://dablin-backend-production.up.railway.app";

// ── STEP CONFIG ───────────────────────────────────────────────
// Each check has: id, label, category, desc, how to detect, CTA
const STEP_DEFS = [
  // ── CRITICAL ─────────────────────────────────────────────
  {
    id: "https",
    priority: "critical",
    icon: "🔒",
    label: "HTTPS not enabled",
    labelOk: "HTTPS enabled",
    desc: "Your site is not served over HTTPS. Google penalises HTTP sites and AI engines distrust them.",
    descOk: "Your site is served securely over HTTPS.",
    fix: "Contact your hosting provider and enable SSL/TLS. Most hosts (Shopify, WordPress, Vercel) offer this for free.",
    cta: null,
    check: (r) => r.https === false,
  },
  {
    id: "gsc",
    priority: "critical",
    icon: "📊",
    label: "Google Search Console not set up",
    labelOk: "Google Search Console connected",
    desc: "Without GSC you have no data on how Google sees your site — which pages are indexed, what queries bring traffic, or what errors exist.",
    descOk: "You have GSC connected. You can see your search data in the Search Console tab.",
    fix: "Go to search.google.com/search-console, add your site and verify ownership. Then connect it to Dablin.",
    cta: { label: "Connect GSC in Dablin →", page: "searchconsole" },
    ctaExternal: { label: "Set up GSC →", url: "https://search.google.com/search-console" },
    check: (r) => !r.gscConnected,
  },
  {
    id: "indexed",
    priority: "critical",
    icon: "🗂️",
    label: "Site may not be indexed by Google",
    labelOk: "Site appears to be indexed",
    desc: "Your homepage couldn't be confirmed as indexed. If Google hasn't indexed your site, you don't exist in search.",
    descOk: "Your site appears to be indexed by Google.",
    fix: "Submit your sitemap to Google Search Console and use the URL Inspection tool to request indexing for your key pages.",
    cta: { label: "Check indexing in Search Console →", page: "searchconsole" },
    check: (r) => r.robotsBlocked === true,
  },
  {
    id: "llmstxt",
    priority: "critical",
    icon: "🤖",
    label: "No llms.txt — AI engines can't identify your brand",
    labelOk: "llms.txt found",
    desc: "llms.txt tells ChatGPT, Gemini and Claude what your site is about. Without it, AI engines have to guess — and often get it wrong.",
    descOk: "Your site has an llms.txt file. AI engines can identify your brand context.",
    fix: "Run the AI Visibility Audit and copy the generated llms.txt. Upload it to your site root.",
    cta: { label: "Run AI Visibility Audit →", page: "ai" },
    check: (r) => r.llmsTxt === false,
  },
  {
    id: "orgSchema",
    priority: "critical",
    icon: "🏢",
    label: "No Organization schema — brand identity unclear to AI",
    labelOk: "Organization schema found",
    desc: "Without Organization schema, AI engines and Google can't confirm your brand is a real entity. This affects both GEO and SEO.",
    descOk: "Organization schema is present. AI engines can verify your brand identity.",
    fix: "Run the AI Visibility Audit to get the exact JSON-LD block to add to your homepage.",
    cta: { label: "Run AI Visibility Audit →", page: "ai" },
    check: (r) => r.orgSchema === false,
  },

  // ── IMPORTANT ─────────────────────────────────────────────
  {
    id: "aiCrawlers",
    priority: "important",
    icon: "🕷️",
    label: "AI crawlers blocked in robots.txt",
    labelOk: "AI crawlers allowed",
    desc: "GPTBot, ClaudeBot or PerplexityBot are blocked in your robots.txt. AI engines can't crawl your content.",
    descOk: "AI crawlers are allowed to crawl your site.",
    fix: "Run the AI Visibility Audit to get the exact robots.txt rules to add.",
    cta: { label: "Run AI Visibility Audit →", page: "ai" },
    check: (r) => r.aiCrawlers === false,
  },
  {
    id: "metaDesc",
    priority: "important",
    icon: "📝",
    label: "Missing meta description",
    labelOk: "Meta description present",
    desc: "Without a meta description, Google writes its own — and it's usually bad. This directly affects click-through rate.",
    descOk: "Your page has a meta description.",
    fix: "Run the SEO Audit to get an AI-generated meta description for your page.",
    cta: { label: "Run SEO Audit →", page: "audit" },
    check: (r) => r.metaDescription === false,
  },
  {
    id: "productSchema",
    priority: "important",
    icon: "🛍️",
    label: "No Product schema — not eligible for Google Shopping",
    labelOk: "Product schema present",
    desc: "Without Product schema, your listings don't qualify for Google Shopping and won't show star ratings or price in search.",
    descOk: "Product schema is present. Your pages are eligible for Google Shopping rich results.",
    fix: "Run the SEO Audit to get the exact JSON-LD Product schema block for your page.",
    cta: { label: "Run SEO Audit →", page: "audit" },
    check: (r) => r.productSchema === false,
  },
  {
    id: "faqSchema",
    priority: "important",
    icon: "❓",
    label: "No FAQPage schema — not eligible for AI Overviews",
    labelOk: "FAQPage schema present",
    desc: "Without FAQPage schema or question-structured headings, Google's AI won't summarise your content in AI Overviews.",
    descOk: "Your page has FAQPage schema or question headings — eligible for AI Overviews.",
    fix: "Run the SEO Audit to check AI Overview eligibility and get a fix.",
    cta: { label: "Run SEO Audit →", page: "audit" },
    check: (r) => r.faqSchema === false,
  },
  {
    id: "openGraph",
    priority: "important",
    icon: "🔗",
    label: "Missing Open Graph tags",
    labelOk: "Open Graph tags present",
    desc: "Missing og:title, og:description or og:image means your pages look broken when shared on social media or cited by AI.",
    descOk: "Open Graph tags are present.",
    fix: "Run the AI Visibility Audit to get the missing OG tags generated for your page.",
    cta: { label: "Run AI Visibility Audit →", page: "ai" },
    check: (r) => r.openGraph === false,
  },
  {
    id: "infoGain",
    priority: "important",
    icon: "📖",
    label: "Fails Information Gain (Google March 2026)",
    labelOk: "Passes Information Gain check",
    desc: "Google's March 2026 update penalises pages with no original content. Your page may lack unique data, author signals, or structured content.",
    descOk: "Your page passes the Information Gain check.",
    fix: "Run the SEO Audit to see the full Information Gain score and what to add.",
    cta: { label: "Run SEO Audit →", page: "audit" },
    check: (r) => r.infoGain === false,
  },

  // ── GOOD TO HAVE ──────────────────────────────────────────
  {
    id: "sitemap",
    priority: "good",
    icon: "🗺️",
    label: "No sitemap.xml found",
    labelOk: "Sitemap.xml found",
    desc: "A sitemap helps Google discover all your pages faster, especially new ones.",
    descOk: "Your sitemap.xml is accessible.",
    fix: "Generate a sitemap using your CMS (Shopify and WordPress do this automatically). Submit it in Google Search Console.",
    cta: null,
    check: (r) => r.sitemap === false,
  },
  {
    id: "canonical",
    priority: "good",
    icon: "🔁",
    label: "Missing canonical tag",
    labelOk: "Canonical tag present",
    desc: "Without a canonical tag, Shopify and similar platforms create duplicate URL penalties by indexing the same page at multiple URLs.",
    descOk: "Canonical tag is present.",
    fix: "Run the SEO Audit for a canonical tag fix for this page.",
    cta: { label: "Run SEO Audit →", page: "audit" },
    check: (r) => r.canonical === false,
  },
  {
    id: "aiVisibility",
    priority: "good",
    icon: "✨",
    label: "AI Visibility Audit not run yet",
    labelOk: "AI Visibility Audit completed",
    desc: "You haven't audited whether ChatGPT, Gemini or Claude can find and understand your brand. Most brands are invisible to AI engines.",
    descOk: "You've run the AI Visibility Audit.",
    fix: "Run the AI Visibility Audit to check all 12 signals AI engines use to find and cite your brand.",
    cta: { label: "Run AI Visibility Audit →", page: "ai" },
    check: (r) => !r.hasRunAiAudit,
  },
];

const PRIORITY_CONFIG = {
  critical: { label: "Critical — fix now",       color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", dot: "#ef4444" },
  important: { label: "Important — fix this week", color: "#f59e0b", bg: "#fffbf0", border: "#fcd34d", dot: "#f59e0b" },
  good:      { label: "Good to have",              color: "#1a7a3a", bg: "#eef8f0", border: "#d0e8d4", dot: "#1a7a3a" },
};

// ── URL INPUT STEP ────────────────────────────────────────────
function StepUrl({ onScan }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleScan() {
    const trimmed = url.trim();
    if (!trimmed) return setError("Please enter a URL");
    setError("");
    setLoading(true);
    try {
      await onScan(trimmed);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", background: "#eef8f0", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "28px" }}>🚀</div>
      <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "28px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.5px", marginBottom: "10px" }}>Let's set up your site</h2>
      <p style={{ fontSize: "15px", color: "#4a6b4c", lineHeight: "1.65", marginBottom: "32px" }}>
        Enter your website URL and we'll scan it in seconds — then walk you through exactly what to fix, in order of priority.
      </p>
      <div style={{ display: "flex", gap: "10px", background: "white", border: "1.5px solid #d0e8d4", borderRadius: "12px", padding: "6px 6px 6px 18px", marginBottom: "8px" }}>
        <input
          type="url"
          placeholder="https://yoursite.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleScan()}
          style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", color: "#0d1f0e", background: "transparent", fontFamily: "inherit" }}
        />
        <button
          onClick={handleScan}
          disabled={loading}
          style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "8px", padding: "11px 24px", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, whiteSpace: "nowrap" }}
        >
          {loading ? "Scanning…" : "Scan my site →"}
        </button>
      </div>
      {error && <div style={{ fontSize: "13px", color: "#c0392b", marginTop: "6px" }}>{error}</div>}
      <p style={{ fontSize: "12px", color: "#4a6b4c", marginTop: "10px" }}>We check 14 signals — takes about 15 seconds</p>
    </div>
  );
}

// ── RESULTS STEP ─────────────────────────────────────────────
function CheckItem({ item, result, setPage, expanded, onToggle }) {
  const failed = item.check(result);
  const cfg = PRIORITY_CONFIG[item.priority];

  return (
    <div style={{ border: `1px solid ${failed ? cfg.border : "#eef2ee"}`, borderRadius: "10px", background: failed ? cfg.bg : "#f8faf8", marginBottom: "10px", overflow: "hidden" }}>
      <div
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", cursor: "pointer" }}
      >
        <span style={{ fontSize: "18px", flexShrink: 0 }}>{failed ? item.icon : "✅"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: failed ? "#0d1f0e" : "#2a3d2b" }}>
            {failed ? item.label : item.labelOk}
          </div>
          {!expanded && failed && (
            <div style={{ fontSize: "12px", color: cfg.color, fontWeight: "500", marginTop: "2px" }}>{cfg.label}</div>
          )}
        </div>
        {failed && (
          <span style={{ fontSize: "11px", color: cfg.color, fontWeight: "700", flexShrink: 0 }}>
            {expanded ? "▲ hide" : "▼ fix"}
          </span>
        )}
        {!failed && (
          <span style={{ background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>Done</span>
        )}
      </div>

      {expanded && failed && (
        <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${cfg.border}` }}>
          <p style={{ fontSize: "13px", color: "#4a6b4c", lineHeight: "1.6", margin: "12px 0 10px" }}>{item.desc}</p>
          <div style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "8px", padding: "12px 14px", marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>How to fix</div>
            <div style={{ fontSize: "13px", color: "#0d1f0e", lineHeight: "1.55" }}>{item.fix}</div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {item.cta && (
              <button
                onClick={() => {
                  if (item.cta.page === 'ai' || item.cta.page === 'audit') {
                    sessionStorage.setItem("prefillUrl", url);
                  }
                  setPage(item.cta.page);
                }}
                style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
              >
                {item.cta.label}
              </button>
            )}
            {item.ctaExternal && (
              <a
                href={item.ctaExternal.url}
                target="_blank"
                rel="noreferrer"
                style={{ background: "white", color: "#1a7a3a", border: "1.5px solid #d0e8d4", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}
              >
                {item.ctaExternal.label}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepResults({ result, url, setPage, onRescan }) {
  const [expanded, setExpanded] = useState({});

  // Get saved timestamp for "last scanned" display
  let lastScanned = "";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const { ts } = JSON.parse(raw);
      const diff = Date.now() - ts;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      lastScanned = mins < 1 ? "just now"
        : mins < 60 ? `${mins}m ago`
        : hours < 24 ? `${hours}h ago`
        : "today";
    }
  } catch {}

  const failed = STEP_DEFS.filter(s => s.check(result));
  const passed = STEP_DEFS.filter(s => !s.check(result));

  const criticalFailed  = failed.filter(s => s.priority === "critical");
  const importantFailed = failed.filter(s => s.priority === "important");
  const goodFailed      = failed.filter(s => s.priority === "good");

  const score = Math.round((passed.length / STEP_DEFS.length) * 100);
  const scoreColor = score >= 80 ? "#1a7a3a" : score >= 50 ? "#f59e0b" : "#ef4444";

  function toggle(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  function expandAll(items) {
    const next = {};
    items.forEach(i => { next[i.id] = true; });
    setExpanded(e => ({ ...e, ...next }));
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "24px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.5px", marginBottom: "4px" }}>Setup checklist</h2>
          <div style={{ fontSize: "13px", color: "#4a6b4c" }}>
            {url}
            {lastScanned && <span style={{ marginLeft: "10px", background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: "600" }}>Scanned {lastScanned}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: scoreColor, fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1 }}>{score}%</div>
            <div style={{ fontSize: "11px", color: "#4a6b4c", marginTop: "2px" }}>setup complete</div>
          </div>
          <button onClick={onRescan} style={{ background: "none", border: "1px solid #eef2ee", color: "#4a6b4c", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>↺ Re-scan</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "#eef2ee", borderRadius: "100px", height: "6px", marginBottom: "20px" }}>
        <div style={{ background: scoreColor, width: `${score}%`, height: "100%", borderRadius: "100px", transition: "width 0.6s ease" }} />
      </div>

      {/* Summary strip + Dashboard CTA */}
      <div style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "12px", padding: "16px 20px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          {criticalFailed.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#ef4444" }}>{criticalFailed.length} critical</span>
            </div>
          )}
          {importantFailed.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f59e0b" }}>{importantFailed.length} important</span>
            </div>
          )}
          {goodFailed.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1a7a3a", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#1a7a3a" }}>{goodFailed.length} good to have</span>
            </div>
          )}
          {failed.length === 0 && (
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a7a3a" }}>🎉 All checks passed</span>
          )}
        </div>
        <button
          onClick={() => setPage("dashboard")}
          style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          View on Dashboard →
        </button>
      </div>

      {/* Critical */}
      {criticalFailed.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0d1f0e" }}>Critical — fix now</span>
              <span style={{ background: "#fef2f2", color: "#c0392b", border: "1px solid #fca5a5", borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: "700" }}>{criticalFailed.length}</span>
            </div>
            <button onClick={() => expandAll(criticalFailed)} style={{ fontSize: "12px", color: "#4a6b4c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Expand all</button>
          </div>
          {criticalFailed.map(item => (
            <CheckItem key={item.id} item={item} result={result} setPage={setPage} expanded={!!expanded[item.id]} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      )}

      {/* Important */}
      {importantFailed.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0d1f0e" }}>Important — fix this week</span>
              <span style={{ background: "#fffbf0", color: "#b45309", border: "1px solid #fcd34d", borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: "700" }}>{importantFailed.length}</span>
            </div>
            <button onClick={() => expandAll(importantFailed)} style={{ fontSize: "12px", color: "#4a6b4c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Expand all</button>
          </div>
          {importantFailed.map(item => (
            <CheckItem key={item.id} item={item} result={result} setPage={setPage} expanded={!!expanded[item.id]} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      )}

      {/* Good to have */}
      {goodFailed.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1a7a3a", display: "inline-block" }} />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0d1f0e" }}>Good to have</span>
              <span style={{ background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: "700" }}>{goodFailed.length}</span>
            </div>
            <button onClick={() => expandAll(goodFailed)} style={{ fontSize: "12px", color: "#4a6b4c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Expand all</button>
          </div>
          {goodFailed.map(item => (
            <CheckItem key={item.id} item={item} result={result} setPage={setPage} expanded={!!expanded[item.id]} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      )}

      {/* All passed */}
      {passed.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d0e8d4", display: "inline-block" }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#4a6b4c" }}>Already done</span>
            <span style={{ background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: "700" }}>{passed.length}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {passed.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "8px", padding: "10px 14px" }}>
                <span style={{ fontSize: "14px" }}>✅</span>
                <span style={{ fontSize: "13px", color: "#2a3d2b", fontWeight: "500" }}>{item.labelOk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All done state */}
      {failed.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 24px", background: "#eef8f0", border: "1px solid #d0e8d4", borderRadius: "14px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "22px", fontWeight: "800", color: "#0d1f0e", marginBottom: "8px" }}>All checks passed!</h3>
          <p style={{ fontSize: "14px", color: "#4a6b4c", lineHeight: "1.6" }}>Your site is well set up for SEO and AI visibility. Check back after making changes to your site.</p>
        </div>
      )}
    </div>
  );
}

const STORAGE_KEY = "dablin_getstarted";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Expire after 24 hours so results stay fresh
    if (Date.now() - saved.ts > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return saved;
  } catch { return null; }
}

function save(url, result) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, result, ts: Date.now() }));
  } catch {}
}

function clearSaved() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function GetStarted({ setPage }) {
  const { getToken } = useAuth();
  const [scanMsg, setScanMsg] = useState("Fetching your page…");

  // Restore from localStorage on mount
  const saved = loadSaved();
  const [step, setStep] = useState(saved ? "results" : "url");
  const [url, setUrl]   = useState(saved?.url || "");
  const [result, setResult] = useState(saved?.result || null);

  const SCAN_MESSAGES = [
    "Fetching your page…",
    "Checking HTTPS and robots.txt…",
    "Looking for llms.txt…",
    "Scanning schema markup…",
    "Checking AI crawler access…",
    "Checking meta tags and Open Graph…",
    "Testing Information Gain signals…",
    "Almost done…",
  ];

  async function handleScan(inputUrl) {
    setUrl(inputUrl);
    setStep("scanning");

    let msgIdx = 0;
    setScanMsg(SCAN_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, SCAN_MESSAGES.length - 1);
      setScanMsg(SCAN_MESSAGES[msgIdx]);
    }, 1800);

    try {
      const token = await getToken();

      const [auditRes, gscRes, histRes] = await Promise.all([
        fetch(`${API}/api/ai-audit`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ url: inputUrl }),
        }),
        fetch(`${API}/api/gsc/status`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ json: async () => ({ connected: false }) })),
        fetch(`${API}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ json: async () => ({ urls: [] }) })),
      ]);

      const [auditData, gscData, histData] = await Promise.all([
        auditRes.json(),
        gscRes.json(),
        histRes.json(),
      ]);

      const hasRunAiAudit = (histData.urls || []).some(u =>
        u.audits?.some(a => a.type === "ai")
      );

      const checks = auditData.checks || {};
      const mapped = {
        https:                checks.https !== false,
        robotsBlocked:        checks.robots === false,
        llmsTxt:              checks.llmsTxt !== false,
        orgSchema:            checks.orgSchema !== false,
        aiCrawlers:           checks.aiCrawlers !== false,
        metaDescription:      checks.metaDescription !== false,
        productSchema:        checks.productSchema !== false,
        faqSchema:            checks.faqSchema !== false || checks.aiOverview !== false,
        openGraph:            checks.openGraph !== false,
        infoGain:             checks.infoGain !== false,
        sitemap:              checks.sitemap !== false,
        canonical:            checks.canonical !== false,
        gscConnected:         gscData.connected === true,
        hasRunAiAudit,
      };

      // Persist to localStorage
      save(inputUrl, mapped);

      setResult(mapped);
      setStep("results");
    } catch (err) {
      throw new Error("Scan failed: " + err.message);
    } finally {
      clearInterval(msgInterval);
    }
  }

  function handleRescan() {
    clearSaved();
    setStep("url");
    setResult(null);
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;800&display=swap');`}</style>

      {step === "url" && <StepUrl onScan={handleScan} />}

      {step === "scanning" && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ width: "64px", height: "64px", background: "#eef8f0", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "28px" }}>
            <span style={{ display: "inline-block", animation: "spin 1.2s linear infinite" }}>◎</span>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "20px", fontWeight: "800", color: "#0d1f0e", marginBottom: "10px" }}>Scanning {url}</h3>
          <p style={{ fontSize: "14px", color: "#4a6b4c" }}>{scanMsg}</p>
        </div>
      )}

      {step === "results" && result && (
        <StepResults
          result={result}
          url={url}
          setPage={setPage}
          onRescan={handleRescan}
        />
      )}
    </div>
  );
}
