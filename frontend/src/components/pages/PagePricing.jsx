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

const PACKS = [
  { name: "Try it free", price: "€0", credits: "7 credits", desc: "No credit card needed", cta: "Start free", highlight: false, features: ["7 AI description credits", "1 AI Visibility Check", "All categories", "SEO score", "HTML export"] },
  { name: "Starter", price: "€3", credits: "20 credits", desc: "One-time, no subscription", cta: "Get started", highlight: true, features: ["20 AI descriptions", "4 SEO or AI audits", "2 AI Visibility Checks", "All categories", "SEO score", "HTML export", "History"] },
  { name: "Pro", price: "€12", credits: "100 credits", desc: "One-time, no subscription", cta: "Go Pro", highlight: false, features: ["100 AI descriptions", "20 SEO or AI audits", "14 AI Visibility Checks", "All categories", "SEO score", "HTML export", "History"] },
  { name: "Studio", price: "€49", credits: "500 credits", desc: "Best value for agencies", cta: "Get Studio", highlight: false, features: ["500 AI descriptions", "100 SEO or AI audits", "71 AI Visibility Checks", "All categories", "SEO score", "HTML export", "History", "Priority support"] },
];

const CREDIT_COSTS = [
  { feature: "Generate Product Description", cost: "1 credit", color: "#2d7a3a" },
  { feature: "SEO Audit", cost: "5 credits", color: "#2d7a3a" },
  { feature: "AI Visibility Audit", cost: "5 credits", color: "#2d7a3a" },
  { feature: "AI Visibility Check", cost: "7 credits", color: "#2d7a3a" },
];

const FAQ = [
  { q: "Do credits expire?", a: "No. Credits never expire. Buy once, use whenever you need." },
  { q: "Can I use credits across all tools?", a: "Yes. Credits are shared across all four Dablin tools — Generate, SEO Audit, AI Visibility Audit, and AI Visibility Check." },
  { q: "Is there a subscription?", a: "No. Dablin is entirely pay-per-use. You buy credits once and use them at your own pace. No monthly fees, no auto-renewal." },
  { q: "What payment methods do you accept?", a: "All major credit and debit cards via Stripe. Payments are processed securely — Dablin never stores your card details." },
  { q: "Can I get a refund?", a: "If you have a problem with a generation or audit, contact hello@dablin.co and we'll make it right." },
  { q: "Is there a free trial?", a: "Yes — new accounts get 7 free credits with no credit card required. That's enough for 7 descriptions, 1 AI Visibility Check, or 1 audit + 2 descriptions." },
];

