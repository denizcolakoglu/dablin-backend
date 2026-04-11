import { Helmet } from 'react-helmet-async';
import { useState } from "react";
import { SignUpButton, SignInButton } from "@clerk/clerk-react";
import PageLayout from "./PageLayout";
import { trackEvent } from "../../analytics";



function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: "1px solid #eef2ee", padding: "20px 0", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", fontSize: "16px", fontWeight: "600", color: "#0d1f0e" }}>
        <span>{q}</span>
        <span style={{ fontSize: "22px", color: "#1a7a3a", flexShrink: 0, fontWeight: "300" }}>{open ? "−" : "+"}</span>
      </div>
      {open && <div style={{ fontSize: "15px", color: "#4a6b4c", lineHeight: "1.65", marginTop: "12px", paddingRight: "32px" }}>{a}</div>}
    </div>
  );
}

const PLANS = [
  {
    id: "starter", name: "Starter", monthlyPrice: 9, yearlyMonthly: 6.75,
    desc: "For solo founders getting SEO foundations right.",
    highlight: false, badge: null,
    features: [
      { label: "SEO Audit", note: "5 / month" },
      { label: "AI Visibility Audit", note: "5 / month" },
      { label: "AI Visibility Check", note: null },
      { label: "AI Query Check", note: null },
      { label: "Description Generator", note: "20 / month" },
      { label: "Search Console integration", note: null },
      { label: "URLs tracked", note: "1 URL" },
      { label: "Team seats", note: "1 seat" },
      { label: "Email support", note: null },
    ],
    included: ["SEO Audit", "AI Visibility Audit", "Description Generator", "URLs tracked", "Team seats", "Email support"],
    cta: "Get Starter",
  },
  {
    id: "pro", name: "Pro", monthlyPrice: 19, yearlyMonthly: 14.25,
    desc: "For brands serious about AI and Google visibility.",
    highlight: true, badge: "Most popular",
    features: [
      { label: "SEO Audit", note: "10 / month" },
      { label: "AI Visibility Audit", note: "10 / month" },
      { label: "AI Visibility Check", note: "Max 7 queries" },
      { label: "AI Query Check", note: null },
      { label: "Description Generator", note: "100 / month" },
      { label: "Search Console integration", note: null },
      { label: "URLs tracked", note: "3 URLs" },
      { label: "Team seats", note: "3 seats" },
      { label: "Priority email support", note: null },
    ],
    included: ["SEO Audit", "AI Visibility Audit", "AI Visibility Check", "Description Generator", "URLs tracked", "Team seats", "Priority email support"],
    cta: "Get Pro",
  },
  {
    id: "agency", name: "Agency", monthlyPrice: 49, yearlyMonthly: 36.75,
    desc: "For agencies managing multiple brands and clients.",
    highlight: false, badge: null,
    features: [
      { label: "SEO Audit", note: "Unlimited" },
      { label: "AI Visibility Audit", note: "Unlimited" },
      { label: "AI Visibility Check", note: "Unlimited" },
      { label: "AI Query Check", note: "Unlimited" },
      { label: "Description Generator", note: "Unlimited" },
      { label: "Search Console integration", note: "Included" },
      { label: "URLs tracked", note: "Unlimited" },
      { label: "Team seats", note: "10 seats" },
      { label: "Priority support + onboarding", note: null },
    ],
    included: ["SEO Audit", "AI Visibility Audit", "AI Visibility Check", "AI Query Check", "Description Generator", "Search Console integration", "URLs tracked", "Team seats", "Priority support + onboarding"],
    cta: "Get Agency",
  },
];

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your account settings. Your plan stays active until the end of the billing period." },
  { q: "Is there a free trial?", a: "Yes — new accounts get 7 days free on any plan. No credit card required to start." },
  { q: "What happens when I hit my monthly limit?", a: "You'll see a notification when you're close to your limit. You can upgrade your plan or wait until the next billing cycle when limits reset." },
  { q: "Can I switch plans?", a: "Yes. Upgrade or downgrade at any time. Changes take effect at the next billing cycle." },
  { q: "What payment methods do you accept?", a: "All major credit and debit cards via Stripe. Payments are processed securely — Dablin never stores your card details." },
  { q: "Why is Search Console only in Agency?", a: "The Search Console integration requires fetching and storing data from your Google account on an ongoing basis, which has higher infrastructure costs. It's included in the Agency plan alongside unlimited everything." },
  { q: "Do you offer yearly billing?", a: "Yes — pay yearly and get 3 months free (equivalent to paying for 9, getting 12). Toggle to yearly on this page to see the discounted prices." },
];

