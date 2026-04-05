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

const TYPE_STYLES = {
  problem:    { bg: '#fef2f2', color: '#c0392b', border: '#fca5a5' },
  category:   { bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
  comparison: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
};
const TYPE_LABELS = { problem: 'Problem', category: 'Category', comparison: 'Comparison' };

function TypePill({ type }) {
  const s = TYPE_STYLES[type];
  return (
    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 8px', borderRadius: '20px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: 'inline-block', flexShrink: 0 }}>
      {TYPE_LABELS[type]}
    </span>
  );
}

const RESULTS = [
  {
    type: 'problem',
    query: "My Shopify store isn't getting discovered by AI tools",
    claude: false, gpt: false, gemini: false,
    insight: "None of the 3 AI engines mentioned EcoBamboo for this query. This is the highest-value query type — buyers at this stage haven't decided on a category yet. Appearing here means reaching customers before your competitors do.",
    competitors: ['GreenLife', 'EcoRoots', 'Bambu Lab'],
    claudeResponse: "For improving AI discoverability of your Shopify store, you should focus on building brand mentions across the web, creating an llms.txt file, and ensuring your Organization schema is correctly implemented...",
  },
  {
    type: 'problem',
    query: "Why isn't my sustainable brand visible to AI assistants?",
    claude: true, gpt: false, gemini: true,
    insight: "Claude and Gemini both mention EcoBamboo in this context, but GPT-4o does not. GPT-4o tends to favour brands with stronger Wikipedia or news coverage. Building more third-party mentions and press coverage will help.",
    competitors: ['Full Circle', 'GreenLife'],
    claudeResponse: "EcoBamboo is a good example of a sustainable kitchen brand that has taken steps toward AI visibility — they have an llms.txt file and Organization schema. To improve further, focus on building brand mentions across review sites and press coverage...",
  },
  {
    type: 'problem',
    query: "How do I get ChatGPT to recommend my eco-friendly products?",
    claude: false, gpt: false, gemini: false,
    insight: "No AI engine mentioned EcoBamboo for this query. This is a directly relevant question from your target customer. The fix is primarily off-page: getting mentioned on sustainable living blogs, Reddit threads, and product review sites.",
    competitors: ['EcoRoots', 'Package Free Shop', 'Etsy'],
    claudeResponse: "To improve your chances of being recommended by AI assistants, focus on building brand authority through third-party mentions, reviews on platforms like G2 and Trustpilot, and creating content that answers common questions in your niche...",
  },
  {
    type: 'category',
    query: "Best bamboo kitchen products for eco-friendly cooking",
    claude: false, gpt: false, gemini: true,
    insight: "Only Gemini mentions EcoBamboo for category queries. Claude and GPT-4o don't have enough brand signal to associate EcoBamboo with this category. Adding more structured content about bamboo kitchen products to your site will help.",
    competitors: ['Bambu Lab', 'GreenLife', 'Full Circle', 'OXO'],
    claudeResponse: "For eco-friendly bamboo kitchen products, some top options include Bambu Lab, GreenLife, and OXO's bamboo range. These brands have strong environmental certifications and wide distribution...",
  },
  {
    type: 'category',
    query: "Top sustainable Shopify stores for kitchen and cooking",
    claude: true, gpt: true, gemini: true,
    insight: "All 3 AI engines mention EcoBamboo for this query — your strongest result. Being listed as a 'top sustainable Shopify store' is the category frame where you have the most visibility. Double down on this positioning.",
    competitors: ['Package Free Shop', 'EcoRoots'],
    claudeResponse: "EcoBamboo is one of the standout sustainable kitchen stores on Shopify. They focus on bamboo and natural material products, have good sustainability certifications, and ship plastic-free packaging...",
  },
  {
    type: 'comparison',
    query: "Alternatives to plastic kitchen tools for eco-conscious buyers",
    claude: false, gpt: false, gemini: true,
    insight: "Only Gemini mentions EcoBamboo as a plastic alternative. This query type has the highest buyer intent — someone asking for alternatives is ready to switch. Getting mentioned here by Claude and GPT-4o should be a priority.",
    competitors: ['GreenLife', 'Bambu Lab', 'Full Circle', 'Silipint'],
    claudeResponse: "Great alternatives to plastic kitchen tools include GreenLife (ceramic coating), Bambu Lab (bamboo), and Full Circle (plant-based materials). These brands offer durable, non-toxic alternatives to conventional plastic tools...",
  },
  {
    type: 'comparison',
    query: "EcoBamboo vs GreenLife — which is better for sustainable kitchens?",
    claude: true, gpt: false, gemini: true,
    insight: "Claude and Gemini both engage with this direct comparison and discuss EcoBamboo fairly. GPT-4o doesn't mention EcoBamboo at all in the comparison, which suggests limited training data exposure for this brand pairing.",
    competitors: ['GreenLife'],
    claudeResponse: "EcoBamboo and GreenLife both make strong cases for sustainable kitchen tools. EcoBamboo focuses exclusively on bamboo materials with compostable packaging, while GreenLife uses ceramic-coated pans. For purely bamboo products, EcoBamboo has the more focused range...",
  },
];

