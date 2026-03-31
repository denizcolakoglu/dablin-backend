import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { trackEvent } from "../analytics";
import ShareButton from "./ShareButton";
import ToolHistory from "./ToolHistory";

const BASE = "https://dablin-backend-production.up.railway.app";

export default function VisibilityChecker({ setPage }) {
  const { getToken } = useAuth();
  const [url, setUrl] = useState("");
  const [activeToolTab, setActiveToolTab] = useState("tool");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [noBalance, setNoBalance] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [confirm, setConfirm] = useState(false);

  async function runCheck() {
    if (!url.trim()) return;
    if (!confirm) { setConfirm(true); return; }
    let fullUrl = url.trim();
    if (!fullUrl.startsWith("http")) fullUrl = "https://" + fullUrl;
    setLoading(true);
    setError(null);
    setResult(null);
    setNoBalance(false);
    setConfirm(false);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/visibility-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (res.status === 402) { setNoBalance(true); return; }
      if (!res.ok) { setError(data.error || "Check failed."); return; }
      setResult(data);
      trackEvent('visibility_check_completed', { url: fullUrl });
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily:"'Roboto',sans-serif" }}>
      <div style={{ display:"flex", borderBottom:"2px solid #d4e8d6" }}>
        {[["tool","AI Visibility Check"],["history","History"]].map(([id,label]) => (
          <button key={id} onClick={() => setActiveToolTab(id)}
            style={{ padding:"11px 24px", fontSize:"13px", fontWeight:"600",
              color: activeToolTab===id ? "#2d7a3a" : "#5a7a5e", background:"none", border:"none",
              cursor:"pointer", borderBottom: activeToolTab===id ? "2px solid #2d7a3a" : "2px solid transparent",
              marginBottom:"-2px", transition:"all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>
      {activeToolTab === "history" && <ToolHistory type="visibility-check" />}
      {activeToolTab === "tool" && (
    <div style={{ maxWidth:"720px", margin:"0 auto", padding:"40px 24px", fontFamily:"'Roboto',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@700;800&display=swap');
        .vc-url-input{flex:1;padding:12px 16px;border:1px solid #d4e8d6;border-radius:8px;font-size:14px;color:#1c2e1e;outline:none;transition:border 0.2s;font-family:'Roboto',sans-serif;}
        .vc-url-input:focus{border-color:#2d7a3a;}
        .vc-btn{background:#2d7a3a;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;font-family:'Roboto',sans-serif;}
        .vc-btn:hover:not(:disabled){background:#3d9e4e;}
        .vc-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .vc-confirm{background:#f0faf1;border:1.5px solid #2d7a3a;border-radius:10px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;}
        .vc-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:28px;}
        .vc-summary-card{background:#f7fbf7;border:1px solid #d4e8d6;border-radius:12px;padding:18px;text-align:center;}
        .vc-summary-engine{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;}
        .vc-summary-count{font-size:28px;font-weight:800;font-family:'Roboto Condensed',sans-serif;}
        .vc-summary-label{font-size:12px;color:#5a7a5e;margin-top:2px;}
        .vc-table{width:100%;border-collapse:collapse;margin-bottom:28px;font-size:13px;}
        .vc-table th{background:#f7fbf7;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#5a7a5e;text-transform:uppercase;letter-spacing:0.8px;border-bottom:2px solid #d4e8d6;}
        .vc-table th.center{text-align:center;}
        .vc-table td{padding:12px 14px;border-bottom:1px solid #eef5ef;vertical-align:middle;}
        .vc-table tr:hover{background:#f7fbf7;cursor:pointer;}
        .vc-table td.center{text-align:center;}
        .vc-mention{font-weight:700;font-size:15px;}
        .vc-expand-row td{background:#f7fbf7;padding:12px 16px;}
        .vc-snippet{font-size:12px;color:#5a7a5e;font-style:italic;line-height:1.5;background:white;border-radius:6px;padding:8px 10px;border:1px solid #eef5ef;margin-top:4px;}
        .vc-chip{display:inline-block;font-size:11px;font-weight:500;padding:2px 10px;border-radius:100px;margin:2px 3px 2px 0;}
        .vc-chip-orange{background:#fff3e0;border:1px solid #ffe0b2;color:#e65100;}
        .vc-chip-blue{background:#e8f0fe;border:1px solid #c5cae9;color:#3949ab;}
        .vc-competitors{background:#f7fbf7;border:1px solid #d4e8d6;border-radius:12px;padding:20px;margin-bottom:24px;}
        .vc-spinner{width:32px;height:32px;border:3px solid #d4e8d6;border-top-color:#2d7a3a;border-radius:50%;animation:vc-spin 0.9s linear infinite;}
        @keyframes vc-spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* Description */}
      <p style={{ fontSize:'15px', color:'#5a7a5e', marginBottom:'20px' }}>
        Enter your website URL and Dablin will automatically generate relevant search queries and check if ChatGPT, Gemini, and Claude mention your brand.
      </p>

      {/* URL input */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
        <input className="vc-url-input" type="url" placeholder="https://yoursite.com"
          value={url} onChange={e => { setUrl(e.target.value); setConfirm(false); }}
          onKeyDown={e => e.key === "Enter" && runCheck()} disabled={loading} />
        <button className="vc-btn" onClick={runCheck} disabled={loading || !url.trim()}>
          {loading ? "Checking…" : confirm ? "Confirm — €1.00" : "Check Visibility"}
        </button>
      </div>

      {/* Confirm banner */}
      {confirm && (
        <div className="vc-confirm">
          <div>
            <div style={{ fontSize:'14px', fontWeight:'700', color:'#1c2e1e' }}>This check costs €1.00</div>
            <div style={{ fontSize:'13px', color:'#5a7a5e', marginTop:'2px' }}>Queries Claude, GPT-4o, and Gemini with 7 search queries</div>
          </div>
          <button className="vc-btn" onClick={runCheck}>Confirm & Run</button>
        </div>
      )}

      {/* No balance */}
      {noBalance && (
        <div style={{ background:"#fffbeb", border:"1.5px solid #f59e0b", borderRadius:"12px", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px", marginBottom:"24px" }}>
          <div>
            <div style={{ fontSize:"15px", fontWeight:"700", color:"#92400e", marginBottom:"4px" }}>Not enough balance</div>
            <div style={{ fontSize:"13px", color:"#b45309" }}>AI Visibility Check costs €1.00. Add balance to continue.</div>
          </div>
          <button className="vc-btn" onClick={() => setPage("pricing")}>Add balance</button>
        </div>
      )}

      {error && (
        <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"8px", padding:"16px", color:"#ef4444", fontSize:"14px", marginBottom:"20px" }}>{error}</div>
      )}

      {loading && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', padding:'40px', color:'#5a7a5e', fontSize:'14px' }}>
          <div className="vc-spinner" />
          <div>Querying Claude, GPT-4o and Gemini — this takes ~20 seconds…</div>
        </div>
      )}

      {result && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
            <div style={{ display:'inline-block', background:'#e8f5ea', color:'#2d7a3a', border:'1px solid #c8e6cb', borderRadius:'100px', padding:'4px 14px', fontSize:'12px', fontWeight:'700' }}>
              Brand: {result.brand}
            </div>
            <ShareButton type="visibility-check" data={result} />
          </div>

          {/* Summary */}
          <div className="vc-summary">
            {[{ engine:"Claude", key:"claude", color:"#c67b2f" }, { engine:"GPT-4o", key:"gpt", color:"#10a37f" }, { engine:"Gemini", key:"gemini", color:"#4285f4" }].map(({ engine, key, color }) => (
              <div className="vc-summary-card" key={key}>
                <div className="vc-summary-engine" style={{ color }}>{engine}</div>
                <div className="vc-summary-count" style={{ color: result.mentionSummary[key] > 0 ? "#2d7a3a" : "#c0392b" }}>
                  {result.mentionSummary[key]}/{result.queries.length}
                </div>
                <div className="vc-summary-label">queries mentioned</div>
              </div>
            ))}
          </div>

          {/* Results table */}
          <table className="vc-table">
            <thead>
              <tr>
                <th>Query</th>
                <th className="center">Claude</th>
                <th className="center">GPT-4o</th>
                <th className="center">Gemini</th>
              </tr>
            </thead>
            <tbody>
              {result.results.map((row, i) => {
                const allBrands = [...new Set([...(row.claude.brands||[]), ...(row.gpt.brands||[]), ...(row.gemini.brands||[])])];
                const allPlatforms = [...new Set([...(row.claude.platforms||[]), ...(row.gpt.platforms||[]), ...(row.gemini.platforms||[])])];
                const isExpanded = expandedRow === i;
                return (
                  <>
                    <tr key={i} onClick={() => setExpandedRow(isExpanded ? null : i)}>
                      <td>
                        <div style={{ fontWeight:'500', color:'#1c2e1e', fontSize:'13px' }}>{row.query}</div>
                        {(allBrands.length > 0 || allPlatforms.length > 0) && (
                          <div style={{ marginTop:'6px' }}>
                            {allBrands.map(b => <span key={b} className="vc-chip vc-chip-orange">{b}</span>)}
                            {allPlatforms.map(p => <span key={p} className="vc-chip vc-chip-blue">📖 {p}</span>)}
                          </div>
                        )}
                      </td>
                      {['claude','gpt','gemini'].map(k => (
                        <td key={k} className="center">
                          <span className="vc-mention" style={{ color: row[k].mentioned ? "#2d7a3a" : "#c0392b" }}>
                            {row[k].mentioned ? "✓" : "✗"}
                          </span>
                        </td>
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr key={`${i}-exp`}>
                        <td colSpan={4} className="vc-expand-row">
                          {[{ label:'Claude', key:'claude', color:'#c67b2f' }, { label:'GPT-4o', key:'gpt', color:'#10a37f' }, { label:'Gemini', key:'gemini', color:'#4285f4' }].map(({ label, key, color }, j) => (
                            <div key={key} style={{ marginTop: j > 0 ? '12px' : 0, paddingTop: j > 0 ? '12px' : 0, borderTop: j > 0 ? '1px solid #e8f5ea' : 'none' }}>
                              <div style={{ fontSize:'11px', fontWeight:'700', color, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px', display:'flex', alignItems:'center', gap:'6px' }}>
                                {label}
                                {row[key].mentioned && <span style={{ fontSize:'10px', background:'#e8f5ea', color:'#2d7a3a', border:'1px solid #c8e6cb', borderRadius:'100px', padding:'1px 8px', fontWeight:'600' }}>✓ Mentioned</span>}
                              </div>
                              <div className="vc-snippet">{row[key].snippet ? `${row[key].snippet}…` : <em>No response captured</em>}</div>
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

          {/* Competitors */}
          {result.topCompetitors?.length > 0 && (
            <div className="vc-competitors">
              <div style={{ fontSize:'14px', fontWeight:'700', color:'#0f1a10', marginBottom:'14px' }}>🏆 Competitors spotted in AI responses</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
                {result.topCompetitors.map(({ name, count }) => (
                  <div key={name} style={{ display:'flex', alignItems:'center', gap:'8px', background:'white', border:'1px solid #d4e8d6', borderRadius:'100px', padding:'6px 14px', fontSize:'13px', color:'#1c2e1e', fontWeight:'500' }}>
                    {name} <span style={{ background:'#2d7a3a', color:'white', borderRadius:'100px', padding:'1px 8px', fontSize:'11px', fontWeight:'700' }}>{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
      )}
    </div>
  );
}