export default function PagePricing() {
  return (
    <PageLayout>
      {/* HERO */}
      <div className="pl-hero">
        <div className="pl-hero-badge">No subscription · Credits never expire</div>
        <h1 className="pl-hero-title">
          Pay once.<br />
          <span className="pl-hero-accent">Use it forever.</span>
        </h1>
        <p className="pl-hero-sub">
          One credit balance. Four tools. No monthly fees. Buy credits when you need them and use them across everything Dablin offers.
        </p>
      </div>

      {/* CREDIT COSTS TABLE */}
      <div className="pl-section" style={{ paddingTop: '0' }}>
        <div className="pl-center" style={{ marginBottom: '40px' }}>
          <p className="pl-label">Credit usage</p>
          <h2 className="pl-h2">What each tool costs</h2>
        </div>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CREDIT_COSTS.map(c => (
            <div key={c.feature} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f7fbf7', border: '1px solid #d4e8d6', borderRadius: '10px', padding: '16px 24px' }}>
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#1c2e1e' }}>{c.feature}</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: c.color }}>{c.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING CARDS */}
      <div style={{ background: '#f7fbf7', borderTop: '1px solid #d4e8d6', borderBottom: '1px solid #d4e8d6', padding: '72px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="pl-center" style={{ marginBottom: '48px' }}>
            <p className="pl-label">Credit packs</p>
            <h2 className="pl-h2">Choose your pack</h2>
            <p className="pl-sub" style={{ margin: '0 auto' }}>All packs are one-time purchases. Credits never expire.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {PACKS.map(p => (
              <div key={p.name} style={{
                border: p.highlight ? '2px solid #2d7a3a' : '1px solid #d4e8d6',
                borderRadius: '14px', padding: '28px', background: 'white',
                position: 'relative', transition: 'all 0.2s',
              }}>
                {p.highlight && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#2d7a3a', color: 'white', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap' }}>Most popular</div>
                )}
                <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '15px', fontWeight: '700', color: '#0f1a10', marginBottom: '8px' }}>{p.name}</div>
                <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '36px', fontWeight: '800', color: '#0f1a10', marginBottom: '2px' }}>{p.price}</div>
                <div style={{ fontSize: '13px', color: '#2d7a3a', fontWeight: '600', marginBottom: '4px' }}>{p.credits}</div>
                <div style={{ fontSize: '12px', color: '#5a7a5e', marginBottom: '20px' }}>{p.desc}</div>
                <ul style={{ listStyle: 'none', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ fontSize: '13px', color: '#1c2e1e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#2d7a3a', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <div onClick={() => trackEvent('sign_up_click', { location: `pricing_page_${p.name.toLowerCase()}` })}>
                  <SignUpButton mode="modal">
                    <button style={{
                      width: '100%', padding: '11px', borderRadius: '8px',
                      fontFamily: "'Roboto', sans-serif", fontSize: '14px', fontWeight: '600',
                      cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                      background: p.highlight ? '#2d7a3a' : '#f7fbf7',
                      color: p.highlight ? 'white' : '#1c2e1e',
                      borderColor: p.highlight ? 'transparent' : '#d4e8d6',
                    }}>{p.cta}</button>
                  </SignUpButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHY PAY PER USE */}
      <div className="pl-section">
        <div className="pl-center" style={{ marginBottom: '48px' }}>
          <p className="pl-label">Why pay per use</p>
          <h2 className="pl-h2">No subscriptions. No wasted money.</h2>
          <p className="pl-sub" style={{ margin: '0 auto' }}>Most AI tools charge monthly whether you use them or not. Dablin only costs when you need it.</p>
        </div>
        <div className="pl-features-grid">
          {[
            { title: "Credits never expire", desc: "Migrate 50 products this month, nothing next month? No problem. Your credits wait for you." },
            { title: "One balance, four tools", desc: "Use the same credits for descriptions, SEO audits, AI visibility audits, and visibility checks." },
            { title: "Start free, no card needed", desc: "7 free credits on signup. See the full output quality before spending a cent." },
            { title: "Transparent pricing", desc: "1 credit = €0.06–€0.15 depending on your pack. No hidden fees, no usage-based surprises." },
            { title: "Scales with your needs", desc: "Run 3 descriptions a month or 500. Pay proportionally, not a flat fee regardless of usage." },
            { title: "No auto-renewal", desc: "You buy credits manually. Nothing ever charges you without your explicit action." },
          ].map(f => (
            <div className="pl-feature-card" key={f.title}>
              <div className="pl-feature-title">{f.title}</div>
              <div className="pl-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="pl-section" style={{ paddingTop: '0' }}>
        <div className="pl-center">
          <p className="pl-label">FAQ</p>
          <h2 className="pl-h2">Pricing questions</h2>
        </div>
        <div className="pl-faq-list">
          {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </div>

      {/* CTA */}
      <div className="pl-section" style={{ paddingTop: '0' }}>
        <div className="pl-cta-box">
          <h2 className="pl-cta-title">Start with <span>7 free credits.</span></h2>
          <p className="pl-cta-sub">No credit card. No subscription. Full access to all four tools.</p>
          <div className="pl-cta-actions">
            <div onClick={() => trackEvent('sign_up_click', { location: 'pricing_page_cta' })}>
              <SignUpButton mode="modal">
                <button className="pl-btn-primary pl-btn-large">Get started free</button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