const COMPETITORS = [
  { name: 'GreenLife',        count: 5 },
  { name: 'Bambu Lab',        count: 4 },
  { name: 'EcoRoots',         count: 3 },
  { name: 'Full Circle',      count: 3 },
  { name: 'Package Free Shop',count: 2 },
  { name: 'Silipint',         count: 1 },
];

const FAQ = [
  { q: "What do the three query types mean?", a: "Problem queries reach buyers before they know what product category they need — the highest-value stage. Category queries are what people search once they know what they want. Comparison queries are decision-stage searches where the buyer is ready to switch. Appearing across all three stages gives you full-funnel AI visibility." },
  { q: "Why does each AI engine give different results?", a: "Claude, GPT-4o, and Gemini were trained on different datasets, have different knowledge cutoffs, and use different retrieval methods. A brand might appear in Gemini's training data but not GPT-4o's. The gap usually reflects differences in how much your brand was mentioned on the web at the time each model was trained." },
  { q: "How do I get mentioned more by AI engines?", a: "Technical fixes (llms.txt, Organization schema, AI crawler access) help AI engines understand your brand. But the bigger lever is off-page: getting mentioned on third-party sites like review platforms, sustainable living blogs, Reddit threads, and press coverage. AI engines recommend brands they've seen mentioned in many contexts across the web." },
  { q: "Why am I missing from problem queries?", a: "Problem queries are the hardest to appear in because they're pre-category — the buyer hasn't decided what kind of product they need yet. AI engines answer these with general advice and tend to mention brands with the broadest web presence. Building content that directly answers these pain-point questions (blog posts, guides, FAQs) is the most reliable way to improve." },
  { q: "How often do AI engine results change?", a: "AI model knowledge is updated when models are retrained, which happens every few months to a year depending on the provider. Results can also change when models are fine-tuned or when retrieval systems are updated. Running the AI Visibility Check monthly gives you a reliable signal of whether your improvements are working." },
  { q: "What is the competitor section showing?", a: "The competitor section shows which brands AI engines mentioned instead of yours when you weren't mentioned. This tells you who owns the AI visibility in your category and which brands you're competing with for AI recommendations — which may be different from your Google SEO competitors." },
];

