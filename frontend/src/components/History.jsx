import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const BASE = "https://dablin-backend-production.up.railway.app";

const SEO_LABELS = {
  meta: "Meta description", schema: "Schema markup", alt: "Image alt text",
  headings: "Heading structure", wordCount: "Word count", canonical: "Canonical tag",
  robots: "Robots tag", og: "Open Graph tags", viewport: "Mobile viewport",
  productSchema: "Product schema", breadcrumb: "Breadcrumb schema",
  reviewSchema: "Review schema", internalLinks: "Internal links",
};

const AI_LABELS = {
  llmsTxt: "llms.txt file", aiCrawlers: "AI crawlers allowed",
  orgSchema: "Organization schema", sameAs: "sameAs links",
  siteName: "WebSite schema", h1: "Clear H1", metaDesc: "Meta description",
  noAiBlock: "No noai tag", canonical: "Canonical URL",
  openGraph: "Open Graph tags", speed: "Fast response", https: "HTTPS",
};

function EmptySection({ icon, text }) {
  return (
    <div style={{ background: '#f7fbf7', border: '1px solid #d4e8d6', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', color: '#5a7a5e' }}>
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '14px' }}>{text}</div>
    </div>
  );
}

export default function History() {
  const { getToken } = useAuth();
  const [descriptions, setDescriptions] = useState([]);
  const [seoAudits, setSeoAudits] = useState([]);
  const [aiAudits, setAiAudits] = useState([]);
  const [visChecks, setVisChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState("visibility-check");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [histRes, auditRes, visRes] = await Promise.all([
        fetch(`${BASE}/api/history`, { headers }),
        fetch(`${BASE}/api/audit-history?limit=100`, { headers }),
        fetch(`${BASE}/api/visibility-check-history`, { headers }),
      ]);
      const histData  = await histRes.json();
      const auditData = await auditRes.json();
      const visData   = await visRes.json();
      setDescriptions(histData.items || []);
      const allAudits = auditData.items || [];
      setSeoAudits(allAudits.filter(a => {
        const keys = Object.keys(a.checks || {});
        return !keys.includes('llmsTxt') && !keys.includes('aiCrawlers');
      }));
      setAiAudits(allAudits.filter(a => {
        const keys = Object.keys(a.checks || {});
        return keys.includes('llmsTxt') || keys.includes('aiCrawlers');
      }));
      setVisChecks(visData.items || []);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="page-loading">Loading history...</div>;

  function toggle(key) { setExpanded(expanded === key ? null : key); }

  const TABS = [
    { id: "visibility-check", label: "AI Visibility Check", count: visChecks.filter(v => !v.from_prompt).length },
    { id: "query-check",      label: "AI Query Check",      count: visChecks.filter(v => v.from_prompt).length  },
    { id: "visibility-audit", label: "AI Visibility Audit", count: aiAudits.length  },
    { id: "seo-audit",        label: "SEO Audit",           count: seoAudits.length },
    { id: "generation",       label: "Product Generation",  count: descriptions.length },
  ];

  return (
    <div className="history-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;800&display=swap');
        .history-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 2px solid #d4e8d6; overflow-x: auto; }
        .history-tab { padding: 12px 20px; font-size: 13px; font-weight: 600; color: #5a7a5e; background: none; border: none; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; white-space: nowrap; text-align: left; }
        .history-tab.active { color: #2d7a3a; border-bottom-color: #2d7a3a; }
        .history-tab:hover { color: #2d7a3a; }
        .history-tab-count { display: block; font-size: 11px; font-weight: 500; color: #9ab09c; margin-top: 2px; }
        .history-tab.active .history-tab-count { color: #5a7a5e; }
        .h-card { border: 1px solid #d4e8d6; border-radius: 12px; overflow: hidden; margin-bottom: 10px; background: white; }
        .h-card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; cursor: pointer; transition: background 0.15s; gap: 12px; }
        .h-card-header:hover { background: #f7fbf7; }
        .h-card-left { flex: 1; min-width: 0; }
        .h-card-title { font-size: 14px; font-weight: 600; color: #1c2e1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .h-card-sub { font-size: 12px; color: #5a7a5e; margin-top: 2px; }
        .h-card-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .h-score { font-size: 13px; font-weight: 700; }
        .h-date { font-size: 12px; color: #5a7a5e; }
        .h-chevron { font-size: 11px; color: #9ab09c; }
        .h-body { padding: 4px 18px 16px; border-top: 1px solid #e8f5ea; }
        .h-field { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f0f7f1; gap: 16px; }
        .h-field:last-child { border-bottom: none; }
        .h-field-label { font-size: 12px; color: #5a7a5e; font-weight: 500; flex-shrink: 0; }
        .h-field-value { font-size: 12px; color: #1c2e1e; text-align: right; }
        .h-tags { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; }
        .h-tag { font-size: 11px; background: #e8f5ea; border: 1px solid #c8e6cb; color: #2d7a3a; padding: 2px 8px; border-radius: 100px; }
        .h-mention-row { display: flex; gap: 12px; padding: 12px 0 8px; }
        .h-mention-box { flex: 1; text-align: center; background: #f7fbf7; border-radius: 8px; padding: 10px 6px; }
        .h-mention-engine { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .h-mention-count { font-size: 20px; font-weight: 800; font-family: 'Roboto Condensed', sans-serif; }
        .h-page-sub { font-size: 13px; color: #5a7a5e; margin-bottom: 20px; }
        .h-page-sub strong { color: #1c2e1e; }
      `}</style>

      {/* Tabs */}
      <div className="history-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`history-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => { setActiveTab(tab.id); setExpanded(null); }}
          >
            {tab.label}
            <span className="history-tab-count">{tab.count} runs</span>
          </button>
        ))}
      </div>

      {/* AI VISIBILITY CHECK */}
      {activeTab === "visibility-check" && (
        <>
          {visChecks.filter(v => !v.from_prompt).length === 0 ? (
            <EmptySection icon="◎" text="No AI Visibility Checks yet. Run one to see which AI engines mention your brand." />
          ) : visChecks.filter(v => !v.from_prompt).map((vc, i) => {
            const key = `vc-${i}`;
            const isOpen = expanded === key;
            const ms = vc.mention_summary || {};
            const total = (ms.claude || 0) + (ms.gpt || 0) + (ms.gemini || 0);
            const competitors = vc.top_competitors || [];
            return (
              <div className="h-card" key={vc.id}>
                <div className="h-card-header" onClick={() => toggle(key)}>
                  <div className="h-card-left">
                    <div className="h-card-title">{vc.url || vc.brand}</div>
                    <div className="h-card-sub">Brand: {vc.brand} · {total} total mentions</div>
                  </div>
                  <div className="h-card-right">
                    <span className="h-date">{new Date(vc.created_at).toLocaleDateString()}</span>
                    <span className="h-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="h-body">
                    <div className="h-mention-row">
                      {[
                        { label: 'Claude', count: ms.claude || 0, color: '#c67b2f' },
                        { label: 'GPT-4o', count: ms.gpt || 0, color: '#10a37f' },
                        { label: 'Gemini', count: ms.gemini || 0, color: '#4285f4' },
                      ].map(({ label, count, color }) => (
                        <div className="h-mention-box" key={label}>
                          <div className="h-mention-engine" style={{ color }}>{label}</div>
                          <div className="h-mention-count" style={{ color: count > 0 ? '#2d7a3a' : '#c0392b' }}>{count}/7</div>
                          <div style={{ fontSize: '10px', color: '#5a7a5e' }}>mentions</div>
                        </div>
                      ))}
                    </div>
                    {competitors.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Competitors spotted</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {competitors.map(({ name, count }) => (
                            <span key={name} style={{ fontSize: '11px', background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', padding: '2px 8px', borderRadius: '100px' }}>
                              {name} <span style={{ opacity: 0.6 }}>{count}×</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* AI QUERY CHECK */}
      {activeTab === "query-check" && (
        <>
          {visChecks.filter(v => v.from_prompt).length === 0 ? (
            <EmptySection icon="↗" text="No AI Query Checks yet. Use AI Query Check to run custom queries across AI engines." />
          ) : visChecks.filter(v => v.from_prompt).map((vc, i) => {
            const key = `qc-${i}`;
            const isOpen = expanded === key;
            const ms = vc.mention_summary || {};
            const total = (ms.claude || 0) + (ms.gpt || 0) + (ms.gemini || 0);
            const competitors = vc.top_competitors || [];
            const queries = vc.queries || [];
            return (
              <div className="h-card" key={vc.id}>
                <div className="h-card-header" onClick={() => toggle(key)}>
                  <div className="h-card-left">
                    <div className="h-card-title">Brand: {vc.brand}</div>
                    <div className="h-card-sub">{queries.length} queries · {total} total mentions</div>
                  </div>
                  <div className="h-card-right">
                    <span className="h-date">{new Date(vc.created_at).toLocaleDateString()}</span>
                    <span className="h-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="h-body">
                    <div className="h-mention-row">
                      {[
                        { label: 'Claude', count: ms.claude || 0, color: '#c67b2f' },
                        { label: 'GPT-4o', count: ms.gpt || 0, color: '#10a37f' },
                        { label: 'Gemini', count: ms.gemini || 0, color: '#4285f4' },
                      ].map(({ label, count, color }) => (
                        <div className="h-mention-box" key={label}>
                          <div className="h-mention-engine" style={{ color }}>{label}</div>
                          <div className="h-mention-count" style={{ color: count > 0 ? '#2d7a3a' : '#c0392b' }}>{count}/{queries.length || 7}</div>
                          <div style={{ fontSize: '10px', color: '#5a7a5e' }}>mentions</div>
                        </div>
                      ))}
                    </div>
                    {queries.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Queries used</div>
                        {queries.map((q, qi) => (
                          <div key={qi} style={{ fontSize: '12px', color: '#1c2e1e', padding: '4px 0', borderBottom: qi < queries.length - 1 ? '1px solid #f0f7f1' : 'none' }}>
                            <span style={{ color: '#9ab09c', marginRight: '6px' }}>›</span>{q}
                          </div>
                        ))}
                      </div>
                    )}
                    {competitors.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Competitors spotted</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {competitors.map(({ name, count }) => (
                            <span key={name} style={{ fontSize: '11px', background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', padding: '2px 8px', borderRadius: '100px' }}>
                              {name} <span style={{ opacity: 0.6 }}>{count}×</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* AI VISIBILITY AUDIT */}
      {activeTab === "visibility-audit" && (
        <>
          {aiAudits.length === 0 ? (
            <EmptySection icon="⌕" text="No AI Visibility Audits yet." />
          ) : aiAudits.map((audit, i) => {
            const key = `ai-${i}`;
            const isOpen = expanded === key;
            const checks = audit.checks || {};
            const issues = audit.issues || {};
            const passed = Object.values(checks).filter(Boolean).length;
            const total  = Object.keys(checks).length || 12;
            const score  = Math.round((passed / total) * 100);
            return (
              <div className="h-card" key={audit.id}>
                <div className="h-card-header" onClick={() => toggle(key)}>
                  <div className="h-card-left">
                    <div className="h-card-title">{audit.url}</div>
                    <div className="h-card-sub">{passed}/{total} checks passed</div>
                  </div>
                  <div className="h-card-right">
                    <span className="h-score" style={{ color: score >= 75 ? '#2d7a3a' : score >= 50 ? '#e08a00' : '#c0392b' }}>{score}%</span>
                    <span className="h-date">{new Date(audit.created_at).toLocaleDateString()}</span>
                    <span className="h-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="h-body">
                    {Object.entries(checks).map(([k, p]) => (
                      <div className="h-field" key={k}>
                        <span className="h-field-label">{AI_LABELS[k] || k}</span>
                        <span className="h-field-value" style={{ color: p ? '#2d7a3a' : '#c0392b' }}>{p ? '✓ Pass' : `✗ ${issues[k] || 'Fail'}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* SEO AUDIT */}
      {activeTab === "seo-audit" && (
        <>
          {seoAudits.length === 0 ? (
            <EmptySection icon="✓" text="No SEO Audits yet." />
          ) : seoAudits.map((audit, i) => {
            const key = `seo-${i}`;
            const isOpen = expanded === key;
            const checks = audit.checks || {};
            const issues = audit.issues || {};
            const passed = Object.values(checks).filter(Boolean).length;
            const total  = Object.keys(checks).length || 13;
            const score  = Math.round((passed / total) * 100);
            return (
              <div className="h-card" key={audit.id}>
                <div className="h-card-header" onClick={() => toggle(key)}>
                  <div className="h-card-left">
                    <div className="h-card-title">{audit.url}</div>
                    <div className="h-card-sub">{passed}/{total} checks passed</div>
                  </div>
                  <div className="h-card-right">
                    <span className="h-score" style={{ color: score >= 75 ? '#2d7a3a' : score >= 50 ? '#e08a00' : '#c0392b' }}>{score}%</span>
                    <span className="h-date">{new Date(audit.created_at).toLocaleDateString()}</span>
                    <span className="h-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="h-body">
                    {Object.entries(checks).map(([k, p]) => (
                      <div className="h-field" key={k}>
                        <span className="h-field-label">{SEO_LABELS[k] || k}</span>
                        <span className="h-field-value" style={{ color: p ? '#2d7a3a' : '#c0392b' }}>{p ? '✓ Pass' : `✗ ${issues[k] || 'Fail'}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* PRODUCT GENERATION */}
      {activeTab === "generation" && (
        <>
          {descriptions.length === 0 ? (
            <EmptySection icon="✦" text="No product descriptions generated yet." />
          ) : descriptions.map((item, i) => {
            const key = `desc-${i}`;
            const isOpen = expanded === key;
            const input  = item.input_json  || {};
            const output = item.output_json || {};
            return (
              <div className="h-card" key={item.id}>
                <div className="h-card-header" onClick={() => toggle(key)}>
                  <div className="h-card-left">
                    <div className="h-card-title">{input.productName || 'Untitled'}</div>
                    <div className="h-card-sub">{input.category}{input.tone ? ` · ${input.tone}` : ''}</div>
                  </div>
                  <div className="h-card-right">
                    <span className="h-date">{new Date(item.created_at).toLocaleDateString()}</span>
                    <span className="h-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="h-body">
                    <div className="h-field">
                      <span className="h-field-label">Title</span>
                      <span className="h-field-value">{output.title}</span>
                    </div>
                    <div className="h-field">
                      <span className="h-field-label">Meta</span>
                      <span className="h-field-value">{output.meta_description}</span>
                    </div>
                    {output.tags?.length > 0 && (
                      <div className="h-field">
                        <span className="h-field-label">Tags</span>
                        <div className="h-tags">
                          {output.tags.map((t, j) => <span key={j} className="h-tag">{t}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}


  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const BASE = "https://dablin-backend-production.up.railway.app";

      const [histRes, auditRes] = await Promise.all([
        fetch(`${BASE}/api/history`, { headers }),
        fetch(`${BASE}/api/audit-history`, { headers }),
      ]);

      const histData  = await histRes.json();
      const auditData = await auditRes.json();

      setItems(histData.items || []);
      setAudits(auditData.items || []);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="page-loading">Loading history...</div>;

  return (
    <div className="history-page">
      <style>{`
        .history-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 2px solid #d4e8d6; }
        .history-tab {
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          color: #5a7a5e;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        .history-tab.active { color: #2d7a3a; border-bottom-color: #2d7a3a; }
        .history-tab:hover { color: #2d7a3a; }
        .audit-history-empty {
          background: #f7fbf7;
          border: 1px solid #d4e8d6;
          border-radius: 14px;
          padding: 48px 24px;
          text-align: center;
          color: #5a7a5e;
        }
        .audit-history-empty h3 { font-size: 18px; font-weight: 700; color: #0f1a10; margin-bottom: 8px; }
      `}</style>

      <div className="history-tabs">
        <button
          className={`history-tab ${activeTab === "descriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("descriptions")}
        >
          Descriptions {items.length > 0 && `(${items.length})`}
        </button>
        <button
          className={`history-tab ${activeTab === "audits" ? "active" : ""}`}
          onClick={() => setActiveTab("audits")}
        >
          SEO Audits {audits.length > 0 && `(${audits.length})`}
        </button>
      </div>

      {activeTab === "descriptions" && (
        <>
          {items.length === 0 ? (
            <div className="empty-page">
              <div className="empty-icon">📋</div>
              <h2>No generations yet</h2>
              <p>Your generated descriptions will appear here</p>
            </div>
          ) : (
            <>
              <p className="page-sub">{items.length} descriptions generated · <strong>{items.length} credits used</strong></p>
              <div className="history-list">
                {items.map((item, i) => {
                  const input  = item.input_json;
                  const output = item.output_json;
                  const isOpen = expanded === i;
                  return (
                    <div className={`history-card ${isOpen ? "open" : ""}`} key={item.id}>
                      <div className="history-card-header" onClick={() => setExpanded(isOpen ? null : i)}>
                        <div className="history-meta">
                          <span className="history-name">{input.productName}</span>
                          <span className="history-category">{input.category}</span>
                        </div>
                        <div className="history-right">
                          <span className="history-date">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <span className="history-chevron">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="history-card-body">
                          <div className="history-field">
                            <span className="history-label">Title</span>
                            <span className="history-value">{output.title}</span>
                          </div>
                          <div className="history-field">
                            <span className="history-label">Meta</span>
                            <span className="history-value">{output.meta_description}</span>
                          </div>
                          <div className="history-field">
                            <span className="history-label">Tags</span>
                            <div className="tags-row">
                              {output.tags?.map((t, j) => (
                                <span key={j} className="tag-chip">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "audits" && (
        <>
          {audits.length === 0 ? (
            <div className="audit-history-empty">
              <h3>No audits yet</h3>
              <p>Run an SEO audit from the Audit tab and your results will appear here.</p>
            </div>
          ) : (
            <>
              <p className="page-sub">{audits.length} audits run · <strong>{audits.length * 7} credits used</strong></p>
              <div className="history-list">
                {audits.map((audit, i) => {
                  const checks = audit.checks || {};
                  const issues = audit.issues || {};
                  const score  = Object.values(checks).filter(Boolean).length;
                  const total  = Object.keys(checks).length || 4;
                  const isOpen = expanded === `audit-${i}`;
                  const checkLabels = { meta: "Meta description", schema: "Schema markup", alt: "Image alt text", headings: "Heading structure" };
                  return (
                    <div className={`history-card ${isOpen ? "open" : ""}`} key={audit.id}>
                      <div className="history-card-header" onClick={() => setExpanded(isOpen ? null : `audit-${i}`)}>
                        <div className="history-meta">
                          <span className="history-name" style={{ fontSize: "13px", wordBreak: "break-all" }}>{audit.url}</span>
                        </div>
                        <div className="history-right">
                          <span style={{
                            fontWeight: 700,
                            fontSize: "13px",
                            color: score === total ? "#2d7a3a" : score >= total / 2 ? "#e08a00" : "#c0392b"
                          }}>{score}/{total}</span>
                          <span className="history-date" style={{ marginLeft: "12px" }}>
                            {new Date(audit.created_at).toLocaleDateString()}
                          </span>
                          <span className="history-chevron">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="history-card-body">
                          {Object.entries(checks).map(([key, passed]) => (
                            <div className="history-field" key={key}>
                              <span className="history-label">{checkLabels[key] || key}</span>
                              <span className="history-value" style={{ color: passed ? "#2d7a3a" : "#c0392b" }}>
                                {passed ? "✓ Pass" : `✗ ${issues[key] || "Fail"}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
