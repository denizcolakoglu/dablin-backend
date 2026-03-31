import { useState } from "react";
import { SignUpButton, SignInButton } from "@clerk/clerk-react";
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

const NAV_ITEMS = [
  { href: "/ai-visibility-check", icon: "◎", label: "AI Visibility Check", desc: "See if ChatGPT, Gemini & Claude mention you" },
  { href: "/ai-visibility-audit", icon: "⌕", label: "AI Visibility Audit", desc: "12 checks for AI engine discoverability" },
  { href: "/seo-audit", icon: "✓", label: "SEO Audit", desc: "18-point SEO check with AI fixes" },
];

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '72px', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #eef2ee', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setMenuOpen(true)} className="pg-hamburger" aria-label="Open menu"><span /><span /><span /></button>
          <a href="/" style={{ textDecoration: 'none' }}><img src="/logo.svg" alt="Dablin" height="44" /></a>
        </div>
        <div className="pg-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="/ai-visibility-check" style={{ fontSize: '15px', fontWeight: '500', color: '#2a3d2b', textDecoration: 'none' }}>AI Visibility Check</a>
          <a href="/ai-visibility-audit" style={{ fontSize: '15px', fontWeight: '600', color: '#1a7a3a', textDecoration: 'none' }}>AI Visibility Audit</a>
          <a href="/seo-audit" style={{ fontSize: '15px', fontWeight: '500', color: '#2a3d2b', textDecoration: 'none' }}>SEO Audit</a>
          <a href="/pricing" style={{ fontSize: '15px', fontWeight: '500', color: '#2a3d2b', textDecoration: 'none' }}>Pricing</a>
          <a href="https://blog.dablin.co" target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px', fontWeight: '500', color: '#2a3d2b', textDecoration: 'none' }}>Blog</a>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <SignInButton mode="modal"><button className="pg-btn-ghost">Sign in</button></SignInButton>
          <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'nav' })}>
            <SignUpButton mode="modal"><button className="pg-btn-primary">Sign up</button></SignUpButton>
          </div>
        </div>
      </nav>
      {menuOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 500, padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <img src="/logo.svg" alt="Dablin" height="40" />
            <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '28px', color: '#2a3d2b', cursor: 'pointer' }}>×</button>
          </div>
          {NAV_ITEMS.map(item => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 0', borderBottom: '1px solid #eef2ee', textDecoration: 'none' }}>
              <span style={{ fontSize: '20px', color: '#1a7a3a', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#0d1f0e', marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: '#4a6b4c' }}>{item.desc}</div>
              </div>
            </a>
          ))}
          <a href="/pricing" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 0', borderBottom: '1px solid #eef2ee', textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', color: '#1a7a3a', flexShrink: 0, marginTop: '2px' }}>€</span>
            <div><div style={{ fontSize: '16px', fontWeight: '600', color: '#0d1f0e', marginBottom: '3px' }}>Pricing</div><div style={{ fontSize: '13px', color: '#4a6b4c' }}>12 checks for AI engine discoverability</div></div>
          </a>
          <a href="https://blog.dablin.co" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 0', borderBottom: '1px solid #eef2ee', textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', color: '#1a7a3a', flexShrink: 0, marginTop: '2px' }}>✍</span>
            <div><div style={{ fontSize: '16px', fontWeight: '600', color: '#0d1f0e', marginBottom: '3px' }}>Blog</div><div style={{ fontSize: '13px', color: '#4a6b4c' }}>AI visibility, GEO and SEO guides</div></div>
          </a>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div onClick={() => { trackEvent('sign_up_modal_opened', { location: 'mobile_menu' }); setMenuOpen(false); }}>
              <SignUpButton mode="modal"><button className="pg-btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '10px' }}>Sign up free</button></SignUpButton>
            </div>
            <SignInButton mode="modal"><button className="pg-btn-ghost" style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '10px' }} onClick={() => setMenuOpen(false)}>Sign in</button></SignInButton>
          </div>
        </div>
      )}
    </>
  );
}

