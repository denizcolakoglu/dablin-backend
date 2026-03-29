import { useState } from "react";
import { SignUpButton, SignInButton } from "@clerk/clerk-react";
import { trackEvent } from "../../analytics";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{
      borderBottom: '1px solid #eef2ee', padding: '20px 0', cursor: 'pointer',
    }}>
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
          <button onClick={() => setMenuOpen(true)} className="seo-hamburger" aria-label="Open menu">
            <span /><span /><span />
          </button>
          <a href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.svg" alt="Dablin" height="44" />
          </a>
        </div>
        <div className="seo-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="/ai-visibility-check" style={{ fontSize: '15px', fontWeight: '500', color: '#2a3d2b', textDecoration: 'none' }}>AI Visibility Check</a>
          <a href="/ai-visibility-audit" style={{ fontSize: '15px', fontWeight: '500', color: '#2a3d2b', textDecoration: 'none' }}>AI Visibility Audit</a>
          <a href="/seo-audit" style={{ fontSize: '15px', fontWeight: '600', color: '#1a7a3a', textDecoration: 'none' }}>SEO Audit</a>
          <a href="/pricing" style={{ fontSize: '15px', fontWeight: '500', color: '#2a3d2b', textDecoration: 'none' }}>Pricing</a>
          <a href="https://blog.dablin.co" target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px', fontWeight: '500', color: '#2a3d2b', textDecoration: 'none' }}>Blog</a>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <SignInButton mode="modal">
            <button className="seo-btn-ghost">Sign in</button>
          </SignInButton>
          <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'nav' })}>
            <SignUpButton mode="modal">
              <button className="seo-btn-primary">Sign up</button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
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
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0d1f0e', marginBottom: '3px' }}>Pricing</div>
              <div style={{ fontSize: '13px', color: '#4a6b4c' }}>Pay per use, credits never expire</div>
            </div>
          </a>
          <a href="https://blog.dablin.co" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 0', borderBottom: '1px solid #eef2ee', textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', color: '#1a7a3a', flexShrink: 0, marginTop: '2px' }}>✍</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0d1f0e', marginBottom: '3px' }}>Blog</div>
              <div style={{ fontSize: '13px', color: '#4a6b4c' }}>AI visibility, GEO and SEO guides</div>
            </div>
          </a>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div onClick={() => { trackEvent('sign_up_modal_opened', { location: 'mobile_menu' }); setMenuOpen(false); }}>
              <SignUpButton mode="modal">
                <button className="seo-btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '10px' }}>Sign up free</button>
              </SignUpButton>
            </div>
            <SignInButton mode="modal">
              <button className="seo-btn-ghost" style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '10px' }} onClick={() => setMenuOpen(false)}>Sign in</button>
            </SignInButton>
          </div>
        </div>
      )}
    </>
  );
}

const CHECKS = [
  { group: "Content Quality", items: [
    { title: "Meta description", desc: "Present, unique and between 120–155 characters." },
    { title: "Heading structure", desc: "Single H1, no skipped heading levels (H3 without H2)." },
    { title: "Word count", desc: "At least 300 words — thin content is penalised by Google." },
    { title: "Image alt text", desc: "All images have descriptive alt attributes for accessibility and SEO." },
  ]},
  { group: "Technical SEO", items: [
    { title: "Canonical tag", desc: "Prevents duplicate content penalties across multiple URLs." },
    { title: "Robots tag", desc: "Page is not accidentally set to noindex." },
    { title: "Mobile viewport", desc: "Viewport meta tag present for Google's mobile-first indexing." },
    { title: "Open Graph tags", desc: "og:title, og:description, og:image all present for social sharing." },
    { title: "Render-blocking scripts", desc: "No synchronous scripts in <head> slowing down page load." },
    { title: "Sitemap", desc: "A sitemap.xml is accessible so Google can discover all your pages." },
  ]},
  { group: "Structured Data", items: [
    { title: "Schema markup", desc: "At least one JSON-LD structured data block present." },
    { title: "Product schema", desc: "Product type schema for Google Shopping eligibility." },
    { title: "Breadcrumb schema", desc: "BreadcrumbList for navigation context in search results." },
    { title: "Review / rating schema", desc: "Star ratings eligible to appear in Google search results." },
  ]},
  { group: "Google March 2026", items: [
    { title: "Information Gain", desc: "600+ words with original signals: author, date, data points, or structured lists." },
    { title: "AI Overview eligibility", desc: "FAQPage or HowTo schema, or question-structured H2s for Google SGE citations." },
  ]},
  { group: "Performance", items: [
    { title: "Image optimisation", desc: "All images have width, height and loading=lazy for Core Web Vitals (CLS/LCP)." },
    { title: "Internal links", desc: "At least 3 links to other pages for crawlability and topical authority." },
  ]},
];

