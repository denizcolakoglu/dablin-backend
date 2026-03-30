import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const API = "https://dablin-backend-production.up.railway.app";

function fmt(n, type) {
  if (n == null) return "—";
  if (type === "ctr") return `${(n * 100).toFixed(1)}%`;
  if (type === "pos") return parseFloat(n).toFixed(1);
  if (type === "num") return Number(n).toLocaleString();
  return n;
}

function MetricCard({ label, value, sub, color = "#1a7a3a" }) {
  return (
    <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "12px", padding: "20px 24px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: "800", color, fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1, marginBottom: "4px" }}>{value}</div>
      {sub && <div style={{ fontSize: "12px", color: "#4a6b4c" }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, desc }) {
  return (
    <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2ee" }}>
      <div style={{ fontSize: "15px", fontWeight: "700", color: "#0d1f0e", marginBottom: "3px" }}>{title}</div>
      {desc && <div style={{ fontSize: "13px", color: "#4a6b4c" }}>{desc}</div>}
    </div>
  );
}

function EmptyState({ title, desc, msg }) {
  return (
    <div>
      <SectionHeader title={title} desc={desc} />
      <div style={{ padding: "48px 24px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>{msg}</div>
    </div>
  );
}

function Tip({ text }) {
  return <div style={{ margin: "12px 24px 0", background: "#eef8f0", border: "1px solid #d0e8d4", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#1a7a3a", fontWeight: "500" }}>💡 {text}</div>;
}

function DataTable({ rows, cols, keys, formatters = {} }) {
  if (!rows?.length) return <div style={{ padding: "40px 24px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>No data available for this period.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eef2ee", background: "#f8faf8" }}>
            {cols.map((c, i) => <th key={c} style={{ textAlign: i === 0 ? "left" : "right", padding: "10px 16px", fontWeight: "600", color: "#4a6b4c", whiteSpace: "nowrap" }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #eef2ee", background: i % 2 === 0 ? "white" : "#fafcfa" }}>
              {keys.map((k, ki) => (
                <td key={k} style={{ textAlign: ki === 0 ? "left" : "right", padding: "10px 16px", color: "#0d1f0e", whiteSpace: ki === 0 ? "normal" : "nowrap" }}>
                  {formatters[k] ? formatters[k](row[k]) : row[k]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: "6px", padding: "14px 24px", borderBottom: "1px solid #eef2ee" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{ padding: "5px 14px", borderRadius: "20px", border: active === t.id ? "2px solid #1a7a3a" : "1px solid #eef2ee", background: active === t.id ? "#1a7a3a" : "white", color: active === t.id ? "white" : "#4a6b4c", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>{t.label}</button>
      ))}
    </div>
  );
}

// ── PANELS ────────────────────────────────────────────────────

function PerformancePanel({ data }) {
  const [sub, setSub] = useState("striking");
  const qFmt = { clicks: v => fmt(v,"num"), impressions: v => fmt(v,"num"), ctr: v => fmt(v,"ctr"), position: v => fmt(v,"pos") };
  return (
    <div>
      <SectionHeader title="Performance" desc="Find quick wins to improve your rankings and CTR." />
      <SubTabs tabs={[{ id:"striking", label:"Striking Distance" },{ id:"lowctr", label:"Low CTR" },{ id:"aioverview", label:"AI Overview" }]} active={sub} onChange={setSub} />
      {sub === "striking" && <>
        <Tip text="These queries rank position 8–20. Small content improvements can push them to page 1." />
        <DataTable rows={data?.striking} cols={["Query","Clicks","Impressions","CTR","Position"]} keys={["query","clicks","impressions","ctr","position"]} formatters={qFmt} />
      </>}
      {sub === "lowctr" && <>
        <Tip text="High impressions, low clicks — rewrite your title tags and meta descriptions for these queries." />
        <DataTable rows={data?.lowCtr} cols={["Query","Impressions","Clicks","CTR","Position"]} keys={["query","impressions","clicks","ctr","position"]} formatters={qFmt} />
      </>}
      {sub === "aioverview" && <>
        <Tip text="Add FAQPage or HowTo schema to more pages to increase AI Overview eligibility." />
        <DataTable rows={data?.aiOverview} cols={["Query","Clicks","Impressions","CTR","Position"]} keys={["query","clicks","impressions","ctr","position"]} formatters={qFmt} />
      </>}
    </div>
  );
}

function QueriesPanel({ data }) {
  const [sub, setSub] = useState("all");
  const [search, setSearch] = useState("");
  const all = data?.allQueries || [];

  // Hidden opportunities: impressions >= 20, 0 clicks — terms Google shows you for but users don't click
  const opportunities = all.filter(r => r.impressions >= 20 && r.clicks === 0)
    .sort((a, b) => b.impressions - a.impressions);

  // Intent mismatch: high impressions, position <= 5, but very low CTR (content doesn't match what searcher wants)
  const intentMismatch = all.filter(r => r.impressions >= 30 && r.position <= 5 && r.ctr < 0.05)
    .sort((a, b) => b.impressions - a.impressions);

  const filtered = search ? all.filter(r => r.query.toLowerCase().includes(search.toLowerCase())) : all;

  const qFmt = { clicks: v=>fmt(v,"num"), impressions: v=>fmt(v,"num"), ctr: v=>fmt(v,"ctr"), position: v=>fmt(v,"pos") };

  return (
    <div>
      <SectionHeader title="Queries" desc="Search terms driving traffic — plus hidden opportunities and intent gaps." />
      <SubTabs
        tabs={[
          { id: "all",          label: "All Queries" },
          { id: "opportunities",label: "Hidden Opportunities" },
          { id: "intent",       label: "Content Intent" },
        ]}
        active={sub} onChange={setSub}
      />

      {sub === "all" && (
        <>
          <Tip text="Sort by impressions to find queries where you're visible but not ranking highly enough to get clicks." />
          <div style={{ padding: "10px 24px", borderBottom: "1px solid #eef2ee" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter queries..." style={{ width: "100%", maxWidth: "320px", padding: "7px 12px", border: "1px solid #eef2ee", borderRadius: "8px", fontSize: "13px", outline: "none", color: "#0d1f0e", background: "#f8faf8" }} />
          </div>
          <DataTable rows={filtered.slice(0, 200)} cols={["Query","Clicks","Impressions","CTR","Position"]} keys={["query","clicks","impressions","ctr","position"]} formatters={qFmt} />
          {filtered.length > 200 && <div style={{ padding: "10px 24px", fontSize: "12px", color: "#4a6b4c" }}>Showing 200 of {filtered.length} queries</div>}
        </>
      )}

      {sub === "opportunities" && (
        <>
          <Tip text="These queries get impressions but zero clicks — Google already shows you for them. Create or improve content targeting these exact terms to start capturing that traffic." />
          <DataTable
            rows={opportunities.slice(0, 100)}
            cols={["Query","Impressions","Clicks","CTR","Position"]}
            keys={["query","impressions","clicks","ctr","position"]}
            formatters={qFmt}
          />
          {!opportunities.length && (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>No zero-click queries found — great signal that your content is converting impressions.</div>
          )}
        </>
      )}

      {sub === "intent" && (
        <>
          <Tip text="You rank in the top 5 for these queries but CTR is below 5% — your title or meta description probably doesn't match what the searcher actually wants. Revisit the content angle." />
          <DataTable
            rows={intentMismatch.slice(0, 100)}
            cols={["Query","Impressions","Clicks","CTR","Position"]}
            keys={["query","impressions","clicks","ctr","position"]}
            formatters={qFmt}
          />
          {!intentMismatch.length && (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>No intent mismatches detected — your top-ranking content appears well aligned with user intent.</div>
          )}
        </>
      )}
    </div>
  );
}

function PagesPanel({ data }) {
  const [sub, setSub] = useState("top");
  const pageFmt = { page: v => <a href={v} target="_blank" rel="noreferrer" style={{ color: "#1a7a3a", textDecoration: "none", display: "block", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</a>, clicks: v=>fmt(v,"num"), impressions: v=>fmt(v,"num"), ctr: v=>fmt(v,"ctr"), position: v=>fmt(v,"pos") };
  return (
    <div>
      <SectionHeader title="Pages" desc="Performance by URL — find your strongest and weakest pages." />
      <SubTabs tabs={[{ id:"top", label:"Top Pages" },{ id:"lowctr", label:"Low CTR Pages" }]} active={sub} onChange={setSub} />
      {sub === "top" && <>
        <Tip text="Double down on top pages — add internal links to them and expand their content." />
        <DataTable rows={data?.topPages} cols={["Page","Clicks","Impressions","CTR","Position"]} keys={["page","clicks","impressions","ctr","position"]} formatters={pageFmt} />
      </>}
      {sub === "lowctr" && <>
        <Tip text="These pages are visible in Google but not getting clicked. Improve title tags and meta descriptions." />
        <DataTable rows={data?.lowCtrPages} cols={["Page","Impressions","Clicks","CTR","Position"]} keys={["page","impressions","clicks","ctr","position"]} formatters={pageFmt} />
      </>}
    </div>
  );
}

function IndexingPanel({ data }) {
  const [sub, setSub] = useState("overview");
  const notIndexed = data?.notIndexed || [];
  const excluded = data?.excluded || [];
  const sitemaps = data?.sitemaps || [];

  return (
    <div>
      <SectionHeader title="Indexing" desc="Which pages Google has indexed, excluded, and any sitemap errors." />

      {/* Summary cards */}
      <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", borderBottom: "1px solid #eef2ee" }}>
        {[
          { label: "Estimated Indexed", value: fmt(data?.indexed, "num"), color: "#1a7a3a" },
          { label: "Not Indexed", value: fmt(notIndexed.length, "num"), color: notIndexed.length > 0 ? "#f59e0b" : "#1a7a3a" },
          { label: "Excluded", value: fmt(excluded.length, "num"), color: excluded.length > 0 ? "#ef4444" : "#4a6b4c" },
          { label: "Sitemaps", value: fmt(sitemaps.length, "num"), color: "#4a6b4c" },
        ].map(m => (
          <div key={m.label} style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "14px 18px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{m.label}</div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: m.color, fontFamily: "'Roboto Condensed', sans-serif" }}>{m.value}</div>
          </div>
        ))}
      </div>

      <SubTabs
        tabs={[
          { id: "overview",   label: "Overview" },
          { id: "notindexed", label: "Not Indexed" },
          { id: "excluded",   label: "Excluded Pages" },
          { id: "sitemaps",   label: "Sitemaps" },
        ]}
        active={sub} onChange={setSub}
      />

      {sub === "overview" && (
        <div style={{ padding: "20px 24px" }}>
          {[
            { icon: "✅", title: "Indexed pages", desc: "Pages Google has crawled and added to its index. These are eligible to appear in search results.", count: data?.indexed },
            { icon: "⚠️", title: "Discovered — not indexed", desc: "Google found these pages but hasn't indexed them yet. Common causes: low quality signals, thin content, crawl budget.", count: notIndexed.length, warn: notIndexed.length > 0 },
            { icon: "🚫", title: "Excluded pages", desc: "Pages intentionally or unintentionally excluded from Google's index. Check for noindex tags, canonical issues, or redirect chains.", count: excluded.length, warn: excluded.length > 0 },
            { icon: "🗺️", title: "Sitemaps submitted", desc: "Sitemaps help Google discover all your pages. Check for errors and warnings below.", count: sitemaps.length },
          ].map(item => (
            <div key={item.title} style={{ display: "flex", gap: "16px", padding: "14px 0", borderBottom: "1px solid #eef2ee", alignItems: "flex-start" }}>
              <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0d1f0e", marginBottom: "3px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "#4a6b4c", lineHeight: "1.5" }}>{item.desc}</div>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: item.warn ? "#f59e0b" : "#1a7a3a", fontFamily: "'Roboto Condensed', sans-serif", flexShrink: 0 }}>{fmt(item.count, "num")}</div>
            </div>
          ))}
        </div>
      )}

      {sub === "notindexed" && (
        <>
          <Tip text="Submit these URLs in Google Search Console's URL Inspection tool to request indexing. Also check for thin content or noindex tags." />
          {!notIndexed.length
            ? <div style={{ padding: "40px 24px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>No unindexed pages detected.</div>
            : notIndexed.map((url, i) => (
              <div key={i} style={{ padding: "10px 24px", borderBottom: "1px solid #eef2ee", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#f59e0b", fontWeight: "700", flexShrink: 0 }}>!</span>
                <a href={url} target="_blank" rel="noreferrer" style={{ color: "#1a7a3a", textDecoration: "none" }}>{url}</a>
              </div>
            ))
          }
        </>
      )}

      {sub === "excluded" && (
        <>
          <Tip text="Excluded pages are blocked from Google's index. Check for noindex meta tags, canonical tags pointing elsewhere, or redirect chains causing issues." />
          {!excluded.length ? (
            <div style={{ padding: "24px" }}>
              <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "20px 24px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0d1f0e", marginBottom: "8px" }}>Common exclusion reasons</div>
                {[
                  { reason: "noindex tag", desc: "A <meta name='robots' content='noindex'> tag is blocking Google from indexing the page.", fix: "Remove the noindex tag if the page should be indexed." },
                  { reason: "Canonical pointing elsewhere", desc: "The page has a canonical tag pointing to a different URL, so Google treats it as a duplicate.", fix: "Verify canonical tags are pointing to the correct canonical version." },
                  { reason: "Redirect", desc: "The URL redirects to another page, so Google indexes the destination instead.", fix: "Ensure redirects lead to the correct final destination." },
                  { reason: "Crawl blocked by robots.txt", desc: "The page is disallowed in robots.txt, preventing Google from crawling it.", fix: "Check your robots.txt and remove any unintended disallow rules." },
                ].map(item => (
                  <div key={item.reason} style={{ padding: "12px 0", borderBottom: "1px solid #eef2ee" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#c0392b", marginBottom: "3px" }}>🚫 {item.reason}</div>
                    <div style={{ fontSize: "12px", color: "#4a6b4c", marginBottom: "3px" }}>{item.desc}</div>
                    <div style={{ fontSize: "12px", color: "#1a7a3a", fontWeight: "500" }}>Fix: {item.fix}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : excluded.map((item, i) => (
            <div key={i} style={{ padding: "10px 24px", borderBottom: "1px solid #eef2ee", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#1a7a3a", textDecoration: "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.url}</a>
              <span style={{ background: "#fef2f2", color: "#c0392b", border: "1px solid #fca5a5", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "600", flexShrink: 0 }}>{item.reason || "Excluded"}</span>
            </div>
          ))}
        </>
      )}

      {sub === "sitemaps" && (
        <>
          <Tip text="Sitemaps help Google discover all your pages. Fix any errors immediately — they can prevent entire sections of your site from being indexed." />
          {!sitemaps.length
            ? <div style={{ padding: "40px 24px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>No sitemaps submitted. Go to Google Search Console → Sitemaps to submit your sitemap.xml.</div>
            : sitemaps.map((s, i) => (
              <div key={i} style={{ padding: "12px 24px", borderBottom: "1px solid #eef2ee", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#0d1f0e" }}>{s.path}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {s.errors > 0 && <span style={{ background: "#fef2f2", color: "#c0392b", border: "1px solid #fca5a5", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "600" }}>{s.errors} errors</span>}
                  {s.warnings > 0 && <span style={{ background: "#fffbf0", color: "#b45309", border: "1px solid #fcd34d", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "600" }}>{s.warnings} warnings</span>}
                  {!s.errors && !s.warnings && <span style={{ background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "600" }}>OK</span>}
                </div>
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}

function LinksPanel({ data }) {
  const [sub, setSub] = useState("external");
  return (
    <div>
      <SectionHeader title="Links" desc="External backlinks and internal link structure." />
      <SubTabs tabs={[{ id:"external", label:"External Links" },{ id:"internal", label:"Internal Links" }]} active={sub} onChange={setSub} />
      {sub === "external" && <DataTable rows={data?.externalLinks} cols={["Linking Site","Links"]} keys={["site","links"]} formatters={{ links: v=>fmt(v,"num") }} />}
      {sub === "internal" && <>
        <Tip text="Pages with fewer than 3 internal links are highlighted — they may be hard for Google to discover." />
        <DataTable rows={data?.internalLinks} cols={["Target Page","Internal Links"]} keys={["page","links"]}
          formatters={{ page: v => <a href={v} target="_blank" rel="noreferrer" style={{ color: "#1a7a3a", textDecoration: "none" }}>{v}</a>, links: v => <span style={{ color: v < 3 ? "#f59e0b" : "#0d1f0e", fontWeight: v < 3 ? "700" : "400" }}>{fmt(v,"num")}</span> }} />
      </>}
    </div>
  );
}

function VitalsPanel({ data }) {
  if (!data) return <EmptyState title="Core Web Vitals" desc="Real user experience signals from Chrome — direct Google ranking factors." msg="No Core Web Vitals data available for this domain." />;
  const metrics = [
    { label: "LCP", full: "Largest Contentful Paint", value: data.lcp, unit: "s", good: 2.5, poor: 4, desc: "How fast the main content loads." },
    { label: "INP", full: "Interaction to Next Paint", value: data.inp, unit: "ms", good: 200, poor: 500, desc: "How fast the page responds to user input." },
    { label: "CLS", full: "Cumulative Layout Shift", value: data.cls, unit: "", good: 0.1, poor: 0.25, desc: "How much the page layout shifts while loading." },
  ];
  return (
    <div>
      <SectionHeader title="Core Web Vitals" desc="Real user experience data from Chrome — direct Google ranking signals." />
      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
        {metrics.map(m => {
          const v = m.value;
          const color = v == null ? "#4a6b4c" : v <= m.good ? "#1a7a3a" : v <= m.poor ? "#f59e0b" : "#ef4444";
          const status = v == null ? "No data" : v <= m.good ? "Good" : v <= m.poor ? "Needs improvement" : "Poor";
          const display = v == null ? "—" : `${v.toFixed(m.label === "CLS" ? 2 : m.label === "INP" ? 0 : 1)}${m.unit}`;
          return (
            <div key={m.label} style={{ background: "#f8faf8", border: `1.5px solid ${color}44`, borderRadius: "12px", padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{m.label}</div>
              <div style={{ fontSize: "12px", color: "#4a6b4c", marginBottom: "12px" }}>{m.full}</div>
              <div style={{ fontSize: "36px", fontWeight: "800", color, fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1, marginBottom: "8px" }}>{display}</div>
              <div style={{ display: "inline-block", background: `${color}18`, color, border: `1px solid ${color}44`, borderRadius: "20px", padding: "3px 12px", fontSize: "11px", fontWeight: "700", marginBottom: "10px" }}>{status}</div>
              <div style={{ fontSize: "12px", color: "#4a6b4c", lineHeight: "1.5" }}>{m.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CountriesPanel({ data }) {
  const [sub, setSub] = useState("countries");
  const countries = data?.countries || [];
  const devices = data?.devices || [];
  return (
    <div>
      <SectionHeader title="Countries & Devices" desc="Where your users are and how they access your site." />
      <SubTabs tabs={[{ id:"countries", label:"Countries" },{ id:"devices", label:"Devices" }]} active={sub} onChange={setSub} />
      {sub === "countries" && <DataTable rows={countries} cols={["Country","Clicks","Impressions","CTR","Position"]} keys={["country","clicks","impressions","ctr","position"]}
        formatters={{ clicks: v=>fmt(v,"num"), impressions: v=>fmt(v,"num"), ctr: v=>fmt(v,"ctr"), position: v=>fmt(v,"pos") }} />}
      {sub === "devices" && (
        !devices.length
          ? <div style={{ padding: "40px 24px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>No device data available.</div>
          : <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
              {devices.map(d => {
                const icons = { MOBILE: "📱", DESKTOP: "🖥️", TABLET: "📲" };
                return (
                  <div key={d.device} style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icons[d.device] || "💻"}</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0d1f0e", marginBottom: "12px" }}>{d.device}</div>
                    <div style={{ fontSize: "26px", fontWeight: "800", color: "#1a7a3a", fontFamily: "'Roboto Condensed', sans-serif", marginBottom: "4px" }}>{fmt(d.clicks,"num")}</div>
                    <div style={{ fontSize: "12px", color: "#4a6b4c" }}>clicks</div>
                    <div style={{ marginTop: "6px", fontSize: "12px", color: "#4a6b4c" }}>{fmt(d.impressions,"num")} impressions</div>
                  </div>
                );
              })}
            </div>
      )}
    </div>
  );
}

function BrandedPanel({ data }) {
  if (!data) return <EmptyState title="Branded vs Non-Branded" desc="Traffic split between brand and category searches." msg="No data available." />;
  const total = (data.brandedClicks || 0) + (data.nonBrandedClicks || 0);
  const bp = total ? Math.round((data.brandedClicks / total) * 100) : 0;
  return (
    <div>
      <SectionHeader title="Branded vs Non-Branded Traffic" desc="How much traffic comes from people already knowing your brand." />
      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "#eef8f0", border: "1px solid #d0e8d4", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#1a7a3a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Branded</div>
          <div style={{ fontSize: "44px", fontWeight: "800", color: "#1a7a3a", fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1, marginBottom: "6px" }}>{bp}%</div>
          <div style={{ fontSize: "13px", color: "#4a6b4c" }}>{fmt(data.brandedClicks,"num")} clicks</div>
        </div>
        <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Non-Branded</div>
          <div style={{ fontSize: "44px", fontWeight: "800", color: "#0d1f0e", fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1, marginBottom: "6px" }}>{100 - bp}%</div>
          <div style={{ fontSize: "13px", color: "#4a6b4c" }}>{fmt(data.nonBrandedClicks,"num")} clicks</div>
        </div>
      </div>
      {data.brandKeywords?.length > 0 && (
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Detected brand keywords</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {data.brandKeywords.map(k => <span key={k} style={{ background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" }}>{k}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DATE PRESETS ──────────────────────────────────────────────
const DATE_PRESETS = [
  { label: "7d", days: 7 },
  { label: "28d", days: 28 },
  { label: "3m", days: 90 },
  { label: "6m", days: 180 },
  { label: "12m", days: 365 },
];

function toDateStr(d) { return d.toISOString().split("T")[0]; }

const TABS = [
  { id: "performance", label: "Performance" },
  { id: "queries",     label: "Queries" },
  { id: "pages",       label: "Pages" },
  { id: "indexing",    label: "Indexing" },
  { id: "links",       label: "Links" },
  { id: "vitals",      label: "Core Web Vitals" },
  { id: "countries",   label: "Countries & Devices" },
  { id: "branded",     label: "Branded vs Non-Branded" },
];

// ── MAIN ──────────────────────────────────────────────────────
export default function SearchConsole({ setPage }) {
  const { getToken } = useAuth();
  const [status, setStatus]         = useState("loading");
  const [sites, setSites]           = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [data, setData]             = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab]   = useState("performance");
  const [error, setError]           = useState(null);
  const [datePreset, setDatePreset] = useState(28);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd]   = useState("");

  useEffect(() => { checkConnection(); }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("gsc") === "connected") {
      window.history.replaceState({}, "", "/dashboard/search-console");
      checkConnection();
    }
  }, []);

  useEffect(() => {
    if (selectedSite) fetchData(selectedSite);
  }, [selectedSite, datePreset]);

  async function checkConnection() {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/gsc/status`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (d.connected) {
        setStatus("connected"); setSites(d.sites || []);
        setSelectedSite(d.selectedSite || d.sites?.[0]);
      } else setStatus("disconnected");
    } catch { setStatus("disconnected"); }
  }

  async function connect() {
    try {
      setError(null); setStatus("loading");
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API}/api/gsc/auth-url`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Error ${res.status}`); }
      const d = await res.json();
      if (!d.url) throw new Error("No auth URL returned");
      window.location.href = d.url;
    } catch (err) { setError("Connection failed: " + err.message); setStatus("disconnected"); }
  }

  async function disconnect() {
    const token = await getToken();
    await fetch(`${API}/api/gsc/disconnect`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    setStatus("disconnected"); setData(null); setSites([]);
  }

  async function fetchData(site, customDates) {
    setLoadingData(true); setError(null);
    try {
      const token = await getToken();
      const endDate = toDateStr(new Date());
      const startDate = customDates?.start
        ? customDates.start
        : toDateStr(new Date(Date.now() - datePreset * 24 * 60 * 60 * 1000));
      const endParam = customDates?.end || endDate;
      const res = await fetch(
        `${API}/api/gsc/data?site=${encodeURIComponent(site)}&startDate=${startDate}&endDate=${endParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to fetch data");
      setData(d);
    } catch (e) { setError(e.message); }
    finally { setLoadingData(false); }
  }

  function applyCustomDates() {
    if (customStart && customEnd) fetchData(selectedSite, { start: customStart, end: customEnd });
  }

  if (status === "loading") return (
    <div style={{ padding: "64px", textAlign: "center", color: "#4a6b4c", fontSize: "14px" }}>Loading...</div>
  );

  if (status === "disconnected") return (
    <div style={{ maxWidth: "580px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", background: "#eef8f0", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "28px" }}>🔍</div>
      <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.5px", marginBottom: "12px" }}>Connect Google Search Console</h2>
      <p style={{ fontSize: "15px", color: "#4a6b4c", lineHeight: "1.65", marginBottom: "28px" }}>Get full visibility into your search performance, indexing, Core Web Vitals, and more — all in Dablin.</p>
      {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", color: "#c0392b", fontSize: "13px", marginBottom: "20px" }}>{error}</div>}
      <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "14px", padding: "20px 24px", marginBottom: "28px", textAlign: "left" }}>
        {["Performance: striking distance, low CTR & AI Overview", "All search queries with clicks, impressions and position", "Page-level performance and optimization insights", "Indexing status, sitemap health and crawl errors", "Core Web Vitals: LCP, INP, CLS", "Countries & device breakdown", "Branded vs non-branded traffic split"].map(item => (
          <div key={item} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px", color: "#4a6b4c", marginBottom: "8px" }}>
            <span style={{ color: "#1a7a3a", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>✓</span>{item}
          </div>
        ))}
      </div>
      <button onClick={connect} style={{ background: "#1a7a3a", color: "white", border: "none", padding: "14px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Connect Google Search Console
      </button>
      <p style={{ fontSize: "12px", color: "#4a6b4c", marginTop: "14px" }}>Read-only access · Disconnect anytime</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.5px", marginBottom: "3px" }}>Search Console</h1>
          <p style={{ fontSize: "12px", color: "#4a6b4c" }}>{selectedSite}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Date presets */}
          <div style={{ display: "flex", gap: "2px", background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "3px" }}>
            {DATE_PRESETS.map(p => (
              <button key={p.days} onClick={() => { setShowCustom(false); setDatePreset(p.days); }} style={{ padding: "5px 11px", borderRadius: "7px", border: "none", background: !showCustom && datePreset === p.days ? "#1a7a3a" : "transparent", color: !showCustom && datePreset === p.days ? "white" : "#4a6b4c", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>{p.label}</button>
            ))}
            <button onClick={() => setShowCustom(v => !v)} style={{ padding: "5px 11px", borderRadius: "7px", border: "none", background: showCustom ? "#1a7a3a" : "transparent", color: showCustom ? "white" : "#4a6b4c", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Custom</button>
          </div>
          {/* Custom date inputs */}
          {showCustom && (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #eef2ee", borderRadius: "8px", fontSize: "12px", color: "#0d1f0e", outline: "none" }} />
              <span style={{ fontSize: "12px", color: "#4a6b4c" }}>to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #eef2ee", borderRadius: "8px", fontSize: "12px", color: "#0d1f0e", outline: "none" }} />
              <button onClick={applyCustomDates} style={{ padding: "6px 14px", background: "#1a7a3a", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Apply</button>
            </div>
          )}
          {sites.length > 1 && (
            <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} style={{ padding: "7px 12px", border: "1px solid #eef2ee", borderRadius: "8px", fontSize: "13px", color: "#0d1f0e", background: "white" }}>
              {sites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <button onClick={disconnect} style={{ background: "none", border: "1px solid #eef2ee", color: "#4a6b4c", padding: "7px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Disconnect</button>
        </div>
      </div>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", color: "#c0392b", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}

      {loadingData ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#4a6b4c" }}>
          <div style={{ fontSize: "24px", marginBottom: "12px" }}>◎</div>Fetching Search Console data...
        </div>
      ) : data && (
        <>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
            <MetricCard label="Total Clicks" value={fmt(data.summary?.clicks,"num")} sub={`last ${showCustom ? "custom period" : datePreset + " days"}`} />
            <MetricCard label="Impressions" value={fmt(data.summary?.impressions,"num")} sub="search appearances" color="#2d9a4e" />
            <MetricCard label="Avg CTR" value={data.summary?.ctr ? `${(data.summary.ctr*100).toFixed(1)}%` : "—"} sub="click-through rate" color="#f59e0b" />
            <MetricCard label="Avg Position" value={data.summary?.position ? data.summary.position.toFixed(1) : "—"} sub="average ranking" color="#4a6b4c" />
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "2px solid #eef2ee", marginBottom: "16px", overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "10px 16px", border: "none", borderBottom: activeTab === t.id ? "2px solid #1a7a3a" : "2px solid transparent", background: "transparent", color: activeTab === t.id ? "#1a7a3a" : "#4a6b4c", fontSize: "13px", fontWeight: activeTab === t.id ? "700" : "500", cursor: "pointer", whiteSpace: "nowrap", marginBottom: "-2px" }}>{t.label}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "14px", overflow: "hidden" }}>
            {activeTab === "performance" && <PerformancePanel data={data} />}
            {activeTab === "queries"     && <QueriesPanel data={data} />}
            {activeTab === "pages"       && <PagesPanel data={data} />}
            {activeTab === "indexing"    && <IndexingPanel data={data} />}
            {activeTab === "links"       && <LinksPanel data={data} />}
            {activeTab === "vitals"      && <VitalsPanel data={data.vitals} />}
            {activeTab === "countries"   && <CountriesPanel data={data} />}
            {activeTab === "branded"     && <BrandedPanel data={data.branded} />}
          </div>
        </>
      )}
    </div>
  );
}
