import { useState } from "react";
import { SignUpButton } from "@clerk/clerk-react";
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

const CHECKS = [
  { label: 'Meta description', pass: true,  note: '142 chars — within the 155 char limit' },
  { label: 'H1 heading',       pass: true,  note: 'Found: "Bamboo Kitchen Set — Eco-Friendly Cooking Tools"' },
  { label: 'Canonical URL',    pass: true,  note: 'Self-referencing canonical present' },
  { label: 'Mobile viewport',  pass: true,  note: 'viewport meta tag found' },
  { label: 'Open Graph tags',  pass: true,  note: 'og:title, og:description, og:image all present' },
  { label: 'HTTPS',            pass: true,  note: 'Site served over HTTPS' },
  { label: 'Robots tag',       pass: true,  note: 'No noindex directive found' },
  { label: 'Image alt text',   pass: true,  note: '8/8 images have alt attributes' },
  { label: 'Schema markup',    pass: false, note: 'JSON-LD found but no Product, BreadcrumbList, or review schema' },
  { label: 'Product schema',   pass: false, note: 'No @type: Product — not eligible for Shopping rich results' },
  { label: 'Review schema',    pass: false, note: 'No AggregateRating — reviews not showing in SERPs' },
  { label: 'Word count',       pass: false, note: 'Only 287 words — thin content (min 600 for March 2026)' },
  { label: 'Information Gain', pass: false, note: 'No author signal, no date, no original data or structured lists' },
  { label: 'AI Overview eligibility', pass: false, note: 'No FAQPage schema and no question-structured H2s found' },
  { label: 'Render-blocking scripts', pass: false, note: '2 scripts in <head> without async/defer' },
  { label: 'Sitemap',          pass: true,  note: 'sitemap.xml found and referenced in robots.txt' },
  { label: 'Internal links',   pass: true,  note: '6 internal links found' },
  { label: 'PageSpeed score',  pass: false, note: '62/100 — below the 70+ threshold for Core Web Vitals' },
];