const FAQ = [
  { q: "What does the SEO audit check?", a: "18 checks across 5 categories: content quality (meta description, headings, word count, image alt text), technical SEO (canonical, robots, viewport, Open Graph, render-blocking scripts, sitemap), structured data (schema markup, Product schema, BreadcrumbList, review schema), Google March 2026 signals (Information Gain, AI Overview eligibility), and performance (image optimisation, internal links). Every failed check includes a ready-to-copy AI-generated fix." },
  { q: "What are the Google March 2026 signals?", a: "The March 2026 Google core update — the fastest ever, rolling out in under 20 hours — introduced two new ranking signals. Information Gain checks whether your page adds something original to the internet. AI Overview eligibility checks whether your page has FAQPage or HowTo schema, or question-structured headings, which increases your chances of appearing in Google's AI-generated search summaries." },
  { q: "What are the AI-generated fixes?", a: "For every failed check, Dablin generates a ready-to-copy fix — the exact HTML tag, JSON-LD schema block, or code snippet you need to paste into your CMS. No developer needed." },
  { q: "Does it work on any website?", a: "Yes. The SEO audit works on any publicly accessible URL — Shopify, WooCommerce, Amazon, WordPress, or any custom store. You can also audit competitor pages." },
  { q: "How long does it take?", a: "The audit typically takes 15–25 seconds depending on page size and the number of failed checks that need AI fixes generated. A PageSpeed Insights score is also included." },
  { q: "How much does it cost?", a: "€0.50 per audit. New accounts get 7 free credits — enough to run your first check with no credit card required. Credits never expire and work across all Dablin tools." },
];

