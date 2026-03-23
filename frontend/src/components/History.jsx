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

function Empty({ icon, text }) {
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
  const [seoAudits, setSeoAudits]       = useState([]);
  const [aiAudits, setAiAudits]         = useState([]);
  const [visChecks, setVisChecks]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [expanded, setExpanded]         = useState(null);
  const [tab, setTab]                   = useState("vc");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const token = await getToken();
      const h = { Authorization: `Bearer ${token}` };
      const [hR, aR, vR] = await Promise.all([
        fetch(`${BASE}/api/history`, { headers: h }),
        fetch(`${BASE}/api/audit-history?limit=100`, { headers: h }),
        fetch(`${BASE}/api/visibility-check-history`, { headers: h }),
      ]);
      const hD = await hR.json();
      const aD = await aR.json();
      const vD = await vR.json();
      setDescriptions(hD.items || []);
      const all = aD.items || [];
      setSeoAudits(all.filter(a => !Object.keys(a.checks||{}).includes('llmsTxt')));
      setAiAudits(all.filter(a => Object.keys(a.checks||{}).includes('llmsTxt')));
      setVisChecks(vD.items || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="page-loading">Loading history...</div>;

  function toggle(k) { setExpanded(expanded === k ? null : k); }
  function scoreColor(s) { return s >= 75 ? '#2d7a3a' : s >= 50 ? '#e08a00' : '#c0392b'; }

  const TABS = [
    { id: "vc",  label: "AI Visibility Check", count: visChecks.length,    credits: visChecks.length * 7 },
    { id: "va",  label: "AI Visibility Audit",  count: aiAudits.length,     credits: aiAudits.length * 5 },
    { id: "seo", label: "SEO Audit",            count: seoAudits.length,    credits: seoAudits.length * 5 },
    { id: "gen", label: "Product Generation",   count: descriptions.length, credits: descriptions.length },
  ];

  function AuditList({ items, labels, prefix }) {
    if (items.length === 0) return <Empty icon="⌕" text="No audits yet." />;
    return items.map((a, i) => {
      const k = `${prefix}-${i}`;
      const open = expanded === k;
      const checks = a.checks || {};
      const issues = a.issues || {};
      const passed = Object.values(checks).filter(Boolean).length;
      const total  = Object.keys(checks).length || 12;
      const score  = Math.round(passed / total * 100);
      return (
        <div className="hc" key={a.id}>
          <div className="hc-head" onClick={() => toggle(k)}>
            <div className="hc-left">
              <div className="hc-title">{a.url}</div>
              <div className="hc-sub">{passed}/{total} checks passed</div>
            </div>
            <div className="hc-right">
              <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(score) }}>{score}%</span>
              <span className="hc-date">{new Date(a.created_at).toLocaleDateString()}</span>
              <span className="hc-chev">{open ? '▲' : '▼'}</span>
            </div>
          </div>
          {open && (
            <div className="hc-body">
              {Object.entries(checks).map(([k2, p]) => (
                <div className="hc-field" key={k2}>
                  <span className="hc-fl">{labels[k2] || k2}</span>
                  <span className="hc-fv" style={{ color: p ? '#2d7a3a' : '#c0392b' }}>{p ? '✓ Pass' : `✗ ${issues[k2] || 'Fail'}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div className="history-page">
      <style>{`
        .history-tabs { display: flex; border-bottom: 2px solid #d4e8d6; margin-bottom: 24px; overflow-x: auto; }
        .ht { padding: 12px 20px; background: none; border: none; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; white-space: nowrap; transition: all 0.2s; text-align: left; }
        .ht-label { font-size: 13px; font-weight: 600; color: #5a7a5e; display: block; }
        .ht-meta  { font-size: 11px; color: #9ab09c; display: block; margin-top: 2px; }
        .ht.active .ht-label { color: #2d7a3a; }
        .ht.active { border-bottom-color: #2d7a3a; }
        .ht:hover .ht-label { color: #2d7a3a; }
        .hc { border: 1px solid #d4e8d6; border-radius: 12px; overflow: hidden; margin-bottom: 10px; background: white; }
        .hc-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; cursor: pointer; gap: 12px; transition: background 0.15s; }
        .hc-head:hover { background: #f7fbf7; }
        .hc-left { flex: 1; min-width: 0; }
        .hc-title { font-size: 14px; font-weight: 600; color: #1c2e1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hc-sub   { font-size: 12px; color: #5a7a5e; margin-top: 2px; }
        .hc-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .hc-date  { font-size: 12px; color: #5a7a5e; }
        .hc-chev  { font-size: 11px; color: #9ab09c; }
        .hc-body  { padding: 4px 18px 16px; border-top: 1px solid #e8f5ea; }
        .hc-field { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f0f7f1; gap: 16px; }
        .hc-field:last-child { border-bottom: none; }
        .hc-fl { font-size: 12px; color: #5a7a5e; font-weight: 500; flex-shrink: 0; }
        .hc-fv { font-size: 12px; color: #1c2e1e; text-align: right; }
        .hc-tags { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; }
        .hc-tag  { font-size: 11px; background: #e8f5ea; border: 1px solid #c8e6cb; color: #2d7a3a; padding: 2px 8px; border-radius: 100px; }
        .hc-mrow { display: flex; gap: 12px; padding: 12px 0 8px; }
        .hc-mbox { flex: 1; text-align: center; background: #f7fbf7; border-radius: 8px; padding: 10px 6px; }
        .hc-meng { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .hc-mnum { font-size: 20px; font-weight: 800; }
      `}</style>

      <div className="history-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`ht ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setExpanded(null); }}>
            <span className="ht-label">{t.label}</span>
            <span className="ht-meta">{t.count} runs · {t.credits} credits</span>
          </button>
        ))}
      </div>

      {tab === "vc" && (
        visChecks.length === 0
          ? <Empty icon="◎" text="No AI Visibility Checks yet." />
          : visChecks.map((vc, i) => {
              const k = `vc-${i}`;
              const open = expanded === k;
              const ms = vc.mention_summary || {};
              const total = (ms.claude||0)+(ms.gpt||0)+(ms.gemini||0);
              const comps = vc.top_competitors || [];
              return (
                <div className="hc" key={vc.id}>
                  <div className="hc-head" onClick={() => toggle(k)}>
                    <div className="hc-left">
                      <div className="hc-title">{vc.url}</div>
                      <div className="hc-sub">Brand: {vc.brand} · {total} total mentions</div>
                    </div>
                    <div className="hc-right">
                      <span className="hc-date">{new Date(vc.created_at).toLocaleDateString()}</span>
                      <span className="hc-chev">{open ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {open && (
                    <div className="hc-body">
                      <div className="hc-mrow">
                        {[{l:'Claude',c:ms.claude||0,col:'#c67b2f'},{l:'GPT-4o',c:ms.gpt||0,col:'#10a37f'},{l:'Gemini',c:ms.gemini||0,col:'#4285f4'}].map(({l,c,col}) => (
                          <div className="hc-mbox" key={l}>
                            <div className="hc-meng" style={{color:col}}>{l}</div>
                            <div className="hc-mnum" style={{color:c>0?'#2d7a3a':'#c0392b'}}>{c}/7</div>
                            <div style={{fontSize:10,color:'#5a7a5e'}}>mentions</div>
                          </div>
                        ))}
                      </div>
                      {comps.length > 0 && (
                        <div style={{marginTop:8}}>
                          <div style={{fontSize:11,fontWeight:700,color:'#5a7a5e',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:6}}>Competitors spotted</div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                            {comps.map(({name,count}) => (
                              <span key={name} style={{fontSize:11,background:'#fff3e0',border:'1px solid #ffe0b2',color:'#e65100',padding:'2px 8px',borderRadius:100}}>
                                {name} <span style={{opacity:0.6}}>{count}×</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
      )}

      {tab === "va"  && <AuditList items={aiAudits}     labels={AI_LABELS}  prefix="va"  />}
      {tab === "seo" && <AuditList items={seoAudits}    labels={SEO_LABELS} prefix="seo" />}

      {tab === "gen" && (
        descriptions.length === 0
          ? <Empty icon="✦" text="No product descriptions generated yet." />
          : descriptions.map((item, i) => {
              const k = `gen-${i}`;
              const open = expanded === k;
              const inp = item.input_json  || {};
              const out = item.output_json || {};
              return (
                <div className="hc" key={item.id}>
                  <div className="hc-head" onClick={() => toggle(k)}>
                    <div className="hc-left">
                      <div className="hc-title">{inp.productName || 'Untitled'}</div>
                      <div className="hc-sub">{inp.category}{inp.tone ? ` · ${inp.tone}` : ''}</div>
                    </div>
                    <div className="hc-right">
                      <span className="hc-date">{new Date(item.created_at).toLocaleDateString()}</span>
                      <span className="hc-chev">{open ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {open && (
                    <div className="hc-body">
                      <div className="hc-field"><span className="hc-fl">Title</span><span className="hc-fv">{out.title}</span></div>
                      <div className="hc-field"><span className="hc-fl">Meta</span><span className="hc-fv">{out.meta_description}</span></div>
                      {out.tags?.length > 0 && (
                        <div className="hc-field">
                          <span className="hc-fl">Tags</span>
                          <div className="hc-tags">{out.tags.map((t,j) => <span key={j} className="hc-tag">{t}</span>)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
      )}
    </div>
  );
}