const CHECKS = [
  { group: "Brand Identity", items: [
    { title: "Organization schema", desc: "AI engines can verify your brand identity via structured data." },
    { title: "sameAs social links", desc: "Social profiles linked in schema for cross-platform entity recognition." },
    { title: "WebSite schema & name", desc: "WebSite schema with name field for AI engine brand identification." },
  ]},
  { group: "AI Crawlability", items: [
    { title: "llms.txt file", desc: "Helps ChatGPT, Gemini and Claude understand your site's purpose and content." },
    { title: "AI crawlers allowed", desc: "GPTBot, ClaudeBot, PerplexityBot not blocked in robots.txt." },
    { title: "No noai meta tag", desc: "AI engines are not explicitly blocked from indexing this page." },
    { title: "HTTPS", desc: "Page served securely — required for AI engine trust signals." },
    { title: "Fast response time", desc: "Server responds in under 3 seconds — slow pages get skipped by AI crawlers." },
  ]},
  { group: "AI-Readable Content", items: [
    { title: "Clear H1 heading", desc: "Single descriptive H1 — AI engines anchor page topic on this." },
    { title: "Meta description", desc: "Used by AI engines for citations and summaries in responses." },
    { title: "Canonical URL", desc: "AI engines index the correct version of your page." },
    { title: "Open Graph tags", desc: "og:title, og:description, og:image — used for AI page summaries." },
  ]},
];

const FAQ = [
  { q: "What is the AI Visibility Audit?", a: "The AI Visibility Audit runs 12 checks to see how well AI-powered search engines like ChatGPT, Gemini, and Claude can find, crawl, and understand your pages. It's different from traditional SEO — these engines use different signals to decide what to surface and cite." },
  { q: "What is llms.txt?", a: "llms.txt is a simple text file you place at the root of your website (yoursite.com/llms.txt) that tells AI models what your site does, who it's for, and what content they can use. It's similar to robots.txt but for AI crawlers. Dablin generates a ready-to-upload version for you if it's missing." },
  { q: "How is this different from the SEO Audit?", a: "The SEO Audit focuses on Google ranking factors — meta tags, schema, headings, Core Web Vitals, and the new March 2026 signals. The AI Visibility Audit focuses on what AI engines need to find and cite your brand — llms.txt, Organization schema, sameAs links, AI crawler access, and more." },
  { q: "Does this work for any website?", a: "Yes. Any publicly accessible URL can be audited — Shopify stores, WooCommerce, WordPress, or custom sites." },
  { q: "How much does it cost?", a: "The AI Visibility Audit is included in all Dablin plans. See the Pricing page for plan details." },
  { q: "What are AEO and GEO?", a: "AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) both refer to optimising content to be found and cited by AI-powered search tools like ChatGPT, Gemini, and Google's AI Overviews. Dablin's AI Visibility Audit covers the technical checks that matter most for both." },
];

