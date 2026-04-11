import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
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

function AiAuditDemo() {
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
    { label: 'llms.txt file', pass: false, issue: 'No llms.txt found — AI engines cannot identify your brand context' },
    { label: 'AI crawlers allowed', pass: true },
    { label: 'Organization schema', pass: false, issue: 'No Organization schema — brand identity unclear to AI engines' },
    { label: 'sameAs social links', pass: false, issue: 'No sameAs links — AI cannot verify brand across platforms' },
    { label: 'Open Graph tags', pass: true },
  ];

  return (
    <div style={{ borderRadius: '14px', border: '1px solid #d0e8d4', background: '#f8faf8', overflow: 'hidden', boxShadow: '0 8px 40px rgba(26,122,58,0.10)' }}>
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid #d0e8d4' }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#4a6b4c' }}>dablin.co · GEO & AI Visibility Audit</span>
      </div>
      <div style={{ padding: '20px', background: 'white' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#0d1f0e', fontFamily: 'monospace', minHeight: '34px' }}>
            {urlVal}{phase === 'typing' ? <span style={{ borderRight: '2px solid #1a7a3a', animation: 'blink 0.8s infinite' }}>&nbsp;</span> : ''}
          </div>
          <button style={{ background: (phase === 'auditing' || phase === 'results') ? '#1a7a3a' : '#b0c9b4', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'default', whiteSpace: 'nowrap' }}>
            {phase === 'auditing' ? `Auditing${dots}` : 'Run GEO Audit'}
          </button>
        </div>
        {showScore && (
          <div style={{ background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #d97706', background: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', color: '#d97706', flexShrink: 0 }}>58%</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#0d1f0e', marginBottom: '2px' }}>Poor AI visibility</div>
              <div style={{ fontSize: '12px', color: '#4a6b4c' }}>7 of 12 checks passed</div>
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
  { group: "Brand Identity", items: [
    { title: "Organization schema", desc: "AI engines verify your brand is a real entity via JSON-LD structured data." },
    { title: "sameAs social links", desc: "Social profiles linked in schema for cross-platform entity recognition." },
    { title: "WebSite schema & name", desc: "WebSite schema with name field for AI engine brand identification." },
  ]},
  { group: "AI Crawlability", items: [
    { title: "llms.txt file", desc: "Tells ChatGPT, Gemini and Claude your site's purpose, content, and what they can use." },
    { title: "AI crawlers allowed", desc: "GPTBot, ClaudeBot, PerplexityBot not blocked in robots.txt." },
    { title: "No noai meta tag", desc: "AI engines are not explicitly blocked from indexing your page." },
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
  { q: "What is the GEO Audit?", a: "The GEO (Generative Engine Optimisation) Audit runs 12 checks to see how well AI-powered search engines like ChatGPT, Gemini, and Claude can find, crawl, and understand your pages. It covers brand identity signals, AI crawlability, and AI-readable content — with a ready-to-copy fix for every issue it finds." },
  { q: "What is llms.txt and why does it matter?", a: "llms.txt is a simple text file placed at the root of your website (yoursite.com/llms.txt) that tells AI models what your site does, who it's for, and what content they can use. Without it, AI engines have to guess — and often get it wrong. Dablin generates a ready-to-upload version for you if it's missing." },
  { q: "How is this different from the SEO Audit?", a: "The SEO Audit focuses on Google ranking factors — meta tags, schema, headings, Core Web Vitals, and the new March 2026 signals. The GEO Audit focuses on what AI engines need to find and cite your brand — llms.txt, Organization schema, sameAs links, AI crawler access, and more." },
  { q: "What are AEO and GEO?", a: "AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) both refer to optimising content to be found and cited by AI-powered search tools like ChatGPT, Gemini, and Google's AI Overviews. Dablin's GEO Audit covers the technical checks that matter most for both." },
  { q: "Which AI engines does this check for?", a: "The audit checks signals that affect all major AI engines: ChatGPT (GPTBot), Google Gemini (Google-Extended), Claude (ClaudeBot), Perplexity (PerplexityBot), and Microsoft Copilot. This includes robots.txt crawler access, schema markup, llms.txt, and response time." },
  { q: "Does it work for any website?", a: "Yes. Any publicly accessible URL can be audited — Shopify stores, WooCommerce, WordPress, Amazon, or any custom site. You can also audit competitor pages to see how their AI visibility compares to yours." },
  { q: "What AI fixes does it generate?", a: "For every failed check, Dablin generates a ready-to-copy fix — the exact JSON-LD schema block, llms.txt content, robots.txt rule, or HTML tag you need. Paste it directly into your CMS. No developer needed." },
  { q: "How much does it cost?", a: "The GEO Audit is included in all Dablin plans. See the Pricing page for plan details." },
];

export default function PageAiAudit() {
  return (
    <PageLayout activePath="/ai-visibility-audit">
      <Helmet>
        <title>GEO Audit — Check AI Visibility for Your Brand | Dablin</title>
        <meta name="description" content="Check if ChatGPT, Gemini and Claude can find your brand. 12 technical GEO checks covering llms.txt, Organization schema and AI crawler access — with AI-generated fixes. Free to start." />
        <meta property="og:title" content="GEO Audit — Check AI Visibility for Your Brand | Dablin" />
        <meta property="og:description" content="Check if ChatGPT, Gemini and Claude can find your brand. 12 technical GEO checks with AI-generated fixes for every issue. Free to start at dablin.co." />
        <meta property="og:image" content="https://dablin.co/geo-audit-og.png" />
        <meta property="og:url" content="https://dablin.co/ai-visibility-audit" />
        <meta name="twitter:title" content="GEO Audit — Check AI Visibility for Your Brand | Dablin" />
        <meta name="twitter:description" content="Check if ChatGPT, Gemini and Claude can find your brand. 12 technical GEO checks with AI-generated fixes. Free to start." />
        <link rel="canonical" href="https://dablin.co/ai-visibility-audit" />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .ai-btn-primary { background: #1a7a3a; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .ai-btn-primary:hover { background: #2d9a4e; transform: translateY(-1px); }
        @media (max-width: 900px) {
          .ai-hero-grid { flex-direction: column !important; }
          .ai-hero-right { display: none !important; }
          .ai-checks-grid { grid-template-columns: 1fr !important; }
          .ai-grid-3 { grid-template-columns: 1fr !important; }
          .ai-dark-grid { flex-direction: column !important; }
        }
        @media (max-width: 600px) {
          .ai-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="ai-section" style={{ background: '#eef8f0', backgroundImage: 'linear-gradient(rgba(26,122,58,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.06) 1px,transparent 1px)', backgroundSize: '36px 36px', padding: 'clamp(56px,7vw,96px) 56px', borderBottom: '1px solid #d0e8d4' }}>
        <div className="ai-hero-grid" style={{ display: 'flex', alignItems: 'flex-start', gap: '64px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ flex: '0 0 400px' }}>
            <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(40px,5vw,60px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-2.5px', color: '#0d1f0e', marginBottom: '20px' }}>
              GEO Audit.<br />
              <span style={{ color: '#1a7a3a' }}>AI Visibility.</span><br />
              12 checks.
            </h1>
            <p style={{ fontSize: '17px', color: '#4a6b4c', fontWeight: '300', lineHeight: '1.65', marginBottom: '28px' }}>
              Check if ChatGPT, Gemini and Claude can find your brand. 12 technical checks covering llms.txt, Organization schema, AI crawler access and more — with a ready-to-copy fix for every issue.
            </p>
            <div onClick={() => trackEvent('sign_up_click', { location: 'ai_audit_page_hero' })}>
              <SignUpButton mode="modal">
                <button className="ai-btn-primary">Run GEO Audit</button>
              </SignUpButton>
            </div>
          </div>
          <div className="ai-hero-right" style={{ flex: 1, minWidth: 0 }}>
            <AiAuditDemo />
          </div>
        </div>
      </div>

      {/* ── 12 CHECKS ── */}
      <div className="ai-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>What we check</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>12 GEO checks across 3 categories</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Every failed check comes with an AI-generated fix ready to copy and paste.</p>
          </div>
          <div className="ai-checks-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {CHECKS.map(group => (
              <div key={group.group} style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '14px', padding: '28px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eef8f0', color: '#1a7a3a', borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>
                  {group.group}
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

      {/* ── WHY GEO MATTERS ── */}
      <div className="ai-section" style={{ background: '#0d1f0e', padding: 'clamp(48px,6vw,96px) 56px' }}>
        <div className="ai-dark-grid" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '64px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', background: '#1a7a3a', color: 'white', borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '20px' }}>Why GEO matters</div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: '800', color: 'white', letterSpacing: '-0.5px', marginBottom: '14px', lineHeight: '1.1' }}>AI search is replacing<br />traditional search.</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.65', fontWeight: '300' }}>ChatGPT alone has over 300 million weekly users asking product questions. If AI engines can't find or trust your brand, you're invisible to an audience that's growing faster than Google.</p>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'No llms.txt = AI guesses your brand', desc: 'Without llms.txt, ChatGPT and Gemini have to infer what your site is about. They often get it wrong — or cite a competitor instead.' },
              { title: 'No Organization schema = untrusted entity', desc: "AI engines cross-reference schema to verify brands are real. Without it, your brand is unverifiable and gets skipped in AI-generated answers." },
              { title: 'Blocked crawlers = zero visibility', desc: 'If GPTBot or ClaudeBot is blocked in robots.txt, AI engines literally cannot read your pages — no matter how good your content is.' },
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
      <div className="ai-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>Before &amp; after</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>What a typical GEO audit finds</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { bg: '#fef2f2', border: '#fca5a5', labelColor: '#c0392b', label: 'Before Dablin', dot: '#ef4444', items: ['No llms.txt — AI engines guess your brand context', 'GPTBot blocked in robots.txt', 'No Organization schema — brand unverified', 'Missing sameAs links — no cross-platform identity'] },
              { bg: '#eef8f0', border: '#d0e8d4', labelColor: '#1a7a3a', label: 'After fixing with Dablin', dot: '#1a7a3a', items: ['llms.txt added — AI engines understand your brand', 'AI crawlers allowed — all engines can read your pages', 'Organization schema added — verified entity', 'sameAs links added — brand confirmed across platforms'] },
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

      {/* ── FAQ ── */}
      <div className="ai-section" style={{ background: '#ffffff', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>FAQ</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>Common questions about GEO</h2>
          </div>
          <div style={{ borderTop: '1px solid #eef2ee' }}>
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="ai-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Find out if AI engines<br /><span style={{ color: '#6fcf8a' }}>know your brand.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>12 GEO checks. AI fix for every issue. Results in 20 seconds.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'ai_audit_page_cta' })}>
            <SignUpButton mode="modal">
              <button className="ai-btn-primary">Run GEO Audit →</button>
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
