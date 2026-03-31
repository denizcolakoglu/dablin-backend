import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import ShareButton from "./ShareButton";
import ToolHistory from "./ToolHistory";

const CHECK_GROUPS = [
  {
    key: "identity",
    label: "Brand Identity",
    checks: [
      { key: "orgSchema", label: "Organization schema",   desc: "AI engines can verify your brand identity" },
      { key: "sameAs",    label: "sameAs social links",   desc: "Social profiles linked in schema for entity recognition" },
      { key: "siteName",  label: "WebSite schema & name", desc: "WebSite schema with name field present" },
    ],
  },
  {
    key: "crawlability",
    label: "AI Crawlability",
    checks: [
      { key: "llmsTxt",    label: "llms.txt file",        desc: "Helps ChatGPT, Perplexity and Gemini understand your site" },
      { key: "aiCrawlers", label: "AI crawlers allowed",  desc: "GPTBot, ClaudeBot, PerplexityBot not blocked in robots.txt" },
      { key: "noAiBlock",  label: "No noai meta tag",     desc: "AI engines are not explicitly blocked on this page" },
      { key: "https",      label: "HTTPS",                desc: "Page served securely — required for AI engine trust" },
      { key: "speed",      label: "Fast response time",   desc: "Server responds in under 3 seconds" },
    ],
  },
  {
    key: "content",
    label: "AI-Readable Content",
    checks: [
      { key: "h1",        label: "Clear H1 heading",  desc: "Single descriptive H1 — AI engines anchor page topic on this" },
      { key: "metaDesc",  label: "Meta description",  desc: "Used by AI engines for citations and summaries" },
      { key: "canonical", label: "Canonical URL",     desc: "AI engines index the correct version of this page" },
      { key: "openGraph", label: "Open Graph tags",   desc: "og:title, og:description, og:image — used for AI summaries" },
    ],
  },
];

const ALL_CHECKS = CHECK_GROUPS.flatMap(g => g.checks);

