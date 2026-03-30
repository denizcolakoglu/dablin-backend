import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const API = "https://dablin-backend-production.up.railway.app";

function MetricCard({ label, value, sub, color = "#1a7a3a" }) {
  return (
    <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "12px", padding: "20px 24px" }}>
      <div style={{ fontSize: "12px", fontWeight: "600", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: "800", color, fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1, marginBottom: "4px" }}>{value}</div>
      {sub && <div style={{ fontSize: "12px", color: "#4a6b4c" }}>{sub}</div>}
    </div>
  );
}

export default function SearchConsole({ setPage }) {
  const { getToken } = useAuth();
  const [status, setStatus] = useState("loading"); // loading | disconnected | connected
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("striking");
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (selectedSite) fetchData(selectedSite);
  }, [selectedSite]);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gsc") === "connected") {
      window.history.replaceState({}, "", "/dashboard/search-console");
      checkConnection();
    }
  }, []);

  async function checkConnection() {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/gsc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.connected) {
        setStatus("connected");
        setSites(data.sites || []);
        if (data.sites?.length > 0) {
          setSelectedSite(data.selectedSite || data.sites[0]);
        }
      } else {
        setStatus("disconnected");
      }
    } catch {
      setStatus("disconnected");
    }
  }

  async function connect() {
    const token = await getToken();
    const res = await fetch(`${API}/api/gsc/auth-url`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  async function disconnect() {
    const token = await getToken();
    await fetch(`${API}/api/gsc/disconnect`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatus("disconnected");
    setData(null);
    setSites([]);
  }

  async function fetchData(site) {
    setLoadingData(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/gsc/data?site=${encodeURIComponent(site)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to fetch data");
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingData(false);
    }
  }

  const TABS = [
    { id: "striking", label: "Striking Distance" },
    { id: "lowctr", label: "Low CTR" },
    { id: "aioverview", label: "AI Overview" },
    { id: "indexed", label: "Not Indexed" },
    { id: "vitals", label: "Core Web Vitals" },
    { id: "branded", label: "Branded vs Non-Branded" },
  ];

  if (status === "loading") return (
    <div style={{ padding: "48px", textAlign: "center", color: "#4a6b4c" }}>Loading...</div>
  );

  if (status === "disconnected") return (
    <div style={{ maxWidth: "600px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", background: "#eef8f0", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "28px" }}>🔍</div>
      <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.5px", marginBottom: "12px" }}>Connect Google Search Console</h2>
      <p style={{ fontSize: "15px", color: "#4a6b4c", lineHeight: "1.65", marginBottom: "32px" }}>
        Connect your GSC account to see striking distance keywords, low CTR pages, AI Overview performance, indexing issues, Core Web Vitals, and branded vs non-branded traffic — all in one place.
      </p>
      <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "14px", padding: "24px", marginBottom: "32px", textAlign: "left" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#0d1f0e", marginBottom: "14px" }}>What you'll get:</div>
        {[
          "Striking distance keywords (position 7–15)",
          "High impression / low CTR pages",
          "AI Overview performance data",
          "Discovered but not indexed pages",
          "Core Web Vitals & INP errors",
          "Branded vs non-branded traffic split",
          "Sitemap status & crawl errors",
        ].map(item => (
          <div key={item} style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", color: "#4a6b4c", marginBottom: "8px" }}>
            <span style={{ color: "#1a7a3a", fontWeight: "700", flexShrink: 0 }}>✓</span>{item}
          </div>
        ))}
      </div>
      <button onClick={connect} style={{ background: "#1a7a3a", color: "white", border: "none", padding: "14px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Connect Google Search Console
      </button>
      <p style={{ fontSize: "12px", color: "#4a6b4c", marginTop: "16px" }}>Read-only access · You can disconnect anytime</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.5px", marginBottom: "4px" }}>Search Console</h1>
          <p style={{ fontSize: "13px", color: "#4a6b4c" }}>Last 28 days · {selectedSite}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {sites.length > 1 && (
            <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #eef2ee", borderRadius: "8px", fontSize: "13px", color: "#0d1f0e", background: "white" }}>
              {sites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <button onClick={disconnect} style={{ background: "none", border: "1px solid #eef2ee", color: "#4a6b4c", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Disconnect</button>
        </div>
      </div>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", color: "#c0392b", fontSize: "13px", marginBottom: "20px" }}>{error}</div>}

      {loadingData ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#4a6b4c" }}>
          <div style={{ fontSize: "20px", marginBottom: "12px" }}>◎</div>
          Fetching Search Console data...
        </div>
      ) : data && (
        <>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" }}>
            <MetricCard label="Total Clicks" value={data.summary?.clicks?.toLocaleString() ?? "—"} sub="last 28 days" />
            <MetricCard label="Impressions" value={data.summary?.impressions?.toLocaleString() ?? "—"} sub="last 28 days" color="#2d9a4e" />
            <MetricCard label="Avg CTR" value={data.summary?.ctr ? `${(data.summary.ctr * 100).toFixed(1)}%` : "—"} sub="click-through rate" color="#f59e0b" />
            <MetricCard label="Avg Position" value={data.summary?.position ? data.summary.position.toFixed(1) : "—"} sub="average ranking" color="#4a6b4c" />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "7px 16px", borderRadius: "20px", border: activeTab === t.id ? "2px solid #1a7a3a" : "1px solid #eef2ee", background: activeTab === t.id ? "#1a7a3a" : "white", color: activeTab === t.id ? "white" : "#4a6b4c", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "14px", overflow: "hidden" }}>
            {activeTab === "striking" && <QueryTable title="Striking Distance Keywords" desc="Queries ranking position 7–15 — small improvements could move these to page 1." rows={data.striking} cols={["Query", "Clicks", "Impressions", "CTR", "Position"]} keys={["query", "clicks", "impressions", "ctr", "position"]} formatters={{ ctr: v => `${(v*100).toFixed(1)}%`, position: v => v.toFixed(1) }} />}
            {activeTab === "lowctr" && <QueryTable title="High Impression / Low CTR" desc="Pages getting seen but not clicked — title and meta description need improvement." rows={data.lowCtr} cols={["Query", "Impressions", "Clicks", "CTR", "Position"]} keys={["query", "impressions", "clicks", "ctr", "position"]} formatters={{ ctr: v => `${(v*100).toFixed(1)}%`, position: v => v.toFixed(1) }} />}
            {activeTab === "aioverview" && <QueryTable title="AI Overview Performance" desc="Queries where your site appears in Google's AI-generated summaries." rows={data.aiOverview} cols={["Query", "Clicks", "Impressions", "CTR", "Position"]} keys={["query", "clicks", "impressions", "ctr", "position"]} formatters={{ ctr: v => `${(v*100).toFixed(1)}%`, position: v => v.toFixed(1) }} />}
            {activeTab === "indexed" && <UrlTable title="Discovered — Currently Not Indexed" desc="Pages Google found but hasn't indexed yet." rows={data.notIndexed} />}
            {activeTab === "vitals" && <VitalsPanel data={data.vitals} />}
            {activeTab === "branded" && <BrandedPanel data={data.branded} />}
          </div>
        </>
      )}
    </div>
  );
}

function QueryTable({ title, desc, rows, cols, keys, formatters = {} }) {
  if (!rows?.length) return <EmptyState title={title} desc={desc} msg="No data available for this period." />;
  return (
    <div>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0d1f0e", marginBottom: "4px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: "#4a6b4c" }}>{desc}</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eef2ee", background: "#f8faf8" }}>
              {cols.map(c => <th key={c} style={{ textAlign: c === cols[0] ? "left" : "right", padding: "10px 16px", fontWeight: "600", color: "#4a6b4c", whiteSpace: "nowrap" }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eef2ee" }}>
                {keys.map(k => (
                  <td key={k} style={{ textAlign: k === keys[0] ? "left" : "right", padding: "10px 16px", color: "#0d1f0e", whiteSpace: k === keys[0] ? "normal" : "nowrap" }}>
                    {formatters[k] ? formatters[k](row[k]) : row[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UrlTable({ title, desc, rows }) {
  if (!rows?.length) return <EmptyState title={title} desc={desc} msg="No unindexed pages found — great!" />;
  return (
    <div>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0d1f0e", marginBottom: "4px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: "#4a6b4c" }}>{desc}</div>
      </div>
      <div style={{ padding: "8px 0" }}>
        {rows.map((url, i) => (
          <div key={i} style={{ padding: "10px 24px", borderBottom: "1px solid #eef2ee", fontSize: "13px", color: "#0d1f0e", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#f59e0b", fontWeight: "700" }}>!</span>
            <a href={url} target="_blank" rel="noreferrer" style={{ color: "#1a7a3a", textDecoration: "none" }}>{url}</a>
          </div>
        ))}
      </div>
    </div>
  );
}

function VitalsPanel({ data }) {
  if (!data) return <EmptyState title="Core Web Vitals" desc="Page experience signals from Chrome users." msg="No Core Web Vitals data available." />;
  const metrics = [
    { label: "LCP", value: data.lcp, unit: "s", good: 2.5, poor: 4 },
    { label: "INP", value: data.inp, unit: "ms", good: 200, poor: 500 },
    { label: "CLS", value: data.cls, unit: "", good: 0.1, poor: 0.25 },
  ];
  return (
    <div>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0d1f0e", marginBottom: "4px" }}>Core Web Vitals</div>
        <div style={{ fontSize: "13px", color: "#4a6b4c" }}>Real user experience data from Chrome — direct Google ranking signals.</div>
      </div>
      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
        {metrics.map(m => {
          const color = m.value <= m.good ? "#1a7a3a" : m.value <= m.poor ? "#f59e0b" : "#ef4444";
          const label = m.value <= m.good ? "Good" : m.value <= m.poor ? "Needs improvement" : "Poor";
          return (
            <div key={m.label} style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>{m.label}</div>
              <div style={{ fontSize: "32px", fontWeight: "800", color, fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1, marginBottom: "6px" }}>{m.value?.toFixed(m.label === "CLS" ? 2 : m.label === "INP" ? 0 : 1)}{m.unit}</div>
              <div style={{ fontSize: "12px", color, fontWeight: "600" }}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrandedPanel({ data }) {
  if (!data) return <EmptyState title="Branded vs Non-Branded" desc="Traffic split between brand searches and category searches." msg="No data available." />;
  const total = (data.brandedClicks || 0) + (data.nonBrandedClicks || 0);
  const brandedPct = total ? Math.round((data.brandedClicks / total) * 100) : 0;
  const nonBrandedPct = 100 - brandedPct;
  return (
    <div>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0d1f0e", marginBottom: "4px" }}>Branded vs Non-Branded Traffic</div>
        <div style={{ fontSize: "13px", color: "#4a6b4c" }}>How much of your search traffic comes from people searching your brand name.</div>
      </div>
      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "#eef8f0", border: "1px solid #d0e8d4", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a7a3a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Branded</div>
          <div style={{ fontSize: "40px", fontWeight: "800", color: "#1a7a3a", fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1, marginBottom: "4px" }}>{brandedPct}%</div>
          <div style={{ fontSize: "13px", color: "#4a6b4c" }}>{data.brandedClicks?.toLocaleString()} clicks</div>
        </div>
        <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Non-Branded</div>
          <div style={{ fontSize: "40px", fontWeight: "800", color: "#0d1f0e", fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1, marginBottom: "4px" }}>{nonBrandedPct}%</div>
          <div style={{ fontSize: "13px", color: "#4a6b4c" }}>{data.nonBrandedClicks?.toLocaleString()} clicks</div>
        </div>
      </div>
      {data.brandKeywords?.length > 0 && (
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Detected brand keywords</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {data.brandKeywords.map(k => <span key={k} style={{ background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" }}>{k}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, desc, msg }) {
  return (
    <div>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0d1f0e", marginBottom: "4px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: "#4a6b4c" }}>{desc}</div>
      </div>
      <div style={{ padding: "48px 24px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>{msg}</div>
    </div>
  );
}
