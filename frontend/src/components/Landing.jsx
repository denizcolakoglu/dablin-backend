import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { trackEvent } from "../analytics";
import { useState, useEffect, useRef } from "react";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-question">
        <span>{q}</span>
        <span className="faq-icon">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

const FEATURES = [
  {
    title: "AI Visibility Check",
    desc: "Enter a URL or describe your brand. Dablin generates 7 typed queries and checks if ChatGPT, Gemini, and Claude mention you across problem, category, and comparison searches.",
    href: "/ai-visibility-check",
  },
  {
    title: "AI Query Check",
    desc: "No URL needed — describe your brand in plain language, review the 7 generated queries, then run them across all 3 AI engines. Full control over how your brand is framed.",
    href: "/ai-query-check",
  },
  {
    title: "AI Visibility Audit",
    desc: "12 technical checks for what's stopping AI engines from finding your brand — llms.txt, Organization schema, AI crawlers, sameAs links, and more. AI fix for every issue.",
    href: "/ai-visibility-audit",
  },
  {
    title: "SEO Audit",
    desc: "18 checks across content, technical SEO, structured data, and Google March 2026 signals. PageSpeed score included. Ready-to-copy AI fix for every failed check.",
    href: "/seo-audit",
  },
  {
    title: "Google Search Console",
    desc: "Connect your GSC account and get striking distance keywords, unindexed pages, Core Web Vitals, and query data — all inside Dablin. Agency plan.",
    href: "/google-search-console",
  },
  {
    title: "SEO/GEO Dashboard",
    desc: "All your SEO and AI visibility issues in one Kanban board. Scan your URL, get a prioritised task list, drag tickets from To Do to Done as you fix them.",
    href: "/seo-geo-dashboard",
  },
];

const FAQ = [
  {
    q: "What is Dablin?",
    a: "Dablin is an AI visibility and SEO toolkit for brands and e-commerce sellers. It checks if ChatGPT, Gemini, and Claude mention your brand, audits your pages for AI engine visibility and SEO issues, connects to Google Search Console, and organises everything into a prioritised dashboard.",
  },
  {
    q: "Does ChatGPT mention my brand?",
    a: "Most brands are completely invisible to AI engines. Dablin's AI Visibility Check generates 7 targeted queries across 3 intent types — problem, category, and comparison — and sends them to Claude, GPT-4o, and Gemini simultaneously. You get a full table showing where you're mentioned and which competitors appear instead.",
  },
  {
    q: "What's the difference between AI Visibility Check and AI Query Check?",
    a: "Both tools run 7 queries × 3 AI engines. The difference is input: AI Visibility Check takes a URL and reads your page automatically. AI Query Check takes a plain-language description — useful when your site isn't live yet, or when you want full control over how queries are framed.",
  },
  {
    q: "What is the AI Visibility Audit?",
    a: "A 12-point technical check that finds why AI engines can't find or understand your pages. It checks llms.txt, AI crawler access, Organization schema, sameAs social links, WebSite schema, HTTPS, response time, H1, meta description, canonical URL, and Open Graph tags. Every failed check includes a ready-to-copy AI-generated fix.",
  },
  {
    q: "What does the SEO Audit check?",
    a: "18 checks across five categories: content quality, technical SEO, structured data, Google March 2026 signals (Information Gain and AI Overview eligibility), and performance. Every failed check includes an AI-generated fix. A PageSpeed Insights score is also included.",
  },
  {
    q: "What is the SEO/GEO Dashboard?",
    a: "The dashboard turns your SEO and AI visibility scan results into a Kanban board — To Do, In Progress, Done. Every issue becomes a ticket prioritised by severity. Drag tickets as you fix them. If Google Search Console is connected, live GSC data (unindexed pages, Core Web Vitals, sitemap errors) is added automatically.",
  },
  {
    q: "What does the Google Search Console integration do?",
    a: "Connect your GSC account to get striking distance keywords, pages not indexed by Google, Core Web Vitals scores, query performance, and link data — all inside Dablin alongside your other tools. Available on the Agency plan.",
  },
  {
    q: "What are the Google March 2026 signals?",
    a: "The March 2026 core update introduced two new ranking signals. Information Gain checks whether your page adds something original — unique data, author signals, structured content. AI Overview eligibility checks whether your page has FAQPage or HowTo schema, or question-structured headings, which increases the chance of appearing in Google's AI-generated search summaries.",
  },
  {
    q: "How is it different from Ahrefs or Semrush?",
    a: "Ahrefs and Semrush were built for traditional Google search. They don't check whether AI engines like ChatGPT or Gemini mention your brand, don't audit for llms.txt or AI crawler access, and don't check Google March 2026 signals. Dablin covers the AI visibility layer traditional tools miss, alongside core SEO — all in one place.",
  },
  {
    q: "What platforms does it support?",
    a: "All audits and checks work on any publicly accessible URL — Shopify, WooCommerce, WordPress, Amazon, custom stores. You can also audit competitor pages.",
  },
];

// ── HERO DEMOS ──────────────────────────────────────────────────────────────

function typeText(text, setText, onDone, speed = 28) {
  let i = 0;
  setText('');
  const iv = setInterval(() => {
    i++;
    setText(text.slice(0, i));
    if (i >= text.length) { clearInterval(iv); onDone && onDone(); }
  }, speed);
  return iv;
}

