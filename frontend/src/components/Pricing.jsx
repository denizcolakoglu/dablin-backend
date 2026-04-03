import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { trackEvent } from "../analytics";

const BASE = "https://dablin-backend-production.up.railway.app";

// ── PLAN CONFIG ───────────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    desc: "For solo founders getting SEO foundations right.",
    monthlyPrice: 9,
    color: "#4a6b4c",
    highlight: false,
    features: [
      { label: "SEO Audit", included: true, note: "5 / month" },
      { label: "AI Visibility Audit", included: true, note: "5 / month" },
      { label: "AI Visibility Check", included: false },
      { label: "AI Query Check", included: false },
      { label: "Description Generator", included: true, note: "20 / month" },
      { label: "Search Console integration", included: false },
      { label: "URLs tracked", included: true, note: "1 URL" },
      { label: "Team seats", included: true, note: "1 seat" },
      { label: "Email support", included: true },
    ],
    cta: "Get Starter",
    stripePriceMonthly: null,
    stripePriceYearly: null,
  },
  {
    id: "pro",
    name: "Pro",
    desc: "For brands serious about AI and Google visibility.",
    monthlyPrice: 19,
    color: "#1a7a3a",
    highlight: true,
    badge: "Most popular",
    features: [
      { label: "SEO Audit", included: true, note: "10 / month" },
      { label: "AI Visibility Audit", included: true, note: "10 / month" },
      { label: "AI Visibility Check", included: true, note: "Max 7 queries" },
      { label: "AI Query Check", included: false },
      { label: "Description Generator", included: true, note: "100 / month" },
      { label: "Search Console integration", included: false },
      { label: "URLs tracked", included: true, note: "3 URLs" },
      { label: "Team seats", included: true, note: "3 seats" },
      { label: "Priority email support", included: true },
    ],
    cta: "Get Pro",
    stripePriceMonthly: null,
    stripePriceYearly: null,
  },
  {
    id: "agency",
    name: "Agency",
    desc: "For agencies managing multiple brands and clients.",
    monthlyPrice: 49,
    color: "#0d1f0e",
    highlight: false,
    features: [
      { label: "SEO Audit", included: true, note: "Unlimited" },
      { label: "AI Visibility Audit", included: true, note: "Unlimited" },
      { label: "AI Visibility Check", included: true, note: "Unlimited" },
      { label: "AI Query Check", included: true, note: "Unlimited" },
      { label: "Description Generator", included: true, note: "Unlimited" },
      { label: "Search Console integration", included: true },
      { label: "URLs tracked", included: true, note: "Unlimited" },
      { label: "Team seats", included: true, note: "10 seats" },
      { label: "Priority support + onboarding", included: true },
    ],
    cta: "Get Agency",
    stripePriceMonthly: null,
    stripePriceYearly: null,
  },
];

const YEARLY_MONTHS = 9; // pay 9, get 12

function yearlyPrice(monthly) {
  return Math.round(monthly * YEARLY_MONTHS / 12 * 100) / 100;
}

function yearlyTotal(monthly) {
  return monthly * YEARLY_MONTHS;
}

// ── FEATURE ROW ───────────────────────────────────────────────
function FeatureRow({ feature, highlight }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "9px 0",
      borderBottom: "1px solid " + (highlight ? "rgba(255,255,255,0.08)" : "#eef2ee"),
    }}>
      <span style={{
        fontSize: "14px", flexShrink: 0,
        color: feature.included ? "#1a7a3a" : "#d0e8d4",
      }}>
        {feature.included ? "✓" : "—"}
      </span>
      <span style={{
        fontSize: "13px",
        color: feature.included
          ? (highlight ? "white" : "#0d1f0e")
          : (highlight ? "rgba(255,255,255,0.35)" : "#9ab09c"),
        flex: 1,
        textDecoration: feature.included ? "none" : "none",
      }}>
        {feature.label}
      </span>
      {feature.included && feature.note && (
        <span style={{
          fontSize: "11px", fontWeight: "600",
          color: highlight ? "rgba(255,255,255,0.55)" : "#4a6b4c",
          flexShrink: 0,
        }}>
          {feature.note}
        </span>
      )}
    </div>
  );
}