const ISSUES = [
  {
    label: 'No Product schema',
    severity: 'Critical',
    desc: 'Your page is not eligible for Google Shopping rich results or price-display in search snippets. Adding Product schema can significantly increase CTR from organic search.',
    fix: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Bamboo Kitchen Set",
  "description": "Eco-friendly bamboo kitchen tools for sustainable cooking",
  "brand": { "@type": "Brand", "name": "EcoBamboo" },
  "offers": {
    "@type": "Offer",
    "price": "34.99",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
}
</script>`,
  },
  {
    label: 'Information Gain too low',
    severity: 'Critical',
    desc: "Google's March 2026 update penalises pages under 600 words that lack original signals. Your page has 287 words with no author byline, no date, and no unique data. Pages like this are being filtered from high-value positions.",
    fix: `Add a content section with:
— Author byline: "Written by [Name], sustainable product specialist"
— Publish date: <time datetime="2026-04-01">April 1, 2026</time>
— A materials comparison table (bamboo vs plastic vs silicone)
— Care instructions list (3–5 bullet points)
— An FAQ section with 3+ questions

Target: 700+ words total with at least 2 of the above signals.`,
  },
  {
    label: 'No AI Overview eligibility',
    severity: 'Important',
    desc: "Google's AI-generated search summaries favour pages with FAQPage schema or question-structured H2 headings. Without these, your page is unlikely to appear in AI Overviews even if it ranks well.",
    fix: `Add these H2s to your page:
— "Is bamboo better than plastic for kitchen tools?"
— "How do you care for bamboo kitchen sets?"
— "Are bamboo kitchen tools safe for food contact?"

Then add FAQPage JSON-LD schema with the same Q&A pairs.`,
  },
  {
    label: '2 render-blocking scripts',
    severity: 'Important',
    desc: 'Two scripts in your <head> are loading synchronously, blocking the browser from rendering the page. This directly hurts your Core Web Vitals LCP score and PageSpeed rating.',
    fix: `Before: <script src="app.js"></script>
After:  <script src="app.js" defer></script>

Use defer for scripts that depend on DOM content.
Use async for independent scripts (analytics, tracking).`,
  },
  {
    label: 'No review schema',
    severity: 'Good to have',
    desc: 'Adding AggregateRating schema shows star ratings in Google search results, which typically increases CTR by 15–35%. You have reviews on the page but they are not marked up.',
    fix: `Add to your Product schema:
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.7",
  "reviewCount": "43"
}`,
  },
];

const FAQ = [
  { q: "What does the SEO Audit score mean?", a: "The score shows how many of 18 checks your page passed. A score of 11/18 means 11 checks passed and 7 failed. Each failed check is a specific, fixable issue — not a vague recommendation. Every failure includes an AI-generated fix you can copy and paste." },
  { q: "What is Information Gain and why does it matter?", a: "Information Gain is one of two new ranking signals introduced in Google's March 2026 core update. It measures whether your page adds something original to the internet — unique data, author signals, structured content, or first-hand experience. Pages with thin, generic content are being deprioritised. Fixing this usually means adding 300+ words of original content with a byline, date, and at least one structured element like a comparison table or FAQ." },
  { q: "What is AI Overview eligibility?", a: "AI Overview eligibility is the second March 2026 signal. Google's AI-generated search summaries pull from pages that have FAQPage or HowTo schema, or H2/H3 headings phrased as questions. Adding these doesn't guarantee you'll appear in AI Overviews, but without them you're ineligible entirely." },
  { q: "How long does fixing these issues take?", a: "The three most impactful fixes — Product schema, Information Gain content, and render-blocking scripts — can typically be done in 2 to 4 hours. The AI-generated fixes in the report are ready to copy and paste. Schema fixes go in your page's <head>. Content fixes go in your product description." },
  { q: "Will fixing these issues immediately improve my rankings?", a: "Schema fixes can show results in 1 to 2 weeks as Google re-crawls and processes the structured data. Content improvements take longer — typically 4 to 8 weeks. Render-blocking script fixes improve Core Web Vitals scores almost immediately after deployment." },
  { q: "Does the audit work on any platform?", a: "Yes. The SEO Audit works on any publicly accessible URL regardless of platform — Shopify, WooCommerce, WordPress, Amazon, custom stores. It fetches and analyses the live page, so it checks exactly what Google and AI engines see." },
];

const SEVERITY_STYLES = {
  Critical:     { bg: '#fef2f2', color: '#c0392b', border: '#fca5a5' },
  Important:    { bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
  'Good to have': { bg: '#eef8f0', color: '#1a7a3a', border: '#d0e8d4' },
};

function SeverityPill({ s }) {
  const st = SEVERITY_STYLES[s] || SEVERITY_STYLES.Important;
  return <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 10px', borderRadius: '20px', background: st.bg, color: st.color, border: `1px solid ${st.border}`, display: 'inline-block', flexShrink: 0 }}>{s}</span>;
}

export default function PageSeoReport() {
  const passed = CHECKS.filter(c => c.pass).length;
  const failed = CHECKS.filter(c => !c.pass).length;

  return (
    <PageLayout activePath="/seo-audit">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&family=Roboto+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sr-btn { background: #1a7a3a; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .sr-btn:hover { background: #2d9a4e; transform: translateY(-1px); }
        .sr-code { background: #f0f7f0; border: 1px solid #d0e8d4; border-radius: 8px; padding: 14px 16px; font-family: 'Roboto Mono', monospace; font-size: 12px; color: '#0d1f0e'; white-space: pre-wrap; line-height: 1.6; margin-top: 12px; overflow-x: auto; }
        @media (max-width: 900px) {
          .sr-score-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sr-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="sr-section" style={{ background: '#0d1f0e', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #1a3a1e' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', color: '#6fcf8a', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>⊕ Sample SEO Audit Report</div>
          <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', lineHeight: '1.05', letterSpacing: '-2px', color: 'white', marginBottom: '16px' }}>
            This is what you get<br /><span style={{ color: '#6fcf8a' }}>after running an audit.</span>
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', fontWeight: '300', lineHeight: '1.65', marginBottom: '0', maxWidth: '580px' }}>
            A real report for a fictional Shopify product page. 18 checks, AI fix for every issue, PageSpeed score included. This is exactly what Dablin generates for your URL in under 30 seconds.
          </p>
        </div>
      </div>

      {/* ── SCORE SUMMARY ── */}
      <div className="sr-section" style={{ background: '#f8faf8', padding: 'clamp(40px,5vw,72px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: '13px', color: '#4a6b4c', background: '#eef8f0', border: '1px solid #d0e8d4', borderRadius: '8px', padding: '6px 14px' }}>mystore.com/products/bamboo-kitchen-set</div>
            <div style={{ fontSize: '12px', color: '#9ab09c' }}>Audited April 3, 2026</div>
          </div>
          <div className="sr-score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Checks passed', value: `${passed}/18`, color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
              { label: 'Issues found', value: failed, color: '#c0392b', bg: '#fef2f2', border: '#fca5a5' },
              { label: 'PageSpeed score', value: '62', color: '#c0392b', bg: '#fef2f2', border: '#fca5a5' },
              { label: 'Critical issues', value: '2', color: '#c0392b', bg: '#fef2f2', border: '#fca5a5' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: '36px', fontWeight: '800', color: s.color, marginBottom: '4px' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: s.color, fontWeight: '600' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a6b4c' }}>
            <span>{passed} passed</span><span>{failed} failed</span>
          </div>
          <div style={{ height: '8px', background: '#fef2f2', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(passed/18)*100}%`, background: '#b45309', borderRadius: '20px' }} />
          </div>
        </div>
      </div>

      {/* ── ISSUES ── */}
      <div className="sr-section" style={{ background: 'white', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '10px' }}>Failed checks with AI fixes</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>Every issue. Every fix. Ready to copy.</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {ISSUES.map((issue, i) => {
              const [expanded, setExpanded] = useState(false);
              return (
                <div key={i} style={{ border: '1px solid #eef2ee', borderRadius: '14px', overflow: 'hidden' }}>
                  <div onClick={() => setExpanded(!expanded)} style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', background: expanded ? '#f8faf8' : 'white' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#0d1f0e' }}>{issue.label}</span>
                        <SeverityPill s={issue.severity} />
                      </div>
                      <p style={{ fontSize: '14px', color: '#4a6b4c', lineHeight: '1.6', margin: 0 }}>{issue.desc}</p>
                    </div>
                    <span style={{ fontSize: '20px', color: '#1a7a3a', fontWeight: '300', flexShrink: 0 }}>{expanded ? '−' : '+'}</span>
                  </div>
                  {expanded && (
                    <div style={{ padding: '0 24px 20px', background: '#f8faf8', borderTop: '1px solid #eef2ee' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a7a3a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', marginTop: '16px' }}>✦ AI Fix</div>
                      <pre className="sr-code">{issue.fix}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ALL CHECKS ── */}
      <div className="sr-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '10px' }}>Full check list</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>All 18 checks at a glance</h2>
          </div>
          <div style={{ border: '1px solid #eef2ee', borderRadius: '14px', overflow: 'hidden', background: 'white' }}>
            {CHECKS.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 20px', borderBottom: i < CHECKS.length - 1 ? '1px solid #f0f7f0' : 'none' }}>
                <span style={{ fontSize: '15px', color: c.pass ? '#1a7a3a' : '#c0392b', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>{c.pass ? '✓' : '✗'}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0d1f0e', marginBottom: '2px' }}>{c.label}</div>
                  <div style={{ fontSize: '12px', color: '#4a6b4c' }}>{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXPLANATION ── */}
      <div className="sr-section" style={{ background: 'white', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '10px' }}>How to read this report</p>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '32px' }}>What each check means</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { title: 'Critical', desc: 'Directly hurts your rankings or eligibility for rich results. Fix these first — they have the highest impact and are usually the fastest to fix.' },
              { title: 'Important', desc: 'Affects performance, user experience, or emerging ranking signals like Core Web Vitals and AI Overview eligibility. Fix these second.' },
              { title: 'Good to have', desc: 'Incremental improvements — review schema, internal linking, image optimisation. These help over time but won\'t move the needle on their own.' },
              { title: 'AI-generated fixes', desc: 'Every failed check includes an AI-generated fix — the exact code, schema block, or content change you need. Copy and paste it directly into your page.' },
            ].map(e => (
              <div key={e.title} style={{ background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{e.title}</div>
                <p style={{ fontSize: '14px', color: '#4a6b4c', lineHeight: '1.65', fontWeight: '300' }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="sr-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '10px' }}>FAQ</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>Common questions about the SEO Audit</h2>
          </div>
          <div style={{ borderTop: '1px solid #eef2ee' }}>
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="sr-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Run this audit<br /><span style={{ color: '#6fcf8a' }}>on your own page.</span>
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>18 checks. AI fix for every issue. Results in 30 seconds.</p>
        <div onClick={() => trackEvent('sign_up_click', { location: 'seo_report_cta' })}>
          <SignUpButton mode="modal">
            <button className="sr-btn" style={{ fontSize: '16px', padding: '16px 40px', borderRadius: '12px' }}>Audit my page →</button>
          </SignUpButton>
        </div>
      </div>
    </PageLayout>
  );
}
