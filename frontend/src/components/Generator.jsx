import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const BASE = "https://dablin-backend-production.up.railway.app";

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
  const [credits, setCredits] = useState(null);
  const [form, setForm] = useState({
    productName: "", category: "home", features: "",
    targetAudience: "", tone: "professional", brandName: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => { fetchCredits(); }, []);

  async function fetchCredits() {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/credits`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCredits(data.credits);
    } catch(e) {}
  }

  async function handleGenerate() {
    if (!form.productName || !form.features) {
      setError("Product name and key features are required.");
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 402) { setError("Not enough credits. Go to Credits to top up."); return; }
      if (!res.ok) { setError(data.error || "Generation failed."); return; }
      setResult(data);
      setCredits(c => c !== null ? c - 1 : null);
      setActiveTab("preview");
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'description_generated', category: form.category, tone: form.tone });
    } catch(e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #d4e8d6',
    borderRadius: '8px', fontSize: '14px', fontFamily: "'Roboto', sans-serif",
    color: '#1c2e1e', background: 'white', outline: 'none',
    transition: 'border 0.2s', boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#1c2e1e', display: 'block', marginBottom: '6px' };
  const fieldStyle = { marginBottom: '16px' };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px', fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@700;800&display=swap');
        .gen-input:focus { border-color: #2d7a3a !important; }
        .gen-select:focus { border-color: #2d7a3a !important; outline: none; }
        .gen-textarea:focus { border-color: #2d7a3a !important; outline: none; }
        .gen-copy-btn:hover { background: #e8f5ea !important; }
        .gen-tab:hover { color: #2d7a3a; }
        .gen-generate-btn:hover:not(:disabled) { background: #3d9e4e !important; }
      `}</style>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '22px', fontWeight: '800', color: '#0f1a10', margin: 0 }}>Generate Product Description</h2>
          <p style={{ fontSize: '13px', color: '#5a7a5e', marginTop: '4px' }}>SEO-ready title, meta, bullets and HTML in 30 seconds · 1 credit per generation</p>
        </div>
        {credits !== null && (
          <div style={{ background: '#e8f5ea', border: '1px solid #c8e6cb', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#2d7a3a' }}>
            {credits} credits remaining
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* LEFT: Input form */}
        <div style={{ background: 'white', border: '1px solid #d4e8d6', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '16px', fontWeight: '700', color: '#0f1a10', margin: '0 0 20px' }}>Product Details</h3>

          <div style={fieldStyle}>
            <label style={labelStyle}>Product Name *</label>
            <input className="gen-input" style={inputStyle} name="productName"
              placeholder="e.g. Bamboo Cutting Board Set"
              value={form.productName} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select className="gen-select" style={{ ...inputStyle, cursor: 'pointer' }}
                name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tone</label>
              <select className="gen-select" style={{ ...inputStyle, cursor: 'pointer' }}
                name="tone" value={form.tone} onChange={handleChange}>
                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Key Features / Specs *</label>
            <textarea className="gen-textarea" style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              name="features"
              placeholder="e.g. 3-piece set, organic bamboo, juice grooves, non-slip feet, dishwasher safe"
              value={form.features} onChange={handleChange} rows={4} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Target Audience</label>
            <input className="gen-input" style={inputStyle} name="targetAudience"
              placeholder="e.g. Home cooks and cooking enthusiasts"
              value={form.targetAudience} onChange={handleChange} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Brand Name</label>
            <input className="gen-input" style={inputStyle} name="brandName"
              placeholder="e.g. GreenKitchen"
              value={form.brandName} onChange={handleChange} />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#c0392b', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            className="gen-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', background: loading ? '#9ab09c' : '#2d7a3a',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Roboto', sans-serif", transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Generating...
              </>
            ) : '✦ Generate Description'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* RIGHT: Output panel */}
        <div style={{ background: 'white', border: '1px solid #d4e8d6', borderRadius: '14px', padding: '24px', minHeight: '400px' }}>
          <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '16px', fontWeight: '700', color: '#0f1a10', margin: '0 0 20px' }}>Generated Output</h3>

          {!result && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#5a7a5e', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', color: '#c8e6cb' }}>✦</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1c2e1e', marginBottom: '6px' }}>Your description will appear here</div>
              <div style={{ fontSize: '13px' }}>Fill in the form and click Generate</div>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#5a7a5e', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', color: '#2d7a3a', animation: 'pulse 1.5s ease-in-out infinite' }}>✦</div>
              <div style={{ fontSize: '14px' }}>Writing your description...</div>
              <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
            </div>
          )}

          {result && (
            <>
              {/* Output tabs */}
              <div style={{ display: 'flex', borderBottom: '2px solid #d4e8d6', marginBottom: '20px' }}>
                {['preview', 'html', 'seo'].map(t => (
                  <button key={t} className="gen-tab" onClick={() => setActiveTab(t)}
                    style={{
                      padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600', fontFamily: "'Roboto', sans-serif",
                      color: activeTab === t ? '#2d7a3a' : '#5a7a5e',
                      borderBottom: activeTab === t ? '2px solid #2d7a3a' : '2px solid transparent',
                      marginBottom: '-2px', transition: 'all 0.2s', textTransform: 'capitalize',
                    }}>
                    {t === 'seo' ? 'SEO Score' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'title', label: 'Product Title', content: result.title, maxLen: 70, currentLen: result.title?.length },
                    { key: 'meta', label: 'Meta Description', content: result.meta_description, maxLen: 155, currentLen: result.meta_description?.length },
                  ].map(f => (
                    <div key={f.key} style={{ border: '1px solid #d4e8d6', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{f.label}</span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: f.currentLen > f.maxLen * 0.9 ? '#e08a00' : '#2d7a3a', fontWeight: '600' }}>{f.currentLen}/{f.maxLen}</span>
                          <button className="gen-copy-btn" onClick={() => copy(f.content, f.key)}
                            style={{ fontSize: '12px', fontWeight: '600', color: '#2d7a3a', background: '#f7fbf7', border: '1px solid #d4e8d6', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontFamily: "'Roboto', sans-serif", transition: 'background 0.15s' }}>
                            {copied === f.key ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#1c2e1e', lineHeight: '1.5' }}>{f.content}</div>
                    </div>
                  ))}

                  <div style={{ border: '1px solid #d4e8d6', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Feature Bullets</span>
                      <button className="gen-copy-btn" onClick={() => copy(result.feature_bullets?.join('\n'), 'bullets')}
                        style={{ fontSize: '12px', fontWeight: '600', color: '#2d7a3a', background: '#f7fbf7', border: '1px solid #d4e8d6', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontFamily: "'Roboto', sans-serif" }}>
                        {copied === 'bullets' ? '✓ Copied' : 'Copy all'}
                      </button>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {result.feature_bullets?.map((b, i) => <li key={i} style={{ fontSize: '14px', color: '#1c2e1e', marginBottom: '4px', lineHeight: '1.5' }}>{b}</li>)}
                    </ul>
                  </div>

                  <div style={{ border: '1px solid #d4e8d6', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Shopify Tags</span>
                      <button className="gen-copy-btn" onClick={() => copy(result.tags?.join(', '), 'tags')}
                        style={{ fontSize: '12px', fontWeight: '600', color: '#2d7a3a', background: '#f7fbf7', border: '1px solid #d4e8d6', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontFamily: "'Roboto', sans-serif" }}>
                        {copied === 'tags' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.tags?.map((t, i) => <span key={i} style={{ fontSize: '12px', background: '#e8f5ea', border: '1px solid #c8e6cb', color: '#2d7a3a', padding: '3px 10px', borderRadius: '100px' }}>{t}</span>)}
                    </div>
                  </div>

                  <div style={{ border: '1px solid #d4e8d6', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Description Body</span>
                      <button className="gen-copy-btn" onClick={() => copy(result.body_html, 'body')}
                        style={{ fontSize: '12px', fontWeight: '600', color: '#2d7a3a', background: '#f7fbf7', border: '1px solid #d4e8d6', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontFamily: "'Roboto', sans-serif" }}>
                        {copied === 'body' ? '✓ Copied' : 'Copy HTML'}
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', color: '#1c2e1e', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: result.body_html }} />
                  </div>
                </div>
              )}

              {activeTab === 'html' && (
                <div style={{ border: '1px solid #d4e8d6', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5a7a5e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Raw HTML (paste into Shopify)</span>
                    <button className="gen-copy-btn" onClick={() => copy(result.body_html, 'html')}
                      style={{ fontSize: '12px', fontWeight: '600', color: '#2d7a3a', background: '#f7fbf7', border: '1px solid #d4e8d6', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontFamily: "'Roboto', sans-serif" }}>
                      {copied === 'html' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{ background: '#f7fbf7', border: '1px solid #e8f5ea', borderRadius: '8px', padding: '14px', fontSize: '12px', color: '#1c2e1e', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6', margin: 0, fontFamily: 'monospace' }}>
                    {result.body_html}
                  </pre>
                </div>
              )}

              {activeTab === 'seo' && result.seo_score && (
                <div style={{ border: '1px solid #d4e8d6', borderRadius: '10px', overflow: 'hidden' }}>
                  {[
                    { label: 'Title length', value: `${result.seo_score.title_length} / 70 chars`, ok: result.seo_score.title_length <= 70 },
                    { label: 'Meta length', value: `${result.seo_score.meta_length} / 155 chars`, ok: result.seo_score.meta_length <= 155 },
                    { label: 'Keyword in title', value: result.seo_score.keyword_in_title ? 'Yes' : 'No', ok: result.seo_score.keyword_in_title },
                    { label: 'Keyword in meta', value: result.seo_score.keyword_in_meta ? 'Yes' : 'No', ok: result.seo_score.keyword_in_meta },
                    { label: 'Body word count', value: `${result.seo_score.body_word_count} words`, ok: result.seo_score.body_word_count >= 150 },
                  ].map((s, i) => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < 4 ? '1px solid #f0f7f1' : 'none', background: i % 2 === 0 ? '#f7fbf7' : 'white' }}>
                      <span style={{ fontSize: '13px', color: '#5a7a5e', fontWeight: '500' }}>{s.label}</span>
                      <span style={{ fontSize: '13px', color: '#1c2e1e' }}>{s.value}</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: s.ok ? '#2d7a3a' : '#c0392b' }}>{s.ok ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