export default function AiAudit({ setPage }) {
  const { getToken } = useAuth();

  // Pre-fill URL if navigated from GetStarted
  const prefill = sessionStorage.getItem("prefillUrl") || "";
  if (prefill) sessionStorage.removeItem("prefillUrl");

  const [url, setUrl] = useState(prefill);
  const [activeToolTab, setActiveToolTab] = useState("tool");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [noCredits, setNoCredits] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ identity: true, crawlability: true, content: true });
  const [copied, setCopied] = useState(null);

  function toggleGroup(key) {
    setExpandedGroups(g => ({ ...g, [key]: !g[key] }));
  }

  function copyFix(key, text) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function runAudit() {
    if (!url.trim()) return;
    let fullUrl = url.trim();
    if (!fullUrl.startsWith("http")) fullUrl = "https://" + fullUrl;
    setLoading(true);
    setError(null);
    setResult(null);
    setNoCredits(false);
    try {
      const token = await getToken();
      const res = await fetch("https://dablin-backend-production.up.railway.app/api/ai-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (res.status === 402) { setNoCredits(true); window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: "credits_depleted" }); return; }
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data);
      window.dataLayer = window.dataLayer || [];
      const passed = Object.values(data.checks || {}).filter(Boolean).length;
      const total = Object.keys(data.checks || {}).length || 12;
      window.dataLayer.push({ event: 'ai_audit_completed', url, score: Math.round(passed / total * 100), passed, total });    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const totalChecks = ALL_CHECKS.length;
  const passed = result ? ALL_CHECKS.filter(c => result.checks[c.key]).length : 0;
  const score  = result ? Math.round((passed / totalChecks) * 100) : null;

  return (
    <div style={{ fontFamily:"'Roboto',sans-serif" }}>
      <div style={{ display:"flex", borderBottom:"2px solid #d4e8d6" }}>
        {[["tool","AI Visibility Audit"],["history","History"]].map(([id,label]) => (
          <button key={id} onClick={() => setActiveToolTab(id)}
            style={{ padding:"11px 24px", fontSize:"13px", fontWeight:"600",
              color: activeToolTab===id ? "#2d7a3a" : "#5a7a5e", background:"none", border:"none",
              cursor:"pointer", borderBottom: activeToolTab===id ? "2px solid #2d7a3a" : "2px solid transparent",
              marginBottom:"-2px", transition:"all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>
      {activeToolTab === "history" && <ToolHistory type="ai-audit" />}
      {activeToolTab === "tool" && (
    <div className="audit-page">
      <style>{`
        .audit-page { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
        .audit-sub { font-size: 15px; color: #5a7a5e; margin-bottom: 32px; }
        .audit-input-row { display: flex; gap: 12px; margin-bottom: 32px; }
        .audit-url-input {
          flex: 1; padding: 12px 16px; border: 1px solid #d4e8d6;
          border-radius: 8px; font-size: 14px; color: #1c2e1e;
          outline: none; transition: border 0.2s;
        }
        .audit-url-input:focus { border-color: #2d7a3a; }
        .audit-btn {
          background: #2d7a3a; color: white; border: none;
          padding: 12px 24px; border-radius: 8px; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .audit-btn:hover { background: #3d9e4e; }
        .audit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .audit-score-card {
          background: #f7fbf7; border: 1px solid #d4e8d6; border-radius: 14px;
          padding: 28px; margin-bottom: 24px; display: flex; align-items: center; gap: 24px;
        }
        .audit-score-circle {
          width: 80px; height: 80px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800; flex-shrink: 0;
        }
        .score-good { background: #e8f5ea; color: #2d7a3a; border: 3px solid #2d7a3a; }
        .score-mid  { background: #fff8e1; color: #f59e0b; border: 3px solid #f59e0b; }
        .score-bad  { background: #fef2f2; color: #ef4444; border: 3px solid #ef4444; }
        .audit-score-info h3 { font-size: 18px; font-weight: 700; color: #0f1a10; margin-bottom: 4px; }
        .audit-score-info p  { font-size: 14px; color: #5a7a5e; }
        .check-group { margin-bottom: 12px; border: 1px solid #d4e8d6; border-radius: 12px; overflow: hidden; }
        .check-group-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; background: #f7fbf7; cursor: pointer;
          user-select: none; transition: background 0.15s;
        }
        .check-group-header:hover { background: #eef7ef; }
        .check-group-title { font-size: 14px; font-weight: 700; color: #0f1a10; }
        .check-group-meta { display: flex; align-items: center; gap: 12px; }
        .group-score { font-size: 12px; font-weight: 600; color: #5a7a5e; }
        .group-chevron { font-size: 11px; color: #5a7a5e; }
        .check-group-body { display: flex; flex-direction: column; }
        .audit-check {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 14px 20px; border-top: 1px solid #eef5ef; background: white;
        }
        .check-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .check-label { font-size: 14px; font-weight: 600; color: #0f1a10; margin-bottom: 2px; }
        .check-desc { font-size: 12px; color: #5a7a5e; }
        .check-desc.fail { color: #c0392b; }
        .fix-box {
          margin-top: 10px; background: #f0faf1;
          border: 1px solid #b7debb; border-radius: 8px; padding: 12px 14px;
        }
        .fix-box-label {
          font-size: 11px; font-weight: 700; color: #2d7a3a;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;
        }
        .fix-box-content {
          font-size: 12px; color: #1c2e1e; white-space: pre-wrap;
          word-break: break-word; font-family: monospace; line-height: 1.5; margin-bottom: 8px;
        }
        .fix-copy-btn {
          background: #2d7a3a; color: white; border: none;
          padding: 5px 14px; border-radius: 6px; font-size: 12px;
          font-weight: 600; cursor: pointer; transition: background 0.2s;
        }
        .fix-copy-btn:hover { background: #3d9e4e; }
        .no-credits-banner {
          background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 12px;
          padding: 20px 24px; display: flex; align-items: center;
          justify-content: space-between; gap: 16px; margin-bottom: 24px;
        }
        .no-credits-text h4 { font-size: 15px; font-weight: 700; color: #92400e; margin-bottom: 4px; }
        .no-credits-text p  { font-size: 13px; color: #b45309; margin: 0; }
        .no-credits-btn {
          background: #f59e0b; color: white; border: none; padding: 10px 20px;
          border-radius: 8px; font-size: 13px; font-weight: 700;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
        }
        .no-credits-btn:hover { background: #d97706; }
        .audit-error {
          background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px;
          padding: 16px; color: #ef4444; font-size: 14px;
        }
        .audit-coming-soon {
          background: #f7fbf7; border: 1px solid #d4e8d6; border-radius: 14px;
          padding: 48px 24px; text-align: center; color: #5a7a5e;
        }
        .audit-coming-soon h3 { font-size: 18px; font-weight: 700; color: #0f1a10; margin-bottom: 8px; }
      `}</style>

      <p className="audit-sub">
        Check how visible your page is to AI engines like ChatGPT, Perplexity and Gemini. 12 checks with AI-generated fixes.
      </p>

      <div className="audit-input-row">
        <input
          className="audit-url-input"
          type="url"
          placeholder="https://yourstore.com/products/your-product"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && runAudit()}
        />
        <button className="audit-btn" onClick={runAudit} disabled={loading || !url.trim()}>
          {loading ? "Auditing..." : "Run AI Audit"}
        </button>
      </div>

      {noCredits && (
        <div className="no-credits-banner">
          <div className="no-credits-text">
            <h4>Not enough balance</h4>
            <p>AI Visibility Audit costs €0.80. Top up your balance to continue.</p>
          </div>
          <button className="no-credits-btn" onClick={() => setPage("pricing")}>Buy Credits</button>
        </div>
      )}

      {error && <div className="audit-error">{error}</div>}

      {result && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <ShareButton type="ai-audit" data={result} />
          </div>
          <div className="audit-score-card">
            <div className={`audit-score-circle ${score >= 75 ? "score-good" : score >= 50 ? "score-mid" : "score-bad"}`}>
              {score}%
            </div>
            <div className="audit-score-info">
              <h3>{score >= 75 ? "Good AI visibility" : score >= 50 ? "Needs improvement" : "Poor AI visibility"}</h3>
              <p>{passed} of {totalChecks} checks passed · {result.response_time_ms && `${result.response_time_ms}ms response`}</p>
            </div>
          </div>

          {CHECK_GROUPS.map(group => {
            const groupPassed = group.checks.filter(c => result.checks[c.key]).length;
            const isOpen = expandedGroups[group.key];
            return (
              <div className="check-group" key={group.key}>
                <div className="check-group-header" onClick={() => toggleGroup(group.key)}>
                  <span className="check-group-title">{group.label}</span>
                  <div className="check-group-meta">
                    <span className="group-score"
                      style={{ color: groupPassed === group.checks.length ? "#2d7a3a" : groupPassed === 0 ? "#c0392b" : "#e08a00" }}>
                      {groupPassed}/{group.checks.length} passed
                    </span>
                    <span className="group-chevron">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="check-group-body">
                    {group.checks.map(c => {
                      const ok  = result.checks[c.key];
                      const fix = result.fixes?.[c.key];
                      return (
                        <div className="audit-check" key={c.key}>
                          <span className="check-icon">{ok ? "✅" : "❌"}</span>
                          <div style={{ flex: 1 }}>
                            <div className="check-label">{c.label}</div>
                            <div className={`check-desc ${!ok ? "fail" : ""}`}>
                              {ok ? c.desc : result.issues?.[c.key] || c.desc}
                            </div>
                            {!ok && fix && (
                              <div className="fix-box">
                                <div className="fix-box-label">✦ AI Fix</div>
                                <div className="fix-box-content">{fix}</div>
                                <button className="fix-copy-btn" onClick={() => copyFix(c.key, fix)}>
                                  {copied === c.key ? "✓ Copied!" : "Copy fix"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {!result && !error && !loading && !noCredits && (
        <div className="audit-coming-soon">
          <h3>Ready to audit</h3>
          <p>Enter a URL above and click "Run AI Audit" to check your AI engine visibility.</p>
        </div>
      )}
    </div>
      )}
    </div>
  );
}