function GeneratorDemo() {
  const [phase, setPhase] = useState('idle');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [visibleFields, setVisibleFields] = useState(0);
  const [dots, setDots] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => runDemo(), 600);
    return () => { clearTimeout(t); clearTimeout(timerRef.current); };
  }, []);

  function runDemo() {
    setPhase('typing1'); setVal1(''); setVal2(''); setVisibleFields(0);
    typeText('Bamboo Cutting Board Set', setVal1, () => {
      setTimeout(() => {
        setPhase('typing2');
        typeText('3-piece, organic bamboo, juice grooves, non-slip feet, dishwasher safe', setVal2, () => {
          setTimeout(() => {
            setPhase('generating');
            let d = 0;
            const iv = setInterval(() => { d = (d + 1) % 4; setDots('.'.repeat(d)); }, 400);
            timerRef.current = setTimeout(() => {
              clearInterval(iv);
              setPhase('output');
              let f = 0;
              const fiv = setInterval(() => {
                f++; setVisibleFields(f);
                if (f >= 4) { clearInterval(fiv); timerRef.current = setTimeout(() => runDemo(), 4000); }
              }, 500);
            }, 2000);
          }, 600);
        }, 18);
      }, 400);
    }, 38);
  }

  return (
    <div style={{ borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--off-white)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(45,122,58,0.10)' }}>
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>dablin.co · Generate</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', minHeight: '280px' }}>
        <div style={{ padding: '20px', borderRight: '1px solid var(--border)', background: 'white' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '14px' }}>Product Details</div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--muted)', marginBottom: '4px' }}>PRODUCT NAME</div>
            <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: 'var(--text)', minHeight: '30px' }}>
              {val1}{phase === 'typing1' ? <span style={{ borderRight: '2px solid var(--green)', animation: 'blink 0.8s infinite' }}>&nbsp;</span> : ''}
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--muted)', marginBottom: '4px' }}>KEY FEATURES</div>
            <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: 'var(--text)', minHeight: '52px', lineHeight: '1.5' }}>
              {val2}{phase === 'typing2' ? <span style={{ borderRight: '2px solid var(--green)' }}>&nbsp;</span> : ''}
            </div>
          </div>
          <button style={{ width: '100%', padding: '9px', borderRadius: '7px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'default', background: (phase === 'generating' || phase === 'output') ? 'var(--green)' : '#b0c9b4', color: 'white', transition: 'background 0.4s' }}>
            {phase === 'generating' ? `✦ Generating${dots}` : '✦ Generate Description'}
          </button>
        </div>
        <div style={{ padding: '20px', background: 'var(--off-white)' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '14px' }}>Generated Output</div>
          {(phase === 'idle' || phase === 'typing1' || phase === 'typing2') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--muted)', fontSize: '12px', gap: '8px' }}>
              <div style={{ fontSize: '20px', color: 'var(--green-mid)' }}>✦</div>
              <div>Output will appear here</div>
            </div>
          )}
          {phase === 'generating' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '10px' }}>
              <div style={{ fontSize: '20px', color: 'var(--green)', animation: 'spin 1.2s linear infinite' }}>✦</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Writing description{dots}</div>
            </div>
          )}
          {phase === 'output' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {visibleFields >= 1 && <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--green)', letterSpacing: '0.8px' }}>PRODUCT TITLE</span>
                  <span style={{ fontSize: '9px', color: 'var(--green)', fontWeight: '600' }}>56/70</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text)', lineHeight: '1.4' }}>GreenKitchen Bamboo Cutting Board Set | Non-Slip, 3-Piece</div>
              </div>}
              {visibleFields >= 2 && <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--green)', letterSpacing: '0.8px' }}>META DESCRIPTION</span>
                  <span style={{ fontSize: '9px', color: 'var(--green)', fontWeight: '600' }}>114/155</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text)', lineHeight: '1.4' }}>Organic bamboo cutting board set — 3 sizes, juice grooves, non-slip feet. Dishwasher safe.</div>
              </div>}
              {visibleFields >= 3 && <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 11px' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--green)', letterSpacing: '0.8px', display: 'block', marginBottom: '5px' }}>FEATURE BULLETS</span>
                <ul style={{ margin: 0, padding: '0 0 0 12px' }}>
                  {['Organic bamboo — sustainable', 'Juice grooves prevent mess', 'Non-slip feet, dishwasher safe'].map((b, i) => <li key={i} style={{ fontSize: '10px', color: 'var(--text)', lineHeight: '1.5' }}>{b}</li>)}
                </ul>
              </div>}
              {visibleFields >= 4 && <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--green)', letterSpacing: '0.8px' }}>SEO SCORE</span>
                <div style={{ flex: 1, height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '92%', background: 'var(--green)', borderRadius: '3px' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--green)' }}>92</span>
              </div>}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
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
    <div style={{ borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--off-white)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(45,122,58,0.10)' }}>
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>dablin.co · SEO Audit</span>
      </div>
      <div style={{ padding: '20px', background: 'white', minHeight: '300px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: 'var(--text)', fontFamily: 'monospace' }}>
            {urlVal}{phase === 'typing' ? <span style={{ borderRight: '2px solid var(--green)', animation: 'blink 0.8s infinite' }}>&nbsp;</span> : ''}
          </div>
          <button style={{ background: (phase === 'auditing' || phase === 'results') ? 'var(--green)' : '#b0c9b4', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'default', whiteSpace: 'nowrap' }}>
            {phase === 'auditing' ? `Auditing${dots}` : 'Audit SEO'}
          </button>
        </div>
        {showScore && (
          <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '3px solid #d97706', background: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: '#d97706', flexShrink: 0 }}>67%</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--dark)', marginBottom: '2px' }}>Needs improvement</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>12 of 18 checks passed</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {checks.slice(0, visibleChecks).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', flexShrink: 0 }}>{c.pass ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--dark)' }}>{c.label}</div>
                {!c.pass && <div style={{ fontSize: '11px', color: '#c0392b', marginTop: '2px' }}>{c.issue}</div>}
                {!c.pass && <div style={{ marginTop: '6px', background: '#f0faf1', border: '1px solid #b7debb', borderRadius: '5px', padding: '6px 8px', fontSize: '10px', color: 'var(--green)', fontWeight: '700' }}>✦ AI Fix available — copy & paste</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiVisibilityDemo() {
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
    { label: 'sameAs social links', pass: false, issue: 'No sameAs links in schema — AI cannot verify brand across platforms' },
    { label: 'Open Graph tags', pass: true },
  ];

  return (
    <div style={{ borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--off-white)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(45,122,58,0.10)' }}>
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>dablin.co · AI Visibility Audit</span>
      </div>
      <div style={{ padding: '20px', background: 'white', minHeight: '300px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: 'var(--text)', fontFamily: 'monospace' }}>
            {urlVal}{phase === 'typing' ? <span style={{ borderRight: '2px solid var(--green)', animation: 'blink 0.8s infinite' }}>&nbsp;</span> : ''}
          </div>
          <button style={{ background: (phase === 'auditing' || phase === 'results') ? 'var(--green)' : '#b0c9b4', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'default', whiteSpace: 'nowrap' }}>
            {phase === 'auditing' ? `Auditing${dots}` : 'Run AI Audit'}
          </button>
        </div>
        {showScore && (
          <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '3px solid #d97706', background: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: '#d97706', flexShrink: 0 }}>58%</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--dark)', marginBottom: '2px' }}>Poor AI visibility</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>7 of 12 checks passed</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {checks.slice(0, visibleChecks).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', flexShrink: 0 }}>{c.pass ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--dark)' }}>{c.label}</div>
                {!c.pass && <div style={{ fontSize: '11px', color: '#c0392b', marginTop: '2px' }}>{c.issue}</div>}
                {!c.pass && <div style={{ marginTop: '6px', background: '#f0faf1', border: '1px solid #b7debb', borderRadius: '5px', padding: '6px 8px', fontSize: '10px', color: 'var(--green)', fontWeight: '700' }}>✦ AI Fix available — copy & paste</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiCheckDemo() {
  const [phase, setPhase] = useState('idle');
  const [urlVal, setUrlVal] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);
  const [dots, setDots] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => runDemo(), 600);
    return () => { clearTimeout(t); clearTimeout(timerRef.current); };
  }, []);

  function runDemo() {
    setPhase('typing'); setUrlVal(''); setShowResults(false); setVisibleRows(0);
    typeText('https://dablin.co', setUrlVal, () => {
      setTimeout(() => {
        setPhase('checking');
        let d = 0;
        const iv = setInterval(() => { d = (d + 1) % 4; setDots('.'.repeat(d)); }, 400);
        timerRef.current = setTimeout(() => {
          clearInterval(iv);
          setPhase('results');
          setShowResults(true);
          let r = 0;
          const riv = setInterval(() => {
            r++; setVisibleRows(r);
            if (r >= 5) { clearInterval(riv); timerRef.current = setTimeout(() => runDemo(), 4000); }
          }, 450);
        }, 2400);
      }, 500);
    }, 22);
  }

  const rows = [
    { query: 'best AI visibility tool for e-commerce', claude: true, gpt: true, gemini: false, competitors: ['Semrush', 'Ahrefs'] },
    { query: 'how to check if ChatGPT mentions my brand', claude: true, gpt: false, gemini: true, competitors: ['BrightEdge', 'Semrush'] },
    { query: 'SEO audit tool for Shopify stores', claude: false, gpt: true, gemini: false, competitors: ['Ahrefs', 'Screaming Frog'] },
    { query: 'AI search visibility checker free', claude: false, gpt: false, gemini: false, competitors: ['Semrush', 'Moz'] },
    { query: 'GEO generative engine optimization tool', claude: true, gpt: false, gemini: true, competitors: ['BrightEdge', 'Conductor'] },
  ];

  const mentionColor = (v) => v ? '#2d7a3a' : '#c0392b';

  return (
    <div style={{ borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--off-white)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(45,122,58,0.10)' }}>
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>dablin.co · AI Visibility Check</span>
      </div>
      <div style={{ padding: '20px', background: 'white', minHeight: '300px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: 'var(--text)', fontFamily: 'monospace' }}>
            {urlVal}{phase === 'typing' ? <span style={{ borderRight: '2px solid var(--green)', animation: 'blink 0.8s infinite' }}>&nbsp;</span> : ''}
          </div>
          <button style={{ background: (phase === 'checking' || phase === 'results') ? 'var(--green)' : '#b0c9b4', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '11px', fontWeight: '700', cursor: 'default', whiteSpace: 'nowrap' }}>
            {phase === 'checking' ? `Checking${dots}` : 'Check Visibility'}
          </button>
        </div>
        {showResults && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
              {[{ label: 'Claude', count: '3/5', color: '#c67b2f' }, { label: 'GPT-4o', count: '2/5', color: '#10a37f' }, { label: 'Gemini', count: '2/5', color: '#4285f4' }].map(e => (
                <div key={e.label} style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: e.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{e.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#2d7a3a', fontFamily: "'Roboto Condensed', sans-serif" }}>{e.count}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)' }}>queries mentioned</div>
                </div>
              ))}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Query</th>
                  <th style={{ textAlign: 'center', padding: '6px 4px', color: '#c67b2f', fontWeight: '700' }}>Claude</th>
                  <th style={{ textAlign: 'center', padding: '6px 4px', color: '#10a37f', fontWeight: '700' }}>GPT</th>
                  <th style={{ textAlign: 'center', padding: '6px 4px', color: '#4285f4', fontWeight: '700' }}>Gemini</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, visibleRows).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eef5ef' }}>
                    <td style={{ padding: '7px 8px', color: 'var(--text)', lineHeight: '1.3' }}>
                      <div>{r.query}</div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                        {r.competitors.map(c => <span key={c} style={{ fontSize: '9px', background: '#f0faf1', border: '1px solid #c8e6cb', borderRadius: '100px', padding: '1px 6px', color: '#2d7a3a' }}>{c}</span>)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px', color: mentionColor(r.claude) }}>{ r.claude ? '✓' : '✗' }</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px', color: mentionColor(r.gpt) }}>{ r.gpt ? '✓' : '✗' }</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px', color: mentionColor(r.gemini) }}>{ r.gemini ? '✓' : '✗' }</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {!showResults && phase !== 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '10px' }}>
            {phase === 'checking'
              ? <><div style={{ fontSize: '20px', color: 'var(--green)', animation: 'spin 1.2s linear infinite' }}>◎</div><div style={{ fontSize: '12px', color: 'var(--muted)' }}>Querying Claude, GPT-4o & Gemini{dots}</div></>
              : <><div style={{ fontSize: '20px', color: 'var(--green-mid)' }}>◎</div><div style={{ fontSize: '12px', color: 'var(--muted)' }}>Enter your URL above</div></>
            }
          </div>
        )}
      </div>
    </div>
  );
}

