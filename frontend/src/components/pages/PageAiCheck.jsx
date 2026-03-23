import { useState } from "react";
import { SignUpButton } from "@clerk/clerk-react";
import { trackEvent } from "../../analytics";
import PageLayout from "./PageLayout";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pl-faq-item" onClick={() => setOpen(!open)}>
      <div className="pl-faq-q"><span>{q}</span><span className="pl-faq-icon">{open ? '−' : '+'}</span></div>
      {open && <div className="pl-faq-a">{a}</div>}
    </div>
  );
}

const FAQ = [
  { q: "What is the AI Visibility Check?", a: "The AI Visibility Check queries Claude, GPT-4o, and Gemini with 5 variations of search queries related to your brand. It tells you which AI engines mention your brand, which queries trigger a mention, and which competitor brands appear in the responses." },
  { q: "How are the queries generated?", a: "Dablin scrapes your URL, extracts your brand name and product category, then uses AI to generate 5 natural search queries that a potential customer would use — without including your brand name." },
  { q: "What if my brand isn't mentioned?", a: "That's exactly what this tool helps you understand. If you're not mentioned, you know there's a gap. The AI Visibility Audit can then help you fix the technical reasons why AI engines aren't picking up your brand." },
  { q: "How accurate is competitor detection?", a: "The tool extracts capitalized brand names from AI responses. It's not perfect — generic terms can occasionally appear — but it gives a reliable signal of which brands AI engines associate with your category." },
  { q: "How much does it cost?", a: "7 credits per check. This covers 15 API calls (5 queries × 3 AI engines). New accounts get 7 free credits — enough for one full check." },
  { q: "How often should I run this?", a: "Monthly is a good cadence. AI model training and knowledge cutoffs mean results can change over time. Tracking your mentions over time shows whether your content strategy is working." },
];