export default function PageSeoAudit() {
  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", color: '#2a3d2b', background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .seo-btn-primary { background: #1a7a3a; color: white; border: none; padding: 12px 28px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .seo-btn-primary:hover { background: #2d9a4e; transform: translateY(-1px); }
        .seo-btn-large { padding: 15px 36px; font-size: 16px; border-radius: 10px; }
        .seo-btn-ghost { background: none; border: 1.5px solid #d0e8d4; color: #1a7a3a; padding: 10px 22px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .seo-btn-ghost:hover { border-color: #1a7a3a; background: #eef8f0; }
        .seo-hamburger { display: none; background: none; border: 1px solid #eef2ee; border-radius: 8px; padding: 8px 10px; cursor: pointer; flex-direction: column; gap: 4px; }
        .seo-hamburger span { display: block; width: 18px; height: 2px; background: #2a3d2b; border-radius: 2px; }
        @media (max-width: 900px) {
          .seo-nav-links { display: none !important; }
          .seo-hamburger { display: flex !important; }
          .seo-grid-2 { grid-template-columns: 1fr !important; }
          .seo-grid-3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .seo-hero-title { font-size: 40px !important; }
          .seo-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* NAV */}
      <NavBar />

      {/* HERO */}
      <div className="seo-section" style={{ background: '#eef8f0', padding: '96px 48px 108px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #d0e8d4', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#1a7a3a', marginBottom: '28px' }}>
          ⚡ Now includes Google March 2026 signals
        </div>
        <h1 className="seo-hero-title" style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(44px,7vw,80px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-3px', color: '#0d1f0e', marginBottom: '24px' }}>
          18 SEO checks.<br />
          <span style={{ color: '#1a7a3a' }}>AI fixes for every issue.</span>
        </h1>
        <p style={{ fontSize: '19px', color: '#4a6b4c', maxWidth: '540px', margin: '0 auto 40px', lineHeight: '1.65', fontWeight: '300' }}>
          Paste any product page URL. Dablin runs 18 SEO checks — including the new Google March 2026 signals — and generates a ready-to-copy fix for every issue it finds.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'seo_audit_page_hero' })}>
            <SignUpButton mode="modal">
              <button className="seo-btn-primary seo-btn-large">Audit my page free →</button>
            </SignUpButton>
          </div>
          <span style={{ fontSize: '13px', color: '#4a6b4c' }}>7 free credits · €0.50 per audit · no card needed</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '56px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[['18', 'SEO checks'], ['Google 2026', 'signals included'], ['PageSpeed', 'score included'], ['Free', 'to start']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a7a3a', fontFamily: "'Roboto Condensed', sans-serif" }}>{val}</div>
              <div style={{ fontSize: '12px', color: '#4a6b4c', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="seo-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '14px' }}>How it works</p>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '56px' }}>Paste a URL. Get a full SEO report.</h2>
          <div className="seo-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0' }}>
            {[
              { n: '1', title: 'Paste your product page URL', desc: 'Any public URL — Shopify, WooCommerce, Amazon, WordPress, or any custom store.' },
              { n: '2', title: 'Dablin runs 18 checks', desc: 'Content, technical SEO, structured data, March 2026 signals, and performance — all in seconds.' },
              { n: '3', title: 'Copy the AI fix for each issue', desc: 'Every failed check includes the exact code or tag to fix it. Copy and paste into your CMS.' },
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

      {/* 18 CHECKS */}
      <div className="seo-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '14px' }}>What we check</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>18 checks across 5 categories</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Every check comes with an AI-generated fix if it fails.</p>
          </div>
          <div className="seo-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {CHECKS.map(group => (
              <div key={group.group} style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '14px', padding: '28px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eef8f0', color: '#1a7a3a', borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>
                  {group.group === 'Google March 2026' ? '⚡ ' : ''}{group.group}
                </div>
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

      {/* MARCH 2026 CALLOUT */}
      <div className="seo-section" style={{ background: '#0d1f0e', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }} className="seo-grid-2">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(111,207,138,0.15)', color: '#6fcf8a', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px', border: '1px solid rgba(111,207,138,0.2)' }}>
              ⚡ Google March 2026
            </div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,3.5vw,40px)', fontWeight: '800', color: 'white', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '16px' }}>
              The fastest Google update ever. Is your site ready?
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', marginBottom: '28px', fontWeight: '300' }}>
              The March 2026 core update rolled out in under 20 hours — the fastest ever. It introduced two new ranking signals that most SEO tools don't check yet. Dablin checks both.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { title: 'Information Gain', desc: 'Does your page add something original? Pages with no unique data, author signal, or structured content are penalised.' },
                { title: 'AI Overview eligibility', desc: 'Does your page have FAQPage schema or question-structured headings? This determines if Google AI summarises you.' },
              ].map(item => (
                <div key={item.title} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#6fcf8a', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.55' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Example audit result</p>
            {[
              { label: 'Meta description', pass: true },
              { label: 'Heading structure', pass: true },
              { label: 'Information Gain', pass: false, issue: 'Only 280 words — needs 600+ with original data' },
              { label: 'AI Overview eligibility', pass: false, issue: 'No FAQPage schema or question H2s found' },
              { label: 'Image optimisation', pass: false, issue: '4 images missing width/height and lazy loading' },
              { label: 'Product schema', pass: true },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>{c.pass ? '✅' : '❌'}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{c.label}</div>
                  {!c.pass && <div style={{ fontSize: '11px', color: '#f87171', marginTop: '2px' }}>{c.issue}</div>}
                  {!c.pass && <div style={{ marginTop: '6px', background: 'rgba(111,207,138,0.1)', border: '1px solid rgba(111,207,138,0.2)', borderRadius: '5px', padding: '5px 8px', fontSize: '10px', color: '#6fcf8a', fontWeight: '700' }}>✦ AI Fix available — copy & paste</div>}
                </div>
              </div>
            ))}
            <div style={{ marginTop: '20px', background: 'rgba(111,207,138,0.08)', border: '1px solid rgba(111,207,138,0.15)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #f59e0b', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', color: '#f59e0b', flexShrink: 0 }}>67%</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>Needs improvement</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>12 of 18 checks passed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHY IT MATTERS */}
      <div className="seo-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '14px' }}>Why it matters</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>Most product pages fail basic SEO checks</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>These are not advanced tactics. They are fundamentals Google expects on every page.</p>
          </div>
          <div className="seo-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              { title: 'Missing schema costs you rich results', desc: 'Without Product schema, your listings don\'t qualify for Google Shopping and won\'t show star ratings or price in search results.' },
              { title: 'Thin content gets filtered', desc: 'Pages under 600 words with no original data are now penalised by Google\'s March 2026 Information Gain filter.' },
              { title: 'No canonical = duplicate URL penalties', desc: 'Shopify creates multiple URLs per product. A missing canonical splits your ranking signals across duplicates.' },
              { title: 'Missing meta = auto-generated previews', desc: 'Without a meta description, Google writes its own — and it\'s usually bad. This directly affects click-through rate.' },
              { title: 'Slow images hurt Core Web Vitals', desc: 'Images without width, height, and lazy loading cause layout shifts and slow LCP — both are direct ranking signals.' },
              { title: 'No AI Overview eligibility = invisible in SGE', desc: 'Without FAQPage schema or question-structured headings, Google\'s AI won\'t summarise your content in AI Overviews.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING CALLOUT */}
      <div className="seo-section" style={{ background: '#eef8f0', padding: 'clamp(48px,6vw,80px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '26px', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-0.5px', marginBottom: '10px' }}>Pay per use. No subscription.</h3>
            <p style={{ fontSize: '15px', color: '#4a6b4c', lineHeight: '1.65' }}>Buy credits once, use them across all Dablin tools. New accounts start with 7 free credits — enough for your first SEO audit and a description.</p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '40px', fontWeight: '800', color: '#1a7a3a', fontFamily: "'Roboto Condensed', sans-serif", lineHeight: 1 }}>€0.50</div>
            <div style={{ fontSize: '13px', color: '#4a6b4c', marginTop: '4px' }}>per SEO audit</div>
          </div>
          <div onClick={() => trackEvent('sign_up_click', { location: 'seo_audit_page_pricing' })}>
            <SignUpButton mode="modal">
              <button className="seo-btn-primary seo-btn-large">Start free →</button>
            </SignUpButton>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="seo-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
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
      <div className="seo-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Find out what's <span style={{ color: '#6fcf8a' }}>holding your rankings back.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>7 free credits. No credit card. Results in 20 seconds.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'seo_audit_page_cta' })}>
            <SignUpButton mode="modal">
              <button className="seo-btn-primary seo-btn-large">Audit your first page free →</button>
            </SignUpButton>
          </div>
          <SignInButton mode="modal">
            <button style={{ background: 'none', border: '2px solid rgba(255,255,255,0.2)', color: 'white', padding: '15px 32px', borderRadius: '10px', fontFamily: "'Roboto', sans-serif", fontSize: '16px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}>Sign in</button>
          </SignInButton>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#0a1a0b', padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>© 2026 Dablin. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[['Privacy', '/legal.html'], ['Terms', '/legal.html'], ['hello@dablin.co', 'mailto:hello@dablin.co']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