// ── PLAN CARD ─────────────────────────────────────────────────
function PlanCard({ plan, yearly, onSelect, currentPlan }) {
  const isHighlight = plan.highlight;
  const price = yearly ? yearlyPrice(plan.monthlyPrice) : plan.monthlyPrice;
  const saving = yearly ? (plan.monthlyPrice * 12 - yearlyTotal(plan.monthlyPrice)) : 0;
  const isCurrent = currentPlan === plan.id;

  return (
    <div style={{
      background: isHighlight ? "#0d1f0e" : "white",
      border: isHighlight ? "2px solid #1a7a3a" : "1px solid #eef2ee",
      borderRadius: "16px",
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      boxShadow: isHighlight ? "0 8px 32px rgba(26,122,58,0.2)" : "none",
      transition: "transform 0.2s",
    }}
      onMouseEnter={e => !isHighlight && (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => !isHighlight && (e.currentTarget.style.transform = "none")}
    >
      {/* Badge */}
      {plan.badge && (
        <div style={{
          position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)",
          background: "#1a7a3a", color: "white",
          borderRadius: "20px", padding: "4px 16px",
          fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}>
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: isHighlight ? "#6fcf8a" : plan.color, marginBottom: "6px" }}>
          {plan.name}
        </div>
        <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "42px", fontWeight: "800", color: isHighlight ? "white" : "#0d1f0e", lineHeight: 1, marginBottom: "4px" }}>
          €{price % 1 === 0 ? price : price.toFixed(2)}
          <span style={{ fontSize: "15px", fontWeight: "500", color: isHighlight ? "rgba(255,255,255,0.5)" : "#4a6b4c" }}>/mo</span>
        </div>
        {yearly && (
          <div style={{ fontSize: "12px", color: isHighlight ? "rgba(255,255,255,0.5)" : "#4a6b4c", marginBottom: "4px" }}>
            €{yearlyTotal(plan.monthlyPrice)} billed yearly
            <span style={{ marginLeft: "6px", background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "1px 7px", fontSize: "11px", fontWeight: "700" }}>
              Save €{saving}
            </span>
          </div>
        )}
        <div style={{ fontSize: "13px", color: isHighlight ? "rgba(255,255,255,0.5)" : "#4a6b4c", lineHeight: "1.5", marginTop: "8px" }}>
          {plan.desc}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan)}
        style={{
          width: "100%", padding: "13px", borderRadius: "9px",
          border: isHighlight ? "none" : "2px solid #1a7a3a",
          background: isHighlight ? "#1a7a3a" : "transparent",
          color: isHighlight ? "white" : "#1a7a3a",
          fontSize: "14px", fontWeight: "700", cursor: "pointer",
          fontFamily: "'Roboto', sans-serif", transition: "all 0.2s",
          marginBottom: "24px",
          opacity: isCurrent ? 0.6 : 1,
        }}
        onMouseEnter={e => {
          if (!isCurrent) e.currentTarget.style.background = isHighlight ? "#2d9a4e" : "#1a7a3a";
          if (!isCurrent && !isHighlight) e.currentTarget.style.color = "white";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isHighlight ? "#1a7a3a" : "transparent";
          if (!isHighlight) e.currentTarget.style.color = "#1a7a3a";
        }}
        disabled={isCurrent}
      >
        {isCurrent ? "Current plan" : plan.cta}
      </button>

      {/* Features */}
      <div style={{ flex: 1 }}>
        {plan.features.map((f, i) => (
          <FeatureRow key={i} feature={f} highlight={isHighlight} />
        ))}
      </div>
    </div>
  );
}