export default function PageAiCheck() {
  return (
    <PageLayout>
      {/* HERO */}
      <div className="pl-hero">
        <div className="pl-hero-badge">◎ 7 credits per check</div>
        <h1 className="pl-hero-title">
          Does ChatGPT mention<br />
          <span className="pl-hero-accent">your brand?</span>
        </h1>
        <p className="pl-hero-sub">
          The AI Visibility Check queries Claude, GPT-4o, and Gemini with 5 variations of your category searches. See exactly which AI engines mention you — and which competitors they recommend instead.
        </p>
        <p className="pl-hero-note">Claude · GPT-4o · Gemini · 5 query variations each · 15 total queries</p>
        <div onClick={() => trackEvent('sign_up_click', { location: 'ai_check_page_hero' })}>
          <SignUpButton mode="modal">
            <button className="pl-btn-primary pl-btn-large">Check your brand free</button>
          </SignUpButton>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="pl-section-green">
        <div className="pl-section-inner pl-center">
          <p className="pl-label">How it works</p>
          <h2 className="pl-h2">Paste a URL. See who mentions you.</h2>
          <div className="pl-steps">
            <div className="pl-step">
              <div className="pl-step-num">1</div>
              <div className="pl-step-title">Paste your website URL</div>
              <div className="pl-step-desc">Dablin scrapes the page and automatically extracts your brand name and product category.</div>
            </div>
            <div className="pl-step">
              <div className="pl-step-num">2</div>
              <div className="pl-step-title">15 queries across 3 AI engines</div>
              <div className="pl-step-desc">5 natural customer queries are sent to Claude, GPT-4o, and Gemini simultaneously.</div>
            </div>
            <div className="pl-step">
              <div className="pl-step-num">3</div>
              <div className="pl-step-title">Get your mention table</div>
              <div className="pl-step-desc">See which AI engines mention you per query, read the actual AI responses, and spot competitor brands.</div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT YOU GET */}
      <div className="pl-section">
        <div className="pl-center" style={{ marginBottom: '48px' }}>
          <p className="pl-label">What you get</p>
          <h2 className="pl-h2">A complete AI mention report</h2>
          <p className="pl-sub">Not just a yes/no — a full breakdown per query and per AI engine.</p>
        </div>
        <div className="pl-checks-grid">
          {[
            { icon: "◎", title: "Mention table", desc: "Query × AI engine grid showing ✓ or ✗ for every combination — 15 data points per check." },
            { icon: "◎", title: "Per-query competitor names", desc: "See which brand names appeared in each query's AI responses, so you know exactly who you're competing against." },
            { icon: "◎", title: "Top competitors summary", desc: "Aggregated list of the brands mentioned most often across all 15 queries and 3 AI engines." },
            { icon: "◎", title: "AI response snippets", desc: "Expand any query row to read the actual text Claude, GPT-4o, or Gemini returned — so you can see the context." },
            { icon: "◎", title: "Summary scores", desc: "X/5 mentions per AI engine at a glance — instantly see where you're strongest and weakest." },
            { icon: "◎", title: "Auto-generated queries", desc: "Dablin generates the 5 queries for you based on your page content. No keyword research needed." },
          ].map(c => (
            <div className="pl-check-item" key={c.title}>
              <span className="pl-check-icon" style={{ color: '#2d7a3a' }}>{c.icon}</span>
              <div>
                <div className="pl-check-title">{c.title}</div>
                <div className="pl-check-desc">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY IT MATTERS */}
      <div className="pl-section-dark">
        <div className="pl-section-inner">
          <div className="pl-center" style={{ marginBottom: '48px' }}>
            <p className="pl-label pl-label-light">Why it matters</p>
            <h2 className="pl-h2 pl-h2-white">AI engines are the new Google</h2>
            <p className="pl-sub-white">Millions of people now use ChatGPT, Perplexity, and Gemini to research products before buying. If you're not in their answers, you're missing traffic that never reaches your site.</p>
          </div>
          <div className="pl-features-grid">
            {[
              { title: "Know your current baseline", desc: "Before you can improve your AI visibility, you need to know where you stand. This check gives you that baseline." },
              { title: "Identify competitor gaps", desc: "If competitors are being mentioned and you're not, you can study their content strategy and fix yours." },
              { title: "Track progress over time", desc: "Run the check monthly to see if your content and technical improvements are moving the needle on AI mentions." },
              { title: "Prioritise your efforts", desc: "If Claude mentions you but GPT-4o doesn't, you know where to focus — different engines have different signals." },
            ].map(f => (
              <div className="pl-feature-card" key={f.title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="pl-feature-title" style={{ color: 'white' }}>{f.title}</div>
                <div className="pl-feature-desc" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="pl-section">
        <div className="pl-pricing-callout">
          <div className="pl-pricing-left">
            <h3>7 credits covers all 15 queries</h3>
            <p>Credits are shared across all Dablin tools. New accounts start with 7 free credits — enough for one complete AI Visibility Check.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="pl-pricing-credit">7 credits</div>
            <div style={{ fontSize: '13px', color: '#5a7a5e', marginTop: '4px' }}>per visibility check</div>
          </div>
          <div onClick={() => trackEvent('sign_up_click', { location: 'ai_check_page_pricing' })}>
            <SignUpButton mode="modal">
              <button className="pl-btn-primary">Start free</button>
            </SignUpButton>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="pl-section" style={{ paddingTop: '0' }}>
        <div className="pl-center">
          <p className="pl-label">FAQ</p>
          <h2 className="pl-h2">Common questions</h2>
        </div>
        <div className="pl-faq-list">
          {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </div>

      {/* CTA */}
      <div className="pl-section" style={{ paddingTop: '0' }}>
        <div className="pl-cta-box">
          <h2 className="pl-cta-title">Find out if AI engines <span>know you exist.</span></h2>
          <p className="pl-cta-sub">7 free credits. No credit card. Results in ~20 seconds.</p>
          <div className="pl-cta-actions">
            <div onClick={() => trackEvent('sign_up_click', { location: 'ai_check_page_cta' })}>
              <SignUpButton mode="modal">
                <button className="pl-btn-primary pl-btn-large">Check your brand free</button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
