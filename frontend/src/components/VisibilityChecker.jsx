import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import ShareButton from "./ShareButton";

const BASE = "https://dablin-backend-production.up.railway.app";

export default function VisibilityChecker({ setPage }) {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('check');

  // Saved queries (from DB)
  const [savedQueries, setSavedQueries] = useState([]); // [{id, query}]
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [newQueryText, setNewQueryText] = useState('');

  // Check tab state
  const [url, setUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [queries, setQueries] = useState([]); // [{id, text, faved}]
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);
  const [noCredits, setNoCredits] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const hasSavedQueries = savedQueries.length > 0;

  useEffect(() => { loadSavedQueries(); }, []);

  async function loadSavedQueries() {
    setLoadingSaved(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/saved-queries`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSavedQueries(data.items || []);
    } catch(e) {}
    finally { setLoadingSaved(false); }
  }

  // ── CHECK TAB ──────────────────────────────────────────────

  async function generateQueries() {
    let fullUrl = url.trim();
    if (!fullUrl) { setGenError('Enter a URL first'); return; }
    if (!fullUrl.startsWith('http')) fullUrl = 'https://' + fullUrl;
    setGenerating(true); setGenError(null); setResult(null); setQueries([]);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/generate-queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setGenError(data.error || 'Failed to generate queries'); return; }
      setBrand(data.brand || '');
      setUrl(fullUrl);
      setQueries((data.queries || []).map((q, i) => ({ id: `gen-${i}`, text: q, faved: false })));
    } catch(e) { setGenError('Network error. Please try again.'); }
    finally { setGenerating(false); }
  }

  function updateQuery(id, text) { setQueries(prev => prev.map(q => q.id === id ? { ...q, text } : q)); }
  function removeQuery(id) { setQueries(prev => prev.filter(q => q.id !== id)); }
  function addQuery() { setQueries(prev => [...prev, { id: `manual-${Date.now()}`, text: '', faved: false }]); }

  async function toggleFav(id) {
    const q = queries.find(q => q.id === id);
    if (!q || !q.text.trim()) return;
    const token = await getToken();
    if (q.faved) {
      // Remove from saved
      const saved = savedQueries.find(s => s.query === q.text.trim());
      if (saved) {
        await fetch(`${BASE}/api/saved-queries/${saved.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setSavedQueries(prev => prev.filter(s => s.id !== saved.id));
      }
      setQueries(prev => prev.map(x => x.id === id ? { ...x, faved: false } : x));
    } else {
      // Add to saved
      const res = await fetch(`${BASE}/api/saved-queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: q.text.trim() }),
      });
      const data = await res.json();
      setSavedQueries(prev => [...prev, { id: data.id, query: q.text.trim() }]);
      setQueries(prev => prev.map(x => x.id === id ? { ...x, faved: true } : x));
    }
  }

  async function runCheck() {
    const queriesToRun = hasSavedQueries
      ? savedQueries.map(q => q.query)
      : queries.filter(q => q.text.trim()).map(q => q.text);

    if (queriesToRun.length === 0) { setRunError('Add at least one query first'); return; }
    if (!url) { setRunError('URL is required'); return; }
    setRunning(true); setRunError(null); setNoCredits(false); setResult(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/visibility-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url, savedQueries: queriesToRun, brand }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setNoCredits(true);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'credits_depleted' });
        return;
      }
      if (!res.ok) { setRunError(data.error || 'Check failed. Please try again.'); return; }
      setResult(data);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'visibility_check_completed', url, mentions_total: (data.mentionSummary?.claude||0)+(data.mentionSummary?.gpt||0)+(data.mentionSummary?.gemini||0) });
    } catch(e) { setRunError('Network error. Please try again.'); }
    finally { setRunning(false); }
  }

  // ── QUERIES TAB ───────────────────────────────────────────

  async function addSavedQuery() {
    if (!newQueryText.trim()) return;
    const token = await getToken();
    const res = await fetch(`${BASE}/api/saved-queries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: newQueryText.trim() }),
    });
    const data = await res.json();
    setSavedQueries(prev => [...prev, { id: data.id, query: newQueryText.trim() }]);
    setNewQueryText('');
  }

  async function deleteSavedQuery(id) {
    const token = await getToken();
    await fetch(`${BASE}/api/saved-queries/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setSavedQueries(prev => prev.filter(q => q.id !== id));
  }

  async function updateSavedQuery(id, newText) {
    setSavedQueries(prev => prev.map(q => q.id === id ? { ...q, query: newText } : q));
  }

  async function saveSavedQueryEdit(id, newText) {
    if (!newText.trim()) return;
    const token = await getToken();
    await fetch(`${BASE}/api/saved-queries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: newText.trim() }),
    });
  }

  const inputStyle = { width:'100%', padding:'11px 14px', border:'1px solid #d4e8d6', borderRadius:'8px', fontSize:'14px', fontFamily:"'Roboto',sans-serif", color:'#1c2e1e', background:'white', outline:'none', boxSizing:'border-box' };

  return (
    <div style={{ maxWidth:'860px', margin:'0 auto', padding:'32px 24px', fontFamily:"'Roboto',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Roboto+Condensed:wght@700;800&display=swap');
        .vc-input:focus { border-color:#2d7a3a !important; outline:none; }
        .vc-btn-primary { background:#2d7a3a;color:white;border:none;padding:11px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Roboto',sans-serif;transition:background 0.2s;white-space:nowrap; }
        .vc-btn-primary:hover:not(:disabled) { background:#3d9e4e; }
        .vc-btn-primary:disabled { opacity:0.6;cursor:not-allowed; }
        .vc-btn-ghost { background:white;color:#1c2e1e;border:1px solid #d4e8d6;padding:11px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Roboto',sans-serif;transition:all 0.2s;white-space:nowrap; }
        .vc-btn-ghost:hover:not(:disabled) { background:#f7fbf7; }
        .vc-btn-ghost:disabled { opacity:0.6;cursor:not-allowed; }
        .vc-query-input { flex:1;border:none;outline:none;font-size:13px;color:#1c2e1e;background:transparent;font-family:'Roboto',sans-serif;padding:0; }
        .vc-query-row:hover { background:#f7fbf7 !important; }
        .vc-table tr:hover td { background:#f7fbf7;cursor:pointer; }
        .vc-table th { padding:10px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5a7a5e;border-bottom:2px solid #d4e8d6;text-align:left; }
        .vc-table th.center { text-align:center; }
        .vc-table td { padding:12px;border-bottom:1px solid #e8f5ea;vertical-align:top; }
        .vc-tab { padding:10px 20px;background:none;border:none;cursor:pointer;font-size:14px;font-weight:600;font-family:'Roboto',sans-serif;color:#5a7a5e;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s; }
        .vc-tab.active { color:#2d7a3a;border-bottom-color:#2d7a3a; }
        .vc-tab:hover { color:#2d7a3a; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>

      {/* Header + Tabs */}
      <div style={{ marginBottom:'24px' }}>
        <h2 style={{ fontFamily:"'Roboto Condensed',sans-serif", fontSize:'22px', fontWeight:'800', color:'#0f1a10', margin:'0 0 4px' }}>AI Visibility Check</h2>
        <p style={{ fontSize:'13px', color:'#5a7a5e', margin:'0 0 20px' }}>Check if ChatGPT, Gemini, and Claude mention your brand · 7 credits</p>
        <div style={{ borderBottom:'2px solid #d4e8d6', display:'flex' }}>
          <button className={`vc-tab ${activeTab==='check'?'active':''}`} onClick={() => setActiveTab('check')}>Check</button>
          <button className={`vc-tab ${activeTab==='queries'?'active':''}`} onClick={() => setActiveTab('queries')}>
            Queries {hasSavedQueries ? <span style={{ fontSize:'11px', background:'#e8f5ea', color:'#2d7a3a', border:'1px solid #c8e6cb', borderRadius:'100px', padding:'1px 7px', marginLeft:'6px', fontWeight:'700' }}>{savedQueries.length}</span> : ''}
          </button>
        </div>
      </div>

      {/* ── CHECK TAB ── */}
      {activeTab === 'check' && (
        <>
          {/* URL + Generate */}
          <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'24px', marginBottom:'20px' }}>
            <label style={{ fontSize:'13px', fontWeight:'600', color:'#1c2e1e', display:'block', marginBottom:'8px' }}>Your website URL</label>
            <div style={{ display:'flex', gap:'10px' }}>
              <input className="vc-input" style={inputStyle} placeholder="https://yoursite.com"
                value={url} onChange={e => { setUrl(e.target.value); setGenError(null); }}
                onKeyDown={e => e.key === 'Enter' && !hasSavedQueries && generateQueries()} />
              {!hasSavedQueries && (
                <button className="vc-btn-primary" onClick={generateQueries} disabled={generating || running}>
                  {generating ? (
                    <span style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ width:'12px', height:'12px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                      Generating…
                    </span>
                  ) : 'Generate queries'}
                </button>
              )}
            </div>
            {genError && <div style={{ fontSize:'12px', color:'#c0392b', marginTop:'8px' }}>{genError}</div>}
            {hasSavedQueries && (
              <div style={{ marginTop:'10px', fontSize:'12px', color:'#2d7a3a', background:'#e8f5ea', border:'1px solid #c8e6cb', borderRadius:'6px', padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>✓ Using your {savedQueries.length} saved queries from the Queries tab · New AI visibility check will be run for saved queries.</span>
                <button onClick={() => setActiveTab('queries')} style={{ background:'none', border:'none', color:'#2d7a3a', fontWeight:'700', cursor:'pointer', fontFamily:"'Roboto',sans-serif", fontSize:'12px', flexShrink:0, marginLeft:'12px' }}>Manage →</button>
              </div>
            )}
          </div>

          {/* Generated queries (new users only) */}
          {!hasSavedQueries && queries.length > 0 && (
            <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'24px', marginBottom:'20px' }}>
              <div style={{ fontSize:'14px', fontWeight:'700', color:'#0f1a10', marginBottom:'4px' }}>{queries.length} queries{brand ? ` for ${brand}` : ''}</div>
              <div style={{ fontSize:'12px', color:'#5a7a5e', marginBottom:'16px' }}>Edit queries — click ☆ to save any to run them again next time, otherwise don't fav and it will generate queries from scratch next time.</div>

              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {queries.map((q, i) => (
                  <div key={q.id} className="vc-query-row" style={{ display:'flex', alignItems:'center', gap:'10px', border:'1px solid #d4e8d6', borderRadius:'10px', padding:'10px 14px', background:'white', transition:'background 0.15s' }}>
                    <span style={{ fontSize:'11px', fontWeight:'700', color:'#9ab09c', width:'18px', flexShrink:0 }}>{i+1}</span>
                    <input className="vc-query-input" value={q.text} onChange={e => updateQuery(q.id, e.target.value)} placeholder="Enter a query…" />
                    <button onClick={() => toggleFav(q.id)} title={q.faved ? 'Remove from saved' : 'Save this query'}
                      style={{ background:'none', border:'none', fontSize:'17px', cursor:'pointer', color: q.faved ? '#2d7a3a' : '#c8d4c9', flexShrink:0, padding:'0 2px', transition:'color 0.15s', lineHeight:1 }}>
                      {q.faved ? '★' : '☆'}
                    </button>
                    <button onClick={() => removeQuery(q.id)} style={{ background:'none', border:'none', color:'#c8d4c9', fontSize:'18px', cursor:'pointer', lineHeight:1, padding:'0 2px', flexShrink:0 }}>×</button>
                  </div>
                ))}
                <button onClick={addQuery} style={{ background:'none', border:'1px dashed #c8e6cb', borderRadius:'10px', padding:'10px', fontSize:'13px', color:'#5a7a5e', cursor:'pointer', fontFamily:"'Roboto',sans-serif" }}>
                  + Add query
                </button>
              </div>
            </div>
          )}

          {/* Run button */}
          {(hasSavedQueries || queries.length > 0) && (
            <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'20px', marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'12px', color:'#5a7a5e' }}>
                Queries Claude, GPT-4o, and Gemini · <strong style={{ color:'#1c2e1e' }}>7 credits</strong>
              </div>
              <button className="vc-btn-primary" onClick={runCheck} disabled={running || !url.trim()} style={{ padding:'12px 32px', fontSize:'15px' }}>
                {running ? (
                  <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                    Running check…
                  </span>
                ) : 'Run visibility check'}
              </button>
            </div>
          )}

          {runError && <div style={{ fontSize:'12px', color:'#c0392b', marginBottom:'12px', textAlign:'right' }}>{runError}</div>}
          {noCredits && (
            <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'8px', padding:'12px 16px', marginBottom:'12px', fontSize:'13px', color:'#c0392b', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              Not enough credits.
              <button onClick={() => setPage('pricing')} style={{ background:'none', border:'none', color:'#2d7a3a', fontWeight:'700', cursor:'pointer', fontFamily:"'Roboto',sans-serif", fontSize:'13px' }}>Get more credits →</button>
            </div>
          )}

          {/* Loading */}
          {running && (
            <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'48px', textAlign:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'28px', color:'#2d7a3a', marginBottom:'12px', animation:'pulse 1.5s ease-in-out infinite' }}>◎</div>
              <div style={{ fontSize:'15px', fontWeight:'600', color:'#0f1a10', marginBottom:'4px' }}>Querying Claude, GPT-4o, and Gemini…</div>
              <div style={{ fontSize:'13px', color:'#5a7a5e' }}>This takes about 20 seconds</div>
            </div>
          )}

          {/* Results */}
          {result && !running && (
            <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                <div>
                  <div style={{ fontFamily:"'Roboto Condensed',sans-serif", fontSize:'18px', fontWeight:'800', color:'#0f1a10' }}>Results for {result.brand}</div>
                  <div style={{ fontSize:'12px', color:'#5a7a5e', marginTop:'2px' }}>{result.url}</div>
                </div>
                <ShareButton type="visibility-check" data={result} />
              </div>

              {/* Summary */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px' }}>
                {[
                  { label:'Claude',  count:result.mentionSummary?.claude, color:'#c67b2f' },
                  { label:'GPT-4o',  count:result.mentionSummary?.gpt,    color:'#10a37f' },
                  { label:'Gemini',  count:result.mentionSummary?.gemini, color:'#4285f4' },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ background:'#f7fbf7', border:'1px solid #d4e8d6', borderRadius:'10px', padding:'16px', textAlign:'center' }}>
                    <div style={{ fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', color, marginBottom:'6px' }}>{label}</div>
                    <div style={{ fontSize:'26px', fontWeight:'800', fontFamily:"'Roboto Condensed',sans-serif", color:(count||0)>0?'#2d7a3a':'#dc2626' }}>{count||0}/{result.queries?.length||0}</div>
                    <div style={{ fontSize:'11px', color:'#5a7a5e', marginTop:'2px' }}>queries mentioned</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <table className="vc-table" style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr>
                    <th>Query</th>
                    <th className="center">Claude</th>
                    <th className="center">GPT-4o</th>
                    <th className="center">Gemini</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.results||[]).map((row, i) => {
                    const allBrands    = [...new Set([...(row.claude?.brands||[]), ...(row.gpt?.brands||[]), ...(row.gemini?.brands||[])])];
                    const allPlatforms = [...new Set([...(row.claude?.platforms||[]), ...(row.gpt?.platforms||[]), ...(row.gemini?.platforms||[])])];
                    const isOpen = expandedRow === i;
                    return (
                      <>
                        <tr key={i} onClick={() => setExpandedRow(isOpen ? null : i)}>
                          <td>
                            <div style={{ fontWeight:'500', color:'#1c2e1e' }}>{row.query}</div>
                            {(allBrands.length > 0 || allPlatforms.length > 0) && (
                              <div style={{ marginTop:'6px', display:'flex', flexWrap:'wrap', gap:'4px' }}>
                                {allBrands.map(c => <span key={c} style={{ fontSize:'10px', background:'#fff3e0', border:'1px solid #ffe0b2', borderRadius:'100px', padding:'2px 8px', color:'#e65100', fontWeight:'500' }}>{c}</span>)}
                                {allPlatforms.map(c => <span key={c} style={{ fontSize:'10px', background:'#e8f0fe', border:'1px solid #c5cae9', borderRadius:'100px', padding:'2px 8px', color:'#3949ab', fontWeight:'500' }}>📖 {c}</span>)}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign:'center' }}><span style={{ fontSize:'16px', fontWeight:'700', color:row.claude?.mentioned?'#2d7a3a':'#dc2626' }}>{row.claude?.mentioned?'✓':'✗'}</span></td>
                          <td style={{ textAlign:'center' }}><span style={{ fontSize:'16px', fontWeight:'700', color:row.gpt?.mentioned?'#2d7a3a':'#dc2626' }}>{row.gpt?.mentioned?'✓':'✗'}</span></td>
                          <td style={{ textAlign:'center' }}><span style={{ fontSize:'16px', fontWeight:'700', color:row.gemini?.mentioned?'#2d7a3a':'#dc2626' }}>{row.gemini?.mentioned?'✓':'✗'}</span></td>
                        </tr>
                        {isOpen && (
                          <tr key={`${i}-exp`}>
                            <td colSpan={4} style={{ background:'#f7fbf7', padding:'14px 16px' }}>
                              {[{label:'Claude',data:row.claude,color:'#c67b2f'},{label:'GPT-4o',data:row.gpt,color:'#10a37f'},{label:'Gemini',data:row.gemini,color:'#4285f4'}].map(({label,data,color},ai) => (
                                <div key={label} style={{ marginTop:ai>0?'14px':'0', borderTop:ai>0?'1px solid #e8f5ea':'none', paddingTop:ai>0?'14px':'0' }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                                    <span style={{ fontSize:'11px', fontWeight:'700', color, textTransform:'uppercase', letterSpacing:'0.8px' }}>{label}</span>
                                    {data?.mentioned && <span style={{ fontSize:'10px', background:'#e8f5ea', color:'#2d7a3a', border:'1px solid #c8e6cb', borderRadius:'100px', padding:'1px 8px', fontWeight:'600' }}>✓ Mentioned</span>}
                                  </div>
                                  <div style={{ fontSize:'12px', color:'#5a7a5e', fontStyle:'italic', lineHeight:'1.5', background:'white', border:'1px solid #e8f5ea', borderRadius:'6px', padding:'8px 10px' }}>
                                    {data?.snippet ? `${data.snippet}...` : <em style={{color:'#bbb'}}>No response captured</em>}
                                  </div>
                                  {(data?.brands||[]).length > 0 && (
                                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginTop:'8px' }}>
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

              {/* Competitors */}
              {(result.topCompetitors||[]).length > 0 && (
                <div style={{ marginTop:'20px', background:'#f7fbf7', border:'1px solid #d4e8d6', borderRadius:'12px', padding:'16px' }}>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f1a10', marginBottom:'10px' }}>🏆 Competitors spotted in AI responses</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {result.topCompetitors.map(({ name, count }) => (
                      <div key={name} style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'100px', padding:'5px 14px', fontSize:'13px', fontWeight:'500', display:'flex', alignItems:'center', gap:'6px' }}>
                        {name}<span style={{ fontSize:'11px', color:'#5a7a5e' }}>{count}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── QUERIES TAB ── */}
      {activeTab === 'queries' && (
        <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'24px' }}>
          {loadingSaved ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#5a7a5e' }}>Loading…</div>
          ) : (
            <>
              <div style={{ fontSize:'13px', color:'#5a7a5e', marginBottom:'20px', lineHeight:'1.6' }}>
                {hasSavedQueries
                  ? `You have ${savedQueries.length} saved queries. These will be used every time you run a check instead of generating new ones.`
                  : 'No saved queries yet. Star a query after generating to save it here, or add one manually below.'}
              </div>

              {/* Saved query list */}
              {hasSavedQueries && (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
                  {savedQueries.map((q, i) => (
                    <div key={q.id} className="vc-query-row" style={{ display:'flex', alignItems:'center', gap:'10px', border:'1px solid #d4e8d6', borderRadius:'10px', padding:'10px 14px', background:'white', transition:'background 0.15s' }}>
                      <span style={{ fontSize:'11px', fontWeight:'700', color:'#9ab09c', width:'18px', flexShrink:0 }}>{i+1}</span>
                      <input
                        className="vc-query-input"
                        value={q.query}
                        onChange={e => updateSavedQuery(q.id, e.target.value)}
                        onBlur={e => saveSavedQueryEdit(q.id, e.target.value)}
                      />
                      <span style={{ fontSize:'16px', color:'#2d7a3a', flexShrink:0 }}>★</span>
                      <button onClick={() => deleteSavedQuery(q.id)} style={{ background:'none', border:'none', color:'#c8d4c9', fontSize:'18px', cursor:'pointer', lineHeight:1, padding:'0 2px', flexShrink:0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new query */}
              <div style={{ display:'flex', gap:'10px' }}>
                <input
                  className="vc-input"
                  style={inputStyle}
                  placeholder="Add a query manually…"
                  value={newQueryText}
                  onChange={e => setNewQueryText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSavedQuery()}
                />
                <button className="vc-btn-ghost" onClick={addSavedQuery} disabled={!newQueryText.trim()} style={{ padding:'11px 20px' }}>Add</button>
              </div>

              {hasSavedQueries && (
                <div style={{ marginTop:'20px', paddingTop:'20px', borderTop:'1px solid #e8f5ea', display:'flex', justifyContent:'flex-end' }}>
                  <button className="vc-btn-primary" onClick={() => setActiveTab('check')}>
                    Run check with these queries →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