// ── COMPARE TABLE ─────────────────────────────────────────────
function CompareTable({ yearly }) {
  const rows = [
    { label: "SEO Audit", values: ["5 / mo", "10 / mo", "Unlimited"] },
    { label: "AI Visibility Audit", values: ["5 / mo", "10 / mo", "Unlimited"] },
    { label: "AI Visibility Check", values: [false, "Max 7 queries", true] },
    { label: "AI Query Check", values: [false, false, true] },
    { label: "Description Generator", values: ["20 / mo", "100 / mo", "Unlimited"] },
    { label: "Search Console integration", values: [false, false, true] },
    { label: "URLs tracked", values: ["1", "3", "Unlimited"] },
    { label: "Team seats", values: ["1", "3", "10"] },
    { label: "Support", values: ["Email", "Priority email", "Priority + onboarding"] },
    { label: "Monthly price", values: PLANS.map(p => `€${yearly ? yearlyPrice(p.monthlyPrice) : p.monthlyPrice}/mo`) },
  ];

  return (
    <div style={{ overflowX: "auto", marginTop: "48px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a7a3a", marginBottom: "8px" }}>Full comparison</p>
        <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "28px", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-0.5px" }}>Everything side by side</h3>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #eef2ee" }}>
            <th style={{ textAlign: "left", padding: "12px 16px", color: "#4a6b4c", fontWeight: "600", width: "35%" }}>Feature</th>
            {PLANS.map(p => (
              <th key={p.id} style={{ textAlign: "center", padding: "12px 16px", color: p.highlight ? "#1a7a3a" : "#0d1f0e", fontWeight: "700", background: p.highlight ? "#eef8f0" : "transparent", borderRadius: p.highlight ? "8px 8px 0 0" : "0" }}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #eef2ee", background: i % 2 === 0 ? "transparent" : "#fafcfa" }}>
              <td style={{ padding: "12px 16px", color: "#4a6b4c", fontWeight: "500" }}>{row.label}</td>
              {row.values.map((val, j) => (
                <td key={j} style={{ textAlign: "center", padding: "12px 16px", background: PLANS[j].highlight ? "rgba(234,248,240,0.4)" : "transparent" }}>
                  {val === true
                    ? <span style={{ color: "#1a7a3a", fontWeight: "700" }}>✓</span>
                    : val === false
                    ? <span style={{ color: "#d0e8d4" }}>—</span>
                    : <span style={{ color: "#0d1f0e", fontWeight: "500" }}>{val}</span>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function Pricing({ setPage }) {
  const { getToken } = useAuth();
  const [yearly, setYearly]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    trackEvent("pricing_viewed");
    fetchPlan();
  }, []);

  async function fetchPlan() {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/plan`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCurrentPlan(data.plan || "free");
    } catch {}
  }

  async function handleSelect(plan) {
    if (currentPlan === plan.id) return;
    setCheckoutError(null);
    trackEvent("subscription_click", { plan: plan.id, billing: yearly ? "yearly" : "monthly" });
    setLoading(plan.id);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan.id, billing: yearly ? "yearly" : "monthly" }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("Checkout error:", data);
        setCheckoutError(data.error || "Checkout failed. Please try again.");
      }
    } catch (e) {
      console.error("Subscribe failed", e);
      setCheckoutError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a7a3a", marginBottom: "10px" }}>Pricing</p>
        <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: "800", color: "#0d1f0e", letterSpacing: "-1px", marginBottom: "12px" }}>
          Simple, transparent pricing
        </h2>
        <p style={{ fontSize: "15px", color: "#4a6b4c", maxWidth: "440px", margin: "0 auto 28px", lineHeight: "1.6" }}>
          Everything you need to be found on Google and AI — no credits, no surprises.
        </p>

        {/* Billing toggle */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "#f8faf8", border: "1px solid #eef2ee", borderRadius: "100px", padding: "4px 4px 4px 16px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500", color: yearly ? "#4a6b4c" : "#0d1f0e" }}>Monthly</span>
          <button
            onClick={() => setYearly(y => !y)}
            style={{
              width: "44px", height: "24px", borderRadius: "100px",
              background: yearly ? "#1a7a3a" : "#d0e8d4",
              border: "none", cursor: "pointer", position: "relative",
              transition: "background 0.2s",
            }}
          >
            <span style={{
              position: "absolute", top: "3px",
              left: yearly ? "23px" : "3px",
              width: "18px", height: "18px",
              background: "white", borderRadius: "50%",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingRight: "4px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500", color: yearly ? "#0d1f0e" : "#4a6b4c" }}>Yearly</span>
            <span style={{ background: "#eef8f0", color: "#1a7a3a", border: "1px solid #d0e8d4", borderRadius: "20px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}>
              3 months free
            </span>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", alignItems: "start" }}>
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            yearly={yearly}
            onSelect={handleSelect}
            currentPlan={currentPlan}
          />
        ))}
      </div>

      {/* Money back + FAQ strip */}
      <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "28px", flexWrap: "wrap" }}>
        {["✓ Cancel anytime", "✓ No setup fees", "✓ Secured by Stripe", "✓ Switch plans anytime"].map(item => (
          <span key={item} style={{ fontSize: "13px", color: "#4a6b4c", fontWeight: "500" }}>{item}</span>
        ))}
      </div>

      {/* Compare toggle */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <button
          onClick={() => setShowCompare(c => !c)}
          style={{ background: "none", border: "none", color: "#1a7a3a", fontSize: "13px", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}
        >
          {showCompare ? "Hide comparison" : "Compare all features →"}
        </button>
      </div>

      {showCompare && <CompareTable yearly={yearly} />}

      {checkoutError && (
        <div style={{ marginTop: "20px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "14px 18px", fontSize: "13px", color: "#c0392b" }}>
          {checkoutError}
        </div>
      )}

    </div>
  );
}
