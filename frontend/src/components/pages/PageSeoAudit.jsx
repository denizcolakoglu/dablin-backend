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
  { icon: "✓", title: "Meta description", desc: "Present, unique, and under 155 characters." },
  { icon: "✓", title: "Heading structure", desc: "Single H1, no skipped heading levels." },
  { icon: "✓", title: "Word count", desc: "At least 300 words for meaningful content." },
  { icon: "✓", title: "Image alt text", desc: "All images have descriptive alt attributes." },
  { icon: "✓", title: "Canonical tag", desc: "Prevents duplicate content penalties." },
  { icon: "✓", title: "Robots tag", desc: "Page is not accidentally set to noindex." },
  { icon: "✓", title: "Mobile viewport", desc: "Viewport meta tag present for mobile-first indexing." },
  { icon: "✓", title: "Open Graph tags", desc: "og:title, og:description, og:image all present." },
  { icon: "✓", title: "Schema markup", desc: "At least one JSON-LD structured data block." },
  { icon: "✓", title: "Product schema", desc: "Product type schema for Google Shopping eligibility." },
  { icon: "✓", title: "Breadcrumb schema", desc: "BreadcrumbList for navigation context." },
  { icon: "✓", title: "Review / rating schema", desc: "Star ratings in search results." },
  { icon: "✓", title: "Internal links", desc: "At least one link to another page on the site." },
];

const FAQ = [
  { q: "What does the SEO audit check?", a: "13 checks across 4 areas: content quality (meta description, headings, word count, image alt text), technical SEO (canonical, robots, viewport, Open Graph), structured data (schema markup, Product schema, BreadcrumbList, review schema), and link structure (internal links)." },
  { q: "What are the AI-generated fixes?", a: "For every failed check, Dablin generates a ready-to-copy fix — the exact HTML tag, JSON-LD schema block, or code snippet you need to paste into your CMS. No developer needed." },
  { q: "Does it work on any website?", a: "Yes. The SEO audit works on any publicly accessible URL — Shopify, WooCommerce, Amazon, WordPress, or any custom store." },
  { q: "How long does it take?", a: "The audit typically takes 10–20 seconds depending on page size and the number of failed checks that need AI fixes generated." },
  { q: "How much does it cost?", a: "5 credits per audit. New accounts get 7 free credits with no credit card required. At the Starter pack (€3 for 20 credits), that's €0.75 per full audit." },
  { q: "Can I audit competitor pages?", a: "Yes — you can audit any public URL, including competitor product pages. This is useful for benchmarking your SEO against competing listings." },
];

export default function PageSeoAudit() {
  return (
    <PageLayout>
      {/* HERO */}
      <div className="pl-hero">
        <div className="pl-hero-badge">✓ 5 credits per audit</div>
        <h1 className="pl-hero-title">
          Find and fix SEO issues<br />
          <span className="pl-hero-accent">on any product page.</span>
        </h1>
        <p className="pl-hero-sub">
          Paste any product page URL. Dablin runs 13 SEO checks and generates a ready-to-copy AI fix for every issue it finds — no developer needed.
        </p>
        <p className="pl-hero-note">Works on Shopify, WooCommerce, Amazon, and any public URL</p>
        <div onClick={() => trackEvent('sign_up_click', { location: 'seo_audit_page_hero' })}>
          <SignUpButton mode="modal">
            <button className="pl-btn-primary pl-btn-large">Try it free — 7 credits</button>
          </SignUpButton>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="pl-section-green">
        <div className="pl-section-inner pl-center">
          <p className="pl-label">How it works</p>
          <h2 className="pl-h2">Paste a URL. Get a full SEO report.</h2>
          <div className="pl-steps">
            <div className="pl-step">
              <div className="pl-step-num">1</div>
              <div className="pl-step-title">Paste your product page URL</div>
              <div className="pl-step-desc">Any public product page URL — Shopify, WooCommerce, Amazon, or custom store.</div>
            </div>
            <div className="pl-step">
              <div className="pl-step-num">2</div>
              <div className="pl-step-title">Dablin runs 13 checks</div>
              <div className="pl-step-desc">Content quality, technical SEO, structured data, and link structure — all checked in seconds.</div>
            </div>
            <div className="pl-step">
              <div className="pl-step-num">3</div>
              <div className="pl-step-title">Copy the AI fix for each issue</div>
              <div className="pl-step-desc">Every failed check includes the exact code or tag to fix it. Copy and paste into your CMS.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 13 CHECKS */}
      <div className="pl-section">
        <div className="pl-center" style={{ marginBottom: '48px' }}>
          <p className="pl-label">What we check</p>
          <h2 className="pl-h2">13 SEO checks across 4 categories</h2>
          <p className="pl-sub">Every check comes with an AI-generated fix if it fails.</p>
        </div>
        <div className="pl-checks-grid">
          {CHECKS.map(c => (
            <div className="pl-check-item" key={c.title}>
              <span className="pl-check-icon" style={{ color: '#2d7a3a', fontWeight: '700' }}>{c.icon}</span>
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
            <h2 className="pl-h2 pl-h2-white">Most product pages fail basic SEO checks</h2>
            <p className="pl-sub-white">These aren't advanced SEO tactics — they're fundamentals that Google expects on every product page.</p>
          </div>
          <div className="pl-features-grid">
            {[
              { title: "Missing schema costs you rich results", desc: "Without Product schema, your listings don't qualify for Google Shopping and won't show star ratings or price in search results." },
              { title: "Supplier descriptions hurt rankings", desc: "Copy-pasted supplier content is duplicate content. Google penalises it. Unique descriptions rank." },
              { title: "Thin content gets ignored", desc: "Pages under 300 words are treated as low-quality by Google. The audit flags this and suggests content additions." },
              { title: "Missing meta = auto-generated previews", desc: "Without a meta description, Google writes its own — and it's usually bad. The audit checks and fixes this." },
              { title: "No canonical = duplicate URL penalties", desc: "Shopify creates multiple URLs per product. A missing canonical splits your ranking signals." },
              { title: "Open Graph affects social traffic", desc: "Missing OG tags mean ugly, unoptimised previews when your products are shared on social media." },
            ].map(f => (
              <div className="pl-feature-card" key={f.title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="pl-feature-title" style={{ color: 'white' }}>{f.title}</div>
                <div className="pl-feature-desc" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING CALLOUT */}
      <div className="pl-section">
        <div className="pl-pricing-callout">
          <div className="pl-pricing-left">
            <h3>One-time credits, no subscription</h3>
            <p>Buy credits once, use them across all Dablin tools. New accounts start with 7 free credits — enough for 1 full SEO audit and 2 descriptions.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="pl-pricing-credit">5 credits</div>
            <div style={{ fontSize: '13px', color: '#5a7a5e', marginTop: '4px' }}>per SEO audit</div>
          </div>
          <div onClick={() => trackEvent('sign_up_click', { location: 'seo_audit_page_pricing' })}>
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
          <h2 className="pl-cta-title">Find out what's <span>holding your rankings back.</span></h2>
          <p className="pl-cta-sub">7 free credits. No credit card. Results in seconds.</p>
          <div className="pl-cta-actions">
            <div onClick={() => trackEvent('sign_up_click', { location: 'seo_audit_page_cta' })}>
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
