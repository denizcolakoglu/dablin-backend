import { Helmet } from 'react-helmet-async';
import { useState } from "react";
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

const MOCK_ROWS = [
  { type: 'problem',    query: "My store isn't getting organic traffic. What am I doing wrong?", claude: true,  gpt: false, gemini: true },
  { type: 'problem',    query: "How do I get my product page to rank on Google?",                  claude: true,  gpt: false, gemini: true },
  { type: 'problem',    query: "Why aren't AI tools recommending my brand?",                       claude: false, gpt: false, gemini: false },
  { type: 'category',   query: "Best SEO audit tool for e-commerce stores",                        claude: false, gpt: false, gemini: true },
  { type: 'category',   query: "Top AI visibility tools for Shopify",                              claude: true,  gpt: true,  gemini: true },
  { type: 'comparison', query: "Alternatives to Semrush for small stores",                         claude: true,  gpt: true,  gemini: true },
  { type: 'comparison', query: "Ahrefs vs Dablin for product page SEO",                            claude: true,  gpt: false, gemini: true },
];

const TYPE_STYLES = {
  problem:    { bg: '#fef2f2', color: '#c0392b', border: '#fca5a5' },
  category:   { bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
  comparison: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
};

const TYPE_LABELS = { problem: 'Problem', category: 'Category', comparison: 'Comparison' };

const QUERY_TYPES = [
  {
    type: 'problem',
    count: '3 queries',
    title: 'Before they know the category',
    desc: 'Natural pain-point questions a buyer asks before they know what product type they need. Highest value — if AI recommends you here, you reach buyers before any competitor.',
    examples: [
      '"My store isn\'t getting organic traffic. What am I doing wrong?"',
      '"How do I get ChatGPT to recommend my brand?"',
    ],
  },
  {
    type: 'category',
    count: '2 queries',
    title: 'Once they know what they need',
    desc: 'Generic category searches used once the buyer knows the type of tool or service they want. Competitive — everyone in your space optimises for these.',
    examples: [
      '"Best SEO audit tool for e-commerce stores"',
      '"Top AI visibility tools for Shopify"',
    ],
  },
  {
    type: 'comparison',
    count: '2 queries',
    title: 'Decision stage — high buyer intent',
    desc: 'Comparison and alternatives queries. Someone asking "alternatives to X" is ready to switch — and ready to buy. The most overlooked query type by brands.',
    examples: [
      '"Alternatives to Semrush for small teams"',
      '"Best Ahrefs alternative for product pages"',
    ],
  },
];

const FEATURES = [
  { title: 'Mention table',           desc: 'Query × AI engine grid — 21 data points per check. Expand any row to read the actual AI response.' },
  { title: 'Query type breakdown',    desc: 'See where you\'re mentioned by intent stage — problem, category, comparison. Know which buyer stage you\'re winning or losing.' },
  { title: 'Competitor brands',       desc: 'Which competitors appeared in AI responses and how often. Know exactly who you\'re up against per AI engine.' },
  { title: 'Per-engine scores',       desc: 'X/7 mentions per AI engine at a glance. See if Claude knows you but GPT-4o doesn\'t — and focus there.' },
  { title: 'AI-generated queries',    desc: 'Dablin reads your page and auto-generates all 7 queries across all 3 intent types. Edit any before running.' },
  { title: 'Full response snippets',  desc: 'Read the actual text each AI returned — see the context of your mention or understand why you were skipped.' },
];

const FAQ = [
  { q: "What is the AI Visibility Check?", a: "The AI Visibility Check queries Claude, GPT-4o, and Gemini with 7 brand-specific queries generated from your URL. It tells you which AI engines mention your brand per query, which competitors they recommend instead, and where you have gaps across the three buyer intent stages." },
  { q: "How are the queries generated?", a: "Dablin scrapes your URL, reads your brand name, product category, and content, then generates 7 queries across 3 intent types: 3 problem queries (pain points before they know the category), 2 category queries (once they know what they need), and 2 comparison queries (decision stage, high buyer intent). You can edit any of them before running." },
  { q: "Why 3 query types?", a: "Different query types represent different stages of the buyer journey — and AI engines behave differently for each. Problem queries are the highest value: if you appear here, you reach buyers before they even know your category exists. Category queries are competitive but important. Comparison queries have the highest buyer intent. Tracking all three gives you a complete picture of your AI visibility." },
  { q: "What if my brand isn't mentioned?", a: "That's exactly what this tool helps you understand. If you're not mentioned on problem queries, your brand isn't being surfaced at the awareness stage. If you're missing from comparison queries, you're losing buyers who are ready to switch. The AI Visibility Audit can then help you fix the technical reasons why AI engines aren't picking up your brand." },
  { q: "How accurate is competitor detection?", a: "The tool extracts brand names directly from AI responses. It gives a reliable signal of which brands AI engines associate with your category and buyer queries — though results can vary between runs as AI models are non-deterministic." },
  { q: "How often should I run this?", a: "Monthly is a good cadence. AI model training and knowledge cutoffs mean results change over time. Tracking your mentions over time shows whether your content and technical improvements are working." },
  { q: "How much does it cost?", a: "The AI Visibility Check is included in Pro and Agency plans. See the Pricing page for plan details." },
];

function TypePill({ type }) {
  const s = TYPE_STYLES[type];
  return (
    <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '1px 6px', borderRadius: '20px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: 'inline-block', marginBottom: '3px' }}>
      {TYPE_LABELS[type]}
    </span>
  );
}

function MockTable() {
  const claudeCount = MOCK_ROWS.filter(r => r.claude).length;
  const gptCount    = MOCK_ROWS.filter(r => r.gpt).length;
  const geminiCount = MOCK_ROWS.filter(r => r.gemini).length;

  return (
    <div style={{ borderRadius: '14px', border: '1px solid #d0e8d4', overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,122,58,0.10)', background: 'white' }}>
      {/* Browser bar */}
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid #d0e8d4' }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#4a6b4c' }}>dablin.co · AI Visibility Check</span>
      </div>

      {/* Score strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', padding: '14px', borderBottom: '1px solid #eef2ee' }}>
        {[{ label:'Claude', val: claudeCount, color:'#c67b2f' }, { label:'GPT-4o', val: gptCount, color:'#10a37f' }, { label:'Gemini', val: geminiCount, color:'#4285f4' }].map(e => (
          <div key={e.label} style={{ background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: e.color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{e.label}</div>
            <div style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: '20px', fontWeight: '800', color: e.val >= 4 ? '#1a7a3a' : '#c0392b' }}>{e.val}/7</div>
            <div style={{ fontSize: '10px', color: '#4a6b4c' }}>mentioned</div>
          </div>
        ))}
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 52px 24px', background: '#f8faf8', borderBottom: '1px solid #eef2ee', padding: '8px 12px', fontSize: '10px', fontWeight: '700', color: '#4a6b4c', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        <span>Query</span>
        {['Claude','GPT-4o','Gemini'].map(e => <span key={e} style={{ textAlign: 'center' }}>{e}</span>)}
        <span />
      </div>

      {/* Rows */}
      {MOCK_ROWS.map((row, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 52px 24px', padding: '8px 12px', borderBottom: i < MOCK_ROWS.length - 1 ? '1px solid #f0f7f0' : 'none', alignItems: 'center' }}>
          <div>
            <TypePill type={row.type} />
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#0d1f0e', lineHeight: '1.3' }}>{row.query}</div>
          </div>
          {[row.claude, row.gpt, row.gemini].map((v, j) => (
            <div key={j} style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px', color: v ? '#1a7a3a' : '#c0392b' }}>{v ? '✓' : '✗'}</div>
          ))}
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ab09c' }}>▾</div>
        </div>
      ))}
    </div>
  );
}

export default function PageAiCheck() {
  return (
    <PageLayout activePath="/ai-visibility-check">
      <Helmet>
        <title>AI Visibility Check — ChatGPT, Gemini &amp; Claude brand monitoring | Dablin</title>
        <meta name="description" content="Check if ChatGPT, Gemini and Claude mention your brand across 7 targeted queries. See which competitors appear instead, which sources they cite, and get fixes to improve your AI visibility." />
        <meta property="og:title" content="AI Visibility Check — ChatGPT, Gemini &amp; Claude brand monitoring | Dablin" />
        <meta property="og:description" content="Check if ChatGPT, Gemini and Claude mention your brand across 7 targeted queries. See which competitors appear instead and get fixes to improve your AI visibility." />
        <meta property="og:url" content="https://dablin.co/ai-visibility-check" />
        <meta name="twitter:title" content="AI Visibility Check — ChatGPT, Gemini &amp; Claude brand monitoring | Dablin" />
        <meta name="twitter:description" content="Check if ChatGPT, Gemini and Claude mention your brand across 7 targeted queries. See competitors, sources and fixes." />
        <link rel="canonical" href="https://dablin.co/ai-visibility-check" />
      </Helmet>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ac-btn { background: #1a7a3a; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .ac-btn:hover { background: #2d9a4e; transform: translateY(-1px); }
        @media (max-width: 960px) {
          .ac-hero-grid { flex-direction: column !important; }
          .ac-hero-right { display: none !important; }
          .ac-qt-grid { grid-template-columns: 1fr !important; }
          .ac-feat-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .ac-section { padding-left: 20px !important; padding-right: 20px !important; }
          .ac-feat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="ac-section" style={{ background: '#eef8f0', backgroundImage: 'linear-gradient(rgba(26,122,58,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.06) 1px,transparent 1px)', backgroundSize: '36px 36px', padding: 'clamp(56px,7vw,96px) 56px', borderBottom: '1px solid #d0e8d4' }}>
        <div className="ac-hero-grid" style={{ display: 'flex', alignItems: 'flex-start', gap: '56px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ flex: '0 0 380px' }}>
            <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(40px,5vw,60px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-2.5px', color: '#0d1f0e', marginBottom: '20px' }}>
              AI Visibility<br /><span style={{ color: '#1a7a3a' }}>Check.</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#4a6b4c', fontWeight: '300', lineHeight: '1.65', marginBottom: '28px' }}>
              Enter your URL. Dablin reads your brand, generates 7 targeted queries across 3 intent types, then checks if ChatGPT, Gemini, and Claude mention you in each one.
            </p>
            <div onClick={() => trackEvent('sign_up_click', { location: 'ai_check_page_hero' })}>
              <SignUpButton mode="modal">
                <button className="ac-btn">Check my brand</button>
              </SignUpButton>
            </div>
            <a href="/ai-visibility-check-sample-report" style={{ display: 'inline-block', marginTop: '14px', fontSize: '14px', color: '#1a7a3a', fontWeight: '600', textDecoration: 'none', borderBottom: '1.5px solid #d0e8d4', paddingBottom: '1px' }}>
              See a real report →
            </a>
          </div>
          <div className="ac-hero-right" style={{ flex: 1, minWidth: 0 }}>
            <MockTable />
          </div>
        </div>
      </div>

      {/* ── 3 QUERY TYPES ── */}
      <div className="ac-section" style={{ background: 'white', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>How queries are generated</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>3 query types. 7 targeted checks.</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>Dablin reads your page and generates queries across 3 buyer intent stages — the same way real customers search.</p>
          </div>
          <div className="ac-qt-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {QUERY_TYPES.map(qt => {
              const s = TYPE_STYLES[qt.type];
              return (
                <div key={qt.type} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '14px', padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{TYPE_LABELS[qt.type]}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: s.color }}>{qt.count}</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#0d1f0e', marginBottom: '10px' }}>{qt.title}</div>
                  <p style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.65', marginBottom: '16px' }}>{qt.desc}</p>
                  {qt.examples.map((ex, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', fontStyle: 'italic', color: '#0d1f0e', marginBottom: i < qt.examples.length - 1 ? '6px' : 0 }}>{ex}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── WHAT YOU GET ── */}
      <div className="ac-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>What you get</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>A complete AI mention report</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Not just a yes/no — a full breakdown per query type, per AI engine.</p>
          </div>
          <div className="ac-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '14px', padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="ac-section" style={{ background: 'white', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
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
      <div className="ac-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Find out if AI engines<br /><span style={{ color: '#6fcf8a' }}>know you exist.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>Results in 20 seconds. 7 queries. 3 AI engines.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'ai_check_page_cta' })}>
            <SignUpButton mode="modal">
              <button className="ac-btn">Check my brand →</button>
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
