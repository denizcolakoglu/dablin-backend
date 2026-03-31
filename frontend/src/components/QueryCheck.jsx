import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { trackEvent } from "../analytics";
import ShareButton from "./ShareButton";
import ToolHistory from "./ToolHistory";

const BASE = "https://dablin-backend-production.up.railway.app";

export default function QueryCheck({ setPage }) {
  const { getToken } = useAuth();

  // Step 1: prompt
  const [prompt, setPrompt] = useState("");
  const [brand, setBrand] = useState("");
  const [activeToolTab, setActiveToolTab] = useState("tool");
  const [generating, setGenerating] = useState(false);

  // Step 2: queries
  const [queries, setQueries] = useState([]);
  const [step, setStep] = useState(1); // 1 = prompt, 2 = edit queries, 3 = results

  // Step 3: results
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [noBalance, setNoBalance] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [confirm, setConfirm] = useState(false);

  async function generateQueries() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/generate-queries-from-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: prompt.trim(), brand: brand.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to generate queries."); return; }
      setQueries(data.queries.map((q, i) => ({ id: i, text: q, saved: false })));
      setBrand(data.brand || brand);
      setStep(2);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function runCheck() {
    if (!confirm) { setConfirm(true); return; }
    setRunning(true);
    setError(null);
    setResult(null);
    setNoBalance(false);
    setConfirm(false);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/visibility-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ savedQueries: queries.map(q => q.text), brand }),
      });
      const data = await res.json();
      if (res.status === 402) { setNoBalance(true); setRunning(false); return; }
      if (!res.ok) { setError(data.error || "Check failed."); return; }
      setResult(data);
      setStep(3);
      trackEvent('query_check_completed');
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setRunning(false);
    }
  }

  function updateQuery(id, text) {
    setQueries(qs => qs.map(q => q.id === id ? { ...q, text } : q));
  }

  function removeQuery(id) {
    setQueries(qs => qs.filter(q => q.id !== id));
  }

  function addQuery() {
    setQueries(qs => [...qs, { id: Date.now(), text: "", saved: false }]);
  }

  return (
    <div style={{ fontFamily:"'Roboto',sans-serif" }}>
      <div style={{ display:"flex", borderBottom:"2px solid #d4e8d6" }}>
        {[["tool","AI Query Check"],["history","History"]].map(([id,label]) => (
          <button key={id} onClick={() => setActiveToolTab(id)}
            style={{ padding:"11px 24px", fontSize:"13px", fontWeight:"600",
              color: activeToolTab===id ? "#2d7a3a" : "#5a7a5e", background:"none", border:"none",
              cursor:"pointer", borderBottom: activeToolTab===id ? "2px solid #2d7a3a" : "2px solid transparent",
              marginBottom:"-2px", transition:"all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>
      {activeToolTab === "history" && <ToolHistory type="query-check" />}
      {activeToolTab === "tool" && (
    <div style={{ maxWidth:"720px", margin:"0 auto", padding:"40px 24px", fontFamily:"'Roboto',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@700;800&display=swap');
        .qc-btn{background:#2d7a3a;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;font-family:'Roboto',sans-serif;}
        .qc-btn:hover:not(:disabled){background:#3d9e4e;}
        .qc-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .qc-btn-ghost{background:white;color:#2d7a3a;border:1px solid #d4e8d6;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.2s;}
        .qc-btn-ghost:hover{border-color:#2d7a3a;background:#f0faf1;}
        .qc-input{width:100%;padding:12px 16px;border:1px solid #d4e8d6;border-radius:8px;font-size:14px;color:#1c2e1e;outline:none;transition:border 0.2s;font-family:'Roboto',sans-serif;box-sizing:border-box;}
        .qc-input:focus{border-color:#2d7a3a;}
        .qc-textarea{width:100%;padding:12px 16px;border:1px solid #d4e8d6;border-radius:8px;font-size:14px;color:#1c2e1e;outline:none;transition:border 0.2s;font-family:'Roboto',sans-serif;box-sizing:border-box;resize:vertical;line-height:1.6;}
        .qc-textarea:focus{border-color:#2d7a3a;}
        .qc-query-item{display:flex;align-items:center;gap:10px;background:white;border:1px solid #d4e8d6;border-radius:8px;padding:10px 14px;margin-bottom:8px;transition:border 0.2s;}
        .qc-query-item:focus-within{border-color:#2d7a3a;}
        .qc-query-input{flex:1;border:none;outline:none;font-size:14px;color:#1c2e1e;font-family:'Roboto',sans-serif;background:transparent;}
        .qc-remove-btn{background:none;border:none;color:#c0392b;cursor:pointer;font-size:16px;padding:2px 6px;border-radius:4px;flex-shrink:0;opacity:0.6;transition:opacity 0.15s;}
        .qc-remove-btn:hover{opacity:1;}
        .qc-step{display:flex;align-items:center;gap:8px;font-size:12px;color:#9ab09c;margin-bottom:24px;}
        .qc-step-dot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;}
        .qc-step-dot.done{background:#2d7a3a;color:white;}
        .qc-step-dot.active{background:#0f1a10;color:white;}
        .qc-step-dot.pending{background:#e8f0e8;color:#9ab09c;}
        .qc-step-line{flex:1;height:1px;background:#d4e8d6;}
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
        .vc-chip{display:inline-block;font-size:11px;font-weight:500;padding:2px 10px;border-radius:100px;margin:2px 3px 2px 0;}
        .vc-chip-orange{background:#fff3e0;border:1px solid #ffe0b2;color:#e65100;}
        .vc-chip-blue{background:#e8f0fe;border:1px solid #c5cae9;color:#3949ab;}
        .vc-snippet{font-size:12px;color:#5a7a5e;font-style:italic;line-height:1.5;background:white;border-radius:6px;padding:8px 10px;border:1px solid #eef5ef;margin-top:4px;}
        .qc-confirm{background:#f0faf1;border:1.5px solid #2d7a3a;border-radius:10px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;}
        .qc-spinner{width:32px;height:32px;border:3px solid #d4e8d6;border-top-color:#2d7a3a;border-radius:50%;animation:qc-spin 0.9s linear infinite;}
        @keyframes qc-spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* Step indicator */}
      <div className="qc-step">
        <div className={`qc-step-dot ${step >= 1 ? step === 1 ? 'active' : 'done' : 'pending'}`}>{step > 1 ? '✓' : '1'}</div>
        <span style={{ color: step === 1 ? '#1c2e1e' : '#9ab09c', fontWeight: step === 1 ? '600' : '400' }}>Describe</span>
        <div className="qc-step-line" />
        <div className={`qc-step-dot ${step >= 2 ? step === 2 ? 'active' : 'done' : 'pending'}`}>{step > 2 ? '✓' : '2'}</div>
        <span style={{ color: step === 2 ? '#1c2e1e' : '#9ab09c', fontWeight: step === 2 ? '600' : '400' }}>Edit queries</span>
        <div className="qc-step-line" />
        <div className={`qc-step-dot ${step >= 3 ? 'active' : 'pending'}`}>3</div>
        <span style={{ color: step === 3 ? '#1c2e1e' : '#9ab09c', fontWeight: step === 3 ? '600' : '400' }}>Results</span>
      </div>

      {/* ── STEP 1: Prompt ── */}
      {step === 1 && (
        <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'28px' }}>
          <p style={{ fontSize:'15px', color:'#5a7a5e', marginBottom:'24px' }}>
            Describe your product, brand, or use case and Dablin will generate the right search queries to test your AI visibility.
          </p>

          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'13px', fontWeight:'600', color:'#1c2e1e', display:'block', marginBottom:'6px' }}>Brand name</label>
            <input className="qc-input" placeholder="e.g. Dablin"
              value={brand} onChange={e => setBrand(e.target.value)} />
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'13px', fontWeight:'600', color:'#1c2e1e', display:'block', marginBottom:'6px' }}>Describe your product or use case *</label>
            <textarea className="qc-textarea" rows={4}
              placeholder="e.g. I sell an AI-powered tool that helps e-commerce brands check if ChatGPT and Gemini mention them in product searches. My target customers are Shopify store owners and SaaS marketers."
              value={prompt} onChange={e => setPrompt(e.target.value)} />
            <div style={{ fontSize:'12px', color:'#9ab09c', marginTop:'6px' }}>The more detail you give, the better the queries will be.</div>
          </div>

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"8px", padding:"12px 16px", color:"#ef4444", fontSize:"13px", marginBottom:"16px" }}>{error}</div>
          )}

          <button className="qc-btn" style={{ width:'100%' }} onClick={generateQueries} disabled={generating || !prompt.trim()}>
            {generating ? '⏳ Generating queries…' : '✦ Generate queries'}
          </button>
        </div>
      )}

      {/* ── STEP 2: Edit queries ── */}
      {step === 2 && (
        <>
          <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'28px', marginBottom:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
              <div style={{ fontSize:'14px', fontWeight:'700', color:'#1c2e1e' }}>Your queries</div>
              <div style={{ fontSize:'12px', color:'#9ab09c' }}>{queries.length} queries</div>
            </div>
            <p style={{ fontSize:'13px', color:'#5a7a5e', marginBottom:'20px' }}>
              Edit, remove or add queries. These will be sent to Claude, GPT-4o, and Gemini.
            </p>

            {queries.map(q => (
              <div key={q.id} className="qc-query-item">
                <span style={{ fontSize:'13px', color:'#9ab09c', fontWeight:'600', minWidth:'20px' }}>›</span>
                <input className="qc-query-input" value={q.text}
                  onChange={e => updateQuery(q.id, e.target.value)}
                  placeholder="Enter a search query…" />
                <button className="qc-remove-btn" onClick={() => removeQuery(q.id)}>✕</button>
              </div>
            ))}

            <button className="qc-btn-ghost" style={{ width:'100%', marginTop:'8px' }} onClick={addQuery}>
              + Add query
            </button>
          </div>

          {/* Confirm banner */}
          {confirm && (
            <div className="qc-confirm">
              <div>
                <div style={{ fontSize:'14px', fontWeight:'700', color:'#1c2e1e' }}>This check costs €1.00</div>
                <div style={{ fontSize:'13px', color:'#5a7a5e', marginTop:'2px' }}>Running {queries.length} queries across Claude, GPT-4o, and Gemini</div>
              </div>
              <button className="qc-btn" onClick={runCheck}>Confirm & Run</button>
            </div>
          )}

          {noBalance && (
            <div style={{ background:"#fffbeb", border:"1.5px solid #f59e0b", borderRadius:"12px", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px", marginBottom:"16px" }}>
              <div>
                <div style={{ fontSize:"15px", fontWeight:"700", color:"#92400e", marginBottom:"4px" }}>Not enough balance</div>
                <div style={{ fontSize:"13px", color:"#b45309" }}>AI Query Check costs €1.00. Add balance to continue.</div>
              </div>
              <button className="qc-btn" onClick={() => setPage("pricing")}>Add balance</button>
            </div>
          )}

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"8px", padding:"12px 16px", color:"#ef4444", fontSize:"13px", marginBottom:"16px" }}>{error}</div>
          )}

          {running && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', padding:'40px', color:'#5a7a5e', fontSize:'14px' }}>
              <div className="qc-spinner" />
              <div>Querying Claude, GPT-4o and Gemini — this takes ~20 seconds…</div>
            </div>
          )}

          <div style={{ display:'flex', gap:'10px' }}>
            <button className="qc-btn-ghost" onClick={() => { setStep(1); setConfirm(false); }}>← Back</button>
            <button className="qc-btn" style={{ flex:1 }} onClick={runCheck} disabled={running || queries.length === 0 || queries.some(q => !q.text.trim())}>
              {running ? 'Running…' : confirm ? 'Confirm — €1.00' : `Run check (${queries.length} queries)`}
            </button>
          </div>
        </>
      )}

      {/* ── STEP 3: Results ── */}
      {step === 3 && result && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
            <div style={{ display:'inline-block', background:'#e8f5ea', color:'#2d7a3a', border:'1px solid #c8e6cb', borderRadius:'100px', padding:'4px 14px', fontSize:'12px', fontWeight:'700' }}>
              Brand: {result.brand}
            </div>
            <ShareButton type="visibility-check" data={result} />
          </div>

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
                        <td colSpan={4} style={{ background:'#f7fbf7', padding:'12px 16px' }}>
                          {[{ label:'Claude', key:'claude', color:'#c67b2f' }, { label:'GPT-4o', key:'gpt', color:'#10a37f' }, { label:'Gemini', key:'gemini', color:'#4285f4' }].map(({ label, key, color }, j) => (
                            <div key={key} style={{ marginTop: j > 0 ? '12px' : 0, paddingTop: j > 0 ? '12px' : 0, borderTop: j > 0 ? '1px solid #e8f5ea' : 'none' }}>
                              <div style={{ fontSize:'11px', fontWeight:'700', color, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px' }}>{label}</div>
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

          {result.topCompetitors?.length > 0 && (
            <div style={{ background:'#f7fbf7', border:'1px solid #d4e8d6', borderRadius:'12px', padding:'20px', marginBottom:'24px' }}>
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

          <button className="qc-btn-ghost" onClick={() => { setStep(1); setResult(null); setPrompt(''); setQueries([]); }}>
            ← Run another check
          </button>
        </>
      )}
    </div>}
    </div>
  );
}