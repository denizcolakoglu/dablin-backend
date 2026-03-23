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

const CHECKS = [
  { icon: "✦", title: "SEO-optimized product title", desc: "Under 70 characters with your keyword included — every time." },
  { icon: "✦", title: "Meta description", desc: "Under 155 characters, keyword-rich, ready to paste into your CMS." },
  { icon: "✦", title: "Feature bullets", desc: "4–6 benefit-focused bullets formatted for your platform." },
  { icon: "✦", title: "Platform-ready HTML body", desc: "Clean HTML you paste directly into Shopify, Amazon, or WooCommerce." },
  { icon: "✦", title: "Shopify tags", desc: "Relevant search tags matching real customer queries." },
  { icon: "✦", title: "SEO score", desc: "Instant score checking title length, meta length, and keyword density." },
];

const FAQ = [
  { q: "What platforms does it support?", a: "Dablin generates descriptions ready for Shopify, Amazon, WooCommerce, and any other e-commerce platform. The output includes clean HTML you can paste directly." },
  { q: "Does it support languages other than English?", a: "Yes. If you write your product details in Italian, French, Spanish or any other language, the output will be in that language automatically." },
  { q: "How is it different from ChatGPT?", a: "ChatGPT gives you generic copy. Dablin keeps titles under 70 characters, metas under 155, generates platform-ready HTML, and scores every output — with no prompt engineering needed." },
  { q: "How many product categories are supported?", a: "10 categories: Beauty & Skincare, Fashion & Apparel, Electronics, Home & Kitchen, Fitness, Food & Beverages, Pet Supplies, Baby & Kids, Jewelry, and Health & Wellness. Each uses a tailored AI persona." },
  { q: "How much does it cost?", a: "1 credit per description. New accounts get 7 free credits with no credit card required. Additional credits are available in one-time packs from €3." },
];

export default function PageGenerate() {
  return (
    <PageLayout>
      {/* HERO */}
      <div className="pl-hero">
        <div className="pl-hero-badge">✦ 1 credit per generation</div>
        <h1 className="pl-hero-title">
          SEO-ready product descriptions<br />
          <span className="pl-hero-accent">in 30 seconds.</span>
        </h1>
        <p className="pl-hero-sub">
          Paste your product name, category, and key features. Dablin generates a platform-ready title, meta description, feature bullets, and full HTML — with an SEO score on every output.
        </p>
        <p className="pl-hero-note">AI-powered · Pay per use · No subscription · No credit card required</p>
        <div onClick={() => trackEvent('sign_up_click', { location: 'generate_page_hero' })}>
          <SignUpButton mode="modal">
            <button className="pl-btn-primary pl-btn-large">Try it free — 7 credits</button>
          </SignUpButton>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="pl-section-green">
        <div className="pl-section-inner pl-center">
          <p className="pl-label">How it works</p>
          <h2 className="pl-h2">Three inputs. One complete description.</h2>
          <div className="pl-steps">
            <div className="pl-step">
              <div className="pl-step-num">1</div>
              <div className="pl-step-title">Fill in your product details</div>
              <div className="pl-step-desc">Product name, category, key features, target audience, tone, and brand name. Takes about 60 seconds.</div>
            </div>
            <div className="pl-step">
              <div className="pl-step-num">2</div>
              <div className="pl-step-title">Click Generate</div>
              <div className="pl-step-desc">Dablin's AI writes your description, optimized for your specific category with the right tone and keywords.</div>
            </div>
            <div className="pl-step">
              <div className="pl-step-num">3</div>
              <div className="pl-step-title">Copy and paste</div>
              <div className="pl-step-desc">Copy individual fields — title, meta, bullets, HTML — or export everything at once. Paste directly into your store.</div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT YOU GET */}
      <div className="pl-section">
        <div className="pl-center" style={{ marginBottom: '48px' }}>
          <p className="pl-label">What you get</p>
          <h2 className="pl-h2">Every output includes 6 fields</h2>
          <p className="pl-sub">Everything your product page needs, generated in one click — no copy-pasting between tools.</p>
        </div>
        <div className="pl-checks-grid">
          {CHECKS.map(c => (
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

      {/* FEATURES */}
      <div className="pl-section-dark">
        <div className="pl-section-inner">
          <div className="pl-center" style={{ marginBottom: '48px' }}>
            <p className="pl-label pl-label-light">Why Dablin</p>
            <h2 className="pl-h2 pl-h2-white">Built for e-commerce, not generic content</h2>
            <p className="pl-sub-white">Every feature is designed to get your products live faster, with better SEO.</p>
          </div>
          <div className="pl-features-grid">
            {[
              { title: "10 product categories", desc: "Each category has a tailored AI persona — a beauty expert writes differently than a tech reviewer." },
              { title: "4 tone options", desc: "Professional, Friendly, Luxury, or Playful. Match your brand voice on every product." },
              { title: "Any language", desc: "Write your inputs in Italian, French, Spanish — the output matches your language automatically." },
              { title: "Correct character limits", desc: "Title ≤70, meta ≤155 — always. You'll never have to count characters again." },
              { title: "Keyword inclusion", desc: "Your product name and key features are woven naturally into the title, meta, and body." },
              { title: "Full history", desc: "Every description saved. Review, reuse, and compare across products from your history tab." },
            ].map(f => (
              <div className="pl-feature-card" key={f.title}>
                <div className="pl-feature-title">{f.title}</div>
                <div className="pl-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING CALLOUT */}
      <div className="pl-section">
        <div className="pl-pricing-callout">
          <div className="pl-pricing-left">
            <h3>Simple, pay-per-use pricing</h3>
            <p>No subscription. Buy credits once, use them whenever you need. Credits never expire. New accounts start with 7 free credits.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="pl-pricing-credit">1 credit</div>
            <div style={{ fontSize: '13px', color: '#5a7a5e', marginTop: '4px' }}>per description</div>
          </div>
          <div onClick={() => trackEvent('sign_up_click', { location: 'generate_page_pricing' })}>
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
          <h2 className="pl-cta-title">Stop writing.<br /><span>Start selling.</span></h2>
          <p className="pl-cta-sub">7 free credits. No credit card. No subscription.</p>
          <div className="pl-cta-actions">
            <div onClick={() => trackEvent('sign_up_click', { location: 'generate_page_cta' })}>
              <SignUpButton mode="modal">
                <button className="pl-btn-primary pl-btn-large">Try it free</button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
