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

const TYPE_STYLES = {
  problem:    { bg: '#fef2f2', color: '#c0392b', border: '#fca5a5' },
  category:   { bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
  comparison: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
};
const TYPE_LABELS = { problem: 'Problem', category: 'Category', comparison: 'Comparison' };

function TypePill({ type }) {
  const s = TYPE_STYLES[type];
  return (
    <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '1px 6px', borderRadius: '20px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: 'inline-block', flexShrink: 0 }}>
      {TYPE_LABELS[type]}
    </span>
  );
}

const MOCK_QUERIES = [
  { type: 'problem',    text: "My store isn't getting organic traffic from AI tools" },
  { type: 'problem',    text: "How do I get ChatGPT to recommend my brand?" },
  { type: 'problem',    text: "Why aren't AI search engines mentioning my product?" },
  { type: 'category',   text: "Best SEO audit tool for Shopify stores" },
  { type: 'category',   text: "Top AI visibility tools for e-commerce" },
  { type: 'comparison', text: "Alternatives to Semrush for small e-commerce" },
  { type: 'comparison', text: "Ahrefs vs Dablin for product page SEO" },
];

const MOCK_RESULTS = [
  { type: 'problem',    query: "My store isn't getting organic traffic",       claude: true,  gpt: false, gemini: true },
  { type: 'category',   query: "Best SEO audit tool for Shopify stores",       claude: false, gpt: false, gemini: true },
  { type: 'comparison', query: "Alternatives to Semrush for small stores",     claude: true,  gpt: true,  gemini: true },
];

function MockFlow() {
  return (
    <div style={{ borderRadius: '14px', border: '1px solid #d0e8d4', overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,122,58,0.10)', background: 'white' }}>
      {/* Browser bar */}
      <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid #d0e8d4' }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#4a6b4c' }}>dablin.co · AI Query Check</span>
      </div>

      {/* Step 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1a7a3a', color: 'white', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0d1f0e' }}>Describe your brand</div>
        <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '600', color: '#1a7a3a', background: '#eef8f0', border: '1px solid #d0e8d4', borderRadius: '20px', padding: '2px 8px' }}>Done ✓</span>
      </div>
      <div style={{ padding: '10px 16px', background: '#f8faf8', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ fontSize: '12px', color: '#0d1f0e', lineHeight: '1.5', fontStyle: 'italic' }}>"Dablin is an AI visibility and SEO toolkit for e-commerce brands and Shopify sellers."</div>
      </div>

      {/* Step 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1a7a3a', color: 'white', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0d1f0e' }}>Review generated queries</div>
        <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '600', color: '#1a7a3a', background: '#eef8f0', border: '1px solid #d0e8d4', borderRadius: '20px', padding: '2px 8px' }}>7 queries</span>
      </div>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #eef2ee' }}>
        {MOCK_QUERIES.map((q, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: i < MOCK_QUERIES.length - 1 ? '1px solid #f0f7f0' : 'none' }}>
            <TypePill type={q.type} />
            <span style={{ fontSize: '11px', color: '#0d1f0e' }}>{q.text}</span>
          </div>
        ))}
      </div>

      {/* Step 3 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1a7a3a', color: 'white', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0d1f0e' }}>Results across 3 AI engines</div>
      </div>
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 52px', background: '#f8faf8', padding: '6px 8px', borderRadius: '6px 6px 0 0', fontSize: '9px', fontWeight: '700', color: '#4a6b4c', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '10px' }}>
          <span>Query</span>
          {['Claude','GPT-4o','Gemini'].map(e => <span key={e} style={{ textAlign: 'center' }}>{e}</span>)}
        </div>
        {MOCK_RESULTS.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 52px', padding: '7px 8px', borderBottom: i < MOCK_RESULTS.length - 1 ? '1px solid #f0f7f0' : 'none', alignItems: 'center' }}>
            <div>
              <TypePill type={row.type} />
              <div style={{ fontSize: '10px', fontWeight: '500', color: '#0d1f0e', marginTop: '2px', lineHeight: '1.3' }}>{row.query}</div>
            </div>
            {[row.claude, row.gpt, row.gemini].map((v, j) => (
              <div key={j} style={{ textAlign: 'center', fontWeight: '700', fontSize: '12px', color: v ? '#1a7a3a' : '#c0392b' }}>{v ? '✓' : '✗'}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const FAQ = [
  { q: "What is the AI Query Check?", a: "The AI Query Check lets you describe your brand in plain language, then generates 7 targeted queries across 3 buyer intent types and checks your visibility across Claude, GPT-4o, and Gemini. Unlike the AI Visibility Check, it doesn't require a URL — you start from a description." },
  { q: "How is it different from the AI Visibility Check?", a: "Both tools run the same 7 queries × 3 AI engines check. The difference is the input: AI Visibility Check takes a URL and reads your page automatically. AI Query Check takes a plain-language description — useful when your site isn't public yet, when you want to test a specific brand angle, or when you want full control over how queries are framed." },
  { q: "Can I edit the queries before running?", a: "Yes. After Dablin generates the 7 queries from your description, you see them all before running the check. You can edit, rephrase, or replace any of them. This is useful if you want to test a specific competitor comparison query or a query framed around a particular use case." },
  { q: "Why 3 query types?", a: "Problem queries reach buyers before they know your category exists — highest value. Category queries are what people search once they know the category. Comparison queries have the highest buyer intent — someone asking 'alternatives to X' is ready to buy. Tracking all three gives you a complete picture of where you appear (and where you don't) across the buyer journey." },
  { q: "How much does it cost?", a: "The AI Query Check is available on the Agency plan. See the Pricing page for plan details." },
  { q: "How often should I run this?", a: "Monthly is a good cadence. AI model knowledge cutoffs and training updates mean results can change over time. Running it monthly lets you track whether your content improvements are having an effect on AI mentions." },
];

export default function PageQueryCheck() {
  return (
    <PageLayout activePath="/ai-query-check">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .qc-btn { background: #1a7a3a; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .qc-btn:hover { background: #2d9a4e; transform: translateY(-1px); }
        @media (max-width: 960px) {
          .qc-hero-grid { flex-direction: column !important; }
          .qc-hero-right { display: none !important; }
          .qc-steps { grid-template-columns: 1fr !important; }
          .qc-vs { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .qc-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="qc-section" style={{ background: '#eef8f0', backgroundImage: 'linear-gradient(rgba(26,122,58,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.06) 1px,transparent 1px)', backgroundSize: '36px 36px', padding: 'clamp(56px,7vw,96px) 56px', borderBottom: '1px solid #d0e8d4' }}>
        <div className="qc-hero-grid" style={{ display: 'flex', alignItems: 'flex-start', gap: '56px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ flex: '0 0 380px' }}>
            <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(40px,5vw,60px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-2.5px', color: '#0d1f0e', marginBottom: '20px' }}>
              AI Query<br /><span style={{ color: '#1a7a3a' }}>Check.</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#4a6b4c', fontWeight: '300', lineHeight: '1.65', marginBottom: '28px' }}>
              Describe your brand in plain language. Dablin generates 7 targeted queries across 3 intent types and checks your visibility across ChatGPT, Gemini, and Claude — no URL needed.
            </p>
            <div onClick={() => trackEvent('sign_up_click', { location: 'query_check_page_hero' })}>
              <SignUpButton mode="modal">
                <button className="qc-btn">Check my brand</button>
              </SignUpButton>
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#4a6b4c' }}>No URL required — works from a description</div>
          </div>
          <div className="qc-hero-right" style={{ flex: 1, minWidth: 0 }}>
            <MockFlow />
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="qc-section" style={{ background: 'white', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>How it works</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>3 steps. No URL needed.</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Works for any brand at any stage — even before your site goes live.</p>
          </div>
          <div className="qc-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0' }}>
            {[
              { n: '1', title: 'Describe your brand', desc: 'Write a sentence about what your brand does, who it\'s for, and what makes it different. No URL required.' },
              { n: '2', title: 'Review 7 typed queries', desc: 'Dablin generates 3 problem queries, 2 category queries, and 2 comparison queries. Edit any of them before running.' },
              { n: '3', title: 'See your mention report', desc: '21 data points across Claude, GPT-4o and Gemini. Read AI responses, spot competitors, track changes over time.' },
            ].map((s, i) => (
              <div key={s.n} style={{ padding: '0 40px', borderRight: i < 2 ? '1px solid #eef2ee' : 'none' }}>
                <div style={{ width: '44px', height: '44px', background: '#eef8f0', border: '1.5px solid #d0e8d4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#1a7a3a', marginBottom: '20px' }}>{s.n}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0d1f0e', marginBottom: '10px' }}>{s.title}</div>
                <p style={{ fontSize: '14px', color: '#4a6b4c', lineHeight: '1.65', fontWeight: '300' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VS AI VISIBILITY CHECK ── */}
      <div className="qc-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>AI Query Check vs AI Visibility Check</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>Same engine. Different input.</h2>
          </div>
          <div className="qc-vs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'white', border: '2px solid #1a7a3a', borderRadius: '14px', padding: '28px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a7a3a', marginBottom: '12px' }}>AI Query Check</div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#0d1f0e', marginBottom: '10px' }}>Start from a description</div>
              <p style={{ fontSize: '14px', color: '#4a6b4c', lineHeight: '1.65', marginBottom: '16px' }}>Best when your site isn't public yet, you want to test a specific brand angle, or you want full control over how queries are framed before running.</p>
              <div style={{ fontSize: '13px', color: '#1a7a3a', fontWeight: '600' }}>Write a description → review queries → run check</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '14px', padding: '28px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#4a6b4c', marginBottom: '12px' }}>AI Visibility Check</div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#0d1f0e', marginBottom: '10px' }}>Start from a URL</div>
              <p style={{ fontSize: '14px', color: '#4a6b4c', lineHeight: '1.65', marginBottom: '16px' }}>Best for live sites — Dablin reads your page, extracts your brand automatically, and generates queries from your real content.</p>
              <div style={{ fontSize: '13px', color: '#4a6b4c', fontWeight: '600' }}>Paste URL → queries auto-generated → run check</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="qc-section" style={{ background: 'white', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
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
      <div className="qc-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Check your AI visibility.<br /><span style={{ color: '#6fcf8a' }}>No URL needed.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>Describe your brand. Get results in 20 seconds.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'query_check_page_cta' })}>
            <SignUpButton mode="modal">
              <button className="qc-btn">Check my brand →</button>
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