export default function PageAiAudit() {
  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", color: '#2a3d2b', background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-btn-primary { background: #1a7a3a; color: white; border: none; padding: 12px 28px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .pg-btn-primary:hover { background: #2d9a4e; transform: translateY(-1px); }
        .pg-btn-large { padding: 15px 36px; font-size: 16px; border-radius: 10px; }
        .pg-btn-ghost { background: none; border: 1.5px solid #d0e8d4; color: #1a7a3a; padding: 10px 22px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .pg-btn-ghost:hover { border-color: #1a7a3a; background: #eef8f0; }
        .pg-hamburger { display: none; background: none; border: 1px solid #eef2ee; border-radius: 8px; padding: 8px 10px; cursor: pointer; flex-direction: column; gap: 4px; }
        .pg-hamburger span { display: block; width: 18px; height: 2px; background: #2a3d2b; border-radius: 2px; }
        @media (max-width: 900px) {
          .pg-nav-links { display: none !important; }
          .pg-hamburger { display: flex !important; }
          .pg-grid-2 { grid-template-columns: 1fr !important; }
          .pg-grid-3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .pg-hero-title { font-size: 40px !important; }
          .pg-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      <NavBar />

      {/* HERO */}
      <div className="pg-section" style={{ background: '#eef8f0', padding: '96px 48px 108px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #d0e8d4', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#1a7a3a', marginBottom: '28px' }}>
          ◈ AI Visibility Audit
        </div>
        <h1 className="pg-hero-title" style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(44px,7vw,80px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-3px', color: '#0d1f0e', marginBottom: '24px' }}>
          Why can't AI engines<br />
          <span style={{ color: '#1a7a3a' }}>find your pages?</span>
        </h1>
        <p style={{ fontSize: '19px', color: '#4a6b4c', maxWidth: '540px', margin: '0 auto 40px', lineHeight: '1.65', fontWeight: '300' }}>
          12 technical checks that identify exactly what's stopping AI engines from understanding your brand — with a ready-to-copy fix for every issue.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'ai_audit_page_hero' })}>
            <SignUpButton mode="modal"><button className="pg-btn-primary pg-btn-large">Audit my page free →</button></SignUpButton>
          </div>
          
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '56px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[['12', 'AI visibility checks'], ['3', 'check categories'], ['AI fix', 'for every issue'], ['Free', 'to start']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a7a3a', fontFamily: "'Roboto Condensed', sans-serif" }}>{val}</div>
              <div style={{ fontSize: '12px', color: '#4a6b4c', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="pg-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '14px' }}>How it works</p>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '56px' }}>Paste a URL. Fix what's blocking AI engines.</h2>
          <div className="pg-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0' }}>
            {[
              { n: '1', title: 'Paste your URL', desc: 'Any product page, homepage, or landing page URL — publicly accessible.' },
              { n: '2', title: 'Run 12 AI visibility checks', desc: 'Brand identity, crawlability, AI-readable content — all checked in under 15 seconds.' },
              { n: '3', title: 'Copy AI fixes for each issue', desc: 'Every failed check includes exact code to fix it — no developer or SEO expert needed.' },
            ].map((s, i) => (
              <div key={s.n} style={{ padding: '0 40px', borderRight: i < 2 ? '1px solid #eef2ee' : 'none', textAlign: 'left' }}>
                <div style={{ width: '44px', height: '44px', background: '#eef8f0', border: '1.5px solid #d0e8d4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#1a7a3a', marginBottom: '20px' }}>{s.n}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0d1f0e', marginBottom: '10px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: '#4a6b4c', lineHeight: '1.65', fontWeight: '300' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12 CHECKS */}
      <div className="pg-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '14px' }}>What we check</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>12 checks across 3 categories</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Every check comes with an AI-generated fix if it fails.</p>
          </div>
          <div className="pg-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {CHECKS.map(group => (
              <div key={group.group} style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '14px', padding: '28px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eef8f0', color: '#1a7a3a', borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>{group.group}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {group.items.map(item => (
                    <div key={item.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#1a7a3a', fontWeight: '700', flexShrink: 0, fontSize: '14px', marginTop: '1px' }}>✓</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0d1f0e', marginBottom: '2px' }}>{item.title}</div>
                        <div style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.5' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHAT YOU GET */}
      <div className="pg-section" style={{ background: '#0d1f0e', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#6fcf8a', marginBottom: '14px' }}>What you get</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: 'white', letterSpacing: '-1px', marginBottom: '12px' }}>A complete AI visibility report with fixes</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Not just a score — actionable fixes for every issue, ready to copy and paste.</p>
          </div>
          <div className="pg-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              { title: 'AI visibility score', desc: 'A percentage score showing how well optimised your page is for AI engines, with a pass/fail breakdown per check.' },
              { title: 'llms.txt generator', desc: 'If your site is missing llms.txt, Dablin generates a complete file based on your page content — ready to upload.' },
              { title: 'Schema fix generator', desc: 'Missing Organization or WebSite schema? Dablin generates the exact JSON-LD block to add to your page.' },
              { title: 'robots.txt fix', desc: 'If AI crawlers are blocked, Dablin generates the exact rules to allow GPTBot, ClaudeBot, and PerplexityBot.' },
              { title: 'Response time diagnosis', desc: 'Flags slow page load times that cause AI crawlers to skip your pages, with suggested fixes.' },
              { title: 'Open Graph fix', desc: 'Missing OG tags generated automatically from your page title and content — ready to paste into your CMS.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      

      {/* FAQ */}
      <div className="pg-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '14px' }}>FAQ</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>Common questions</h2>
          </div>
          <div style={{ borderTop: '1px solid #eef2ee' }}>
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pg-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Make your brand <span style={{ color: '#6fcf8a' }}>visible to AI.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>Make your brand visible to AI today.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'ai_audit_page_cta' })}>
            <SignUpButton mode="modal"><button className="pg-btn-primary pg-btn-large">Audit my page free →</button></SignUpButton>
          </div>
          <SignInButton mode="modal"><button style={{ background: 'none', border: '2px solid rgba(255,255,255,0.2)', color: 'white', padding: '15px 32px', borderRadius: '10px', fontFamily: "'Roboto', sans-serif", fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>Sign in</button></SignInButton>
        </div>
      </div>

      <footer style={{ background:"#0a1a0b", padding:"56px 48px 32px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"48px", marginBottom:"48px" }}>

          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
              <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"10px" }}>
                <img src="/logo.svg" alt="Dablin" height="32" />
                <span style={{ color:"white", fontSize:"17px", fontWeight:"700", letterSpacing:"-0.3px" }}>dablin</span>
              </a>
            </div>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)", lineHeight:"1.65", maxWidth:"260px", margin:"0 0 24px" }}>Be visible everywhere search happens. SEO and AI visibility for brands and e-commerce sellers.</p>
            <div style={{ display:"flex", gap:"10px" }}>
              <a href="https://www.linkedin.com/company/dablin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                style={{ width:"34px", height:"34px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 9h4v12H2z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4" cy="4" r="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8"/></svg>
              </a>
              <a href="https://medium.com/dablin" target="_blank" rel="noopener noreferrer" aria-label="Medium"
                style={{ width:"34px", height:"34px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <div style={{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"16px" }}>Tools</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {[["AI Visibility Check","/ai-visibility-check"],["AI Visibility Audit","/ai-visibility-audit"],["SEO Audit","/seo-audit"],["AI Query Check","/dashboard/query-check"]].map(([label,href]) => (
                <a key={href} href={href} style={{ fontSize:"13px", color:"rgba(255,255,255,0.55)", textDecoration:"none" }}>{label}</a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"16px" }}>Product</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {[["Step by Step SEO","/dashboard/get-started"],["SEO/GEO Dashboard","/dashboard"],["Google Search Console","/dashboard/search-console"],["Pricing","/pricing"],["Blog","https://blog.dablin.co"]].map(([label,href]) => (
                <a key={href} href={href} style={{ fontSize:"13px", color:"rgba(255,255,255,0.55)", textDecoration:"none" }}>{label}</a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"16px" }}>Company</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {[["Contact us","mailto:hello@dablin.co"],["Privacy Policy","/legal.html"],["Terms of Service","/legal.html"]].map(([label,href]) => (
                <a key={href} href={href} style={{ fontSize:"13px", color:"rgba(255,255,255,0.55)", textDecoration:"none" }}>{label}</a>
              ))}
            </div>
          </div>

        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:"24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
          <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.25)" }}>© 2026 Dablin. All rights reserved.</span>
          <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.25)" }}>Built for the AI search era.</span>
        </div>
      </footer>
    </div>
  );
}
