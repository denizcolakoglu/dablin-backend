import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";

const BASE = "https://dablin-backend-production.up.railway.app";
const STORAGE_KEY   = "dablin_getstarted";
const KANBAN_KEY    = "dablin_kanban";

const STEP_DEFS = [
  { id: "gsc",           priority: "critical",  icon: "📊", label: "Connect Google Search Console",       labelOk: "Google Search Console connected",   desc: "Without GSC you have no data on how Google sees your site — which pages are indexed, what queries bring traffic, or what errors exist.", fix: "Go to search.google.com/search-console, add your site, then connect it to Dablin.", cta: { label: "Connect GSC →", page: "searchconsole" }, ctaExternal: { label: "Set up GSC →", url: "https://search.google.com/search-console" }, check: r => !r.gscConnected },
  { id: "llmstxt",       priority: "critical",  icon: "🤖", label: "No llms.txt — AI can't identify your brand", labelOk: "llms.txt found",              desc: "llms.txt tells ChatGPT, Gemini and Claude what your site is about. Without it, AI engines have to guess — and often get it wrong.", fix: "Run the AI Visibility Audit and copy the generated llms.txt. Upload it to your site root.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => r.llmsTxt === false },
  { id: "orgSchema",     priority: "critical",  icon: "🏢", label: "No Organization schema",               labelOk: "Organization schema present",       desc: "Without Organization schema, AI engines and Google can't confirm your brand is a real entity.", fix: "Run the AI Visibility Audit to get the exact JSON-LD block to add to your homepage.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => r.orgSchema === false },
  { id: "https",         priority: "critical",  icon: "🔒", label: "HTTPS not enabled",                    labelOk: "HTTPS enabled",                     desc: "Your site is not served over HTTPS. Google penalises HTTP sites and AI engines distrust them.", fix: "Contact your hosting provider and enable SSL/TLS. Most hosts offer this for free.", cta: null, check: r => r.https === false },
  { id: "indexed",       priority: "critical",  icon: "🗂️", label: "Site may not be indexed by Google",    labelOk: "Site appears to be indexed",        desc: "Your homepage couldn't be confirmed as indexed. If Google hasn't indexed your site, you don't exist in search.", fix: "Submit your sitemap to Google Search Console and use the URL Inspection tool to request indexing.", cta: { label: "Check in Search Console →", page: "searchconsole" }, check: r => r.robotsBlocked === true },
  { id: "aiCrawlers",    priority: "important", icon: "🕷️", label: "AI crawlers blocked in robots.txt",   labelOk: "AI crawlers allowed",               desc: "GPTBot, ClaudeBot or PerplexityBot are blocked in your robots.txt. AI engines can't crawl your content.", fix: "Run the AI Visibility Audit to get the exact robots.txt rules to add.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => r.aiCrawlers === false },
  { id: "metaDesc",      priority: "important", icon: "📝", label: "Missing meta description",             labelOk: "Meta description present",          desc: "Without a meta description, Google writes its own — usually bad. This directly affects click-through rate.", fix: "Run the SEO Audit to get an AI-generated meta description for your page.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.metaDescription === false },
  { id: "productSchema", priority: "important", icon: "🛍️", label: "No Product schema",                   labelOk: "Product schema present",            desc: "Without Product schema, your listings don't qualify for Google Shopping and won't show star ratings or price.", fix: "Run the SEO Audit to get the exact JSON-LD Product schema block.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.productSchema === false },
  { id: "faqSchema",     priority: "important", icon: "❓", label: "No FAQPage schema",                    labelOk: "FAQPage schema present",            desc: "Without FAQPage schema or question headings, Google's AI won't summarise your content in AI Overviews.", fix: "Run the SEO Audit to check AI Overview eligibility and get a fix.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.faqSchema === false },
  { id: "openGraph",     priority: "important", icon: "🔗", label: "Missing Open Graph tags",              labelOk: "Open Graph tags present",           desc: "Missing og:title, og:description or og:image means your pages look broken when shared or cited by AI.", fix: "Run the AI Visibility Audit to get the missing OG tags generated.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => r.openGraph === false },
  { id: "infoGain",      priority: "important", icon: "📖", label: "Fails Information Gain (Mar 2026)",    labelOk: "Passes Information Gain",           desc: "Google's March 2026 update penalises pages with no original content. Your page may lack unique data or author signals.", fix: "Run the SEO Audit to see the full Information Gain score and what to add.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.infoGain === false },
  { id: "sitemap",       priority: "good",      icon: "🗺️", label: "No sitemap.xml found",                labelOk: "Sitemap.xml found",                 desc: "A sitemap helps Google discover all your pages faster, especially new ones.", fix: "Generate a sitemap using your CMS. Shopify and WordPress do this automatically. Submit in GSC.", cta: null, check: r => r.sitemap === false },
  { id: "canonical",     priority: "good",      icon: "🔁", label: "Missing canonical tag",               labelOk: "Canonical tag present",             desc: "Without a canonical tag, Shopify and similar platforms create duplicate URL penalties.", fix: "Run the SEO Audit for a canonical tag fix.", cta: { label: "Run SEO Audit →", page: "audit" }, check: r => r.canonical === false },
  { id: "aiVisibility",  priority: "good",      icon: "✨", label: "AI Visibility Audit not run yet",     labelOk: "AI Visibility Audit completed",      desc: "You haven't audited whether ChatGPT, Gemini or Claude can find and understand your brand.", fix: "Run the AI Visibility Audit to check all 12 signals AI engines use to cite your brand.", cta: { label: "Run AI Visibility Audit →", page: "ai" }, check: r => !r.hasRunAiAudit },
  // GSC-derived
  { id: "gscNotIndexed",    priority: "critical",  icon: "🚫", label: "Pages discovered but not indexed",      labelOk: "No unindexed pages detected",       desc: "Google found pages on your site but hasn't indexed them — they're invisible in search.", fix: "Open Search Console → Indexing. Use URL Inspection to request indexing.", cta: { label: "View in Search Console →", page: "searchconsole" }, check: r => r.gscConnected && r.gscNotIndexed === true },
  { id: "gscSitemap",       priority: "important", icon: "🗺️", label: "No sitemap submitted to GSC",           labelOk: "Sitemap submitted to GSC",          desc: "Without a sitemap in GSC, Google discovers pages by crawling alone — slower and less reliable.", fix: "Go to Google Search Console → Sitemaps and submit your sitemap.xml.", cta: { label: "View Sitemaps in GSC →", page: "searchconsole" }, ctaExternal: { label: "Open GSC →", url: "https://search.google.com/search-console/sitemaps" }, check: r => r.gscConnected && r.gscNoSitemap === true },
  { id: "gscVitals",        priority: "important", icon: "⚡", label: "Core Web Vitals failing",               labelOk: "Core Web Vitals passing",           desc: "Your site has poor LCP, INP or CLS scores — direct Google ranking signals.", fix: "Open the Core Web Vitals tab in Search Console to see which pages are failing.", cta: { label: "View Core Web Vitals →", page: "searchconsole" }, check: r => r.gscConnected && r.gscVitalsFailing === true },
  { id: "gscSitemapErrors", priority: "important", icon: "⚠️", label: "Sitemap errors in GSC",                 labelOk: "No sitemap errors in GSC",          desc: "Your sitemap has errors in Google Search Console that can prevent pages from being indexed.", fix: "Open Search Console → Sitemaps to see and fix the errors.", cta: { label: "View Sitemaps in GSC →", page: "searchconsole" }, check: r => r.gscConnected && r.gscSitemapErrors === true },
];

const PRIORITY_CONFIG = {
  critical:  { label: "Critical",     color: "#ef4444", pill: "#fef2f2", pillText: "#c0392b", pillBorder: "#fca5a5" },
  important: { label: "Important",    color: "#f59e0b", pill: "#fffbf0", pillText: "#b45309", pillBorder: "#fcd34d" },
  good:      { label: "Good to have", color: "#1a7a3a", pill: "#eef8f0", pillText: "#1a7a3a", pillBorder: "#d0e8d4" },
};

const COLUMNS = [
  { id: "todo",       label: "To Do",       color: "#ef4444", emptyMsg: "🎉 All clear!" },
  { id: "inprogress", label: "In Progress", color: "#f59e0b", emptyMsg: "Drag tickets here when working on them." },
  { id: "done",       label: "Done",        color: "#1a7a3a", emptyMsg: "Drag tickets here when fixed." },
];

const BLOG_POSTS = [
  { tag: "Google · SEO",       title: "Google March 2026: What the Fastest Core Update Means for Your Site", date: "26 Mar 2026", url: "https://blog.dablin.co/google-march-2026-update" },
  { tag: "SEO · Backlinks",    title: "Not All Backlinks Are Equal. Here's Why Most Link Building is a Waste of Time.", date: "23 Mar 2026", url: "https://blog.dablin.co/backlink-quality-vs-quantity" },
  { tag: "AI Visibility · GEO",title: "What Is Dablin? The Problem It Solves and How to Use It", date: "21 Mar 2026", url: "https://blog.dablin.co/what-is-dablin" },
];

// ── HELPERS ───────────────────────────────────────────────────
function loadKanban() {
  try { return JSON.parse(localStorage.getItem(KANBAN_KEY)) || {}; } catch { return {}; }
}
function saveKanban(positions) {
  try { localStorage.setItem(KANBAN_KEY, JSON.stringify(positions)); } catch {}
}

// ── TICKET ────────────────────────────────────────────────────
function Ticket({ item, colId, isDragging, onDragStart, onDragEnd, setPage, isExpanded, onExpand, gsUrl }) {
  const cfg = PRIORITY_CONFIG[item.priority];
  const isDone = colId === "done";
  const isInProgress = colId === "inprogress";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onExpand}
      style={{
        background: "white",
        border: `1px solid ${isExpanded ? cfg.color + "66" : "#eef2ee"}`,
        borderLeft: `3px solid ${isDone ? "#d0e8d4" : isInProgress ? "#f59e0b" : cfg.color}`,
        borderRadius: "10px",
        padding: "12px 14px",
        cursor: "grab",
        transition: "all 0.15s",
        opacity: isDragging ? 0.4 : isDone ? 0.7 : 1,
        userSelect: "none",
        boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
        {/* Drag handle */}
        <span style={{ fontSize: "12px", color: "#ccc", flexShrink: 0, marginTop: "2px", cursor: "grab" }}>⠿</span>
        <span style={{ fontSize: "15px", flexShrink: 0, marginTop: "0px" }}>{isDone ? "✅" : item.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: isDone ? "#4a6b4c" : "#0d1f0e", lineHeight: "1.35", textDecoration: isDone ? "line-through" : "none", marginBottom: "5px" }}>
            {isDone ? item.labelOk : item.label}
          </div>
          <span style={{ background: cfg.pill, color: cfg.pillText, border: `1px solid ${cfg.pillBorder}`, borderRadius: "20px", padding: "1px 7px", fontSize: "10px", fontWeight: "700" }}>
            {cfg.label}
          </span>
        </div>
        <span style={{ fontSize: "9px", color: "#9ab09c", flexShrink: 0, marginTop: "2px" }}>{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div
          style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #eef2ee" }}
          onClick={e => e.stopPropagation()}
        >
          <p style={{ fontSize: "12px", color: "#4a6b4c", lineHeight: "1.6", marginBottom: "8px" }}>{item.desc}</p>
          {!isDone && (
            <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "7px", padding: "8px 11px", marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>How to fix</div>
              <div style={{ fontSize: "12px", color: "#0d1f0e", lineHeight: "1.5" }}>{item.fix}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {!isDone && item.cta && (
              <button
                onClick={() => {
                  if (item.cta.page === "ai" || item.cta.page === "audit") {
                    if (gsUrl) sessionStorage.setItem("prefillUrl", gsUrl);
                  }
                  setPage(item.cta.page);
                }}
                style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
              >
                {item.cta.label}
              </button>
            )}
            {!isDone && item.ctaExternal && (
              <a
                href={item.ctaExternal.url} target="_blank" rel="noreferrer"
                style={{ background: "white", color: "#1a7a3a", border: "1.5px solid #d0e8d4", borderRadius: "6px", padding: "6px 12px", fontSize: "11px", fontWeight: "600", textDecoration: "none" }}
              >
                {item.ctaExternal.label}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── COLUMN ────────────────────────────────────────────────────
function KanbanColumn({ col, tickets, draggingId, dragOverCol, onDragOver, onDrop, setPage, gsUrl, expandedId, onExpand, onDragStart, onDragEnd }) {
  const isOver = dragOverCol === col.id && draggingId !== null;
  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(col.id); }}
      onDrop={() => onDrop(col.id)}
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: isOver ? col.color + "0a" : "transparent",
        border: isOver ? `2px dashed ${col.color}66` : "2px solid transparent",
        borderRadius: "12px",
        padding: "0 2px",
        transition: "all 0.15s",
      }}
    >
      {/* Column header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", paddingBottom: "10px", borderBottom: `2px solid ${col.color}` }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0d1f0e" }}>{col.label}</span>
        <span style={{ background: col.color + "22", color: col.color, border: `1px solid ${col.color}44`, borderRadius: "20px", padding: "1px 7px", fontSize: "11px", fontWeight: "700" }}>
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px", flex: 1, minHeight: "80px" }}>
        {tickets.length === 0 ? (
          <div style={{ background: "#f8faf8", border: "1px dashed #eef2ee", borderRadius: "10px", padding: "20px 14px", textAlign: "center", fontSize: "11px", color: "#9ab09c", lineHeight: "1.5" }}>
            {col.emptyMsg}
          </div>
        ) : (
          tickets.map(item => (
            <Ticket
              key={item.id}
              item={item}
              colId={col.id}
              isDragging={draggingId === item.id}
              onDragStart={() => onDragStart(item.id)}
              onDragEnd={onDragEnd}
              setPage={setPage}
              gsUrl={gsUrl}
              isExpanded={expandedId === item.id + "_" + col.id}
              onExpand={() => onExpand(item.id + "_" + col.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function Dashboard({ setPage }) {
  const { getToken } = useAuth();
  const [auditData, setAuditData] = useState(null);
  const [gsResult, setGsResult]   = useState(null);
  const [gsUrl, setGsUrl]         = useState("");
  const [loading, setLoading]     = useState(true);

  // Kanban state: { [ticketId]: "todo" | "inprogress" | "done" }
  const [positions, setPositions] = useState({});

  // Drag state
  const [draggingId, setDraggingId]   = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Expand state
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAuditData();
    // Load GetStarted result
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Date.now() - saved.ts < 24 * 60 * 60 * 1000) {
          setGsResult(saved.result);
          setGsUrl(saved.url || "");
        }
      }
    } catch {}
    // Load saved kanban positions
    setPositions(loadKanban());
  }, []);

  async function fetchAuditData() {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      setAuditData(await res.json());
    } catch {}
    finally { setLoading(false); }
  }

  // Build columns from STEP_DEFS + scan result + saved positions
  function getTicketsForColumn(colId) {
    if (!gsResult) return [];
    return STEP_DEFS.filter(step => {
      const savedCol = positions[step.id];
      if (savedCol) return savedCol === colId;
      // Default: failed checks → todo, passed → done
      const failed = step.check(gsResult);
      if (colId === "todo")  return failed;
      if (colId === "done")  return !failed;
      return false;
    });
  }

  function handleDragStart(id) {
    setDraggingId(id);
    setExpandedId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
  }

  function handleDrop(targetColId) {
    if (!draggingId) return;
    const next = { ...positions, [draggingId]: targetColId };
    setPositions(next);
    saveKanban(next);
    setDraggingId(null);
    setDragOverCol(null);
  }

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id);
  }

  function resetBoard() {
    setPositions({});
    saveKanban({});
  }

  const todoTickets       = getTicketsForColumn("todo");
  const inProgressTickets = getTicketsForColumn("inprogress");
  const doneTickets       = getTicketsForColumn("done");

  const score = gsResult
    ? Math.round((doneTickets.length / STEP_DEFS.length) * 100)
    : null;
  const scoreColor = score == null ? "#4a6b4c" : score >= 80 ? "#1a7a3a" : score >= 50 ? "#f59e0b" : "#ef4444";
  const criticalCount = todoTickets.filter(t => t.priority === "critical").length;

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#4a6b4c" }}>Loading...</div>;

  return (
    <div style={{ padding: "24px", fontFamily: "'Roboto', sans-serif", height: "100%", overflowY: "auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "20px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.4px", marginBottom: "2px" }}>Dashboard</h2>
          {gsUrl && <p style={{ fontSize: "11px", color: "#4a6b4c" }}>{gsUrl}</p>}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {score != null && (
            <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "8px", padding: "6px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: scoreColor, fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: "10px", color: "#4a6b4c" }}>complete</div>
            </div>
          )}
          {criticalCount > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "6px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444", fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1 }}>{criticalCount}</div>
              <div style={{ fontSize: "10px", color: "#c0392b", fontWeight: "600" }}>critical</div>
            </div>
          )}
          {gsResult && (
            <button onClick={resetBoard} style={{ background: "none", border: "1px solid #eef2ee", color: "#4a6b4c", borderRadius: "7px", padding: "6px 12px", fontSize: "11px", cursor: "pointer" }} title="Reset board positions">↺ Reset board</button>
          )}
          <button
            onClick={() => setPage("getstarted")}
            style={{ background: gsResult ? "none" : "#1a7a3a", border: gsResult ? "1px solid #eef2ee" : "none", color: gsResult ? "#4a6b4c" : "white", borderRadius: "7px", padding: "7px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
          >
            {gsResult ? "↺ Re-scan" : "🚀 Run setup scan →"}
          </button>
        </div>
      </div>

      {/* Main grid: kanban + sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: gsResult ? "1fr 1fr 1fr 264px" : "1fr 264px", gap: "16px", alignItems: "start" }}>

        {/* Empty state */}
        {!gsResult && (
          <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "14px", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "14px" }}>🚀</div>
            <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "18px", fontWeight: "800", color: "#0d1f0e", marginBottom: "8px" }}>Start with a site scan</h3>
            <p style={{ fontSize: "13px", color: "#4a6b4c", lineHeight: "1.65", maxWidth: "320px", margin: "0 auto 20px" }}>
              Scan your site in Get Started. Your fix list appears here as a Kanban board — drag tickets across columns as you work through them.
            </p>
            <button onClick={() => setPage("getstarted")} style={{ background: "#1a7a3a", color: "white", border: "none", borderRadius: "8px", padding: "11px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              🚀 Go to Get Started →
            </button>
          </div>
        )}

        {/* Kanban columns */}
        {gsResult && COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            col={col}
            tickets={col.id === "todo" ? todoTickets : col.id === "inprogress" ? inProgressTickets : doneTickets}
            draggingId={draggingId}
            dragOverCol={dragOverCol}
            onDragOver={setDragOverCol}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            setPage={setPage}
            gsUrl={gsUrl}
            expandedId={expandedId}
            onExpand={toggleExpand}
          />
        ))}

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          {/* Blog posts */}
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>From the blog</div>
          {BLOG_POSTS.map((post, i) => (
            <a key={i} href={post.url} target="_blank" rel="noreferrer"
              style={{ background: "white", border: "1px solid #eef2ee", borderRadius: "9px", padding: "12px 14px", textDecoration: "none", display: "block" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#d0e8d4"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#eef2ee"}
            >
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#1a7a3a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>{post.tag}</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#0d1f0e", lineHeight: "1.4", marginBottom: "6px" }}>{post.title}</div>
              <div style={{ fontSize: "10px", color: "#4a6b4c" }}>{post.date}</div>
            </a>
          ))}
          <a href="https://blog.dablin.co" target="_blank" rel="noreferrer"
            style={{ fontSize: "11px", color: "#1a7a3a", fontWeight: "600", textDecoration: "none", textAlign: "center", padding: "6px" }}>
            View all posts →
          </a>

          {/* Activity stats */}
          {auditData && (
            <div style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "9px", padding: "12px 14px", marginTop: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Activity</div>
              {[
                { label: "Audits run",    value: auditData.totalAudits },
                { label: "URLs tracked",  value: auditData.urls?.length || 0 },
                { label: "Descriptions", value: auditData.totalDescriptions },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #eef2ee" }}>
                  <span style={{ fontSize: "11px", color: "#4a6b4c" }}>{s.label}</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#1a7a3a", fontFamily: "'Roboto Condensed', sans-serif" }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
