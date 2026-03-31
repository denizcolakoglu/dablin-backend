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



const FAQ = [
  { q: "What is the AI Visibility Check?", a: "The AI Visibility Check queries Claude, GPT-4o, and Gemini with 7 variations of search queries related to your brand. It tells you which AI engines mention your brand, which queries trigger a mention, and which competitor brands appear in the responses." },
  { q: "How are the queries generated?", a: "Dablin scrapes your URL, extracts your brand name and product category, then uses AI to generate 7 natural search queries that a potential customer would use — without including your brand name. You can also edit them before running." },
  { q: "What if my brand isn't mentioned?", a: "That's exactly what this tool helps you understand. If you're not mentioned, you know there's a gap. The AI Visibility Audit can then help you fix the technical reasons why AI engines aren't picking up your brand." },
  { q: "How accurate is competitor detection?", a: "The tool extracts brand names from AI responses. It gives a reliable signal of which brands AI engines associate with your category when buyers search for your type of product." },
  { q: "How much does it cost?", a: "The AI Visibility Check is included in Pro and Agency plans. See the Pricing page for plan details." },
  { q: "How often should I run this?", a: "Monthly is a good cadence. AI model training and knowledge cutoffs mean results can change over time. Tracking your mentions over time shows whether your content and technical improvements are working." },
];

export default function PageAiCheck() {
  return (
    <PageLayout activePath="/ai-visibility-check">

      {/* HERO */}
      <div className="pg-section" style={{ background: '#eef8f0', padding: '96px 48px 108px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #d0e8d4', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#1a7a3a', marginBottom: '28px' }}>
          ◎ AI Visibility Check
        </div>
        <h1 className="pg-hero-title" style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(44px,7vw,80px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-3px', color: '#0d1f0e', marginBottom: '24px' }}>
          Does ChatGPT mention<br />
          <span style={{ color: '#1a7a3a' }}>your brand?</span>
        </h1>
        <p style={{ fontSize: '19px', color: '#4a6b4c', maxWidth: '540px', margin: '0 auto 40px', lineHeight: '1.65', fontWeight: '300' }}>
          Enter your URL and Dablin sends 7 real customer queries to Claude, GPT-4o, and Gemini — showing you exactly who mentions your brand and which competitors they recommend instead.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'ai_check_page_hero' })}>
            <SignUpButton mode="modal"><button className="pg-btn-primary pg-btn-large">Check my brand free →</button></SignUpButton>
          </div>
          
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '56px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[['7', 'queries per check'], ['3', 'AI engines queried'], ['21', 'total data points'], ['Free', 'to start']].map(([val, label]) => (
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
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '56px' }}>Paste a URL. See who mentions you.</h2>
          <div className="pg-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0' }}>
            {[
              { n: '1', title: 'Paste your website URL', desc: 'Dablin scrapes your page and automatically extracts your brand name and product category.' },
              { n: '2', title: '21 queries across 3 AI engines', desc: '7 natural customer queries sent to Claude, GPT-4o, and Gemini simultaneously — no brand name included.' },
              { n: '3', title: 'Get your full mention report', desc: 'See which AI engines mention you per query, read the actual responses, and spot competitor brands.' },
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

      {/* WHAT YOU GET */}
      <div className="pg-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '14px' }}>What you get</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>A complete AI mention report</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Not just a yes/no — a full breakdown per query and per AI engine.</p>
          </div>
          <div className="pg-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              { title: 'Mention table', desc: 'Query × AI engine grid showing ✓ or ✗ for every combination — 21 data points per check.' },
              { title: 'Per-query competitor names', desc: 'See which brands appeared in each AI response, so you know exactly who you\'re competing against.' },
              { title: 'Top competitors summary', desc: 'Aggregated list of brands mentioned most often across all queries and all 3 AI engines.' },
              { title: 'AI response snippets', desc: 'Expand any row to read the actual text Claude, GPT-4o, or Gemini returned — see the full context.' },
              { title: 'Summary scores per engine', desc: 'X/7 mentions per AI engine at a glance — instantly see where you\'re strongest and weakest.' },
              { title: 'Auto-generated queries', desc: 'Dablin generates 7 queries from your URL automatically. Edit them before running for best results.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHY IT MATTERS */}
      <div className="pg-section" style={{ background: '#0d1f0e', padding: 'clamp(48px,6vw,96px) 48px', borderTop: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#6fcf8a', marginBottom: '14px' }}>Why it matters</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: 'white', letterSpacing: '-1px', marginBottom: '12px' }}>AI engines are the new front page</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>Millions of people use ChatGPT, Gemini, and Claude to research products before buying. If you're not in their answers, you're missing buyers who never reach your site.</p>
          </div>
          <div className="pg-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '20px' }}>
            {[
              { title: 'Know your current baseline', desc: 'Before you can improve your AI visibility, you need to know where you stand. This check gives you that baseline in 20 seconds.' },
              { title: 'Identify competitor gaps', desc: 'If competitors are being recommended and you\'re not, you can study what they\'re doing and fix your own content strategy.' },
              { title: 'Track progress over time', desc: 'Run the check monthly to see if your content and technical improvements are moving the needle on AI mentions.' },
              { title: 'Prioritise by AI engine', desc: 'If Claude mentions you but GPT-4o doesn\'t, you know exactly where to focus — different engines weight different signals.' },
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
          Find out if AI engines <span style={{ color: '#6fcf8a' }}>know you exist.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>Find out if AI engines know you exist today.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'ai_check_page_cta' })}>
            <SignUpButton mode="modal"><button className="pg-btn-primary pg-btn-large">Check my brand free →</button></SignUpButton>
          </div>
          <SignInButton mode="modal"><button style={{ background: 'none', border: '2px solid rgba(255,255,255,0.2)', color: 'white', padding: '15px 32px', borderRadius: '10px', fontFamily: "'Roboto', sans-serif", fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>Sign in</button></SignInButton>
        </div>
      </div>
    </PageLayout>
  );
}
