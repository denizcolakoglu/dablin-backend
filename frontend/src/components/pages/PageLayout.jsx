import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { trackEvent } from "../../analytics";

export default function PageLayout({ children }) {
  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", color: '#1c2e1e', background: 'white', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        :root {
          --green: #2d7a3a; --green-light: #3d9e4e; --green-pale: #e8f5ea;
          --green-mid: #c8e6cb; --dark: #0f1a10; --dark-mid: #1a2e1c;
          --text: #1c2e1e; --muted: #5a7a5e; --border: #d4e8d6;
          --white: #ffffff; --off-white: #f7fbf7;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pl-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 48px; position: sticky; top: 0; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); z-index: 100; }
        .pl-nav-links { display: flex; align-items: center; gap: 20px; }
        .pl-nav-link { font-size: 13px; font-weight: 500; color: var(--text); text-decoration: none; transition: color 0.2s; white-space: nowrap; }
        .pl-nav-link:hover { color: var(--green); }
        .pl-nav-actions { display: flex; gap: 12px; align-items: center; }
        .pl-btn-ghost { background: none; border: 1px solid var(--border); color: var(--text); padding: 9px 20px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .pl-btn-ghost:hover { border-color: var(--green); color: var(--green); }
        .pl-btn-primary { background: var(--green); color: white; border: none; padding: 10px 22px; border-radius: 8px; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .pl-btn-primary:hover { background: var(--green-light); }
        .pl-btn-large { padding: 16px 36px; font-size: 16px; border-radius: 10px; font-weight: 600; }

        /* NAV DROPDOWN */
        .pl-nav-dropdown { position: relative; }
        .pl-nav-dropdown-trigger { font-size: 14px; font-weight: 500; color: var(--text); cursor: pointer; user-select: none; }
        .pl-nav-dropdown-trigger:hover { color: var(--green); }
        .pl-nav-dropdown-menu { display: none; position: absolute; top: calc(100% + 16px); left: 50%; transform: translateX(-50%); background: white; border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); padding: 8px; min-width: 320px; z-index: 200; }
        .pl-nav-dropdown:hover .pl-nav-dropdown-menu { display: flex; flex-direction: column; gap: 2px; }
        .pl-nav-dropdown-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 10px; text-decoration: none; transition: background 0.15s; }
        .pl-nav-dropdown-item:hover { background: var(--green-pale); }
        .pl-nav-dropdown-icon { font-size: 16px; color: var(--green); flex-shrink: 0; margin-top: 2px; }
        .pl-nav-dropdown-label { font-size: 13px; font-weight: 600; color: var(--dark); margin-bottom: 2px; }
        .pl-nav-dropdown-desc { font-size: 12px; color: var(--muted); line-height: 1.4; }

        /* PAGE SECTIONS */
        .pl-hero { max-width: 860px; margin: 0 auto; padding: 72px 48px 64px; text-align: center; }
        .pl-hero-badge { display: inline-block; background: var(--green-pale); color: var(--green); border: 1px solid var(--green-mid); padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 24px; }
        .pl-hero-title { font-family: 'Roboto Condensed', sans-serif; font-size: clamp(36px, 5vw, 64px); font-weight: 800; line-height: 1.05; letter-spacing: -2px; color: var(--dark); margin-bottom: 20px; }
        .pl-hero-accent { color: var(--green); }
        .pl-hero-sub { font-size: 18px; color: var(--muted); max-width: 560px; margin: 0 auto 36px; line-height: 1.6; font-weight: 300; }
        .pl-hero-note { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
        .pl-section { padding: 72px 48px; max-width: 1100px; margin: 0 auto; }
        .pl-section-dark { background: var(--dark); padding: 72px 48px; }
        .pl-section-green { background: var(--green-pale); border-top: 1px solid var(--green-mid); border-bottom: 1px solid var(--green-mid); padding: 72px 48px; }
        .pl-section-inner { max-width: 1100px; margin: 0 auto; }
        .pl-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--green); margin-bottom: 16px; }
        .pl-label-light { color: var(--green-light); }
        .pl-h2 { font-family: 'Roboto Condensed', sans-serif; font-size: clamp(26px, 3.5vw, 40px); font-weight: 700; color: var(--dark); margin-bottom: 16px; letter-spacing: -1px; }
        .pl-h2-white { color: white; }
        .pl-sub { font-size: 16px; color: var(--muted); max-width: 520px; line-height: 1.6; }
        .pl-sub-white { color: rgba(255,255,255,0.6); max-width: 520px; line-height: 1.6; font-size: 16px; }
        .pl-center { text-align: center; }
        .pl-center .pl-sub { margin: 0 auto; }
        .pl-center .pl-sub-white { margin: 0 auto; }

        /* HOW IT WORKS */
        .pl-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 56px; }
        .pl-step { text-align: center; }
        .pl-step-num { width: 44px; height: 44px; border-radius: 50%; background: var(--green); color: white; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-family: 'Roboto Condensed', sans-serif; }
        .pl-step-title { font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px; font-family: 'Roboto Condensed', sans-serif; }
        .pl-step-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

        /* CHECKS GRID */
        .pl-checks-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 48px; }
        .pl-check-item { display: flex; gap: 12px; align-items: flex-start; background: white; border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
        .pl-check-icon { font-size: 16px; flex-shrink: 0; }
        .pl-check-title { font-size: 14px; font-weight: 600; color: var(--dark); margin-bottom: 3px; }
        .pl-check-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

        /* FEATURES */
        .pl-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
        .pl-feature-card { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 28px; }
        .pl-feature-title { font-family: 'Roboto Condensed', sans-serif; font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
        .pl-feature-desc { font-size: 14px; color: var(--muted); line-height: 1.55; }

        /* CTA BOX */
        .pl-cta-box { background: var(--dark); border-radius: 20px; padding: 56px 48px; text-align: center; margin-top: 48px; }
        .pl-cta-title { font-family: 'Roboto Condensed', sans-serif; font-size: clamp(24px, 3vw, 40px); font-weight: 800; color: white; margin-bottom: 14px; letter-spacing: -1px; }
        .pl-cta-title span { color: var(--green-light); }
        .pl-cta-sub { font-size: 16px; color: rgba(255,255,255,0.5); margin-bottom: 32px; }
        .pl-cta-actions { display: flex; gap: 14px; justify-content: center; align-items: center; flex-wrap: wrap; }
        .pl-btn-outline { background: none; border: 2px solid rgba(255,255,255,0.3); color: white; padding: 14px 32px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .pl-btn-outline:hover { border-color: white; }

        /* FAQ */
        .pl-faq-list { max-width: 720px; margin: 48px auto 0; }
        .pl-faq-item { border-bottom: 1px solid var(--border); padding: 20px 0; cursor: pointer; }
        .pl-faq-item:first-child { border-top: 1px solid var(--border); }
        .pl-faq-q { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 15px; font-weight: 600; color: var(--dark); }
        .pl-faq-icon { font-size: 20px; color: var(--green); flex-shrink: 0; }
        .pl-faq-a { font-size: 14px; color: var(--muted); line-height: 1.65; margin-top: 10px; padding-right: 24px; }

        /* PRICING CALLOUT */
        .pl-pricing-callout { background: var(--green-pale); border: 1px solid var(--green-mid); border-radius: 16px; padding: 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-top: 48px; }
        .pl-pricing-left h3 { font-family: 'Roboto Condensed', sans-serif; font-size: 22px; font-weight: 700; color: var(--dark); margin-bottom: 6px; }
        .pl-pricing-left p { font-size: 14px; color: var(--muted); }
        .pl-pricing-credit { font-size: 28px; font-weight: 800; color: var(--green); font-family: 'Roboto Condensed', sans-serif; white-space: nowrap; }

        /* FOOTER */
        .pl-footer { background: var(--dark-mid); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); }
        .pl-footer-copy { font-size: 13px; color: rgba(255,255,255,0.3); }
        .pl-footer-links { display: flex; gap: 24px; }
        .pl-footer-links a { font-size: 13px; color: rgba(255,255,255,0.3); text-decoration: none; }
        .pl-footer-links a:hover { color: rgba(255,255,255,0.7); }

        @media (max-width: 768px) {
          .pl-nav { padding: 14px 20px; }
          .pl-nav-links { display: none; }
          .pl-btn-ghost { display: none; }
          .pl-hero { padding: 40px 20px 48px; }
          .pl-hero-sub { font-size: 16px; }
          .pl-section { padding: 48px 20px; }
          .pl-section-dark { padding: 48px 20px; }
          .pl-section-green { padding: 48px 20px; }
          .pl-steps { grid-template-columns: 1fr; }
          .pl-checks-grid { grid-template-columns: 1fr; }
          .pl-features-grid { grid-template-columns: 1fr; }
          .pl-pricing-callout { flex-direction: column; text-align: center; }
          .pl-cta-box { padding: 40px 20px; }
          .pl-cta-actions { flex-direction: column; }
          .pl-footer { padding: 24px 20px; flex-direction: column; gap: 16px; text-align: center; }
          .pl-btn-large { padding: 14px 28px; font-size: 15px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="pl-nav">
        <a href="/" style={{ textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Dablin" height="44" />
        </a>
        <div className="pl-nav-links">
          {[
            { href: "/ai-visibility-check", label: "AI Visibility Check" },
            { href: "/ai-visibility-audit", label: "AI Visibility Audit" },
            { href: "/seo-audit", label: "SEO Audit" },
            { href: "/generate-product-description", label: "Generate" },
            { href: "/pricing", label: "Pricing" },
          ].map(item => {
            const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
            return (
              <a key={item.href} href={item.href} className="pl-nav-link" style={{ color: isActive ? 'var(--green)' : undefined, fontWeight: isActive ? '700' : undefined }}>
                {item.label}
              </a>
            );
          })}
          <a href="https://blog.dablin.co" target="_blank" rel="noopener noreferrer" className="pl-nav-link">Blog</a>
        </div>
        <div className="pl-nav-actions">
          <SignInButton mode="modal">
            <button className="pl-btn-ghost">Sign in</button>
          </SignInButton>
          <div onClick={() => trackEvent('sign_up_modal_opened', { location: 'page_nav' })}>
            <SignUpButton mode="modal">
              <button className="pl-btn-primary">Sign up</button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {children}

      {/* FOOTER */}
      <footer className="pl-footer">
        <div className="pl-footer-copy">© 2026 Dablin. All rights reserved.</div>
        <div className="pl-footer-links">
          <a href="/legal.html">Privacy</a>
          <a href="/legal.html">Terms</a>
          <a href="mailto:hello@dablin.co">Contact: hello@dablin.co</a>
        </div>
      </footer>
    </div>
  );
}