const HERO_TABS = [
  { id: 'aicheck',  label: '◎ AI Visibility Check', component: AiCheckDemo },
  { id: 'ai',       label: '◎ AI Visibility Audit',  component: AiVisibilityDemo },
  { id: 'seo',      label: '⌕ SEO Audit',            component: SeoAuditDemo },
  { id: 'generate', label: '✦ Generate',              component: GeneratorDemo },
];

function HeroDemoTabs() {
  const [active, setActive] = useState('aicheck');
  const ActiveDemo = HERO_TABS.find(t => t.id === active).component;
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        {HERO_TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            padding: '8px 16px', borderRadius: '100px', border: active === t.id ? '2px solid var(--green)' : '2px solid var(--border)',
            background: active === t.id ? 'var(--green)' : 'white', color: active === t.id ? 'white' : 'var(--muted)',
            fontFamily: "'Roboto', sans-serif", fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>
      <ActiveDemo key={active} />
    </div>
  );
}

// ── TOOL TABS ───────────────────────────────────────────────────────────────

const TOOL_TABS = [
  {
    id: "generator",
    label: "✦ AI Description Generator",
    screenshot: "/Generator.png",
    bullets: [
      "Generates platform-ready title, meta description, and feature bullets",
      "Full HTML output — paste directly into Shopify, Amazon, or WooCommerce",
      "Built-in SEO score: title length, meta length, keyword presence",
      "10 product categories, 4 tones, supports any language",
    ],
  },
  {
    id: "audit",
    label: "⌕ SEO Audit",
    screenshot: "/SEO_Audit.png",
    bullets: [
      "13-point SEO check: meta tags, headings, word count, image alt text",
      "Technical SEO: canonical, robots, viewport, Open Graph tags",
      "Structured data: Product schema, BreadcrumbList, reviews",
      "AI-generated fix for every failed check — ready to copy and paste",
    ],
  },
  {
    screenshot: "/AI_Visibility_audit.png",
    bullets: [
      "12 checks for AI engine visibility: llms.txt, AI crawler access, HTTPS",
      "Brand identity: Organization schema, sameAs links, WebSite name",
      "AI-readable content: H1, meta description, canonical, Open Graph",
      "AI-generated fix for every failed check — ready to copy and paste",
    ],
  },
];

function ToolTabs() {
  const [active, setActive] = useState("generator");
  const tab = TOOL_TABS.find(t => t.id === active);
  return (
    <div style={{ background: 'var(--green-pale)', borderTop: '1px solid var(--green-mid)', borderBottom: '1px solid var(--green-mid)', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 4vw, 48px)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          {TOOL_TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              padding: '11px 24px', borderRadius: '100px',
              border: active === t.id ? '2px solid var(--green)' : '2px solid var(--green-mid)',
              background: active === t.id ? 'var(--green)' : 'white',
              color: active === t.id ? 'white' : 'var(--dark)',
              fontFamily: "'Roboto', sans-serif", fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--green-mid)', boxShadow: '0 8px 40px rgba(45,122,58,0.12)' }}>
            <img src={tab.screenshot} alt={tab.label} style={{ width: '100%', display: 'block' }} />
          </div>
          <div>
            <div style={{ display: 'inline-block', background: 'var(--green)', color: 'white', fontSize: '12px', fontWeight: '700', padding: '4px 14px', borderRadius: '100px', marginBottom: '20px', letterSpacing: '0.5px' }}>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tab.bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '15px', color: 'var(--text)', lineHeight: '1.55' }}>
                  <span style={{ color: 'var(--green)', fontWeight: '700', fontSize: '14px', marginTop: '2px', flexShrink: 0 }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN LANDING ─────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "AI Visibility",
    items: [
      { href: "/ai-visibility-audit",       label: "AI Visibility Audit",  desc: "12 checks for AI engine discoverability" },
      { href: "/ai-visibility-check",       label: "AI Visibility Check",  desc: "See if ChatGPT, Gemini & Claude mention you" },
      { href: "/ai-query-check",     label: "AI Query Check",       desc: "Run custom queries across AI engines" },
    ],
  },
  {
    label: "SEO Expert",
    items: [
      { href: "/seo-audit",                 label: "SEO Audit",              desc: "18-point SEO check with AI fixes" },
      { href: "/google-search-console",  label: "Google Search Console",  desc: "Index status, vitals and query data" },
      { href: "/seo-geo-dashboard",          label: "SEO/GEO Dashboard",      desc: "Your full visibility kanban board" },
    ],
  },
];

const RESOURCES = [
  { href: "https://blog.dablin.co",                    label: "Blog",              desc: "AI visibility, GEO and SEO guides",  external: true },
  { href: "https://www.linkedin.com/company/dablin",   label: "Dablin on LinkedIn", desc: "Follow us for SEO & AI insights",   external: true },
  { href: "https://medium.com/dablin",                 label: "Dablin on Medium",  desc: "In-depth articles and guides",       external: true },
  { href: "/whats-new",                                label: "What's New",        desc: "Weekly updates every Friday",        external: false },
];

function useDropdown() {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const enter = () => { clearTimeout(timer.current); setOpen(true); };
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 120); };
  return { open, enter, leave };
}

