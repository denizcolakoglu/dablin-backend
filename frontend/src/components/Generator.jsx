import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { trackEvent } from "../analytics";

const CATEGORIES = [
  { value: "beauty",      label: "Beauty & Skincare" },
  { value: "fashion",     label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics & Tech" },
  { value: "home",        label: "Home & Kitchen" },
  { value: "fitness",     label: "Fitness & Sports" },
  { value: "food",        label: "Food & Beverages" },
  { value: "pets",        label: "Pet Supplies" },
  { value: "baby",        label: "Baby & Kids" },
  { value: "jewelry",     label: "Jewelry & Accessories" },
  { value: "health",      label: "Health & Wellness" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly",     label: "Friendly" },
  { value: "luxury",       label: "Luxury" },
  { value: "playful",      label: "Playful" },
];

export default function Generator() {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    productName: "", category: "home", features: "",
    targetAudience: "", tone: "professional", brandName: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");

  async function handleGenerate() {
    if (!form.productName || !form.features) {
      setError("Product name and features are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = await getToken();
      const res = await fetch("https://dablin-backend-production.up.railway.app/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 402 ? "Not enough balance. Add balance to continue." : data.error || "Generation failed.");
        return;
      }
      setResult(data);
      setActiveTab("preview");
      trackEvent('description_generated', { category: form.category, tone: form.tone });
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    trackEvent('output_copied', { field: key });
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'40px 24px', fontFamily:"'Roboto',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@700;800&display=swap');
        .gen-label { font-size:13px; font-weight:600; color:#1c2e1e; display:block; margin-bottom:6px; }
        .gen-input, .gen-select, .gen-textarea {
          width:100%; padding:11px 14px; border:1px solid #d4e8d6;
          border-radius:8px; font-size:14px; font-family:'Roboto',sans-serif;
          color:#1c2e1e; background:white; outline:none; transition:border 0.2s; box-sizing:border-box;
        }
        .gen-input:focus, .gen-select:focus, .gen-textarea:focus { border-color:#2d7a3a; }
        .gen-textarea { resize:vertical; }
        .gen-btn {
          width:100%; background:#2d7a3a; color:white; border:none;
          padding:13px 24px; border-radius:8px; font-size:15px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:'Roboto',sans-serif; margin-top:8px;
        }
        .gen-btn:hover:not(:disabled) { background:#3d9e4e; }
        .gen-btn:disabled { opacity:0.7; cursor:not-allowed; }
        .gen-tab { padding:10px 20px; font-size:14px; font-weight:600; color:#5a7a5e; background:none; border:none; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s; font-family:'Roboto',sans-serif; }
        .gen-tab.active { color:#2d7a3a; border-bottom-color:#2d7a3a; }
        .copy-btn { font-size:12px; font-weight:600; color:#2d7a3a; background:#e8f5ea; border:1px solid #c8e6cb; padding:4px 12px; border-radius:6px; cursor:pointer; font-family:'Roboto',sans-serif; transition:all 0.15s; white-space:nowrap; }
        .copy-btn:hover { background:#d4eeda; }
        .field-card { background:white; border:1px solid #d4e8d6; border-radius:12px; padding:20px; margin-bottom:16px; }
        .field-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .field-name { font-size:13px; font-weight:700; color:#1c2e1e; text-transform:uppercase; letter-spacing:0.5px; }
        .char-count { font-size:12px; font-weight:600; margin-right:8px; }
        .char-ok { color:#2d7a3a; } .char-warn { color:#e08a00; }
        .seo-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #f0f7f1; }
        .seo-label { flex:1; font-size:14px; color:#1c2e1e; }
        .seo-value { font-size:13px; color:#5a7a5e; }
        .seo-pass { color:#2d7a3a; font-weight:700; font-size:16px; }
        .seo-fail { color:#ef4444; font-weight:700; font-size:16px; }
        .tag-chip { display:inline-block; background:#eef5ee; border:1px solid #c8e6c8; border-radius:100px; padding:3px 12px; font-size:12px; font-weight:500; color:#2d5a2d; margin:3px 4px 3px 0; }
        .bullet-item { font-size:14px; color:#1c2e1e; line-height:1.7; padding:4px 0; display:flex; gap:8px; }
        .html-block { background:#f7fbf7; border:1px solid #d4e8d6; border-radius:8px; padding:16px; font-size:12px; color:#1c2e1e; white-space:pre-wrap; word-break:break-word; font-family:monospace; line-height:1.6; overflow-x:auto; }
        .empty-state { text-align:center; padding:60px 24px; color:#9ab09c; }
        .spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; margin-right:8px; vertical-align:middle; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* Description */}
      <p style={{ fontSize:'15px', color:'#5a7a5e', marginBottom:'24px' }}>
        Fill in your product details and Dablin will generate a Shopify-ready product description with SEO title, meta, bullets and body copy.
      </p>

      {/* FORM */}
      <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'28px', marginBottom:'24px' }}>
        <div style={{ marginBottom:'16px' }}>
          <label className="gen-label">Product Name *</label>
          <input className="gen-input" name="productName" placeholder="e.g. Bamboo Cutting Board Set" value={form.productName} onChange={handleChange} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
          <div>
            <label className="gen-label">Category *</label>
            <select className="gen-select" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="gen-label">Tone</label>
            <select className="gen-select" name="tone" value={form.tone} onChange={handleChange}>
              {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom:'16px' }}>
          <label className="gen-label">Key Features / Specs *</label>
          <textarea className="gen-textarea" name="features" rows={4}
            placeholder="e.g. 3-piece set, organic bamboo, juice grooves, non-slip feet, dishwasher safe"
            value={form.features} onChange={handleChange} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
          <div>
            <label className="gen-label">Target Audience</label>
            <input className="gen-input" name="targetAudience" placeholder="e.g. Home cooks" value={form.targetAudience} onChange={handleChange} />
          </div>
          <div>
            <label className="gen-label">Brand Name</label>
            <input className="gen-input" name="brandName" placeholder="e.g. GreenKitchen" value={form.brandName} onChange={handleChange} />
          </div>
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'8px', padding:'12px 16px', fontSize:'13px', color:'#dc2626', marginBottom:'16px' }}>
            {error}
          </div>
        )}

        <button className="gen-btn" onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner" />Generating…</> : '✦ Generate Description'}
        </button>
      </div>

      {/* OUTPUT */}
      {!result && !loading && (
        <div className="empty-state">
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>✦</div>
          <p style={{ fontWeight:'500', marginBottom:'4px' }}>Your output will appear here</p>
          <p style={{ fontSize:'13px' }}>Fill in the form and click Generate</p>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <div style={{ fontSize:'32px', marginBottom:'12px', animation:'spin 2s linear infinite', display:'inline-block' }}>✦</div>
          <p style={{ fontWeight:'500' }}>Writing your description…</p>
        </div>
      )}

      {result && (
        <>
          {/* Output tabs */}
          <div style={{ borderBottom:'2px solid #d4e8d6', display:'flex', marginBottom:'20px' }}>
            <button className={`gen-tab ${activeTab==='preview'?'active':''}`} onClick={() => setActiveTab('preview')}>Preview</button>
            <button className={`gen-tab ${activeTab==='html'?'active':''}`} onClick={() => setActiveTab('html')}>HTML</button>
            <button className={`gen-tab ${activeTab==='seo'?'active':''}`} onClick={() => setActiveTab('seo')}>SEO Score</button>
          </div>

          {activeTab === 'preview' && (
            <>
              {/* Title */}
              <div className="field-card">
                <div className="field-header">
                  <span className="field-name">Product Title</span>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <span className={`char-count ${result.title?.length > 60 ? 'char-warn' : 'char-ok'}`}>{result.title?.length}/70</span>
                    <button className="copy-btn" onClick={() => copy(result.title, 'title')}>{copied==='title'?'✓ Copied':'Copy'}</button>
                  </div>
                </div>
                <div style={{ fontSize:'15px', fontWeight:'600', color:'#1c2e1e', lineHeight:1.4 }}>{result.title}</div>
              </div>

              {/* Meta */}
              <div className="field-card">
                <div className="field-header">
                  <span className="field-name">Meta Description</span>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <span className={`char-count ${result.meta_description?.length > 140 ? 'char-warn' : 'char-ok'}`}>{result.meta_description?.length}/155</span>
                    <button className="copy-btn" onClick={() => copy(result.meta_description, 'meta')}>{copied==='meta'?'✓ Copied':'Copy'}</button>
                  </div>
                </div>
                <div style={{ fontSize:'14px', color:'#3a4a3a', lineHeight:1.6 }}>{result.meta_description}</div>
              </div>

              {/* Bullets */}
              <div className="field-card">
                <div className="field-header">
                  <span className="field-name">Feature Bullets</span>
                  <button className="copy-btn" onClick={() => copy(result.feature_bullets?.join('\n'), 'bullets')}>{copied==='bullets'?'✓ Copied':'Copy all'}</button>
                </div>
                {result.feature_bullets?.map((b, i) => (
                  <div key={i} className="bullet-item"><span style={{ color:'#2d7a3a', fontWeight:'700', flexShrink:0 }}>•</span>{b}</div>
                ))}
              </div>

              {/* Tags */}
              <div className="field-card">
                <div className="field-header">
                  <span className="field-name">Shopify Tags</span>
                  <button className="copy-btn" onClick={() => copy(result.tags?.join(', '), 'tags')}>{copied==='tags'?'✓ Copied':'Copy'}</button>
                </div>
                <div>{result.tags?.map((t, i) => <span key={i} className="tag-chip">{t}</span>)}</div>
              </div>

              {/* Body */}
              <div className="field-card">
                <div className="field-header">
                  <span className="field-name">Description Body</span>
                  <button className="copy-btn" onClick={() => copy(result.body_html, 'body')}>{copied==='body'?'✓ Copied':'Copy HTML'}</button>
                </div>
                <div style={{ fontSize:'14px', color:'#1c2e1e', lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html: result.body_html }} />
              </div>
            </>
          )}

          {activeTab === 'html' && (
            <div className="field-card">
              <div className="field-header">
                <span className="field-name">Raw HTML</span>
                <button className="copy-btn" onClick={() => copy(result.body_html, 'html')}>{copied==='html'?'✓ Copied':'Copy'}</button>
              </div>
              <pre className="html-block">{result.body_html}</pre>
            </div>
          )}

          {activeTab === 'seo' && result.seo_score && (
            <div className="field-card">
              {[
                { label:'Title length',     value:`${result.seo_score.title_length} / 70 chars`,  ok: result.seo_score.title_length <= 70 },
                { label:'Meta length',      value:`${result.seo_score.meta_length} / 155 chars`,  ok: result.seo_score.meta_length <= 155 },
                { label:'Keyword in title', value: result.seo_score.keyword_in_title ? 'Yes':'No', ok: result.seo_score.keyword_in_title },
                { label:'Keyword in meta',  value: result.seo_score.keyword_in_meta  ? 'Yes':'No', ok: result.seo_score.keyword_in_meta },
                { label:'Body word count',  value:`${result.seo_score.body_word_count} words`,    ok: result.seo_score.body_word_count >= 150 },
              ].map(s => (
                <div key={s.label} className="seo-row">
                  <span className="seo-label">{s.label}</span>
                  <span className="seo-value">{s.value}</span>
                  <span className={s.ok ? 'seo-pass' : 'seo-fail'}>{s.ok ? '✓' : '✗'}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
