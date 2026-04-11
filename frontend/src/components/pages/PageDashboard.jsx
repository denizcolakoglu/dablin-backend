import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from "react";
import { SignUpButton, SignInButton } from "@clerk/clerk-react";
import PageLayout from "./PageLayout";
import { trackEvent } from "../../analytics";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: '1px solid #eef2ee', padding: '20px 0', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '16px', fontWeight: '600', color: '#0d1f0e' }}>
        <span>{q}</span>
        <span style={{ fontSize: '22px', color: '#1a7a3a', flexShrink: 0, fontWeight: '300' }}>{open ? '−' : '+'}</span>
      </div>
      {open && <div style={{ fontSize: '15px', color: '#4a6b4c', lineHeight: '1.65', marginTop: '12px', paddingRight: '32px' }}>{a}</div>}
    </div>
  );
}

function KanbanDemo() {
  // Animate the top ticket: cycles todo → inprogress → done → todo
  const [ticketCol, setTicketCol] = useState('todo');
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const cycle = () => {
      setAnimating(true);
      setTimeout(() => {
        setTicketCol(prev => prev === 'todo' ? 'inprogress' : prev === 'inprogress' ? 'done' : 'todo');
        setAnimating(false);
      }, 400);
    };
    const iv = setInterval(cycle, 2800);
    return () => clearInterval(iv);
  }, []);

  const TICKET = { label: 'No Organization schema', priority: 'Critical', color: '#ef4444', pill: '#fef2f2', pillText: '#c0392b', pillBorder: '#fca5a5' };

  const cols = [
    { id: 'todo',       label: 'To Do',       color: '#ef4444', count: ticketCol === 'todo' ? 3 : 2 },
    { id: 'inprogress', label: 'In Progress',  color: '#f59e0b', count: ticketCol === 'inprogress' ? 1 : 0 },
    { id: 'done',       label: 'Done',         color: '#1a7a3a', count: ticketCol === 'done' ? 5 : 4 },
  ];

  const staticTodo = [
    { label: 'AI crawlers blocked in robots.txt', color: '#f59e0b', pill: '#fffbeb', pillText: '#b45309', pillBorder: '#fcd34d', priority: 'Important' },
    { label: 'No sitemap.xml found', color: '#1a7a3a', pill: '#eef8f0', pillText: '#1a7a3a', pillBorder: '#d0e8d4', priority: 'Good to have' },
  ];
  const staticDone = [
    { label: 'HTTPS enabled' },
    { label: 'GSC connected' },
    { label: 'Canonical tag present' },
    { label: 'Open Graph tags present' },
  ];

  return (
    <div style={{ borderRadius: '14px', border: '1px solid #d0e8d4', background: '#f8faf8', overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,122,58,0.10)' }}>
      {/* Browser bar */}
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid #d0e8d4' }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#4a6b4c' }}>dablin.co · SEO/GEO Dashboard</span>
      </div>
      <div style={{ padding: '16px', background: 'white' }}>
        {/* Score strip */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '8px', padding: '8px 14px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>64%</div>
            <div style={{ fontSize: '10px', color: '#4a6b4c' }}>complete</div>
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 14px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{ticketCol === 'todo' ? 3 : 2}</div>
            <div style={{ fontSize: '10px', color: '#c0392b', fontWeight: '600' }}>critical</div>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '8px 14px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>4</div>
            <div style={{ fontSize: '10px', color: '#b45309', fontWeight: '600' }}>important</div>
          </div>
        </div>
        {/* Kanban columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
          {cols.map(col => (
            <div key={col.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: `2px solid ${col.color}` }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0d1f0e' }}>{col.label}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', background: col.color + '22', color: col.color, border: `1px solid ${col.color}44`, borderRadius: '20px', padding: '1px 6px' }}>{col.count}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                {/* Animated ticket */}
                {ticketCol === col.id && (
                  <div style={{
                    background: 'white', border: `1px solid ${col.id === 'done' ? '#d0e8d4' : TICKET.pillBorder}`,
                    borderLeft: `3px solid ${col.id === 'done' ? '#1a7a3a' : TICKET.color}`,
                    borderRadius: '8px', padding: '9px 11px',
                    opacity: animating ? 0 : 1,
                    transform: animating ? 'translateX(12px) scale(0.97)' : 'translateX(0) scale(1)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: col.id === 'done' ? '#4a6b4c' : '#0d1f0e', textDecoration: col.id === 'done' ? 'line-through' : 'none', marginBottom: '4px', lineHeight: '1.3' }}>
                      {col.id === 'done' ? 'Organization schema added' : TICKET.label}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', background: col.id === 'done' ? '#eef8f0' : TICKET.pill, color: col.id === 'done' ? '#1a7a3a' : TICKET.pillText, border: `1px solid ${col.id === 'done' ? '#d0e8d4' : TICKET.pillBorder}`, borderRadius: '20px', padding: '1px 7px' }}>
                      {col.id === 'done' ? '✅ Done' : TICKET.priority}
                    </span>
                  </div>
                )}

                {/* Static tickets */}
                {col.id === 'todo' && staticTodo.map((t, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #eef2ee', borderLeft: `3px solid ${t.color}`, borderRadius: '8px', padding: '9px 11px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#0d1f0e', marginBottom: '4px', lineHeight: '1.3' }}>{t.label}</div>
                    <span style={{ fontSize: '10px', fontWeight: '700', background: t.pill, color: t.pillText, border: `1px solid ${t.pillBorder}`, borderRadius: '20px', padding: '1px 7px' }}>{t.priority}</span>
                  </div>
                ))}
                {col.id === 'inprogress' && ticketCol !== 'inprogress' && (
                  <div style={{ background: '#f8faf8', border: '1px dashed #eef2ee', borderRadius: '8px', padding: '16px 10px', textAlign: 'center', fontSize: '11px', color: '#9ab09c' }}>Drag tickets here</div>
                )}
                {col.id === 'done' && staticDone.map((t, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #eef2ee', borderLeft: '3px solid #d0e8d4', borderRadius: '8px', padding: '9px 11px', opacity: 0.65 }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#4a6b4c', textDecoration: 'line-through', lineHeight: '1.3' }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { title: "Prioritised by severity", desc: "Critical issues appear first, then important, then good-to-have. Always know exactly what to fix next." },
  { title: "Drag to move tickets", desc: "Grab any ticket and drag it between To Do, In Progress and Done. Positions are saved automatically between sessions." },
  { title: "Click for fix instructions", desc: "Expand any ticket to see what the problem is, how to fix it, and a direct link to the Dablin tool that generates the fix." },
  { title: "Live GSC data", desc: "Connected Google Search Console? The dashboard pulls live data on unindexed pages, Core Web Vitals failures and sitemap errors." },
  { title: "Re-scan to update", desc: "Fixed an issue? Re-scan your URL and the board automatically moves resolved tickets to Done. Track your progress over time." },
  { title: "SEO and AI visibility", desc: "The board covers both Google SEO signals and AI engine visibility — llms.txt, Organization schema, AI crawlers, and more." },
];

const FAQ = [
  { q: "What is the SEO/GEO Dashboard?", a: "The SEO/GEO Dashboard is a Kanban-style task board that turns your site's SEO and AI visibility issues into a prioritised fix list. Scan your URL, get a list of everything that needs fixing, and work through it ticket by ticket — dragging each one from To Do to Done as you fix it." },
  { q: "What does GEO mean?", a: "GEO stands for Generative Engine Optimization — optimising your content to be found and cited by AI-powered search tools like ChatGPT, Gemini and Google's AI Overviews. The dashboard covers both traditional Google SEO signals and the AI visibility signals that matter for GEO." },
  { q: "How is it different from the SEO Audit?", a: "The SEO Audit gives you a detailed report for a single page. The Dashboard gives you a top-level view of your site's overall health — across SEO, AI visibility, and Google Search Console data — and organises everything into a board you can work through over time." },
  { q: "Does it work with Google Search Console?", a: "Yes. If you've connected your Google Search Console account (Agency plan), the dashboard pulls live data on unindexed pages, Core Web Vitals failures, and sitemap errors — and surfaces them as additional tickets on the board." },
  { q: "Is my progress saved?", a: "Yes. Ticket positions (To Do / In Progress / Done) are saved to your browser's local storage. When you re-scan your URL, the board updates automatically — tickets for issues you've fixed move to Done, and new issues appear in To Do." },
  { q: "Which plan includes the dashboard?", a: "The SEO/GEO Dashboard is available on all plans. The Step by Step SEO wizard (which generates the board) is included from the Starter plan. Live Google Search Console data on the board requires the Agency plan." },
  { q: "How many issues does it check?", a: "The board checks 18 signals by default — the same as the SEO Audit — covering content quality, technical SEO, structured data, Google March 2026 signals, and performance. If GSC is connected, it adds up to 4 additional live checks from your Google data." },
];

export default function PageDashboard() {
  return (
    <PageLayout activePath="/seo-geo-dashboard">
      <Helmet>
        <title>SEO &amp; GEO Dashboard — Track and fix your visibility issues | Dablin</title>
        <meta name="description" content="Scan your URL and get a prioritised Kanban board of SEO and AI visibility fixes. Drag tickets from To Do to Done as you fix them. Track your progress across Google and AI search." />
        <meta property="og:title" content="SEO &amp; GEO Dashboard — Track and fix your visibility issues | Dablin" />
        <meta property="og:description" content="Scan your URL and get a prioritised Kanban board of SEO and AI visibility fixes. Track your progress across Google and AI search." />
        <meta property="og:url" content="https://dablin.co/seo-geo-dashboard" />
        <meta name="twitter:title" content="SEO &amp; GEO Dashboard — Track and fix your visibility issues | Dablin" />
        <meta name="twitter:description" content="Prioritised Kanban board of SEO and AI visibility fixes. Track your progress across Google and AI search." />
        <link rel="canonical" href="https://dablin.co/seo-geo-dashboard" />
      </Helmet>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .db-btn-primary { background: #1a7a3a; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .db-btn-primary:hover { background: #2d9a4e; transform: translateY(-1px); }
        @media (max-width: 900px) {
          .db-hero-grid { flex-direction: column !important; }
          .db-hero-right { display: none !important; }
          .db-features-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .db-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="db-section" style={{ background: '#eef8f0', backgroundImage: 'linear-gradient(rgba(26,122,58,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.06) 1px,transparent 1px)', backgroundSize: '36px 36px', padding: 'clamp(56px,7vw,96px) 56px', borderBottom: '1px solid #d0e8d4' }}>
        <div className="db-hero-grid" style={{ display: 'flex', alignItems: 'flex-start', gap: '64px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ flex: '0 0 400px' }}>
            <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(40px,5vw,60px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-2.5px', color: '#0d1f0e', marginBottom: '20px' }}>
              SEO/GEO<br /><span style={{ color: '#1a7a3a' }}>Dashboard.</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#4a6b4c', fontWeight: '300', lineHeight: '1.65', marginBottom: '28px' }}>
              Your SEO and AI visibility fixes — organised as a Kanban board. Scan your URL, get a prioritised task list, drag tickets from To Do to Done as you fix them.
            </p>
            <div onClick={() => trackEvent('sign_up_click', { location: 'dashboard_page_hero' })}>
              <SignUpButton mode="modal">
                <button className="db-btn-primary">Scan my site</button>
              </SignUpButton>
            </div>
          </div>
          <div className="db-hero-right" style={{ flex: 1, minWidth: 0 }}>
            <KanbanDemo />
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="db-section" style={{ background: 'white', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>How it works</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>Scan once. Fix everything.</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>Dablin scans your URL across 18 signals and turns the results into a prioritised Kanban board you can work through at your own pace.</p>
          </div>
          <div className="db-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ border: '1px solid #eef2ee', borderRadius: '14px', padding: '24px', background: 'white' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHAT GETS CHECKED ── */}
      <div className="db-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>What gets checked</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>18 signals. Three priority levels.</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Every check becomes a ticket on the board, sorted by how urgently it needs fixing.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', label: 'Critical — fix now', items: ['HTTPS enabled', 'Site indexed by Google', 'llms.txt file present', 'Organization schema', 'GSC connected'] },
              { color: '#f59e0b', bg: '#fffbef', border: '#fcd34d', label: 'Important — fix this week', items: ['AI crawlers allowed', 'Meta description', 'Product schema', 'Open Graph tags', 'Information Gain (Mar 2026)'] },
              { color: '#1a7a3a', bg: '#eef8f0', border: '#d0e8d4', label: 'Good to have', items: ['Sitemap.xml present', 'Canonical tag', 'AI Visibility Audit run', 'Core Web Vitals', 'Internal links'] },
            ].map(col => (
              <div key={col.label} style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: '14px', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: col.color, marginBottom: '16px' }}>{col.label}</div>
                {col.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: i < col.items.length - 1 ? `1px solid ${col.border}` : 'none', fontSize: '13px', color: '#0d1f0e' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="db-section" style={{ background: 'white', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>FAQ</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>Common questions</h2>
          </div>
          <div style={{ borderTop: '1px solid #eef2ee' }}>
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="db-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Your full SEO picture.<br /><span style={{ color: '#6fcf8a' }}>One board.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>Scan your site in 30 seconds. Start fixing today.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'dashboard_page_cta' })}>
            <SignUpButton mode="modal">
              <button className="db-btn-primary">Scan my site free →</button>
            </SignUpButton>
          </div>
          <SignInButton mode="modal">
            <button style={{ background: 'none', border: '2px solid rgba(255,255,255,0.2)', color: 'white', padding: '14px 32px', borderRadius: '10px', fontFamily: "'Roboto', sans-serif", fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>Sign in</button>
          </SignInButton>
        </div>
      </div>
    </PageLayout>
  );
}
