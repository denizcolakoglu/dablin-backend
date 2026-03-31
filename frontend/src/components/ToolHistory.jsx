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
    <div style={{ background: "#f7fbf7", border: "1px solid #d4e8d6", borderRadius: "12px", padding: "48px 24px", textAlign: "center", color: "#5a7a5e" }}>
      <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "14px" }}>{text}</div>
    </div>
  );
}

function Card({ children, header }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #d4e8d6", borderRadius: "12px", overflow: "hidden", marginBottom: "10px", background: "white" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", gap: "12px" }}
        onMouseEnter={e => e.currentTarget.style.background = "#f7fbf7"}
        onMouseLeave={e => e.currentTarget.style.background = "white"}>
        {header}
        <span style={{ fontSize: "11px", color: "#9ab09c", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div style={{ padding: "4px 18px 16px", borderTop: "1px solid #e8f5ea" }}>{children}</div>}
    </div>
  );
}

function Field({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f0f7f1", gap: "16px" }}>
      <span style={{ fontSize: "12px", color: "#5a7a5e", fontWeight: "500", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "12px", color: valueColor || "#1c2e1e", textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── HISTORY SECTIONS ──────────────────────────────────────────

function VisibilityCheckHistory({ items }) {
  if (!items.length) return <EmptySection icon="◎" text="No AI Visibility Checks yet. Run one to see which AI engines mention your brand." />;
  return items.map((vc, i) => {
    const ms = vc.mention_summary || {};
    const total = (ms.claude || 0) + (ms.gpt || 0) + (ms.gemini || 0);
    const competitors = vc.top_competitors || [];
    return (
      <Card key={vc.id || i} header={
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1c2e1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vc.url || vc.brand}</div>
          <div style={{ fontSize: "12px", color: "#5a7a5e", marginTop: "2px" }}>Brand: {vc.brand} · {total} mentions · {new Date(vc.created_at).toLocaleDateString()}</div>
        </div>
      }>
        <div style={{ display: "flex", gap: "12px", padding: "12px 0 8px" }}>
          {[{ label: "Claude", count: ms.claude || 0, color: "#c67b2f" }, { label: "GPT-4o", count: ms.gpt || 0, color: "#10a37f" }, { label: "Gemini", count: ms.gemini || 0, color: "#4285f4" }].map(({ label, count, color }) => (
            <div key={label} style={{ flex: 1, textAlign: "center", background: "#f7fbf7", borderRadius: "8px", padding: "10px 6px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color, marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: "20px", fontWeight: "800", fontFamily: "'Roboto Condensed', sans-serif", color: count > 0 ? "#2d7a3a" : "#c0392b" }}>{count}/7</div>
              <div style={{ fontSize: "10px", color: "#5a7a5e" }}>mentions</div>
            </div>
          ))}
        </div>
        {competitors.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#5a7a5e", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Competitors spotted</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {competitors.map(({ name, count }) => (
                <span key={name} style={{ fontSize: "11px", background: "#fff3e0", border: "1px solid #ffe0b2", color: "#e65100", padding: "2px 8px", borderRadius: "100px" }}>
                  {name} <span style={{ opacity: 0.6 }}>{count}×</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  });
}

function QueryCheckHistory({ items }) {
  if (!items.length) return <EmptySection icon="↗" text="No AI Query Checks yet. Use AI Query Check to run custom queries across AI engines." />;
  return items.map((vc, i) => {
    const ms = vc.mention_summary || {};
    const total = (ms.claude || 0) + (ms.gpt || 0) + (ms.gemini || 0);
    const queries = vc.queries || [];
    const competitors = vc.top_competitors || [];
    return (
      <Card key={vc.id || i} header={
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1c2e1e" }}>Brand: {vc.brand}</div>
          <div style={{ fontSize: "12px", color: "#5a7a5e", marginTop: "2px" }}>{queries.length} queries · {total} mentions · {new Date(vc.created_at).toLocaleDateString()}</div>
        </div>
      }>
        <div style={{ display: "flex", gap: "12px", padding: "12px 0 8px" }}>
          {[{ label: "Claude", count: ms.claude || 0, color: "#c67b2f" }, { label: "GPT-4o", count: ms.gpt || 0, color: "#10a37f" }, { label: "Gemini", count: ms.gemini || 0, color: "#4285f4" }].map(({ label, count, color }) => (
            <div key={label} style={{ flex: 1, textAlign: "center", background: "#f7fbf7", borderRadius: "8px", padding: "10px 6px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color, marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: "20px", fontWeight: "800", fontFamily: "'Roboto Condensed', sans-serif", color: count > 0 ? "#2d7a3a" : "#c0392b" }}>{count}/{queries.length || 7}</div>
              <div style={{ fontSize: "10px", color: "#5a7a5e" }}>mentions</div>
            </div>
          ))}
        </div>
        {queries.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#5a7a5e", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Queries used</div>
            {queries.map((q, qi) => (
              <div key={qi} style={{ fontSize: "12px", color: "#1c2e1e", padding: "4px 0", borderBottom: qi < queries.length - 1 ? "1px solid #f0f7f1" : "none" }}>
                <span style={{ color: "#9ab09c", marginRight: "6px" }}>›</span>{q}
              </div>
            ))}
          </div>
        )}
        {competitors.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#5a7a5e", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Competitors spotted</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {competitors.map(({ name, count }) => (
                <span key={name} style={{ fontSize: "11px", background: "#fff3e0", border: "1px solid #ffe0b2", color: "#e65100", padding: "2px 8px", borderRadius: "100px" }}>
                  {name} <span style={{ opacity: 0.6 }}>{count}×</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  });
}

function AuditHistory({ items, labels, emptyIcon, emptyText }) {
  if (!items.length) return <EmptySection icon={emptyIcon} text={emptyText} />;
  return items.map((audit, i) => {
    const checks = audit.checks || {};
    const issues = audit.issues || {};
    const passed = Object.values(checks).filter(Boolean).length;
    const total  = Object.keys(checks).length || 12;
    const score  = Math.round((passed / total) * 100);
    const scoreColor = score >= 75 ? "#2d7a3a" : score >= 50 ? "#e08a00" : "#c0392b";
    return (
      <Card key={audit.id || i} header={
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#1c2e1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{audit.url}</div>
            <div style={{ fontSize: "12px", color: "#5a7a5e", marginTop: "2px" }}>{passed}/{total} checks passed · {new Date(audit.created_at).toLocaleDateString()}</div>
          </div>
          <span style={{ fontSize: "14px", fontWeight: "700", color: scoreColor, flexShrink: 0 }}>{score}%</span>
        </>
      }>
        {Object.entries(checks).map(([k, p]) => (
          <Field key={k} label={labels[k] || k} value={p ? "✓ Pass" : `✗ ${issues[k] || "Fail"}`} valueColor={p ? "#2d7a3a" : "#c0392b"} />
        ))}
      </Card>
    );
  });
}

// ── MAIN EXPORT ───────────────────────────────────────────────
// type: "seo-audit" | "ai-audit" | "visibility-check" | "query-check"
export default function ToolHistory({ type }) {
  const { getToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, [type]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      if (type === "seo-audit" || type === "ai-audit") {
        const res = await fetch(`${BASE}/api/audit-history?limit=100`, { headers });
        const data = await res.json();
        const all = data.items || [];
        if (type === "ai-audit") {
          setItems(all.filter(a => {
            const keys = Object.keys(a.checks || {});
            return keys.includes("llmsTxt") || keys.includes("aiCrawlers");
          }));
        } else {
          setItems(all.filter(a => {
            const keys = Object.keys(a.checks || {});
            return !keys.includes("llmsTxt") && !keys.includes("aiCrawlers");
          }));
        }
      } else {
        const res = await fetch(`${BASE}/api/visibility-check-history`, { headers });
        const data = await res.json();
        const all = data.items || [];
        if (type === "query-check") setItems(all.filter(v => v.from_prompt));
        else setItems(all.filter(v => !v.from_prompt));
      }
    } catch (e) {
      console.error("History fetch failed", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ padding: "48px 24px", textAlign: "center", color: "#5a7a5e", fontSize: "14px" }}>Loading history...</div>
  );

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 24px 40px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;800&display=swap');`}</style>
      {type === "visibility-check" && <VisibilityCheckHistory items={items} />}
      {type === "query-check"      && <QueryCheckHistory items={items} />}
      {type === "ai-audit"         && <AuditHistory items={items} labels={AI_LABELS}  emptyIcon="⌕" emptyText="No AI Visibility Audits yet." />}
      {type === "seo-audit"        && <AuditHistory items={items} labels={SEO_LABELS} emptyIcon="✓" emptyText="No SEO Audits yet." />}
    </div>
  );
}