export default function PageAiCheckReport() {
  const [expandedRow, setExpandedRow] = useState(null);

  const claudeCount  = RESULTS.filter(r => r.claude).length;
  const gptCount     = RESULTS.filter(r => r.gpt).length;
  const geminiCount  = RESULTS.filter(r => r.gemini).length;

  return (
    <PageLayout activePath="/ai-visibility-check">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&family=Roboto+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ar-btn { background: #1a7a3a; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .ar-btn:hover { background: #2d9a4e; transform: translateY(-1px); }
        .ar-row { cursor: pointer; }
        .ar-row:hover { background: #f8faf8; }
        @media (max-width: 900px) {
          .ar-score-grid { grid-template-columns: repeat(2,1fr) !important; }
          .ar-section { padding-left: 20px !important; padding-right: 20px !important; }
          .ar-comp-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="ar-section" style={{ background: '#0d1f0e', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #1a3a1e' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', color: '#6fcf8a', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>◎ Sample AI Visibility Check Report</div>
          <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', lineHeight: '1.05', letterSpacing: '-2px', color: 'white', marginBottom: '16px' }}>
            This is what you see<br /><span style={{ color: '#6fcf8a' }}>after running a check.</span>
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', fontWeight: '300', lineHeight: '1.65', maxWidth: '580px' }}>
            A real report for a fictional Shopify brand — EcoBamboo. 7 queries across 3 intent types, checked against ChatGPT, Gemini, and Claude. Click any row to read the actual AI response and insight.
          </p>
        </div>
      </div>

      {/* ── SCORE SUMMARY ── */}
      <div className="ar-section" style={{ background: '#f8faf8', padding: 'clamp(40px,5vw,72px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: '13px', color: '#4a6b4c', background: '#eef8f0', border: '1px solid #d0e8d4', borderRadius: '8px', padding: '6px 14px' }}>mystore.com · EcoBamboo</div>
            <div style={{ fontSize: '12px', color: '#9ab09c' }}>Checked April 3, 2026 · 7 queries · 3 AI engines</div>
          </div>
          <div className="ar-score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '16px' }}>
            {[
              { label: 'Claude', val: claudeCount, color: '#c67b2f', bg: '#fffbeb', border: '#fcd34d' },
              { label: 'GPT-4o', val: gptCount,    color: '#10a37f', bg: gptCount <= 2 ? '#fef2f2' : '#eef8f0', border: gptCount <= 2 ? '#fca5a5' : '#d0e8d4' },
              { label: 'Gemini', val: geminiCount, color: '#4285f4', bg: '#eff6ff', border: '#bfdbfe' },
            ].map(e => (
              <div key={e.label} style={{ background: e.bg, border: `1px solid ${e.border}`, borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: e.color, marginBottom: '8px' }}>{e.label}</div>
                <div style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: '44px', fontWeight: '800', color: e.color, lineHeight: 1 }}>{e.val}/7</div>
                <div style={{ fontSize: '12px', color: e.color, marginTop: '6px', fontWeight: '500' }}>queries mentioned</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '14px 18px', fontSize: '14px', color: '#c0392b', fontWeight: '500' }}>
            EcoBamboo is missing from all 3 problem queries — the highest-value stage of the buyer journey. Fix llms.txt, Organization schema, and AI crawler access first.
          </div>
        </div>
      </div>

      {/* ── RESULTS TABLE ── */}
      <div className="ar-section" style={{ background: 'white', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '10px' }}>Results per query</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '8px' }}>7 queries. 21 data points.</h2>
            <p style={{ fontSize: '15px', color: '#4a6b4c' }}>Click any row to read the actual AI response and our insight.</p>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px 24px', background: '#f8faf8', padding: '10px 16px', borderRadius: '10px 10px 0 0', border: '1px solid #eef2ee', borderBottom: 'none', fontSize: '11px', fontWeight: '700', color: '#4a6b4c', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            <span>Query</span>
            {['Claude','GPT-4o','Gemini'].map(e => <span key={e} style={{ textAlign: 'center' }}>{e}</span>)}
            <span />
          </div>

          <div style={{ border: '1px solid #eef2ee', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
            {RESULTS.map((row, i) => (
              <div key={i}>
                <div className="ar-row" onClick={() => setExpandedRow(expandedRow === i ? null : i)} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px 24px', padding: '14px 16px', borderBottom: i < RESULTS.length - 1 || expandedRow === i ? '1px solid #f0f7f0' : 'none', alignItems: 'center', background: expandedRow === i ? '#f8faf8' : 'white' }}>
                  <div>
                    <TypePill type={row.type} />
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f0e', marginTop: '4px', lineHeight: '1.3' }}>{row.query}</div>
                  </div>
                  {[row.claude, row.gpt, row.gemini].map((v, j) => (
                    <div key={j} style={{ textAlign: 'center', fontWeight: '800', fontSize: '15px', color: v ? '#1a7a3a' : '#c0392b' }}>{v ? '✓' : '✗'}</div>
                  ))}
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#9ab09c', transform: expandedRow === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</div>
                </div>
                {expandedRow === i && (
                  <div style={{ padding: '20px 16px', background: '#f8faf8', borderBottom: i < RESULTS.length - 1 ? '1px solid #eef2ee' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a7a3a', marginBottom: '8px' }}>Dablin insight</div>
                        <p style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.65' }}>{row.insight}</p>
                      </div>
                      <div style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#c67b2f', marginBottom: '8px' }}>Claude response (excerpt)</div>
                        <p style={{ fontSize: '12px', color: '#0d1f0e', lineHeight: '1.65', fontStyle: 'italic' }}>"{row.claudeResponse}"</p>
                      </div>
                    </div>
                    {row.competitors.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#4a6b4c', marginBottom: '8px' }}>Competitors mentioned instead</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {row.competitors.map(c => (
                            <span key={c} style={{ fontSize: '12px', fontWeight: '600', padding: '3px 12px', borderRadius: '20px', background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}>{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMPETITOR SECTION ── */}
      <div className="ar-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '10px' }}>Competitor brands</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '8px' }}>Who AI engines recommend instead</h2>
            <p style={{ fontSize: '15px', color: '#4a6b4c' }}>Brands that appeared in AI responses when EcoBamboo wasn't mentioned. These are your AI visibility competitors.</p>
          </div>
          <div className="ar-comp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {COMPETITORS.map(c => (
              <div key={c.name} style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0d1f0e' }}>{c.name}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px', background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}>{c.count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXPLANATION ── */}
      <div className="ar-section" style={{ background: 'white', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '10px' }}>How to read this report</p>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '32px' }}>What each section means</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { title: 'Problem queries', desc: 'The buyer doesn\'t know your category yet. They\'re describing a pain point. Appearing here means reaching buyers before your competitors do — the highest-value stage.' },
              { title: 'Category queries', desc: 'The buyer knows what type of product they need and is looking for the best option. Being mentioned here means you\'re seen as a category leader by AI engines.' },
              { title: 'Comparison queries', desc: 'Decision stage — the buyer is ready to switch or buy and is comparing options. The highest buyer intent of the three types. Missing from these means losing ready-to-buy customers.' },
              { title: 'Competitor brands', desc: 'Every brand that appeared in an AI response when you weren\'t mentioned. These are your real AI visibility competitors — they may be different from your Google SEO competitors.' },
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
      <div className="ar-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,80px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '10px' }}>FAQ</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px' }}>Common questions about AI visibility</h2>
          </div>
          <div style={{ borderTop: '1px solid #eef2ee' }}>
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="ar-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Check your own brand<br /><span style={{ color: '#6fcf8a' }}>across all 3 AI engines.</span>
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>7 queries. 21 data points. Results in 20 seconds.</p>
        <div onClick={() => trackEvent('sign_up_click', { location: 'ai_check_report_cta' })}>
          <SignUpButton mode="modal">
            <button className="ar-btn" style={{ fontSize: '16px', padding: '16px 40px', borderRadius: '12px' }}>Check my brand →</button>
          </SignUpButton>
        </div>
      </div>
    </PageLayout>
  );
}
