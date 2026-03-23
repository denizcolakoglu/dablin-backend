import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

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

function scoreColor(s) { return s >= 75 ? '#2d7a3a' : s >= 50 ? '#d97706' : '#dc2626'; }
function scoreBg(s)    { return s >= 75 ? '#e8f5ea' : s >= 50 ? '#fff8e1' : '#fef2f2'; }

export default function SharedResult() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/share/${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError("Failed to load result"))
      .finally(() => setLoading(false));
  }, [token]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const typeLabel = {
    'visibility-check': 'AI Visibility Check',
    'ai-audit': 'AI Visibility Audit',
    'seo-audit': 'SEO Audit',
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", minHeight: '100vh', background: '#f7fbf7' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --green: #2d7a3a; --green-light: #3d9e4e; --green-pale: #e8f5ea; --green-mid: #c8e6cb; --dark: #0f1a10; --muted: #5a7a5e; --border: #d4e8d6; }
        .sr-nav { background: white; border-bottom: 1px solid var(--border); padding: 16px 48px; display: flex; align-items: center; justify-content: space-between; }
        .sr-nav-brand { font-family: 'Roboto Condensed', sans-serif; font-size: 20px; font-weight: 800; color: var(--dark); text-decoration: none; display: flex; align-items: center; gap: 10px; }
        .sr-nav-actions { display: flex; gap: 12px; align-items: center; }
        .sr-copy-btn { display: flex; align-items: center; gap: 6px; background: white; border: 1px solid var(--border); color: var(--green); padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Roboto', sans-serif; }
        .sr-copy-btn:hover { background: var(--green-pale); }
        .sr-try-btn { background: var(--green); color: white; border: none; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Roboto', sans-serif; text-decoration: none; display: inline-block; }
        .sr-body { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
        .sr-header { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 28px; margin-bottom: 24px; }
        .sr-type-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px; border-radius: 100px; margin-bottom: 12px; }
        .sr-url { font-size: 15px; font-weight: 600; color: var(--dark); margin-bottom: 6px; word-break: break-all; }
        .sr-meta { font-size: 13px; color: var(--muted); }
        .sr-card { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 28px; margin-bottom: 20px; }
        .sr-section-title { font-family: 'Roboto Condensed', sans-serif; font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 16px; }
        .sr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .sr-table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); border-bottom: 2px solid var(--border); }
        .sr-table th.center { text-align: center; }
        .sr-table td { padding: 12px; border-bottom: 1px solid #e8f5ea; vertical-align: top; }
        .sr-table tr:hover { background: #f7fbf7; cursor: pointer; }
        .sr-mention { font-size: 16px; font-weight: 700; }
        .sr-snippet { font-size: 12px; color: var(--muted); font-style: italic; line-height: 1.5; margin-top: 6px; background: #f7fbf7; border: 1px solid #e8f5ea; border-radius: 6px; padding: 8px 10px; }
        .sr-summary-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 24px; }
        .sr-summary-card { background: #f7fbf7; border: 1px solid var(--border); border-radius: 10px; padding: 16px; text-align: center; }
        .sr-engine { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        .sr-score { font-size: 26px; font-weight: 800; font-family: 'Roboto Condensed', sans-serif; }
        .sr-score-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .sr-check-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f0f7f1; gap: 16px; }
        .sr-check-row:last-child { border-bottom: none; }
        .sr-check-label { font-size: 13px; color: var(--muted); font-weight: 500; flex-shrink: 0; }
        .sr-check-value { font-size: 13px; font-weight: 600; text-align: right; }
        .sr-score-circle { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Roboto Condensed', sans-serif; font-size: 20px; font-weight: 800; flex-shrink: 0; border: 3px solid; }
        .sr-score-row { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .sr-score-info h3 { font-family: 'Roboto Condensed', sans-serif; font-size: 20px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
        .sr-competitors { background: #f7fbf7; border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-top: 20px; }
        .sr-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .sr-chip { border-radius: 100px; padding: 4px 12px; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
        .sr-branding { text-align: center; padding: 40px 24px; color: var(--muted); font-size: 13px; }
        .sr-branding a { color: var(--green); font-weight: 600; text-decoration: none; }
        @media (max-width: 768px) {
          .sr-nav { padding: 14px 20px; }
          .sr-body { padding: 24px 16px; }
          .sr-summary-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav className="sr-nav">
        <a href="https://dablin.co" className="sr-nav-brand">
          <img src="https://dablin.co/logo.svg" alt="Dablin" height="40" />
        </a>
        <div className="sr-nav-actions">
          <a href="https://dablin.co" className="sr-try-btn">Try Dablin free →</a>
        </div>
      </nav>

      <div className="sr-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>◎</div>
            Loading result…
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#dc2626' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠</div>
            <div style={{ fontWeight: '600', marginBottom: '6px' }}>{error === 'Result not found or expired' ? 'This link has expired or doesn\'t exist.' : error}</div>
            <div style={{ fontSize: '13px', color: '#5a7a5e', marginTop: '8px' }}>Links expire after 30 days. <a href="https://dablin.co" style={{ color: 'var(--green)', fontWeight: '600' }}>Run a new check →</a></div>
          </div>
        )}

        {data && (() => {
          const result = data.data;
          const type = data.type;
          const createdAt = new Date(data.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          const expiresAt = new Date(data.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

          const badgeColors = {
            'visibility-check': { bg: '#fff8e1', color: '#d97706' },
            'ai-audit': { bg: '#ede9fe', color: '#6d28d9' },
            'seo-audit': { bg: '#e8f5ea', color: '#2d7a3a' },
          };
          const badge = badgeColors[type] || badgeColors['seo-audit'];

          return (
            <>
              {/* Header */}
              <div className="sr-header">
                <div className="sr-type-badge" style={{ background: badge.bg, color: badge.color }}>
                  {typeLabel[type]}
                </div>
                <div className="sr-url">{result.url}</div>
                <div className="sr-meta">Generated {createdAt} · Expires {expiresAt} · Powered by <a href="https://dablin.co" style={{ color: 'var(--green)', fontWeight: '600' }}>Dablin</a></div>
              </div>

              {/* VISIBILITY CHECK */}
              {type === 'visibility-check' && (
                <>
                  <div className="sr-card">
                    <div className="sr-section-title">Brand: {result.brand}</div>
                    <div className="sr-summary-grid">
                      {[
                        { label: 'Claude',  count: result.mentionSummary?.claude, color: '#c67b2f' },
                        { label: 'GPT-4o',  count: result.mentionSummary?.gpt,    color: '#10a37f' },
                        { label: 'Gemini',  count: result.mentionSummary?.gemini, color: '#4285f4' },
                      ].map(({ label, count, color }) => (
                        <div className="sr-summary-card" key={label}>
                          <div className="sr-engine" style={{ color }}>{label}</div>
                          <div className="sr-score" style={{ color: count > 0 ? '#2d7a3a' : '#dc2626' }}>{count || 0}/{result.queries?.length || 7}</div>
                          <div className="sr-score-label">queries mentioned</div>
                        </div>
                      ))}
                    </div>

                    <table className="sr-table">
                      <thead>
                        <tr>
                          <th>Query</th>
                          <th className="center">Claude</th>
                          <th className="center">GPT-4o</th>
                          <th className="center">Gemini</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(result.results || []).map((row, i) => {
                          const allBrands    = [...new Set([...(row.claude?.brands||[]), ...(row.gpt?.brands||[]), ...(row.gemini?.brands||[])])];
                          const allPlatforms = [...new Set([...(row.claude?.platforms||[]), ...(row.gpt?.platforms||[]), ...(row.gemini?.platforms||[])])];
                          const isOpen = expandedRow === i;
                          return (
                            <>
                              <tr key={i} onClick={() => setExpandedRow(isOpen ? null : i)}>
                                <td>
                                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--dark)' }}>{row.query}</div>
                                  {(allBrands.length > 0 || allPlatforms.length > 0) && (
                                    <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                      {allBrands.map(c => <span key={c} style={{ fontSize:'10px', background:'#fff3e0', border:'1px solid #ffe0b2', borderRadius:'100px', padding:'2px 8px', color:'#e65100', fontWeight:'500' }}>{c}</span>)}
                                      {allPlatforms.map(c => <span key={c} style={{ fontSize:'10px', background:'#e8f0fe', border:'1px solid #c5cae9', borderRadius:'100px', padding:'2px 8px', color:'#3949ab', fontWeight:'500' }}>📖 {c}</span>)}
                                    </div>
                                  )}
                                </td>
                                <td style={{ textAlign:'center' }}><span className="sr-mention" style={{ color: row.claude?.mentioned ? '#2d7a3a' : '#dc2626' }}>{row.claude?.mentioned ? '✓' : '✗'}</span></td>
                                <td style={{ textAlign:'center' }}><span className="sr-mention" style={{ color: row.gpt?.mentioned ? '#2d7a3a' : '#dc2626' }}>{row.gpt?.mentioned ? '✓' : '✗'}</span></td>
                                <td style={{ textAlign:'center' }}><span className="sr-mention" style={{ color: row.gemini?.mentioned ? '#2d7a3a' : '#dc2626' }}>{row.gemini?.mentioned ? '✓' : '✗'}</span></td>
                              </tr>
                              {isOpen && (
                                <tr key={`${i}-exp`}>
                                  <td colSpan={4} style={{ background:'#f7fbf7', padding:'12px 16px 16px' }}>
                                    {[{label:'Claude',data:row.claude,color:'#c67b2f'},{label:'GPT-4o',data:row.gpt,color:'#10a37f'},{label:'Gemini',data:row.gemini,color:'#4285f4'}].map(({label,data,color},ai) => (
                                      <div key={label} style={{ marginTop:ai>0?'12px':'0', borderTop:ai>0?'1px solid #e8f5ea':'none', paddingTop:ai>0?'12px':'0' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                                          <span style={{ fontSize:'11px', fontWeight:'700', color, textTransform:'uppercase', letterSpacing:'0.8px' }}>{label}</span>
                                          {data?.mentioned && <span style={{ fontSize:'10px', background:'#e8f5ea', color:'#2d7a3a', border:'1px solid #c8e6cb', borderRadius:'100px', padding:'1px 8px', fontWeight:'600' }}>✓ Mentioned</span>}
                                        </div>
                                        <div className="sr-snippet">{data?.snippet ? `${data.snippet}...` : <em style={{color:'#bbb'}}>No response captured</em>}</div>
                                        {(data?.brands||[]).length > 0 && (
                                          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginTop:'6px' }}>
                                            <span style={{ fontSize:'10px', color:'#5a7a5e', fontWeight:'600' }}>Competitors:</span>
                                            {data.brands.map(c => <span key={c} style={{ fontSize:'10px', background:'#fff3e0', border:'1px solid #ffe0b2', borderRadius:'100px', padding:'2px 8px', color:'#e65100', fontWeight:'500' }}>{c}</span>)}
                                          </div>
                                        )}
                                        {(data?.platforms||[]).length > 0 && (
                                          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginTop:'6px' }}>
                                            <span style={{ fontSize:'10px', color:'#5a7a5e', fontWeight:'600' }}>Sources:</span>
                                            {data.platforms.map(c => <span key={c} style={{ fontSize:'10px', background:'#e8f0fe', border:'1px solid #c5cae9', borderRadius:'100px', padding:'2px 8px', color:'#3949ab', fontWeight:'500' }}>📖 {c}</span>)}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>

                    {(result.topCompetitors||[]).length > 0 && (
                      <div className="sr-competitors">
                        <div style={{ fontSize:'13px', fontWeight:'700', color:'var(--dark)', marginBottom:'10px' }}>🏆 Competitors spotted in AI responses</div>
                        <div className="sr-chips">
                          {result.topCompetitors.map(({ name, count }) => (
                            <div key={name} style={{ background:'white', border:'1px solid var(--border)', borderRadius:'100px', padding:'5px 14px', fontSize:'13px', fontWeight:'500', display:'flex', alignItems:'center', gap:'6px' }}>
                              {name}<span style={{ fontSize:'11px', color:'var(--muted)' }}>{count}×</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* AUDIT (SEO or AI) */}
              {(type === 'seo-audit' || type === 'ai-audit') && (() => {
                const checks = result.checks || {};
                const issues = result.issues || {};
                const passed = Object.values(checks).filter(Boolean).length;
                const total  = Object.keys(checks).length || 12;
                const score  = Math.round((passed / total) * 100);
                const labels = type === 'ai-audit' ? AI_LABELS : SEO_LABELS;
                const statusLabel = score >= 75 ? (type === 'ai-audit' ? 'Good AI visibility' : 'Good SEO') : score >= 50 ? 'Needs improvement' : 'Critical issues found';
                return (
                  <div className="sr-card">
                    <div className="sr-score-row">
                      <div className="sr-score-circle" style={{ color: scoreColor(score), background: scoreBg(score), borderColor: scoreColor(score) }}>{score}%</div>
                      <div className="sr-score-info">
                        <h3>{statusLabel}</h3>
                        <div style={{ fontSize:'13px', color:'var(--muted)' }}>{passed}/{total} checks passed</div>
                      </div>
                    </div>
                    {Object.entries(checks).map(([k, p]) => (
                      <div className="sr-check-row" key={k}>
                        <span className="sr-check-label">{labels[k] || k}</span>
                        <span className="sr-check-value" style={{ color: p ? '#2d7a3a' : '#dc2626' }}>
                          {p ? '✓ Pass' : `✗ ${issues[k] || 'Fail'}`}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          );
        })()}

        {/* Branding footer */}
        {data && (
          <div className="sr-branding">
            <div style={{ marginBottom: '12px' }}>
              <img src="https://dablin.co/logo.svg" alt="Dablin" height="32" />
            </div>
            <div>This report was generated by <a href="https://dablin.co">Dablin</a> — AI Visibility Check · AI Visibility Audit · SEO Audit · Product Descriptions</div>
            <div style={{ marginTop: '8px' }}><a href="https://dablin.co">Try it free →</a></div>
          </div>
        )}
      </div>
    </div>
  );
}
