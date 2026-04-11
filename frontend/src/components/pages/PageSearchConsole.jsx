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

const FEATURES = [
  { title: "Performance", desc: "Clicks, impressions, CTR and average position over time. Filter by query, page, country or device." },
  { title: "Striking Distance", desc: "Queries ranking 5–20 where a small improvement could push you to page 1. Prioritised by traffic opportunity." },
  { title: "Indexing", desc: "Which pages are indexed, which are not, and why. Request indexing for missing pages directly from Dablin." },
  { title: "Core Web Vitals", desc: "LCP, INP and CLS scores for all your pages. See which ones are failing and where to focus first." },
  { title: "Links", desc: "External and internal link data. See who links to you and how your pages connect to each other." },
  { title: "Countries & Devices", desc: "Where your traffic comes from and how it splits across mobile, desktop and tablet." },
];

const INSIGHTS = [
  { tag: "Opportunity", title: "Striking distance keywords", desc: "Queries ranking 5–20 where a title or meta tweak could move you to page 1. Links directly to the SEO Audit for the affected page." },
  { tag: "Fix", title: "Pages not indexed", desc: "Pages Google discovered but didn't index. See exactly why and request indexing in one click via the URL Inspection deep link." },
  { tag: "Fix", title: "Low CTR pages", desc: "Good rankings but poor clicks. Usually a title or meta description problem. Dablin links directly to the SEO Audit to fix it." },
  { tag: "AI Visibility", title: "AI Overview keywords", desc: "Queries triggering Google's AI Overviews. Optimise for inclusion by running the AI Visibility Audit on the relevant pages." },
];

const FAQ = [
  { q: "What is Google Search Console?", a: "Google Search Console is a free tool from Google that shows you how your site performs in Google Search — which pages are indexed, what queries bring traffic, Core Web Vitals scores, crawl errors, and more. It's the most direct source of data about how Google sees your site." },
  { q: "Which plan includes Search Console?", a: "The Google Search Console integration is available on the Agency plan. It requires ongoing data fetching from your Google account, which is why it's reserved for the higher tier." },
  { q: "How do I connect my GSC account?", a: "Go to the Search Console section in your Dablin dashboard and click 'Connect Google Search Console'. You'll be redirected to Google to authorise access. Once authorised, select the site property you want to use and Dablin will start pulling your data." },
  { q: "What are striking distance keywords?", a: "Striking distance keywords are queries where your page ranks between position 5 and 20. These are your best quick wins — you're already on page 1 or close to it, and a small improvement to your title tag, meta description, or page content could push you into the top 5." },
  { q: "Can I connect multiple sites?", a: "Yes. If your Google account has multiple properties in Search Console, you can switch between them using the site selector in the Dablin dashboard. Each site's data is fetched separately." },
  { q: "Is my Google data secure?", a: "Yes. Dablin uses Google's official OAuth 2.0 flow — we never see your Google password. We only request read access to your Search Console data. You can disconnect your GSC account at any time from the dashboard." },
  { q: "How is this different from using GSC directly?", a: "Google Search Console shows you raw data. Dablin organises it into actionable views — striking distance keywords, low CTR pages, unindexed pages — and connects each insight directly to the Dablin tool that can fix it. You don't need to export data or switch between tools." },
  { q: "How often is the data refreshed?", a: "GSC data is fetched each time you open the Search Console section in Dablin. Google Search Console data typically has a 2–3 day lag, so you'll be seeing data from the last few days rather than real-time." },
];

