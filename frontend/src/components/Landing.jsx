import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />
      </div>

      <nav className="landing-nav">
        <div className="nav-brand">
        <img src="/logo.svg" alt="Dablin" height="48" />
        </div>
        <div className="landing-nav-actions">
          <SignInButton mode="modal">
            <button className="btn-ghost">Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-primary">Start free</button>
          </SignUpButton>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-badge">Built for e-commerce sellers</div>
        <h1 className="hero-title">
          Product descriptions<br />
          <span className="hero-accent">that actually sell.</span>
        </h1>
        <p className="hero-sub">
          Paste your product specs. Get SEO-optimized, Platform-native HTML
          with the right title length, meta tags, and bullet points —
          ready to publish in seconds.
        </p>
        <div className="hero-actions">
          <SignUpButton mode="modal">
            <button className="btn-primary btn-large">
              Try free — 3 descriptions included
            </button>
          </SignUpButton>
          <p className="hero-note">No credit card required</p>
        </div>

        <div className="demo-card">
          <div className="demo-label">Example output</div>
          <div className="demo-row">
            <div className="demo-col">
              <div className="demo-tag">Input</div>
              <div className="demo-text muted">
                bamboo cutting board set, 3 pieces, juice grooves, non-slip feet, dishwasher safe
              </div>
            </div>
            <div className="demo-arrow">→</div>
            <div className="demo-col">
              <div className="demo-tag green">Output</div>
              <div className="demo-output">
                <div className="output-field">
                  <span className="field-label">Title</span>
                  <span className="field-value">Bamboo Cutting Board Set — 3-Piece Kitchen Essential</span>
                  <span className="field-meta">56 chars ✓</span>
                </div>
                <div className="output-field">
                  <span className="field-label">Meta</span>
                  <span className="field-value">Shop our 3-piece bamboo cutting board set with juice grooves & non-slip feet. Dishwasher safe. Free shipping.</span>
                  <span className="field-meta">112 chars ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="features-row">
          {[
            { icon: "⚡", title: "Platform-native HTML", desc: "Correct tags, correct limits, zero formatting work" },
            { icon: "🎯", title: "SEO optimized", desc: "Title ≤70 chars, meta ≤155 chars, keywords included" },
            { icon: "🚀", title: "Push to store", desc: "Connect Shopify and publish directly, no copy-paste" },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