export default function PagePricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <PageLayout activePath="/pricing">
      <Helmet>
        <title>Dablin Pricing — Starter €9, Pro €19, Agency €49</title>
        <meta name="description" content="SEO Audit, GEO checks and AI visibility tools for brands and e-commerce. Starter from €9/month. No setup fees, cancel anytime. Free plan available." />
        <meta property="og:title" content="Dablin Pricing — Starter €9, Pro €19, Agency €49" />
        <meta property="og:description" content="SEO Audit, GEO checks and AI visibility tools. Starter from €9/month. No setup fees, cancel anytime. Free plan available." />
        <meta property="og:url" content="https://dablin.co/pricing" />
        <meta name="twitter:title" content="Dablin Pricing — Starter €9, Pro €19, Agency €49" />
        <meta name="twitter:description" content="SEO Audit, GEO checks and AI visibility tools. Starter from €9/month. Free plan available." />
        <link rel="canonical" href="https://dablin.co/pricing" />
      </Helmet>

      {/* HERO */}
      <div className="pp-section" style={{ background: "#eef8f0", padding: "80px 48px 96px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a7a3a", marginBottom: "14px" }}>Pricing</p>
        <h1 className="pp-hero-title" style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: "800", lineHeight: "1.0", letterSpacing: "-2.5px", color: "#0d1f0e", marginBottom: "20px" }}>
          Simple, transparent pricing.
        </h1>
        <p style={{ fontSize: "18px", color: "#4a6b4c", maxWidth: "480px", margin: "0 auto 36px", lineHeight: "1.65", fontWeight: "300" }}>
          Everything you need to be found on Google and AI — no credit systems, no surprises.
        </p>

        {/* Billing toggle */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "white", border: "1.5px solid #d0e8d4", borderRadius: "100px", padding: "6px 6px 6px 18px" }}>
          <span style={{ fontSize: "14px", fontWeight: "500", color: yearly ? "#4a6b4c" : "#0d1f0e" }}>Monthly</span>
          <button onClick={() => setYearly(y => !y)} style={{ width: "44px", height: "26px", borderRadius: "100px", background: yearly ? "#1a7a3a" : "#d0e8d4", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: "4px", left: yearly ? "22px" : "4px", width: "18px", height: "18px", background: "white", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingRight: "6px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: yearly ? "#0d1f0e" : "#4a6b4c" }}>Yearly</span>
            <span style={{ background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "700" }}>3 months free</span>
          </div>
        </div>
      </div>

      {/* PLAN CARDS */}
      <div className="pp-section" style={{ background: "#ffffff", padding: "clamp(48px,6vw,80px) 48px", borderTop: "1px solid #eef2ee" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="pp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", alignItems: "start" }}>
            {PLANS.map(plan => {
              const price = yearly ? plan.yearlyMonthly : plan.monthlyPrice;
              const saving = yearly ? Math.round((plan.monthlyPrice * 12 - plan.yearlyMonthly * 12)) : 0;
              return (
                <div key={plan.id} style={{
                  background: plan.highlight ? "#0d1f0e" : "white",
                  border: plan.highlight ? "2px solid #1a7a3a" : "1px solid #eef2ee",
                  borderRadius: "16px", padding: "28px 24px",
                  position: "relative",
                  boxShadow: plan.highlight ? "0 8px 32px rgba(26,122,58,0.15)" : "none",
                }}>
                  {plan.badge && (
                    <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#1a7a3a", color: "white", borderRadius: "20px", padding: "4px 16px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {plan.badge}
                    </div>
                  )}
                  <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: plan.highlight ? "#6fcf8a" : "#1a7a3a", marginBottom: "8px" }}>{plan.name}</div>
                  <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "44px", fontWeight: "800", color: plan.highlight ? "white" : "#0d1f0e", lineHeight: 1, marginBottom: "4px" }}>
                    €{price % 1 === 0 ? price : price.toFixed(2)}
                    <span style={{ fontSize: "16px", fontWeight: "500", color: plan.highlight ? "rgba(255,255,255,0.5)" : "#4a6b4c" }}>/mo</span>
                  </div>
                  {yearly && (
                    <div style={{ fontSize: "12px", color: plan.highlight ? "rgba(255,255,255,0.5)" : "#4a6b4c", marginBottom: "4px" }}>
                      €{(plan.yearlyMonthly * 12).toFixed(0)} billed yearly
                      <span style={{ marginLeft: "6px", background: plan.highlight ? "rgba(111,207,138,0.15)" : "#eef8f0", color: plan.highlight ? "#6fcf8a" : "#1a7a3a", border: `1px solid ${plan.highlight ? "rgba(111,207,138,0.3)" : "#d0e8d4"}`, borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: "700" }}>
                        Save €{saving}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.5)" : "#4a6b4c", lineHeight: "1.5", marginBottom: "24px", marginTop: "8px" }}>{plan.desc}</div>

                  <div onClick={() => trackEvent("sign_up_click", { location: `pricing_page_${plan.id}`, billing: yearly ? "yearly" : "monthly" })}>
                    <SignUpButton mode="modal">
                      <button style={{
                        width: "100%", padding: "13px", borderRadius: "9px",
                        border: plan.highlight ? "none" : "2px solid #1a7a3a",
                        background: plan.highlight ? "#1a7a3a" : "transparent",
                        color: plan.highlight ? "white" : "#1a7a3a",
                        fontSize: "14px", fontWeight: "700", cursor: "pointer",
                        fontFamily: "'Roboto', sans-serif", marginBottom: "24px",
                        transition: "all 0.2s",
                      }}>
                        {plan.cta}
                      </button>
                    </SignUpButton>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {plan.features.map((f, i) => {
                      const inc = plan.included.includes(f.label);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: `1px solid ${plan.highlight ? "rgba(255,255,255,0.08)" : "#eef2ee"}` }}>
                          <span style={{ fontSize: "13px", flexShrink: 0, color: inc ? "#1a7a3a" : (plan.highlight ? "rgba(255,255,255,0.2)" : "#d0e8d4") }}>
                            {inc ? "✓" : "—"}
                          </span>
                          <span style={{ fontSize: "13px", flex: 1, color: inc ? (plan.highlight ? "white" : "#0d1f0e") : (plan.highlight ? "rgba(255,255,255,0.3)" : "#9ab09c") }}>
                            {f.label}
                          </span>
                          {inc && f.note && (
                            <span style={{ fontSize: "11px", fontWeight: "600", color: plan.highlight ? "rgba(255,255,255,0.5)" : "#4a6b4c", flexShrink: 0 }}>
                              {f.note}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TRUST STRIP */}
      <div className="pp-section" style={{ background: "#f8faf8", padding: "24px 48px", borderTop: "1px solid #eef2ee", borderBottom: "1px solid #eef2ee" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
          {["✓ Cancel anytime", "✓ 14-day money-back guarantee", "✓ No setup fees", "✓ Secured by Stripe"].map(item => (
            <span key={item} style={{ fontSize: "13px", color: "#4a6b4c", fontWeight: "500" }}>{item}</span>
          ))}
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="pp-section" style={{ background: "#ffffff", padding: "clamp(48px,6vw,80px) 48px", borderTop: "1px solid #eef2ee" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a7a3a", marginBottom: "10px" }}>Compare plans</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.8px" }}>Everything side by side</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eef2ee" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", color: "#4a6b4c", fontWeight: "600", width: "38%" }}>Feature</th>
                  {[
                    { name: "Starter", highlight: false },
                    { name: "Pro", highlight: true },
                    { name: "Agency", highlight: false },
                  ].map(col => (
                    <th key={col.name} style={{ textAlign: "center", padding: "12px 16px", color: col.highlight ? "#1a7a3a" : "#0d1f0e", fontWeight: "700", background: col.highlight ? "#eef8f0" : "transparent", borderRadius: col.highlight ? "8px 8px 0 0" : "0" }}>{col.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "SEO Audit",                   values: ["5 / mo",        "10 / mo",          "Unlimited"] },
                  { label: "AI Visibility Audit",         values: ["5 / mo",        "10 / mo",          "Unlimited"] },
                  { label: "AI Visibility Check",         values: [false,            "Max 7 queries",    "Unlimited"] },
                  { label: "AI Query Check",              values: [false,            false,              "Unlimited"] },
                  { label: "Description Generator",       values: ["20 / mo",       "100 / mo",         "Unlimited"] },
                  { label: "Search Console integration",  values: [false,            false,              true] },
                  { label: "URLs tracked",                values: ["1",             "3",                "Unlimited"] },
                  { label: "Team seats",                  values: ["1",             "3",                "10"] },
                  { label: "Support",                     values: ["Email",         "Priority email",   "Priority + onboarding"] },
                  { label: "Monthly price",               values: PLANS.map(p => `€${yearly ? p.yearlyMonthly : p.monthlyPrice}/mo`) },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eef2ee", background: i % 2 === 0 ? "transparent" : "#fafcfa" }}>
                    <td style={{ padding: "12px 16px", color: "#4a6b4c", fontWeight: "500" }}>{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} style={{ textAlign: "center", padding: "12px 16px", background: j === 1 ? "rgba(234,248,240,0.4)" : "transparent" }}>
                        {val === true ? <span style={{ color: "#1a7a3a", fontWeight: "700" }}>✓</span>
                          : val === false ? <span style={{ color: "#d0e8d4" }}>—</span>
                          : <span style={{ color: "#0d1f0e", fontWeight: "500" }}>{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="pp-section" style={{ background: "#f8faf8", padding: "clamp(48px,6vw,80px) 48px", borderTop: "1px solid #eef2ee" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a7a3a", marginBottom: "10px" }}>FAQ</p>
            <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.8px" }}>Common questions</h2>
          </div>
          <div style={{ borderTop: "1px solid #eef2ee" }}>
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pp-section" style={{ background: "#0d1f0e", padding: "clamp(64px,8vw,112px) 48px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: "800", color: "white", letterSpacing: "-1.5px", marginBottom: "16px" }}>
          Start free. <span style={{ color: "#6fcf8a" }}>Cancel anytime.</span>
        </h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", marginBottom: "36px", lineHeight: "1.6" }}>14-day free trial on any plan. No credit card required.</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <div onClick={() => trackEvent("sign_up_click", { location: "pricing_page_cta" })}>
            <SignUpButton mode="modal">
              <button style={{ background: "#1a7a3a", color: "white", border: "none", padding: "15px 36px", borderRadius: "10px", fontFamily: "'Roboto', sans-serif", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
                Get started free →
              </button>
            </SignUpButton>
          </div>
          <SignInButton mode="modal">
            <button style={{ background: "none", border: "2px solid rgba(255,255,255,0.2)", color: "white", padding: "15px 32px", borderRadius: "10px", fontFamily: "'Roboto', sans-serif", fontSize: "16px", fontWeight: "500", cursor: "pointer" }}>Sign in</button>
          </SignInButton>
        </div>
      </div>


    </PageLayout>
  );
}
