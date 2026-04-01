import PageLayout from "./PageLayout";

const ENTRIES = [
  {
    date: "April 1, 2026",
    version: "v0.9",
    title: "New public pages, navigation redesign & contact form",
    desc: "A big day for Dablin's marketing surface. Five new public pages, a full navigation redesign with dropdowns, and a working contact form.",
    items: [
      { tag: "new",     text: "Google Search Console public page at /google-search-console" },
      { tag: "new",     text: "SEO/GEO Dashboard public page at /seo-geo-dashboard with live Kanban animation" },
      { tag: "new",     text: "Contact page at /contact with form — sends to hello@dablin.co via Brevo with auto-reply" },
      { tag: "design",  text: "SEO Audit page fully redesigned — split hero with live audit animation on the right" },
      { tag: "design",  text: "Navigation redesigned with AI Visibility, SEO Expert, Pricing and Resources dropdowns" },
      { tag: "new",     text: "Announcement bar above navigation (scrolls away like Semrush) — Google March 2026 signal" },
      { tag: "design",  text: "Hero fine grid background added to landing and all public pages" },
      { tag: "fix",     text: "Navigation fixed — frozen at top while scrolling" },
      { tag: "fix",     text: "Dropdown menus stay open — 120ms delay prevents accidental close before click" },
      { tag: "fix",     text: "Google Search Console stays connected — refresh token now saved correctly" },
    ],
  },
  {
    date: "March 28, 2026",
    version: "v0.8",
    title: "Dashboard Kanban, per-tool history & pricing redesign",
    desc: "The dashboard moved from a list view to a full drag-and-drop Kanban board. Each tool now has its own history tab. Pricing was rebuilt to reflect the new subscription model.",
    items: [
      { tag: "new",     text: "Dashboard rebuilt as drag-and-drop Kanban — To Do / In Progress / Done columns" },
      { tag: "new",     text: "Per-tool History tab added to SEO Audit, AI Audit, AI Visibility Check and AI Query Check" },
      { tag: "new",     text: "Pricing page rebuilt — Starter €9 / Pro €19 / Agency €49, monthly/yearly toggle" },
      { tag: "improve", text: "Dashboard summary strip shows critical/important/good counts with View on Dashboard CTA" },
      { tag: "improve", text: "4 new GSC-derived checks added to dashboard: unindexed pages, no sitemap, vitals failing, sitemap errors" },
      { tag: "fix",     text: "Drag-and-drop 120ms delay timer — prevents ghost drops on fast clicks" },
      { tag: "design",  text: "All public page credit/pricing references removed — replaced with plan upgrade CTAs" },
    ],
  },
  {
    date: "March 22, 2026",
    version: "v0.7",
    title: "SEO Audit expanded to 18 checks — Google March 2026 signals",
    desc: "The SEO Audit now checks 18 signals including the two new ranking factors from Google's March 2026 core update — Information Gain and AI Overview eligibility.",
    items: [
      { tag: "new",     text: "Information Gain check — 600+ words with original signals required by March 2026 update" },
      { tag: "new",     text: "AI Overview eligibility check — FAQPage schema or question-structured H2s" },
      { tag: "new",     text: "Image optimisation check — width, height and loading=lazy for Core Web Vitals" },
      { tag: "new",     text: "Internal links check — minimum 3 internal links for crawlability" },
      { tag: "improve", text: "SEO Audit now runs 18 checks across 5 categories (up from 13 across 4)" },
      { tag: "design",  text: "Landing page hero redesigned — Semrush-inspired layout with mint grid background" },
      { tag: "new",     text: "Google March 2026 popup on landing page — explains the two new signals" },
    ],
  },
];

const TAG_STYLES = {
  new:     { background: '#eef8f0', color: '#1a7a3a',  border: '1px solid #d0e8d4' },
  fix:     { background: '#fef2f2', color: '#c0392b',  border: '1px solid #fca5a5' },
  design:  { background: '#eff6ff', color: '#1d4ed8',  border: '1px solid #bfdbfe' },
  improve: { background: '#fffbeb', color: '#b45309',  border: '1px solid #fcd34d' },
};

const TAG_LABELS = { new: 'New', fix: 'Fix', design: 'Design', improve: 'Improve' };

export default function PageWhatsNew() {
  return (
    <PageLayout activePath="/whats-new">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 700px) {
          .wn-entry { flex-direction: column !important; gap: 12px !important; }
          .wn-left { flex: none !important; }
          .wn-hero { padding: 48px 20px !important; }
          .wn-content { padding: 40px 20px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="wn-hero" style={{ background: '#eef8f0', backgroundImage: 'linear-gradient(rgba(26,122,58,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.06) 1px,transparent 1px)', backgroundSize: '36px 36px', padding: '72px 56px', borderBottom: '1px solid #d0e8d4' }}>
        <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(40px,6vw,64px)', fontWeight: '800', letterSpacing: '-2px', color: '#0d1f0e', marginBottom: '14px', lineHeight: '1.0' }}>
          What's New
        </h1>
        <p style={{ fontSize: '17px', color: '#4a6b4c', fontWeight: '300', lineHeight: '1.6', maxWidth: '480px' }}>
          Every update, fix and new feature — in the order they shipped. Updated regularly.
        </p>
      </div>

      {/* ── ENTRIES ── */}
      <div className="wn-content" style={{ maxWidth: '860px', margin: '0 auto', padding: '64px 56px' }}>
        {ENTRIES.map((entry, ei) => (
          <div key={ei} className="wn-entry" style={{ display: 'flex', gap: '48px', marginBottom: '56px', paddingBottom: '56px', borderBottom: ei < ENTRIES.length - 1 ? '1px solid #eef2ee' : 'none' }}>

            {/* Left — date + version */}
            <div className="wn-left" style={{ flex: '0 0 140px', paddingTop: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{entry.date}</div>
              <span style={{ fontSize: '11px', fontWeight: '700', background: '#eef8f0', color: '#1a7a3a', border: '1px solid #d0e8d4', borderRadius: '20px', padding: '3px 10px', display: 'inline-block' }}>{entry.version}</span>
            </div>

            {/* Right — content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '22px', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-0.5px', marginBottom: '10px', lineHeight: '1.2' }}>
                {entry.title}
              </h2>
              <p style={{ fontSize: '14px', color: '#4a6b4c', lineHeight: '1.7', marginBottom: '20px' }}>
                {entry.desc}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {entry.items.map((item, ii) => (
                  <div key={ii} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: '20px', flexShrink: 0, marginTop: '2px', ...TAG_STYLES[item.tag] }}>
                      {TAG_LABELS[item.tag]}
                    </span>
                    <span style={{ fontSize: '13px', color: '#0d1f0e', lineHeight: '1.55' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Bottom note */}
        <div style={{ textAlign: 'center', paddingTop: '16px' }}>
          <p style={{ fontSize: '13px', color: '#9ab09c' }}>More updates coming soon. Follow <a href="https://www.linkedin.com/company/dablin" target="_blank" rel="noopener noreferrer" style={{ color: '#1a7a3a', fontWeight: '600', textDecoration: 'none' }}>Dablin on LinkedIn</a> for the latest.</p>
        </div>
      </div>
    </PageLayout>
  );
}