export default function PageSearchConsole() {
  return (
    <PageLayout activePath="/google-search-console">
      <Helmet>
        <title>Google Search Console Integration — SEO insights inside Dablin</title>
        <meta name="description" content="Connect Google Search Console to Dablin and we turn your raw GSC data into clear actions — which pages to fix, which keywords are close to ranking, and what's hurting your Core Web Vitals. No spreadsheets needed." />
        <meta property="og:title" content="Google Search Console Integration — SEO insights inside Dablin" />
        <meta property="og:description" content="Connect Google Search Console to Dablin and we turn your raw GSC data into clear actions. No spreadsheets needed." />
        <meta property="og:url" content="https://dablin.co/google-search-console" />
        <meta name="twitter:title" content="Google Search Console Integration — SEO insights inside Dablin" />
        <meta name="twitter:description" content="Connect GSC to Dablin and turn raw data into clear SEO actions. No spreadsheets needed." />
        <link rel="canonical" href="https://dablin.co/google-search-console" />
      </Helmet>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .gsc-btn-primary { background: #1a7a3a; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .gsc-btn-primary:hover { background: #2d9a4e; transform: translateY(-1px); }
        @media (max-width: 900px) {
          .gsc-hero-grid { flex-direction: column !important; }
          .gsc-hero-right { display: none !important; }
          .gsc-features-grid { grid-template-columns: 1fr !important; }
          .gsc-insights-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .gsc-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="gsc-section" style={{ background: '#eef8f0', backgroundImage: 'linear-gradient(rgba(26,122,58,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.06) 1px,transparent 1px)', backgroundSize: '36px 36px', padding: 'clamp(56px,7vw,96px) 56px', borderBottom: '1px solid #d0e8d4' }}>
        <div className="gsc-hero-grid" style={{ display: 'flex', alignItems: 'flex-start', gap: '64px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Left */}
          <div style={{ flex: '0 0 420px' }}>
            <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(40px,5vw,60px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-2.5px', color: '#0d1f0e', marginBottom: '20px' }}>
              Google Search<br />
              <span style={{ color: '#1a7a3a' }}>Console.</span><br />
              Inside Dablin.
            </h1>
            <p style={{ fontSize: '17px', color: '#4a6b4c', fontWeight: '300', lineHeight: '1.65', marginBottom: '28px' }}>
              Connect your GSC account and get actionable SEO insights — indexed pages, striking distance keywords, Core Web Vitals, and crawl errors — all in one place.
            </p>
            <div onClick={() => trackEvent('sign_up_click', { location: 'gsc_page_hero' })}>
              <SignUpButton mode="modal">
                <button className="gsc-btn-primary">Connect Search Console</button>
              </SignUpButton>
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#4a6b4c' }}>Available on Agency plan</div>
          </div>

          {/* Right: mock dashboard */}
          <div className="gsc-hero-right" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ borderRadius: '14px', border: '1px solid #d0e8d4', background: '#f8faf8', overflow: 'hidden', boxShadow: '0 8px 32px rgba(26,122,58,0.10)' }}>
              <div style={{ background: '#e8f5ea', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid #d0e8d4' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#4a6b4c' }}>dablin.co · Search Console</span>
              </div>
              <div style={{ padding: '20px', background: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[['48.2K','Clicks (28d)'],['1.2M','Impressions'],['4.1%','Avg CTR'],['12.4','Avg position']].map(([val, lbl]) => (
                    <div key={lbl} style={{ background: '#f8faf8', border: '1px solid #eef2ee', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '22px', fontWeight: '800', color: '#1a7a3a', marginBottom: '2px' }}>{val}</div>
                      <div style={{ fontSize: '11px', color: '#4a6b4c' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #eef2ee', marginBottom: '14px' }}>
                  {['Striking distance', 'Low CTR', 'All queries'].map((t, i) => (
                    <div key={t} style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: i === 0 ? '#1a7a3a' : '#4a6b4c', borderBottom: i === 0 ? '2px solid #1a7a3a' : '2px solid transparent' }}>{t}</div>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: '#4a6b4c', marginBottom: '10px' }}>Queries ranking 5–20 — small fixes could move these to page 1</div>
                {[
                  ['best bamboo cutting board', 'pos 8', 'Low CTR', '#fffbeb', '#b45309', '#fcd34d'],
                  ['organic bamboo kitchen set', 'pos 11', 'Good CTR', '#eef8f0', '#1a7a3a', '#d0e8d4'],
                  ['eco-friendly chopping board', 'pos 14', 'Low CTR', '#fffbeb', '#b45309', '#fcd34d'],
                  ['bamboo kitchen accessories', 'pos 17', 'Low CTR', '#fffbeb', '#b45309', '#fcd34d'],
                ].map(([q, pos, label, bg, color, border], i) => (
                  <div key={q} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f0f7f0' : 'none', fontSize: '12px' }}>
                    <span style={{ color: '#0d1f0e', fontWeight: '500' }}>{q}</span>
                    <span style={{ color: '#4a6b4c' }}>{pos}</span>
                    <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHAT YOU GET ── */}
      <div className="gsc-section" style={{ background: 'white', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>What you get</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>8 views of your search performance</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Everything Google knows about your site, organised into actionable panels.</p>
          </div>
          <div className="gsc-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ border: '1px solid #eef2ee', borderRadius: '14px', padding: '24px', background: 'white' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ACTIONABLE INSIGHTS ── */}
      <div className="gsc-section" style={{ background: '#f8faf8', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a7a3a', marginBottom: '12px' }}>Actionable insights</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', color: '#0d1f0e', letterSpacing: '-1px', marginBottom: '12px' }}>Not just data — things to act on</h2>
            <p style={{ fontSize: '16px', color: '#4a6b4c', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>Dablin surfaces the opportunities that matter and connects them to the right tool.</p>
          </div>
          <div className="gsc-insights-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {INSIGHTS.map(item => (
              <div key={item.title} style={{ background: 'white', border: '1px solid #eef2ee', borderRadius: '14px', padding: '24px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a7a3a', background: '#eef8f0', border: '1px solid #d0e8d4', borderRadius: '20px', padding: '3px 10px', display: 'inline-block', marginBottom: '12px' }}>{item.tag}</span>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d1f0e', marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: '#4a6b4c', lineHeight: '1.6' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="gsc-section" style={{ background: 'white', padding: 'clamp(48px,6vw,96px) 56px', borderBottom: '1px solid #eef2ee' }}>
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
      <div className="gsc-section" style={{ background: '#0d1f0e', padding: 'clamp(64px,8vw,120px) 56px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Your Google data.<br /><span style={{ color: '#6fcf8a' }}>Your SEO actions.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.6' }}>Available on Agency plan. Connect in under 2 minutes.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div onClick={() => trackEvent('sign_up_click', { location: 'gsc_page_cta' })}>
            <SignUpButton mode="modal">
              <button className="gsc-btn-primary">Get Agency plan →</button>
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