function DropdownMenu({ group }) {
  const { open, enter, leave } = useDropdown();
  return (
    <div style={{ position: "relative" }} onMouseEnter={enter} onMouseLeave={leave}>
      <button className="nav-dropdown-trigger">
        {group.label} <span style={{ fontSize: "10px", color: "#9ab09c" }}>▾</span>
      </button>
      {open && (
        <div className="nav-dropdown-menu" onMouseEnter={enter} onMouseLeave={leave}>
          {group.items.map(item => (
            <a key={item.href} href={item.href} className="nav-dropdown-item">
              <div>
                <div className="nav-dropdown-label">{item.label}</div>
                <div className="nav-dropdown-desc">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourcesDropdown() {
  const { open, enter, leave } = useDropdown();
  return (
    <div style={{ position: "relative" }} onMouseEnter={enter} onMouseLeave={leave}>
      <button className="nav-dropdown-trigger">
        Resources <span style={{ fontSize: "10px", color: "#9ab09c" }}>▾</span>
      </button>
      {open && (
        <div className="nav-dropdown-menu" onMouseEnter={enter} onMouseLeave={leave}>
          {RESOURCES.map(item => (
            <a key={item.href} href={item.href} className="nav-dropdown-item"
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}>
              <div>
                <div className="nav-dropdown-label">{item.label}</div>
                <div className="nav-dropdown-desc">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementBar({ onDismiss }) {
  return (
    <div style={{ background: "#1a7a3a", color: "white", textAlign: "center", padding: "10px 40px 10px 12px", fontSize: "13px", fontWeight: "500", position: "fixed", top: 0, left: 0, right: 0, lineHeight: "1.4", zIndex: 200, height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontWeight: "700", marginRight: "8px" }}>⚡ New</span>
      Now includes Google March 2026 signals — Information Gain &amp; AI Overview eligibility checks
      <a href="/seo-audit" style={{ marginLeft: "12px", color: "white", fontWeight: "700", textDecoration: "underline", textUnderlineOffset: "3px" }}>Try the SEO Audit →</a>
      <button onClick={onDismiss} style={{ position: "absolute", right: "16px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "18px", cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
    </div>
  );
}

function NavBar({ topOffset }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav className="landing-nav" style={{ top: topOffset + "px" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
          <div className="nav-left-logo">
            <a href="/" style={{ textDecoration: 'none' }}>
              <img src="/logo.svg" alt="Dablin" height="44" />
            </a>
          </div>
        </div>

        <div className="nav-center-logo">
          <a href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.svg" alt="Dablin" height="40" />
          </a>
        </div>

        {/* Desktop dropdown nav */}
        <div className="landing-nav-links">
          {NAV_GROUPS.map(group => (
            <DropdownMenu key={group.label} group={group} />
          ))}
          <a href="/pricing" className="nav-direct-link">Pricing</a>
          <ResourcesDropdown />
        </div>

        <div className="landing-nav-actions">
          <SignInButton mode="modal">
            <button className="btn-ghost">Sign in</button>
          </SignInButton>
          <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'nav' })}>
            <SignUpButton mode="modal">
              <button className="btn-primary">Sign up</button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <img src="/logo.svg" alt="Dablin" height="40" />
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>×</button>
        </div>
        <div className="mobile-menu-group-label">AI Visibility</div>
        {NAV_GROUPS[0].items.map(item => (
          <a key={item.href} href={item.href} className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
            <div><div className="mobile-menu-label">{item.label}</div><div className="mobile-menu-desc">{item.desc}</div></div>
          </a>
        ))}
        <div className="mobile-menu-group-label">SEO Expert</div>
        {NAV_GROUPS[1].items.map(item => (
          <a key={item.href} href={item.href} className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
            <div><div className="mobile-menu-label">{item.label}</div><div className="mobile-menu-desc">{item.desc}</div></div>
          </a>
        ))}
        <a href="/pricing" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
          <div><div className="mobile-menu-label">Pricing</div><div className="mobile-menu-desc">Simple monthly plans</div></div>
        </a>
        <div className="mobile-menu-group-label">Resources</div>
        {RESOURCES.map(item => (
          <a key={item.href} href={item.href} className="mobile-menu-item"
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            onClick={() => setMenuOpen(false)}>
            <div><div className="mobile-menu-label">{item.label}</div><div className="mobile-menu-desc">{item.desc}</div></div>
          </a>
        ))}
        <div className="mobile-menu-cta">
          <div onClick={() => { trackEvent('sign_up_modal_opened', { location: 'mobile_menu' }); setMenuOpen(false); }}>
            <SignUpButton mode="modal">
              <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '10px' }}>Sign up free</button>
            </SignUpButton>
          </div>
          <SignInButton mode="modal">
            <button className="btn-ghost" style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '10px' }} onClick={() => setMenuOpen(false)}>Sign in</button>
          </SignInButton>
        </div>
      </div>
    </>
  );
}

function GoogleUpdatePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("g2026popup")) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    sessionStorage.setItem("g2026popup", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div onClick={dismiss} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: "420px", width: "100%", borderRadius: "20px",
        overflow: "hidden", position: "relative",
        background: "linear-gradient(135deg, #0f2a1a 0%, #1a4a2a 50%, #2d6a3a 100%)",
      }}>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "relative", padding: "32px" }}>
          <button onClick={dismiss} style={{
            position: "absolute", top: "16px", right: "16px",
            background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
            width: "26px", height: "26px", color: "rgba(255,255,255,0.6)",
            cursor: "pointer", fontSize: "12px", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)",
            borderRadius: "20px", padding: "4px 12px", fontSize: "11px",
            fontWeight: "500", letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: "18px", border: "0.5px solid rgba(255,255,255,0.15)",
          }}>
            ⚡ Google March 2026
          </div>
          <h2 style={{
            fontSize: "26px", fontWeight: "700", color: "#ffffff",
            lineHeight: "1.15", margin: "0 0 10px", letterSpacing: "-0.5px",
          }}>
            Does your site pass<br />the new ranking signals?
          </h2>
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.6)",
            lineHeight: "1.6", margin: "0 0 24px", fontWeight: "300",
          }}>
            Dablin now checks <span style={{ color: "#fff", fontWeight: "500" }}>Information Gain</span> and <span style={{ color: "#fff", fontWeight: "500" }}>AI Overview eligibility</span> — the 2 signals from Google's fastest update ever.
          </p>
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard/seo-audit">
            <button onClick={() => sessionStorage.setItem("g2026popup", "1")} style={{
              width: "100%", background: "#ffffff", color: "#0f2a1a",
              border: "none", borderRadius: "12px", padding: "15px",
              fontSize: "15px", fontWeight: "700", cursor: "pointer",
              marginBottom: "10px", letterSpacing: "-0.2px",
            }}>
              Run free SEO Audit →
            </button>
          </SignInButton>
          <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroUrlForm() {
  const [url, setUrl] = useState('');

  function handleAnalyze() {
    if (!url.trim()) return;
    sessionStorage.setItem("postLoginRedirect", "/dashboard/seo-audit");
    sessionStorage.setItem("heroUrl", url.trim());
    window.location.href = "/dashboard/seo-audit";
  }

  return (
    <div className="hero-url-form">
      <input
        className="hero-url-input"
        type="url"
        placeholder="Enter your website URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleAnalyze()}
      />
      <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard/seo-audit">
        <button className="hero-url-btn" onClick={() => {
          sessionStorage.setItem("heroUrl", url.trim());
          trackEvent('hero_url_analyze_clicked', { url });
        }}>
          Analyze →
        </button>
      </SignUpButton>
    </div>
  );
}

export default function Landing() {
  const [barVisible, setBarVisible] = useState(true);
  const BAR_H = 40;
  const NAV_H = 72;
  const totalOffset = barVisible ? BAR_H + NAV_H : NAV_H;

  return (
    <>
    {barVisible && <AnnouncementBar onDismiss={() => setBarVisible(false)} />}
    <div className="landing" style={{ paddingTop: totalOffset + "px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');

        :root {
          --green: #1a7a3a; --green-light: #2d9a4e; --green-pale: #eef8f0;
          --green-mid: #d0e8d4; --dark: #0d1f0e; --dark-mid: #1a2e1c;
          --text: #2a3d2b; --muted: #4a6b4c; --border: #eef2ee;
          --white: #ffffff; --off-white: #f8faf8; --mint: #eef8f0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing { font-family: 'Roboto', sans-serif; color: var(--text); background: var(--white); min-height: 100vh; overflow-x: hidden; }

        /* NAV */
        .landing-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 72px; position: fixed; left: 0; right: 0; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); z-index: 100; }
        .nav-brand img { display: block; }
        .landing-nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-text-link { font-size: 15px; font-weight: 500; color: var(--text); text-decoration: none; transition: color 0.2s; }
        .nav-text-link:hover { color: var(--green); }
        .nav-direct-link { font-size: 15px; font-weight: 500; color: var(--text); text-decoration: none; transition: color 0.2s; white-space: nowrap; }
        .nav-direct-link:hover { color: var(--green); }
        .landing-nav-actions { display: flex; gap: 10px; align-items: center; }
        .btn-ghost { background: none; border: 1.5px solid var(--green-mid); color: var(--green); padding: 9px 20px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-ghost:hover { border-color: var(--green); background: var(--green-pale); }
        .btn-primary { background: var(--green); color: white; border: none; padding: 10px 22px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: var(--green-light); transform: translateY(-1px); }
        .btn-large { padding: 15px 36px; font-size: 16px; border-radius: 10px; font-weight: 600; }
        .btn-outline-green { background: none; border: 2px solid var(--green-mid); color: var(--green); padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-outline-green:hover { border-color: var(--green); background: var(--green-pale); }

        /* HAMBURGER */
        .nav-hamburger { display: none; background: none; border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; cursor: pointer; flex-direction: column; gap: 4px; }
        .nav-hamburger span { display: block; width: 18px; height: 2px; background: var(--text); border-radius: 2px; }
        .nav-center-logo { display: none; }
        .nav-left-logo { display: block; }
        .mobile-menu { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 500; padding: 24px; overflow-y: auto; }
        .mobile-menu.open { display: flex; flex-direction: column; }
        .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .mobile-menu-close { background: none; border: none; font-size: 28px; color: var(--text); cursor: pointer; line-height: 1; }
        .mobile-menu-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--border); text-decoration: none; }
        .mobile-menu-item:last-child { border-bottom: none; }
        .mobile-menu-icon { font-size: 20px; color: var(--green); flex-shrink: 0; margin-top: 2px; }
        .mobile-menu-label { font-size: 16px; font-weight: 600; color: var(--dark); margin-bottom: 3px; }
        .mobile-menu-desc { font-size: 13px; color: var(--muted); }
        .mobile-menu-cta { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }

        /* NAV DROPDOWN */
        .nav-dropdown-trigger { font-size: 15px; font-weight: 500; color: var(--text); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; padding: 4px 0; font-family: 'Roboto', sans-serif; transition: color 0.2s; white-space: nowrap; }
        .nav-dropdown-trigger:hover { color: var(--green); }
        .nav-dropdown-menu { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background: white; border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); padding: 8px; padding-top: 16px; min-width: 260px; z-index: 200; margin-top: 4px; }
        .nav-dropdown-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-radius: 9px; text-decoration: none; transition: background 0.15s; }
        .nav-dropdown-item:hover { background: var(--mint); }
        .nav-dropdown-label { font-size: 13px; font-weight: 600; color: var(--dark); margin-bottom: 2px; }
        .nav-dropdown-desc { font-size: 12px; color: var(--muted); line-height: 1.4; }
        .mobile-menu-group-label { font-size: 11px; font-weight: 700; color: #9ab09c; text-transform: uppercase; letter-spacing: 1px; padding: 14px 0 6px; }

        /* HERO */
        .hero { background: #eef8f0; background-image: linear-gradient(rgba(26,122,58,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(26,122,58,0.06) 1px, transparent 1px); background-size: 36px 36px; max-width: 100%; padding: clamp(40px,8vw,96px) clamp(20px,4vw,48px) clamp(48px,8vw,108px); text-align: center; position: relative; }
        .hero-title { font-family: 'Roboto Condensed', sans-serif; font-size: clamp(48px, 7vw, 84px); font-weight: 300; line-height: 1.0; letter-spacing: -3px; color: var(--dark); margin-bottom: 24px; }
        .hero-accent { color: var(--green); }
        .hero-sub { font-size: 19px; color: var(--muted); max-width: 540px; margin: 0 auto 12px; line-height: 1.65; font-weight: 300; }
        .hero-actions { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 48px; }
        .hero-note { font-size: 13px; color: var(--muted); }

        /* URL INPUT FIELD */
        .hero-url-form { display: flex; align-items: center; max-width: 580px; margin: 40px auto 12px; background: white; border-radius: 100px; padding: 6px 6px 6px 24px; border: 1.5px solid var(--green-mid); }
        .hero-url-input { flex: 1; border: none; outline: none; font-size: 15px; font-family: 'Roboto', sans-serif; color: var(--dark); background: transparent; caret-color: #1a7a3a; animation: caret-pulse 1.2s ease-in-out infinite; }
        @keyframes caret-pulse { 0%, 100% { caret-color: #1a7a3a; } 50% { caret-color: transparent; } }
        .hero-url-input::placeholder { color: #9ab09c; }
        .hero-url-btn { background: var(--green); color: white; border: none; border-radius: 100px; padding: 12px 28px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: 'Roboto', sans-serif; }
        .hero-url-btn:hover { background: var(--green-light); }

        /* SECTIONS */
        .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--green); margin-bottom: 14px; }
        .section-title { font-family: 'Roboto Condensed', sans-serif; font-size: clamp(28px, 4vw, 44px); font-weight: 800; color: var(--dark); margin-bottom: 16px; letter-spacing: -1px; }
        .section-sub { font-size: 16px; color: var(--muted); max-width: 560px; margin: 0 auto; line-height: 1.6; }
        .section-title-dark { font-family: 'Roboto Condensed', sans-serif; font-size: clamp(28px, 4vw, 44px); font-weight: 800; color: var(--dark); margin-bottom: 16px; letter-spacing: -1px; }
        .section-sub-dark { font-size: 16px; color: var(--muted); max-width: 520px; margin: 0 auto; line-height: 1.6; }
        .screenshot-section { background: var(--off-white); padding: 80px 48px; text-align: center; border-top: 1px solid var(--border); }
        .features-section { padding: 80px 48px; max-width: 1100px; margin: 0 auto; }
        .features-header { text-align: center; margin-bottom: 56px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card { background: var(--off-white); border: 1px solid var(--border); border-radius: 12px; padding: 28px; transition: all 0.2s; }
        .feature-card:hover { border-color: var(--green-mid); box-shadow: 0 4px 20px rgba(26,122,58,0.06); transform: translateY(-2px); }
        .feature-title { font-family: 'Roboto Condensed', sans-serif; font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
        .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.55; }

        /* PRICING */
        .pricing-section { padding: 80px 48px; max-width: 1100px; margin: 0 auto; }
        .pricing-header { text-align: center; margin-bottom: 48px; }
        .pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; align-items: start; }
        .pricing-card { border: 1px solid var(--border); border-radius: 14px; padding: 28px; background: white; position: relative; transition: all 0.2s; min-width: 0; }
        .pricing-card:hover { box-shadow: 0 8px 32px rgba(26,122,58,0.08); transform: translateY(-2px); }
        .pricing-card.highlight { border-color: var(--green); border-width: 2px; background: var(--green-pale); }
        .pricing-popular { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--green); color: white; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 14px; border-radius: 100px; white-space: nowrap; }
        .pricing-name { font-family: 'Roboto Condensed', sans-serif; font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
        .pricing-price { font-family: 'Roboto Condensed', sans-serif; font-size: 36px; font-weight: 800; color: var(--dark); margin-bottom: 2px; }
        .pricing-credits { font-size: 13px; color: var(--green); font-weight: 600; margin-bottom: 4px; }
        .pricing-desc { font-size: 12px; color: var(--muted); margin-bottom: 20px; }
        .pricing-features { list-style: none; margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
        .pricing-features li { font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 8px; }
        .pricing-features li::before { content: "✓"; color: var(--green); font-weight: 700; font-size: 12px; flex-shrink: 0; }
        .pricing-btn { width: 100%; padding: 11px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
        .pricing-btn.primary { background: var(--green); color: white; }
        .pricing-btn.primary:hover { background: var(--green-light); }
        .pricing-btn.secondary { background: var(--off-white); color: var(--text); border: 1px solid var(--border); }
        .pricing-btn.secondary:hover { border-color: var(--green); color: var(--green); }

        /* FAQ */
        .faq-section { padding: 80px 48px; background: var(--white); }
        .faq-inner { max-width: 780px; margin: 0 auto; }
        .faq-list { display: flex; flex-direction: column; gap: 0; }
        .faq-item { border-bottom: 1px solid var(--border); padding: 20px 0; cursor: pointer; }
        .faq-item:first-child { border-top: 1px solid var(--border); }
        .faq-question { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 16px; font-weight: 600; color: var(--dark); }
        .faq-icon { font-size: 22px; color: var(--green); flex-shrink: 0; font-weight: 300; }
        .faq-answer { font-size: 15px; color: var(--muted); line-height: 1.65; margin-top: 12px; padding-right: 32px; }

        /* CTA */
        .cta-section { background: var(--dark); padding: 96px 48px; text-align: center; }
        .cta-title { font-family: 'Roboto Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 800; color: white; margin-bottom: 16px; letter-spacing: -1.5px; }
        .cta-title span { color: #6fcf8a; }
        .cta-sub { font-size: 17px; color: rgba(255,255,255,0.5); margin-bottom: 36px; line-height: 1.6; }
        .cta-actions { display: flex; align-items: center; justify-content: center; gap: 16px; }

        /* FOOTER */
        .landing-footer { background: #0a1a0b; padding: 56px 48px 32px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .footer-brand-desc { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.65; max-width: 260px; margin: 0 0 24px; }
        .footer-socials { display: flex; gap: 10px; }
        .footer-social-btn { width: 34px; height: 34px; background: rgba(255,255,255,0.08); border-radius: 8px; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: background 0.2s; border: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .footer-social-btn:hover { background: rgba(255,255,255,0.15); }
        .footer-col-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 16px; }
        .footer-col-links { display: flex; flex-direction: column; gap: 10px; }
        .footer-col-links a { font-size: 13px; color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.15s; }
        .footer-col-links a:hover { color: white; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.07); padding-top: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.25); }
        .footer-tagline { font-size: 12px; color: rgba(255,255,255,0.25); }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr; }
          .landing-footer { padding: 40px 20px 24px; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }

        @media (max-width: 900px) {
          .landing-nav { padding: 0 20px; }
          .landing-nav-links { display: none; }
          .landing-nav-actions { display: none; }
          .nav-hamburger { display: flex; }
          .nav-left-logo { display: none; }
          .nav-center-logo { display: block; position: absolute; left: 50%; transform: translateX(-50%); }
          .hero { padding: 40px 20px 48px; }
          .hero-title { font-size: clamp(36px,8vw,56px) !important; letter-spacing: -2px !important; }
          .hero-sub { font-size: 16px; }
          .hero-url-form { margin: 32px 0 12px; flex-direction: column; border-radius: 14px; padding: 12px; gap: 8px; }
          .hero-url-input { font-size: 14px; }
          .hero-url-btn { width: 100%; border-radius: 8px; }
          .features-grid { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; gap: 16px; }
          .features-section, .pricing-section, .cta-section, .faq-section { padding: 48px 20px; }
          .screenshot-section { padding: 48px 20px; }
          .cta-actions { flex-direction: column; }
          .faq-answer { padding-right: 0; }
          /* Product sections — stack on mobile */
          .product-section-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .product-section-demo { display: none !important; }
          /* How it works — stack */
          .how-it-works-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .how-it-works-step { padding: 0 0 32px 0 !important; border-right: none !important; border-bottom: 1px solid var(--green-mid); margin-bottom: 32px; }
          /* Blog — single column */
          .blog-grid { grid-template-columns: 1fr !important; }
          /* Before/after — stack */
          .before-after-grid { grid-template-columns: 1fr !important; }
          /* Comparison table — smaller text */
          .compare-table { font-size: 12px !important; }
          /* Announcement bar */
          .announcement-bar-inner { font-size: 12px !important; padding: 8px 40px 8px 12px !important; }
          /* Section padding */
          .landing > div { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* NAV */}
      <NavBar topOffset={barVisible ? BAR_H : 0} />

      {/* HERO */}
      <div className="hero">
        <h1 className="hero-title">
          Be visible everywhere<br />
          <span className="hero-accent">search happens.</span>
        </h1>
        <p className="hero-sub">
          Capture visibility across Google and AI — all with one platform built for today's search.
        </p>
        <HeroUrlForm />
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '0' }}></p>
      </div>

      {/* PRODUCT SECTIONS */}

      {/* 1: AI Visibility Check — text left, demo right */}
      <div style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div className='product-section-grid' style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>◎ AI Visibility Check</div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '16px' }}>
              Does ChatGPT mention<br />your brand?
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '28px', fontWeight: '300' }}>
              Enter your URL and Dablin generates 7 real customer queries — the kind buyers type into ChatGPT before they find you. Then it sends them to Claude, GPT-4o, and Gemini simultaneously and shows you exactly who mentions your brand and which competitors they recommend instead.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {['7 auto-generated customer queries from your URL', 'Runs across Claude, GPT-4o and Gemini at once', 'Shows which competitors AI engines recommend instead', 'Track changes over time with saved queries'].map(b => (
                <div key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>{b}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'aicheck_section' })}>
                <SignUpButton mode="modal">
                  <button className="btn-primary">Check my AI visibility →</button>
                </SignUpButton>
              </div>
              
            </div>
          </div>
          <div><AiCheckDemo /></div>
        </div>
      </div>

      {/* 2: AI Visibility Audit — demo left, text right */}
      <div style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div className='product-section-grid' style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div><AiVisibilityDemo /></div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>◈ AI Visibility Audit</div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '16px' }}>
              Why can't AI engines<br />find your pages?
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '28px', fontWeight: '300' }}>
              12 technical checks that identify exactly what's stopping AI engines from understanding your brand. From llms.txt to Organization schema, sameAs links, and AI crawler access — every failed check comes with a ready-to-copy fix.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {['12 checks for AI engine visibility', 'Detects missing llms.txt, schema and crawler access', 'AI-generated fix for every failed check', 'No developer needed — copy and paste fixes'].map(b => (
                <div key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>{b}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'aiaudit_section' })}>
                <SignUpButton mode="modal">
                  <button className="btn-primary">Run AI Visibility Audit →</button>
                </SignUpButton>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* 3: SEO Audit — text left, demo right */}
      <div style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div className='product-section-grid' style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>⊕ SEO Audit</div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '16px' }}>
              18 checks. AI fixes.<br />Google March 2026 ready.
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '28px', fontWeight: '300' }}>
              Paste any product page URL and Dablin runs 18 SEO checks — including the two new signals from Google's March 2026 update: Information Gain and AI Overview eligibility. Every failed check includes an AI-generated fix ready to copy and paste.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {['18 checks across content, technical SEO and structured data', 'Information Gain score (Google March 2026)', 'AI Overview eligibility check (FAQPage / HowTo schema)', 'PageSpeed Insights score included'].map(b => (
                <div key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>{b}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'seoaudit_section' })}>
                <SignUpButton mode="modal">
                  <button className="btn-primary">Audit my page →</button>
                </SignUpButton>
              </div>
              
            </div>
          </div>
          <div><SeoAuditDemo /></div>
        </div>
      </div>

      {/* 4: AI Query Check — text right, mockup left */}
      <div style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div className='product-section-grid' style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', boxShadow: '0 4px 24px rgba(26,122,58,0.08)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>Describe your brand</div>
            <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '16px', fontStyle: 'italic' }}>"Dablin is an AI visibility and SEO toolkit for e-commerce brands and Shopify sellers."</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Generated queries</div>
            {[
              { type: 'problem',    label: 'Problem',    bg: '#fef2f2', color: '#c0392b', border: '#fca5a5', text: "My store isn't getting traffic from AI tools" },
              { type: 'category',   label: 'Category',   bg: '#fffbeb', color: '#b45309', border: '#fcd34d', text: "Best SEO audit tool for Shopify" },
              { type: 'comparison', label: 'Comparison', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', text: "Alternatives to Semrush for small stores" },
            ].map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', padding: '1px 6px', borderRadius: '20px', background: q.bg, color: q.color, border: `1px solid ${q.border}`, flexShrink: 0 }}>{q.label}</span>
                <span style={{ fontSize: '12px', color: 'var(--text)' }}>{q.text}</span>
              </div>
            ))}
            <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: '8px' }}>+ 4 more queries</div>
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>↗ AI Query Check</div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '16px' }}>
              Check your brand<br />without a URL.
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '28px', fontWeight: '300' }}>
              Describe your brand in plain language. Dablin generates 7 queries across 3 intent types — problem, category, and comparison — and checks your visibility across ChatGPT, Gemini, and Claude.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {['No URL required — works from a description', '3 problem queries, 2 category, 2 comparison', 'Edit any query before running', 'Full mention report with competitor brands'].map(b => (
                <div key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>{b}
                </div>
              ))}
            </div>
            <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'querycheck_section' })}>
              <SignUpButton mode="modal">
                <button className="btn-primary">Check my brand →</button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>

      {/* 5: Search Console — demo left, text right */}
      <div style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div className='product-section-grid' style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(26,122,58,0.08)' }}>
            <div style={{ background: 'var(--off-white)', padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840' }} />
              <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>Search Console · Striking Distance</span>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '14px' }}>
                {[['48.2K','Clicks'],['1.2M','Impressions'],['4.1%','CTR'],['12.4','Position']].map(([v,l]) => (
                  <div key={l} style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: '18px', fontWeight: '800', color: 'var(--green)' }}>{v}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
              {[['best bamboo cutting board','pos 8','Low CTR'],['organic bamboo kitchen set','pos 11','Good CTR'],['eco-friendly chopping board','pos 14','Low CTR']].map(([q,p,t]) => (
                <div key={q} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--off-white)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text)', fontWeight: '500' }}>{q}</span>
                  <span style={{ color: 'var(--muted)' }}>{p}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', background: t === 'Low CTR' ? '#fffbeb' : 'var(--green-pale)', color: t === 'Low CTR' ? '#b45309' : 'var(--green)', border: `1px solid ${t === 'Low CTR' ? '#fcd34d' : 'var(--green-mid)'}`, borderRadius: '20px', padding: '2px 8px' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>📊 Search Console</div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '16px' }}>
              Google Search Console<br />inside Dablin.
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '28px', fontWeight: '300' }}>
              Connect your GSC account and get striking distance keywords, unindexed pages, Core Web Vitals status, and query performance — all in one place alongside your SEO and AI visibility tools.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {['Striking distance keywords — small fixes, big gains', 'Pages Google discovered but didn\'t index', 'Core Web Vitals scores per page', 'Query performance, CTR and position data'].map(b => (
                <div key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>{b}
                </div>
              ))}
            </div>
            <a href="/google-search-console" style={{ display: 'inline-block', textDecoration: 'none' }}>
              <button className="btn-primary">Learn more →</button>
            </a>
          </div>
        </div>
      </div>

      {/* 6: Dashboard — text left, kanban right */}
      <div style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div className='product-section-grid' style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>⊞ SEO/GEO Dashboard</div>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '16px' }}>
              Every fix.<br />One Kanban board.
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '28px', fontWeight: '300' }}>
              Scan your URL and every SEO and AI visibility issue becomes a prioritised ticket. Drag from To Do to Done as you fix them. Critical issues first, good-to-have last.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {['Prioritised by severity — critical issues first', 'Drag-and-drop — positions saved between sessions', 'Click any ticket for fix instructions', 'Re-scan to auto-update resolved tickets'].map(b => (
                <div key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>{b}
                </div>
              ))}
            </div>
            <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'dashboard_section' })}>
              <SignUpButton mode="modal">
                <button className="btn-primary">Try the dashboard →</button>
              </SignUpButton>
            </div>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 24px rgba(26,122,58,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
              {[
                { col: 'To Do', color: '#ef4444', tickets: [{ text: 'No Organization schema', sev: 'Critical', bg: '#fef2f2', tc: '#c0392b', bc: '#fca5a5' }, { text: 'AI crawlers blocked', sev: 'Important', bg: '#fffbeb', tc: '#b45309', bc: '#fcd34d' }] },
                { col: 'In Progress', color: '#f59e0b', tickets: [{ text: 'Missing meta description', sev: 'Important', bg: '#fffbeb', tc: '#b45309', bc: '#fcd34d' }] },
                { col: 'Done', color: '#1a7a3a', tickets: [{ text: 'HTTPS enabled', sev: '✅ Done', bg: '#eef8f0', tc: '#1a7a3a', bc: '#d0e8d4' }, { text: 'GSC connected', sev: '✅ Done', bg: '#eef8f0', tc: '#1a7a3a', bc: '#d0e8d4' }] },
              ].map(col => (
                <div key={col.col}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--dark)', marginBottom: '8px', paddingBottom: '6px', borderBottom: `2px solid ${col.color}` }}>{col.col}</div>
                  {col.tickets.map((t, i) => (
                    <div key={i} style={{ background: 'white', border: `1px solid ${t.bc}`, borderLeft: `3px solid ${col.color}`, borderRadius: '8px', padding: '8px 10px', marginBottom: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: col.col === 'Done' ? 'var(--muted)' : 'var(--dark)', textDecoration: col.col === 'Done' ? 'line-through' : 'none', marginBottom: '4px', lineHeight: '1.3' }}>{t.text}</div>
                      <span style={{ fontSize: '9px', fontWeight: '700', background: t.bg, color: t.tc, border: `1px solid ${t.bc}`, borderRadius: '20px', padding: '1px 6px' }}>{t.sev}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: 'var(--mint)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--green)', marginBottom: '14px' }}>How it works</p>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', marginBottom: '56px' }}>From URL to actionable fixes in 30 seconds</h2>
          <div className='blog-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', position: 'relative' }}>
            {[
              { step: '1', title: 'Enter your URL', desc: 'Paste any product page or homepage URL. Dablin fetches and analyses your page automatically.' },
              { step: '2', title: 'Get your results', desc: 'See your AI visibility score, SEO health, and which AI engines mention your brand — all in under 30 seconds.' },
              { step: '3', title: 'Copy the fixes', desc: 'Every failed check comes with a ready-to-copy AI-generated fix. No developer, no guesswork.' },
            ].map((s, i) => (
              <div key={s.step} className='how-it-works-step' style={{ padding: '0 40px', borderRight: i < 2 ? '1px solid var(--green-mid)' : 'none', textAlign: 'left' }}>
                <div style={{ width: '44px', height: '44px', background: 'white', border: '1.5px solid var(--green-mid)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: 'var(--green)', marginBottom: '20px' }}>{s.step}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dark)', marginBottom: '12px', letterSpacing: '-0.3px' }}>{s.title}</h3>
                <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: '1.65', fontWeight: '300' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BEFORE / AFTER */}
      <div style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--green)', marginBottom: '14px' }}>The difference</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', marginBottom: '12px' }}>Invisible vs found</h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Most brands are invisible to AI engines and have no idea. Here's what changes when you fix it.</p>
          </div>
          <div className='before-after-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* BEFORE */}
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '16px', padding: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#c0392b', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '24px' }}>✗ Before Dablin</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  'ChatGPT recommends your competitors when buyers search your category',
                  'No llms.txt — AI engines can\'t identify your brand context',
                  'Missing Organization schema — brand identity unclear to AI',
                  'Product pages fail Information Gain — filtered by Google March 2026',
                  'No FAQPage schema — invisible in Google AI Overviews',
                  'You don\'t know any of this is happening',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '14px', color: '#7f1d1d', lineHeight: '1.5' }}>
                    <span style={{ color: '#c0392b', fontWeight: '700', flexShrink: 0, fontSize: '16px' }}>✗</span>{item}
                  </div>
                ))}
              </div>
            </div>
            {/* AFTER */}
            <div style={{ background: '#f0faf1', border: '1px solid #b7debb', borderRadius: '16px', padding: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e8f5ea', color: '#2d7a3a', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '24px' }}>✓ After Dablin</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  'You know exactly which AI engines mention you and which don\'t',
                  'llms.txt created and indexed — AI engines understand your brand',
                  'Organization schema in place — brand entity confirmed',
                  'Pages pass Information Gain — protected from Google March 2026',
                  'FAQPage schema live — appearing in Google AI Overviews',
                  'Track your AI visibility score over time as you improve',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '14px', color: '#1a3a1e', lineHeight: '1.5' }}>
                    <span style={{ color: '#2d7a3a', fontWeight: '700', flexShrink: 0, fontSize: '16px' }}>✓</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPETITOR COMPARISON */}
      <div style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--green)', marginBottom: '14px' }}>Why Dablin</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px', marginBottom: '12px' }}>Built for the new era of search</h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Traditional SEO tools were built for Google blue links. Dablin is built for AI search too.</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: 'var(--muted)', fontWeight: '600', fontSize: '13px' }}>Feature</th>
                  {[
                    { name: 'Dablin', highlight: true },
                    { name: 'Ahrefs', highlight: false },
                    { name: 'Semrush', highlight: false },
                    { name: 'Screaming Frog', highlight: false },
                  ].map(col => (
                    <th key={col.name} style={{ textAlign: 'center', padding: '14px 16px', color: col.highlight ? 'var(--green)' : 'var(--muted)', fontWeight: '700', fontSize: '14px', background: col.highlight ? 'var(--green-pale)' : 'transparent', borderRadius: col.highlight ? '8px 8px 0 0' : '0' }}>{col.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'AI brand mention check (ChatGPT/Gemini/Claude)', dablin: true, ahrefs: false, semrush: false, sf: false },
                  { feature: 'AI Visibility Audit (llms.txt, schema, crawlers)', dablin: true, ahrefs: false, semrush: false, sf: false },
                  { feature: 'Google March 2026 signals (Information Gain)', dablin: true, ahrefs: false, semrush: false, sf: false },
                  { feature: 'AI Overview eligibility check', dablin: true, ahrefs: false, semrush: false, sf: false },
                  { feature: 'SEO Audit with AI-generated fixes', dablin: true, ahrefs: true, semrush: true, sf: true },
                  { feature: 'Product description generator', dablin: true, ahrefs: false, semrush: false, sf: false },
                  { feature: 'Pay per use — no subscription', dablin: true, ahrefs: false, semrush: false, sf: false },
                  { feature: 'PageSpeed Insights integration', dablin: true, ahrefs: false, semrush: true, sf: true },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--off-white)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--text)', fontWeight: '500' }}>{row.feature}</td>
                    {[row.dablin, row.ahrefs, row.semrush, row.sf].map((v, j) => (
                      <td key={j} style={{ textAlign: 'center', padding: '14px 16px', background: j === 0 ? 'rgba(232,245,234,0.5)' : 'transparent', fontWeight: '700', fontSize: '16px', color: v ? '#2d7a3a' : '#d4e8d6' }}>{v ? '✓' : '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BLOG POSTS */}
      <div style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: 'clamp(48px,6vw,96px) clamp(20px,4vw,80px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--green)', marginBottom: '8px' }}>From the blog</p>
              <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: '800', color: 'var(--dark)', letterSpacing: '-1px' }}>Latest guides</h2>
            </div>
            <a href="https://blog.dablin.co" target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'var(--green)', fontWeight: '600', textDecoration: 'none' }}>View all posts →</a>
          </div>
          <div className='blog-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              {
                tag: 'SEO · Google',
                title: 'Google March 2026: What the Fastest Core Update in History Means for Your Site',
                desc: 'The March 2026 core update finished in under 20 hours. Here\'s what it targeted and what founders need to fix.',
                date: '26 Mar 2026',
                url: 'https://blog.dablin.co/google-march-2026-update',
                img: 'https://blog.dablin.co/images/google-march-2026-update.png',
              },
              {
                tag: 'SEO · Backlinks',
                title: 'Not All Backlinks Are Equal. Here\'s Why Most Link Building is a Waste of Time.',
                desc: 'A link from a low-reputation site does almost nothing. Here\'s what actually moves the needle.',
                date: '23 Mar 2026',
                url: 'https://blog.dablin.co/backlink-quality-vs-quantity',
                img: 'https://blog.dablin.co/images/backlink-quality-vs-quantity.png',
              },
              {
                tag: 'AI Visibility · GEO',
                title: 'What Is Dablin? The Problem It Solves and How to Use It',
                desc: 'Most brands are invisible to AI engines and have no idea. Dablin was built to close that gap.',
                date: '21 Mar 2026',
                url: 'https://blog.dablin.co/what-is-dablin',
                img: 'https://blog.dablin.co/images/what-is-dablin.png',
              },
            ].map((post, i) => (
              <a key={i} href={post.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <img src={post.img} alt={post.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{post.tag}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--dark)', lineHeight: '1.35', marginBottom: '10px', flex: 1 }}>{post.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.55', marginBottom: '14px' }}>{post.desc}</p>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>{post.date} · Dablin</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="faq-section">
        <div className="faq-inner">
          <div className="features-header">
            <p className="section-label" style={{color:'var(--green)'}}>FAQ</p>
            <h2 className="section-title-dark">Common questions</h2>
          </div>
          <div className="faq-list">
            {FAQ.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2 className="cta-title">Generate. Audit. <span>Get found.</span></h2>
        <p className="cta-sub">The only e-commerce tool that writes copy, fixes SEO, and optimises for AI engines — no subscription, no monthly fees.</p>
        <div className="cta-actions">
          <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'cta_bottom' })}>
            <SignUpButton mode="modal">
              <button className="btn-primary btn-large">Start free — no card needed</button>
            </SignUpButton>
          </div>
          <SignInButton mode="modal">
            <button className="btn-outline-green">Sign in</button>
          </SignInButton>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
              <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"10px" }}>
                <img src="/logo.svg" alt="Dablin" height="32" />
                <span style={{ color:"white", fontSize:"17px", fontWeight:"700", letterSpacing:"-0.3px" }}>dablin</span>
              </a>
            </div>
            <p className="footer-brand-desc">Be visible everywhere search happens. SEO and AI visibility for brands and e-commerce sellers.</p>
            <div className="footer-socials">
              <a href="https://www.linkedin.com/company/dablin" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 9h4v12H2z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4" cy="4" r="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8"/></svg>
              </a>
              <a href="https://medium.com/dablin" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Medium">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <div className="footer-col-label">Tools</div>
            <div className="footer-col-links">
              <a href="/ai-visibility-check">AI Visibility Check</a>
              <a href="/ai-visibility-audit">AI Visibility Audit</a>
              <a href="/seo-audit">SEO Audit</a>
              <a href="/ai-query-check">AI Query Check</a>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="footer-col-label">Product</div>
            <div className="footer-col-links">
              <a href="/seo-audit">Step by Step SEO</a>
              <a href="/seo-geo-dashboard">SEO/GEO Dashboard</a>
              <a href="/google-search-console">Google Search Console</a>
              <a href="/pricing">Pricing</a>
              <a href="https://blog.dablin.co" target="_blank" rel="noopener noreferrer">Blog</a>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="footer-col-label">Company</div>
            <div className="footer-col-links">
              <a href="/contact">Contact us</a>
              <a href="/legal.html">Privacy Policy</a>
              <a href="/legal.html">Terms of Service</a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Dablin. All rights reserved.</span>
          <span className="footer-tagline">Built for the AI search era.</span>
        </div>
      </footer>

      <GoogleUpdatePopup />
    </div>
    </>
  );
}
