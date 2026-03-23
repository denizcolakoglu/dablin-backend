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
  { icon: "◎", title: "llms.txt file", desc: "Helps ChatGPT, Perplexity and Gemini understand your site's purpose." },
  { icon: "◎", title: "AI crawlers allowed", desc: "GPTBot, ClaudeBot, PerplexityBot not blocked in robots.txt." },
  { icon: "◎", title: "No noai meta tag", desc: "AI engines are not explicitly blocked from this page." },
  { icon: "◎", title: "HTTPS", desc: "Page served securely — required for AI engine trust." },
  { icon: "◎", title: "Fast response time", desc: "Server responds in under 3 seconds — slow pages get skipped." },
  { icon: "◎", title: "Organization schema", desc: "AI engines can verify your brand identity." },
  { icon: "◎", title: "sameAs social links", desc: "Social profiles linked in schema for entity recognition." },
  { icon: "◎", title: "WebSite schema & name", desc: "WebSite schema with name field for AI engine identification." },
  { icon: "◎", title: "Clear H1 heading", desc: "Single descriptive H1 — AI engines anchor page topic on this." },
  { icon: "◎", title: "Meta description", desc: "Used by AI engines for citations and summaries." },
  { icon: "◎", title: "Canonical URL", desc: "AI engines index the correct version of this page." },
  { icon: "◎", title: "Open Graph tags", desc: "og:title, og:description, og:image — used for AI page summaries." },
];

const FAQ = [
  { q: "What is AI Visibility Audit?", a: "The AI Visibility Audit runs 12 checks to see how well AI-powered search engines like ChatGPT, Perplexity, and Gemini can find, crawl, and understand your pages. It's different from traditional SEO — these engines use different signals to decide what to surface." },
  { q: "What is llms.txt?", a: "llms.txt is a simple text file you place at the root of your website (yoursite.com/llms.txt) that tells AI models what your site does, who it's for, and what content they can use. It's similar to robots.txt but for AI crawlers." },
  { q: "How is this different from the SEO Audit?", a: "The SEO Audit focuses on Google ranking factors — meta tags, schema, headings, technical SEO. The AI Visibility Audit focuses on what AI engines need to find and cite your pages — llms.txt, Organization schema, sameAs links, AI crawler access, and more." },
  { q: "Does this work for any website?", a: "Yes. Any publicly accessible URL can be audited — Shopify stores, WooCommerce, WordPress, or custom sites." },
  { q: "How much does it cost?", a: "5 credits per audit. New accounts get 7 free credits with no credit card required." },
  { q: "What are AEO and GEO?", a: "AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) both refer to optimizing content to be found and cited by AI-powered search tools like ChatGPT, Perplexity, and Google's AI Overviews. Dablin's AI Visibility Audit covers the technical checks that matter most for both." },
];

export default function PageAiAudit() {
  return (
    <PageLayout>
      {/* HERO */}
      <div className="pl-hero">
        <div className="pl-hero-badge">◎ 5 credits per audit</div>
        <h1 className="pl-hero-title">
          Is your store visible to<br />
          <span className="pl-hero-accent">ChatGPT and Gemini?</span>
        </h1>
        <p className="pl-hero-sub">
          The AI Visibility Audit runs 12 checks to see if AI-powered search engines can find, crawl, and understand your pages — with ready-to-copy fixes for every issue.
        </p>
        <p className="pl-hero-note">Checks llms.txt · Organization schema · AI crawlers · Open Graph · and 8 more</p>
        <div onClick={() => trackEvent('sign_up_click', { location: 'ai_audit_page_hero' })}>
          <SignUpButton mode="modal">
            <button className="pl-btn-primary pl-btn-large">Try it free — 7 credits</button>
          </SignUpButton>
        </div>
      </div>

      {/* WHY AEO */}
      <div className="pl-section-green">
        <div className="pl-section-inner pl-center">
          <p className="pl-label">Why AI visibility matters</p>
          <h2 className="pl-h2">Search is changing. AI engines are the new front page.</h2>
          <p className="pl-sub" style={{ margin: '0 auto 48px' }}>ChatGPT, Perplexity, and Google's AI Overviews now answer product questions directly. If your store isn't optimised for these engines, you're invisible to a growing share of buyers.</p>
          <div className="pl-steps">
            <div className="pl-step">
              <div className="pl-step-num">1</div>
              <div className="pl-step-title">Paste your URL</div>
              <div className="pl-step-desc">Any product page, homepage, or landing page URL.</div>
            </div>
            <div className="pl-step">
              <div className="pl-step-num">2</div>
              <div className="pl-step-title">Run 12 AI visibility checks</div>
              <div className="pl-step-desc">Brand identity, crawlability, AI-readable content — all checked in seconds.</div>
            </div>
            <div className="pl-step">
              <div className="pl-step-num">3</div>
              <div className="pl-step-title">Copy AI fixes for each issue</div>
              <div className="pl-step-desc">Every failed check includes exact code to fix it — no developer or SEO expert needed.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 12 CHECKS */}
      <div className="pl-section">
        <div className="pl-center" style={{ marginBottom: '48px' }}>
          <p className="pl-label">What we check</p>
          <h2 className="pl-h2">12 checks across 3 categories</h2>
          <p className="pl-sub">Brand Identity · AI Crawlability · AI-Readable Content</p>
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

      {/* FEATURES DARK */}
      <div className="pl-section-dark">
        <div className="pl-section-inner">
          <div className="pl-center" style={{ marginBottom: '48px' }}>
            <p className="pl-label pl-label-light">What you get</p>
            <h2 className="pl-h2 pl-h2-white">A complete AI visibility report with fixes</h2>
            <p className="pl-sub-white">Not just a score — actionable fixes for every issue, ready to copy and paste.</p>
          </div>
          <div className="pl-features-grid">
            {[
              { title: "AI visibility score", desc: "A percentage score showing how well optimised your page is for AI engines, with a pass/fail breakdown per check." },
              { title: "llms.txt generator", desc: "If your site is missing llms.txt, Dablin generates a complete file based on your page content — ready to upload." },
              { title: "Schema fix generator", desc: "Missing Organization or WebSite schema? Dablin generates the exact JSON-LD block to add to your page." },
              { title: "robots.txt fix", desc: "If AI crawlers are blocked, Dablin generates the exact rules to add to allow GPTBot, ClaudeBot, and PerplexityBot." },
              { title: "Response time diagnosis", desc: "Flags slow page load times that cause AI crawlers to skip your pages, with suggested fixes." },
              { title: "Open Graph fix", desc: "Missing OG tags generated automatically from your page title and content." },
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
            <h3>Pay per audit, no subscription</h3>
            <p>Credits work across all Dablin tools. 7 free credits on signup — enough for 1 AI Visibility Audit and 2 descriptions.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="pl-pricing-credit">5 credits</div>
            <div style={{ fontSize: '13px', color: '#5a7a5e', marginTop: '4px' }}>per AI audit</div>
          </div>
          <div onClick={() => trackEvent('sign_up_click', { location: 'ai_audit_page_pricing' })}>
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
          <h2 className="pl-cta-title">Make your store <span>visible to AI.</span></h2>
          <p className="pl-cta-sub">7 free credits. No credit card. Results in seconds.</p>
          <div className="pl-cta-actions">
            <div onClick={() => trackEvent('sign_up_click', { location: 'ai_audit_page_cta' })}>
              <SignUpButton mode="modal">
                <button className="pl-btn-primary pl-btn-large">Audit your first page free</button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
