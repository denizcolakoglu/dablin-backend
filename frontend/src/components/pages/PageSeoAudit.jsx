import { useState, useEffect, useRef } from "react";
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

function typeText(text, setter, onDone, speed = 22) {
  let i = 0;
  const iv = setInterval(() => {
    setter(text.slice(0, ++i));
    if (i >= text.length) { clearInterval(iv); onDone(); }
  }, speed);
  return iv;
}

function SeoAuditDemo() {
  const [phase, setPhase] = useState('idle');
  const [urlVal, setUrlVal] = useState('');
  const [showScore, setShowScore] = useState(false);
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [dots, setDots] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => runDemo(), 600);
    return () => { clearTimeout(t); clearTimeout(timerRef.current); };
  }, []);

  function runDemo() {
    setPhase('typing'); setUrlVal(''); setShowScore(false); setVisibleChecks(0);
    typeText('https://mystore.com/products/bamboo-set', setUrlVal, () => {
      setTimeout(() => {
        setPhase('auditing');
        let d = 0;
        const iv = setInterval(() => { d = (d + 1) % 4; setDots('.'.repeat(d)); }, 400);
        timerRef.current = setTimeout(() => {
          clearInterval(iv);
          setPhase('results');
          setShowScore(true);
          let c = 0;
          const civ = setInterval(() => {
            c++; setVisibleChecks(c);
            if (c >= 5) { clearInterval(civ); timerRef.current = setTimeout(() => runDemo(), 4000); }
          }, 400);
        }, 2200);
      }, 500);
    }, 22);
  }

  const checks = [
    { label: 'Meta description', pass: true },
    { label: 'Heading structure (H1)', pass: true },
    { label: 'Information Gain', pass: false, issue: 'Only 280 words — Google March 2026 requires 600+ with original data' },
    { label: 'AI Overview eligibility', pass: false, issue: 'No FAQPage schema or question-structured H2s found' },
    { label: 'Image optimisation', pass: false, issue: '4 images missing width/height and loading=lazy — hurts Core Web Vitals' },
  ];

  return (
    <div style={{ borderRadius: '14px', border: '1px solid #d0e8d4', background: '#f8faf8', overflow: 'hidden', boxShadow: '0 8px 40px rgba(26,122,58,0.10)' }}>
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid #d0e8d4' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#4a6b4c' }}>dablin.co · SEO Audit</span>
      </div>
      <div style={{ padding: '20px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#0d1f0e', fontFamily: 'monospace', minHeight: '34px' }}>
            {urlVal}{phase === 'typing' ? <span style={{ borderRight: '2px solid #1a7a3a', animation: 'blink 0.8s infinite' }}>&nbsp;</span> : ''}
          </div>
          <button style={{ background: (phase === 'auditing' || phase === 'results') ? '#1a7a3a' : '#b0c9b4', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'default', whiteSpace: 'nowrap' }}>
            {phase === 'auditing' ? `Auditing${dots}` : 'Audit SEO'}
          </button>
        </div>
        {showScore && (
          <div style={{ background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #d97706', background: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', color: '#d97706', flexShrink: 0 }}>67%</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#0d1f0e', marginBottom: '2px' }}>Needs improvement</div>
              <div style={{ fontSize: '12px', color: '#4a6b4c' }}>12 of 18 checks passed</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {checks.slice(0, visibleChecks).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '9px 11px', background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', flexShrink: 0 }}>{c.pass ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#0d1f0e' }}>{c.label}</div>
                {!c.pass && <div style={{ fontSize: '11px', color: '#c0392b', marginTop: '2px' }}>{c.issue}</div>}
                {!c.pass && <div style={{ marginTop: '5px', background: '#f0faf1', border: '1px solid #b7debb', borderRadius: '5px', padding: '4px 8px', fontSize: '10px', color: '#1a7a3a', fontWeight: '700', display: 'inline-block' }}>✦ AI Fix available — copy &amp; paste</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
  { q: "How much does it cost?", a: "The SEO Audit is included in all Dablin plans. See the Pricing page for plan details." },
];

export default function PageSeoAudit() {
  return (
    <PageLayout activePath="/seo-audit">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .seo-btn-primary { background: #1a7a3a; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .seo-btn-primary:hover { background: #2d9a4e; transform: translateY(-1px); }
        @media (max-width: 900px) {
          .seo-hero-grid { flex-direction: column !important; }
          .seo-hero-right { display: none !important; }
          .seo-checks-grid { grid-template-columns: 1fr !important; }
          .seo-grid-3 { grid-template-columns: 1fr !important; }
          .seo-march-grid { flex-direction: column !important; }
          .seo-ba-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .seo-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="seo-section" style={{ background: '#eef8f0', backgroundImage: 'linear-gradient(rgba(26,122,58,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.06) 1px,transparent 1px)', backgroundSize: '36px 36px', padding: 'clamp(56px,7vw,96px) 56px', borderBottom: '1px solid #d0e8d4' }}>
        <div className="seo-hero-grid" style={{ display: 'flex', alignItems: 'flex-start', gap: '64px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Left */}
          <div style={{ flex: '0 0 400px' }}>
            <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(44px,5vw,64px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-2.5px', color: '#0d1f0e', marginBottom: '20px' }}>
              SEO Audit.<br />
              <span style={{ color: '#1a7a3a' }}>18 checks.<br />AI fixes.</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#4a6b4c', fontWeight: '300', lineHeight: '1.65', marginBottom: '28px' }}>
              Paste any product page URL. Get a full SEO report with ready-to-copy fixes for every issue — in under 30 seconds.
            </p>
            <div onClick={() => trackEvent('sign_up_click', { location: 'seo_audit_page_hero' })}>
              <SignUpButton mode="modal">
                <button className="seo-btn-primary">Audit my page</button>
              </SignUpButton>
            </div>
          </div>

          {/* Right: animation */}
          <div className="seo-hero-right" style={{ flex: 1, minWidth: 0 }}>
            <SeoAuditDemo />
          </div>
        </div>
      </div>

      {/* ── 18 CHECKS ── */}
      <div className="seo-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 56px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>What we check</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>18 checks across 5 categories</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Every check comes with an AI-generated fix if it fails.</p>
          </div>
          <div className="seo-checks-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

      {/* ── MARCH 2026 DARK BAND ── */}
      <div className="seo-section" style={{ background: '#0d1f0e', padding: 'clamp(48px,6vw,96px) 56px' }}>
        <div className="seo-march-grid" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '64px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', background: '#1a7a3a', color: 'white', borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '20px' }}>⚡ Google March 2026</div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: '800', color: 'white', letterSpacing: '-0.5px', marginBottom: '14px', lineHeight: '1.1' }}>Two new signals.<br />Most tools miss them.</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.65', fontWeight: '300' }}>The March 2026 update rolled out in under 20 hours — the fastest core update in Google history. Dablin checks both new signals.</p>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Information Gain', desc: 'Checks if your page adds something original — unique data, author signals, structured lists. Pages without it are filtered down.' },
              { title: 'AI Overview eligibility', desc: 'FAQPage or HowTo schema, or question-structured H2s — needed to appear in Google\'s AI-generated search summaries.' },
            ].map(item => (
              <div key={item.title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#6fcf8a', marginBottom: '6px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.55' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BEFORE / AFTER ── */}
      <div className="seo-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 56px', borderTop: '1px solid #eef2ee', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>Before &amp; after</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>What a typical audit finds</h2>
          </div>
          <div className="seo-ba-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { bg: '#fef2f2', border: '#fca5a5', labelColor: '#c0392b', label: 'Before Dablin', dot: '#ef4444', items: ['No Product schema — not eligible for Shopping', 'Missing meta description', 'Fails Information Gain — filtered by March 2026', 'No AI Overview eligibility'] },
              { bg: '#eef8f0', border: '#d0e8d4', labelColor: '#1a7a3a', label: 'After fixing with Dablin', dot: '#1a7a3a', items: ['Product schema added — Google Shopping ready', 'Meta description optimised — CTR improved', 'Passes Information Gain — protected', 'FAQPage schema — eligible for AI Overviews'] },
            ].map(col => (
              <div key={col.label} style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: '14px', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: col.labelColor, marginBottom: '14px' }}>{col.label}</div>
                {col.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: i < col.items.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', fontSize: '13px', color: '#0d1f0e' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY IT MATTERS ── */}
      <div className="seo-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>Why it matters</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>Most product pages fail basic SEO checks</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>These are not advanced tactics — they are fundamentals Google expects on every page.</p>
          </div>
          <div className="seo-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              { title: 'Missing schema costs you rich results', desc: "Without Product schema, your listings don't qualify for Google Shopping and won't show star ratings or price." },
              { title: 'Thin content gets filtered', desc: "Pages under 600 words with no original data are penalised by Google's March 2026 Information Gain filter." },
              { title: 'No canonical = duplicate URL penalties', desc: "Shopify creates multiple URLs per product. A missing canonical splits your ranking signals across duplicates." },
              { title: 'Missing meta = auto-generated previews', desc: "Without a meta description, Google writes its own — usually bad. This directly affects click-through rate." },
              { title: 'Slow images hurt Core Web Vitals', desc: "Images without width, height, and lazy loading cause layout shifts and slow LCP — both direct ranking signals." },
              { title: 'No AI Overview eligibility = invisible in SGE', desc: "Without FAQPage schema or question-structured headings, Google's AI won't summarise your content." },
            ].map(f => (
              <div key={f.title} style={{ background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="seo-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
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
      <div className="seo-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Find out what's <span style={{ color: '#6fcf8a' }}>holding your rankings back.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>Fix your SEO issues today. Results in 20 seconds.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'seo_audit_page_cta' })}>
            <SignUpButton mode="modal">
              <button className="seo-btn-primary">Audit your first page free →</button>
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
