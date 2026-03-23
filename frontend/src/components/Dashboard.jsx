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

function scoreColor(score) {
  if (score >= 75) return '#2d7a3a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function scoreBg(score) {
  if (score >= 75) return '#e8f5ea';
  if (score >= 50) return '#fff8e1';
  return '#fef2f2';
}

function typeLabel(type) {
  if (type === 'ai') return 'AI Visibility Audit';
  if (type === 'visibility') return 'AI Visibility Check';
  return 'SEO Audit';
}

function typeBadgeClass(type) {
  if (type === 'ai') return 'db-type-ai';
  if (type === 'visibility') return 'db-type-visibility';
  return 'db-type-seo';
}

function ScoreCircle({ score, size = 56 }) {
  const color = scoreColor(score);
  const bg = scoreBg(score);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid ${color}`, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Roboto Condensed', sans-serif",
      fontSize: size * 0.28, fontWeight: '800', color, flexShrink: 0,
    }}>{score}%</div>
  );
}

export default function Dashboard({ setPage }) {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchDashboard(); }, []);

  async function fetchDashboard() {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Dashboard fetch failed", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#5a7a5e' }}>Loading dashboard...</div>;

  const hasData = data?.urls?.length > 0;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px', fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;800&display=swap');
        .db-stat-card { background: #f7fbf7; border: 1px solid #d4e8d6; border-radius: 12px; padding: 20px 24px; text-align: center; }
        .db-stat-num { font-family: 'Roboto Condensed', sans-serif; font-size: 36px; font-weight: 800; color: #2d7a3a; }
        .db-stat-label { font-size: 13px; color: #5a7a5e; margin-top: 4px; }
        .db-url-card { border: 1px solid #d4e8d6; border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
        .db-url-header { display: flex; align-items: center; gap: 16px; padding: 20px 24px; background: #f7fbf7; cursor: pointer; transition: background 0.15s; }
        .db-url-header:hover { background: #eef7ef; }
        .db-url-info { flex: 1; min-width: 0; }
        .db-url-text { font-size: 13px; color: #1c2e1e; font-weight: 600; word-break: break-all; margin-bottom: 4px; }
        .db-url-meta { font-size: 12px; color: #5a7a5e; }
        .db-type-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 3px 10px; border-radius: 100px; flex-shrink: 0; }
        .db-type-seo { background: #e8f5ea; color: #2d7a3a; }
        .db-type-ai { background: #ede9fe; color: #6d28d9; }
        .db-type-visibility { background: #fef3c7; color: #d97706; }
        .db-improvement { font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .db-timeline { padding: 0 24px 24px; }
        .db-run { display: flex; gap: 16px; margin-top: 16px; position: relative; }
        .db-run-line { position: absolute; left: 27px; top: 56px; bottom: -16px; width: 2px; background: #d4e8d6; }
        .db-run:last-child .db-run-line { display: none; }
        .db-run-content { flex: 1; background: white; border: 1px solid #d4e8d6; border-radius: 10px; padding: 16px; }
        .db-run-date { font-size: 11px; color: #5a7a5e; margin-bottom: 8px; }
        .db-run-score-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .db-run-score-label { font-size: 13px; font-weight: 600; color: #1c2e1e; }
        .db-run-bar { flex: 1; height: 8px; background: #e8f5ea; border-radius: 4px; overflow: hidden; }
        .db-fixed-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .db-fixed-chip { font-size: 11px; background: #e8f5ea; border: 1px solid #c8e6cb; color: #2d7a3a; padding: 3px 10px; border-radius: 100px; font-weight: 500; }
        .db-issue-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
        .db-issue-item { font-size: 12px; color: #c0392b; display: flex; gap: 6px; align-items: flex-start; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '26px', fontWeight: '800', color: '#0f1a10', marginBottom: '6px' }}>Dashboard</h2>
        <p style={{ fontSize: '14px', color: '#5a7a5e' }}>Track your SEO and AI visibility progress over time.</p>
      </div>

      {/* Stats row */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          <div className="db-stat-card">
            <div className="db-stat-num">{data.totalAudits}</div>
            <div className="db-stat-label">Total audits run</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-num">{data.urls?.length || 0}</div>
            <div className="db-stat-label">URLs tracked</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-num">{data.totalDescriptions}</div>
            <div className="db-stat-label">Descriptions generated</div>
          </div>
        </div>
      )}

      {!hasData ? (
        <div style={{ background: '#f7fbf7', border: '1px solid #d4e8d6', borderRadius: '14px', padding: '48px 24px', textAlign: 'center', color: '#5a7a5e' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f1a10', marginBottom: '8px' }}>No audit data yet</div>
          <div style={{ fontSize: '14px', marginBottom: '24px' }}>Run your first SEO or AI Visibility Audit to start tracking your progress.</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setPage('audit')} style={{ background: '#2d7a3a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Run SEO Audit</button>
            <button onClick={() => setPage('ai')} style={{ background: '#6d28d9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Run AI Visibility Audit</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            Tracked URLs ({data.urls.length})
          </div>
          {data.urls.map((urlData, i) => {
            const isOpen = expanded === i;
            const improvement = urlData.improvement;
            const checkLabels = urlData.type === 'ai' ? AI_LABELS : SEO_LABELS;

            return (
              <div className="db-url-card" key={urlData.url + i}>
                <div className="db-url-header" onClick={() => setExpanded(isOpen ? null : i)}>
                  <ScoreCircle score={urlData.latestScore} />
                  <div className="db-url-info">
                    <div className="db-url-text">{urlData.url}</div>
                    <div className="db-url-meta">{urlData.runs} run{urlData.runs > 1 ? 's' : ''} · Latest: {new Date(urlData.timeline[urlData.timeline.length - 1].date).toLocaleDateString()}</div>
                  </div>
                  <span className={`db-type-badge ${typeBadgeClass(urlData.type)}`}>
                    {typeLabel(urlData.type)}
                  </span>
                  {urlData.runs > 1 && (
                    <div className="db-improvement" style={{ color: improvement > 0 ? '#2d7a3a' : improvement < 0 ? '#dc2626' : '#5a7a5e' }}>
                      {improvement > 0 ? `+${improvement}%` : improvement < 0 ? `${improvement}%` : '—'}
                    </div>
                  )}
                  <span style={{ fontSize: '12px', color: '#5a7a5e' }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {isOpen && (
                  <div className="db-timeline">
                    {urlData.timeline.map((run, ri) => (
                      <div className="db-run" key={run.id}>
                        {ri < urlData.timeline.length - 1 && <div className="db-run-line" />}
                        <ScoreCircle score={run.score} size={56} />
                        <div className="db-run-content">
                          <div className="db-run-date">
                            {new Date(run.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {ri === urlData.timeline.length - 1 && <span style={{ marginLeft: '8px', background: '#2d7a3a', color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>Latest</span>}
                          </div>
                          <div className="db-run-score-row">
                            <div className="db-run-score-label">{run.passed}/{run.total} checks passed</div>
                            <div className="db-run-bar">
                              <div style={{ height: '100%', width: `${run.score}%`, background: scoreColor(run.score), borderRadius: '4px', transition: 'width 0.6s ease' }} />
                            </div>
                          </div>

                          {/* Fixed since previous run */}
                          {run.fixed?.length > 0 && (
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: '700', color: '#2d7a3a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>✓ Fixed issues</div>
                              <div className="db-fixed-list">
                                {run.fixed.map(key => (
                                  <span className="db-fixed-chip" key={key}>{checkLabels[key] || key}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Remaining issues */}
                          {run.issues?.length > 0 && (
                            <div style={{ marginTop: run.fixed?.length > 0 ? '12px' : '0' }}>
                              <div style={{ fontSize: '11px', fontWeight: '700', color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>✗ Remaining issues</div>
                              <div className="db-issue-list">
                                {run.issues.slice(0, 5).map(({ key, msg }) => (
                                  <div className="db-issue-item" key={key}>
                                    <span style={{ flexShrink: 0 }}>•</span>
                                    <span><strong>{checkLabels[key] || key}:</strong> {msg}</span>
                                  </div>
                                ))}
                                {run.issues.length > 5 && <div style={{ fontSize: '12px', color: '#5a7a5e', marginTop: '2px' }}>+{run.issues.length - 5} more issues</div>}
                              </div>
                            </div>
                          )}

                          {run.issues?.length === 0 && (
                            <div style={{ fontSize: '13px', color: '#2d7a3a', fontWeight: '600', marginTop: '4px' }}>🎉 All checks passed</div>
                          )}
                        </div>
                      </div>
                    ))}
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
