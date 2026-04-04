import { useState } from "react";
import { SignUpButton, SignInButton } from "@clerk/clerk-react";
import { trackEvent } from "../../analytics";

const BASE = "https://dablin-backend-production.up.railway.app";

const MOCK_RESULTS = [
  { type: "problem",    query: "My Shopify store isn't getting organic traffic",     claude: true,  gpt: false, gemini: false },
  { type: "problem",    query: "Why aren't AI tools recommending my brand?",          claude: false, gpt: false, gemini: false },
  { type: "category",  query: "Best SEO audit tool for Shopify stores",              claude: true,  gpt: true,  gemini: true  },
  { type: "comparison",query: "Alternatives to Semrush for small e-commerce stores", claude: true,  gpt: false, gemini: true  },
];

const TYPE_STYLES = {
  problem:    { bg: "#fef2f2", color: "#c0392b", border: "#fca5a5" },
  category:   { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
  comparison: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
};

function TypePill({ type }) {
  const s = TYPE_STYLES[type];
  const labels = { problem: "Problem", category: "Category", comparison: "Comparison" };
  return (
    <span style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 7px", borderRadius: "20px", background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: "inline-block", flexShrink: 0 }}>
      {labels[type]}
    </span>
  );
}

function ResultTable() {
  const claude = MOCK_RESULTS.filter(r => r.claude).length;
  const gpt    = MOCK_RESULTS.filter(r => r.gpt).length;
  const gemini = MOCK_RESULTS.filter(r => r.gemini).length;

  return (
    <div style={{ borderRadius: "16px", border: "1px solid #d0e8d4", overflow: "hidden", boxShadow: "0 16px 48px rgba(26,122,58,0.12)", background: "white" }}>
      {/* Browser bar */}
      <div style={{ background: "#e8f5ea", padding: "10px 16px", display: "flex", alignItems: "center", gap: "7px", borderBottom: "1px solid #d0e8d4" }}>
        {["#ff5f57","#febc2e","#28c840"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />)}
        <span style={{ flex: 1, textAlign: "center", fontSize: "12px", color: "#4a6b4c", fontFamily: "monospace" }}>dablin.co · AI Visibility Check</span>
      </div>

      {/* Score strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", padding: "16px", borderBottom: "1px solid #eef2ee" }}>
        {[{ label: "Claude", val: claude, color: "#c67b2f" },{ label: "GPT-4o", val: gpt, color: "#10a37f" },{ label: "Gemini", val: gemini, color: "#4285f4" }].map(e => (
          <div key={e.label} style={{ background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: e.color, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{e.label}</div>
            <div style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: "24px", fontWeight: "800", color: e.val >= 3 ? "#1a7a3a" : e.val >= 1 ? "#b45309" : "#c0392b" }}>{e.val}/4</div>
            <div style={{ fontSize: "10px", color: "#4a6b4c" }}>mentioned</div>
          </div>
        ))}
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 60px", background: "#f8faf8", padding: "8px 14px", fontSize: "10px", fontWeight: "700", color: "#4a6b4c", textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #eef2ee" }}>
        <span>Query</span>
        {["Claude","GPT-4o","Gemini"].map(e => <span key={e} style={{ textAlign: "center" }}>{e}</span>)}
      </div>

      {MOCK_RESULTS.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 60px", padding: "10px 14px", borderBottom: i < MOCK_RESULTS.length - 1 ? "1px solid #f0f7f0" : "none", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <TypePill type={row.type} />
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#0d1f0e", lineHeight: "1.3" }}>{row.query}</span>
          </div>
          {[row.claude, row.gpt, row.gemini].map((v, j) => (
            <div key={j} style={{ textAlign: "center", fontWeight: "800", fontSize: "15px", color: v ? "#1a7a3a" : "#c0392b" }}>{v ? "✓" : "✗"}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  { n: "1", title: "Enter your URL", desc: "Paste any product page or homepage. Dablin reads your brand automatically." },
  { n: "2", title: "Get 7 typed queries", desc: "Problem queries, category queries, comparison queries — across the full buyer journey." },
  { n: "3", title: "See your AI mention report", desc: "21 data points. Claude, GPT-4o, Gemini. Which competitors they recommend instead." },
];

const CHECKS = [
  "ChatGPT mentions your brand",
  "Gemini mentions your brand",
  "Claude mentions your brand",
  "Which competitors appear instead",
  "Per query type breakdown",
  "Full AI response for each query",
  "18 SEO checks on your page",
  "Information Gain score",
  "AI Overview eligibility",
  "llms.txt presence",
  "AI crawler access",
  "Organization schema",
  "Core Web Vitals score",
  "AI-generated fix for every issue",
];

const FAQS = [
  { q: "What exactly does the AI Visibility Check do?", a: "It generates 7 queries across 3 buyer intent stages — problem, category, and comparison — and sends them to ChatGPT, Gemini, and Claude simultaneously. You get a table showing where you're mentioned and who gets recommended instead." },
  { q: "How is this different from Semrush or Ahrefs?", a: "Semrush and Ahrefs check Google rankings. They don't check whether AI engines like ChatGPT or Gemini mention your brand. Dablin covers that layer plus core SEO — in one place, starting at €9/mo." },
  { q: "Do I need to install anything?", a: "No. Paste your URL, get results in under 30 seconds. Nothing to install, no Chrome extension, no API keys." },
  { q: "What plan do I need for the AI Visibility Check?", a: "The AI Visibility Check is included from the Pro plan at €19/mo. The Starter plan at €9/mo includes the SEO Audit and AI Visibility Audit." },
];

export default function PageGoogleAds() {
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", color: "#0d1f0e", background: "white", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ga-btn { background: #1a7a3a; color: white; border: none; padding: 16px 36px; border-radius: 12px; font-family: 'Roboto', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-block; }
        .ga-btn:hover { background: #2d9a4e; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,122,58,0.25); }
        .ga-btn-lg { padding: 18px 48px; font-size: 17px; border-radius: 14px; }
        @media (max-width: 900px) {
          .ga-hero { flex-direction: column !important; }
          .ga-demo { display: none !important; }
          .ga-steps { grid-template-columns: 1fr !important; }
          .ga-checks { grid-template-columns: 1fr 1fr !important; }
          .ga-section { padding: 56px 24px !important; }
        }
        @media (max-width: 600px) {
          .ga-checks { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background: "#1a7a3a", padding: "10px 24px", textAlign: "center", fontSize: "13px", color: "white", fontWeight: "500" }}>
        Starter plan from <strong>€9/mo</strong> · No setup fees · Cancel anytime
      </div>

      {/* ── NAV ── */}
      <nav style={{ padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eef2ee", position: "sticky", top: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.svg" alt="Dablin" width="36" height="36" loading="lazy" />
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#0d1f0e", fontFamily: "'Roboto Condensed',sans-serif", letterSpacing: "-0.5px" }}>dablin</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SignInButton mode="modal">
            <button style={{ background: "none", border: "1px solid #eef2ee", color: "#0d1f0e", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Roboto',sans-serif" }}>Sign in</button>
          </SignInButton>
          <div onClick={() => trackEvent("sign_up_click", { location: "google_ads_nav" })}>
            <SignUpButton mode="modal">
              <button className="ga-btn" style={{ padding: "9px 22px", fontSize: "14px", borderRadius: "9px" }}>Check my brand</button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="ga-section" style={{ background: "#eef8f0", backgroundImage: "linear-gradient(rgba(26,122,58,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.05) 1px,transparent 1px)", backgroundSize: "36px 36px", padding: "80px 56px", borderBottom: "1px solid #d0e8d4" }}>
        <div className="ga-hero" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "flex-start", gap: "64px" }}>
          <div style={{ flex: "0 0 460px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#d0e8d4", color: "#1a7a3a", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "24px" }}>
              ◎ AI Visibility Check
            </div>
            <h1 style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: "clamp(40px,5vw,62px)", fontWeight: "800", lineHeight: "1.0", letterSpacing: "-2.5px", color: "#0d1f0e", marginBottom: "24px" }}>
              Does ChatGPT<br />mention your<br /><span style={{ color: "#1a7a3a" }}>brand?</span>
            </h1>
            <p style={{ fontSize: "18px", color: "#4a6b4c", fontWeight: "300", lineHeight: "1.65", marginBottom: "36px", maxWidth: "400px" }}>
              Most brands are invisible to AI engines and have no idea. Dablin checks if ChatGPT, Gemini, and Claude mention you — and shows you exactly who they recommend instead.
            </p>
            <div onClick={() => trackEvent("sign_up_click", { location: "google_ads_hero" })}>
              <SignUpButton mode="modal">
                <button className="ga-btn ga-btn-lg">Check my brand →</button>
              </SignUpButton>
            </div>
            <div style={{ marginTop: "16px", fontSize: "13px", color: "#4a6b4c", display: "flex", alignItems: "center", gap: "16px" }}>
              <span>✓ Results in 20 seconds</span>
              <span>✓ No credit card required</span>
            </div>
          </div>
          <div className="ga-demo" style={{ flex: 1, minWidth: 0 }}>
            <ResultTable />
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF BAR ── */}
      <div style={{ background: "white", borderBottom: "1px solid #eef2ee", padding: "20px 56px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "48px", flexWrap: "wrap", fontSize: "13px", color: "#4a6b4c", fontWeight: "500" }}>
          {["Works on Shopify, WooCommerce, Amazon", "3 AI engines checked simultaneously", "Results in under 30 seconds", "AI fix for every failed check"].map(t => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#1a7a3a", fontWeight: "700" }}>✓</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="ga-section" style={{ padding: "80px 56px", background: "#f8faf8", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a7a3a", marginBottom: "12px" }}>How it works</p>
            <h2 style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-1px" }}>From URL to full report in 30 seconds</h2>
          </div>
          <div className="ga-steps" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ padding: "0 40px", borderRight: i < 2 ? "1px solid #d0e8d4" : "none" }}>
                <div style={{ width: "48px", height: "48px", background: "#eef8f0", border: "1.5px solid #d0e8d4", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "800", color: "#1a7a3a", marginBottom: "20px", fontFamily: "'Roboto Condensed',sans-serif" }}>{s.n}</div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0d1f0e", marginBottom: "10px" }}>{s.title}</h3>
                <p style={{ fontSize: "14px", color: "#4a6b4c", lineHeight: "1.65", fontWeight: "300" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHAT'S INCLUDED ── */}
      <div className="ga-section" style={{ padding: "80px 56px", background: "white", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a7a3a", marginBottom: "12px" }}>What you get</p>
            <h2 style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-1px" }}>Every check. Every fix.</h2>
          </div>
          <div className="ga-checks" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }}>
            {CHECKS.map(c => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "10px", padding: "14px 18px", fontSize: "14px", color: "#0d1f0e", fontWeight: "500" }}>
                <span style={{ color: "#1a7a3a", fontWeight: "800", fontSize: "15px", flexShrink: 0 }}>✓</span>{c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA MID ── */}
      <div className="ga-section" style={{ padding: "80px 56px", background: "#0d1f0e", borderBottom: "1px solid #1a3a1e" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: "800", color: "white", letterSpacing: "-1.5px", marginBottom: "16px" }}>
            Find out if AI engines<br /><span style={{ color: "#6fcf8a" }}>know you exist.</span>
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", marginBottom: "36px", lineHeight: "1.6" }}>Enter your URL. Results in 20 seconds. No setup needed.</p>
          <div onClick={() => trackEvent("sign_up_click", { location: "google_ads_mid_cta" })}>
            <SignUpButton mode="modal">
              <button className="ga-btn ga-btn-lg">Check my brand →</button>
            </SignUpButton>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "16px" }}>Starter from €9/mo · Cancel anytime · No credit card to start</p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="ga-section" style={{ padding: "80px 56px", background: "white", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a7a3a", marginBottom: "12px" }}>FAQ</p>
            <h2 style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-1px" }}>Common questions</h2>
          </div>
          <div style={{ borderTop: "1px solid #eef2ee" }}>
            {FAQS.map((item, i) => (
              <div key={i} onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ borderBottom: "1px solid #eef2ee", padding: "20px 0", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", fontSize: "16px", fontWeight: "600", color: "#0d1f0e" }}>
                  <span>{item.q}</span>
                  <span style={{ fontSize: "22px", color: "#1a7a3a", flexShrink: 0, fontWeight: "300" }}>{faqOpen === i ? "−" : "+"}</span>
                </div>
                {faqOpen === i && <p style={{ fontSize: "15px", color: "#4a6b4c", lineHeight: "1.65", marginTop: "12px", paddingRight: "32px" }}>{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="ga-section" style={{ padding: "96px 56px", background: "#eef8f0", backgroundImage: "linear-gradient(rgba(26,122,58,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.05) 1px,transparent 1px)", backgroundSize: "36px 36px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Roboto Condensed',sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-1.5px", marginBottom: "16px" }}>
            Check your AI visibility<br />right now.
          </h2>
          <p style={{ fontSize: "17px", color: "#4a6b4c", fontWeight: "300", marginBottom: "36px", lineHeight: "1.6" }}>
            See exactly where ChatGPT, Gemini, and Claude stand on your brand — and what to fix first.
          </p>
          <div onClick={() => trackEvent("sign_up_click", { location: "google_ads_final_cta" })}>
            <SignUpButton mode="modal">
              <button className="ga-btn ga-btn-lg">Check my brand →</button>
            </SignUpButton>
          </div>
          <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", flexWrap: "wrap", fontSize: "13px", color: "#4a6b4c" }}>
            <span>✓ Results in 20 seconds</span>
            <span>✓ Starter from €9/mo</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* ── MINIMAL FOOTER ── */}
      <div style={{ background: "#0d1f0e", padding: "24px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>© 2026 Dablin</span>
        <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
          <a href="/privacy-policy" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Privacy</a>
          <a href="/terms-of-service" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Terms</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>dablin.co</a>
        </div>
      </div>
    </div>
  );
}
