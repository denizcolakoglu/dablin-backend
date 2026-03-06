import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

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
    productName: "",
    category: "home",
    features: "",
    targetAudience: "",
    tone: "professional",
    brandName: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    fetchCredits();
  }, []);

  async function fetchCredits() {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:3000/api/credits", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCredits(data.credits);
    } catch (e) {
      console.error("Failed to fetch credits", e);
    }
  }

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
      const res = await fetch("http://localhost:3000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setError("You're out of credits. Buy more to continue.");
        } else {
          setError(data.error || "Generation failed.");
        }
        return;
      }

      setResult(data);
      setCredits(data.creditsRemaining);
      setActiveTab("preview");
    } catch (e) {
      setError("Network error. Is your server running?");
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

  return (
    <div className="generator">
      {/* Credits bar */}
      <div className="credits-bar">
        <span className="credits-label">
          {credits === null ? "Loading..." : `${credits} credits remaining`}
        </span>
        {credits !== null && credits <= 5 && (
          <span className="credits-warning">⚠ Running low</span>
        )}
      </div>

      <div className="generator-layout">
        {/* LEFT: Input form */}
        <div className="input-panel">
          <h2 className="panel-title">Product Details</h2>

          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              className="form-input"
              name="productName"
              placeholder="e.g. Bamboo Cutting Board Set"
              value={form.productName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tone</label>
              <select className="form-select" name="tone" value={form.tone} onChange={handleChange}>
                {TONES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Key Features / Specs *</label>
            <textarea
              className="form-textarea"
              name="features"
              placeholder="e.g. 3-piece set, organic bamboo, juice grooves, non-slip feet, dishwasher safe, includes hanging loop"
              value={form.features}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <input
              className="form-input"
              name="targetAudience"
              placeholder="e.g. Home cooks and cooking enthusiasts"
              value={form.targetAudience}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Brand Name</label>
            <input
              className="form-input"
              name="brandName"
              placeholder="e.g. GreenKitchen"
              value={form.brandName}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button
            className={`btn-generate ${loading ? "loading" : ""}`}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-inner">
                <span className="spinner" /> Generating...
              </span>
            ) : (
              "✦ Generate Description"
            )}
          </button>
          <p className="cost-note">1 credit per generation</p>
        </div>

        {/* RIGHT: Output panel */}
        <div className="output-panel">
          <h2 className="panel-title">Generated Output</h2>

          {!result && !loading && (
            <div className="output-empty">
              <div className="empty-icon">✦</div>
              <p>Your Shopify-ready description will appear here</p>
              <p className="empty-sub">Fill in the form and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="output-empty">
              <div className="pulse-icon">✦</div>
              <p>Writing your description...</p>
            </div>
          )}

          {result && (
            <div className="output-content">
              {/* Tabs */}
              <div className="output-tabs">
                <button
                  className={`output-tab ${activeTab === "preview" ? "active" : ""}`}
                  onClick={() => setActiveTab("preview")}
                >Preview</button>
                <button
                  className={`output-tab ${activeTab === "html" ? "active" : ""}`}
                  onClick={() => setActiveTab("html")}
                >HTML</button>
                <button
                  className={`output-tab ${activeTab === "seo" ? "active" : ""}`}
                  onClick={() => setActiveTab("seo")}
                >SEO Score</button>
              </div>

              {activeTab === "preview" && (
                <div className="preview-tab">
                  {/* Title */}
                  <div className="output-field">
                    <div className="field-header">
                      <span className="field-name">Product Title</span>
                      <div className="field-actions">
                        <span className={`char-count ${result.title?.length > 60 ? "warn" : "ok"}`}>
                          {result.title?.length}/70
                        </span>
                        <button className="copy-btn" onClick={() => copy(result.title, "title")}>
                          {copied === "title" ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div className="field-content title-content">{result.title}</div>
                  </div>

                  {/* Meta */}
                  <div className="output-field">
                    <div className="field-header">
                      <span className="field-name">Meta Description</span>
                      <div className="field-actions">
                        <span className={`char-count ${result.meta_description?.length > 140 ? "warn" : "ok"}`}>
                          {result.meta_description?.length}/155
                        </span>
                        <button className="copy-btn" onClick={() => copy(result.meta_description, "meta")}>
                          {copied === "meta" ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div className="field-content">{result.meta_description}</div>
                  </div>

                  {/* Bullets */}
                  <div className="output-field">
                    <div className="field-header">
                      <span className="field-name">Feature Bullets</span>
                      <button className="copy-btn" onClick={() => copy(result.feature_bullets?.join("\n"), "bullets")}>
                        {copied === "bullets" ? "✓ Copied" : "Copy all"}
                      </button>
                    </div>
                    <ul className="bullets-list">
                      {result.feature_bullets?.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="output-field">
                    <div className="field-header">
                      <span className="field-name">Shopify Tags</span>
                      <button className="copy-btn" onClick={() => copy(result.tags?.join(", "), "tags")}>
                        {copied === "tags" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="tags-row">
                      {result.tags?.map((t, i) => (
                        <span key={i} className="tag-chip">{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Body preview */}
                  <div className="output-field">
                    <div className="field-header">
                      <span className="field-name">Description Body</span>
                      <button className="copy-btn" onClick={() => copy(result.body_html, "body")}>
                        {copied === "body" ? "✓ Copied" : "Copy HTML"}
                      </button>
                    </div>
                    <div
                      className="body-preview"
                      dangerouslySetInnerHTML={{ __html: result.body_html }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "html" && (
                <div className="html-tab">
                  <div className="field-header">
                    <span className="field-name">Raw HTML (paste into Shopify)</span>
                    <button className="copy-btn" onClick={() => copy(result.body_html, "html")}>
                      {copied === "html" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="html-block">{result.body_html}</pre>
                </div>
              )}

              {activeTab === "seo" && result.seo_score && (
                <div className="seo-tab">
                  {[
                    { label: "Title length", value: `${result.seo_score.title_length} / 70 chars`, ok: result.seo_score.title_length <= 70 },
                    { label: "Meta length", value: `${result.seo_score.meta_length} / 155 chars`, ok: result.seo_score.meta_length <= 155 },
                    { label: "Keyword in title", value: result.seo_score.keyword_in_title ? "Yes" : "No", ok: result.seo_score.keyword_in_title },
                    { label: "Keyword in meta", value: result.seo_score.keyword_in_meta ? "Yes" : "No", ok: result.seo_score.keyword_in_meta },
                    { label: "Body word count", value: `${result.seo_score.body_word_count} words`, ok: result.seo_score.body_word_count >= 150 },
                  ].map(s => (
                    <div className="seo-row" key={s.label}>
                      <span className="seo-label">{s.label}</span>
                      <span className="seo-value">{s.value}</span>
                      <span className={`seo-status ${s.ok ? "pass" : "fail"}`}>
                        {s.ok ? "✓" : "✗"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
