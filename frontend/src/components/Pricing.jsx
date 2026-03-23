import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { trackEvent } from "../analytics";

const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 20,
    price: "$3",
    perCredit: "$0.15",
    desc: "Perfect for trying it out",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 100,
    price: "$12",
    perCredit: "$0.12",
    desc: "Best for regular sellers",
    highlight: true,
  },
  {
    id: "studio",
    name: "Studio",
    credits: 500,
    price: "$49",
    perCredit: "$0.098",
    desc: "Best for large catalogs",
    highlight: false,
  },
];

export default function Pricing({ setPage }) {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("usage");
  const [loading, setLoading] = useState(null);
  const [credits, setCredits] = useState(null);
  const [usage, setUsage] = useState([]);
  const [showDaily, setShowDaily] = useState(true);
  const [usageType, setUsageType] = useState('visibility_check');

  useEffect(() => {
    trackEvent('pricing_viewed');
    fetchCredits();
  }, []);

  useEffect(() => {
    fetchUsage(usageType);
  }, [usageType]);

  async function fetchCredits() {
    try {
      const token = await getToken();
      const res = await fetch("https://dablin-backend-production.up.railway.app/api/credits", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCredits(data.credits);
    } catch(e) {}
  }

  async function fetchUsage(type) {
    try {
      const token = await getToken();
      const res = await fetch(`https://dablin-backend-production.up.railway.app/api/usage/daily?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsage(data.days || []);
    } catch(e) {}
  }

  async function handleBuy(packageId, price) {
    trackEvent('purchase_click', { package: packageId, price });
    setLoading(packageId);
    try {
      const token = await getToken();
      const res = await fetch("https://dablin-backend-production.up.railway.app/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error("Checkout failed", e);
    } finally {
      setLoading(null);
    }
  }

  const totalUsed = usage.reduce((s, d) => s + d.count, 0);
  const maxUsage = Math.max(...usage.map(d => d.count), 1);

  return (
    <div className="pricing-page">
      <style>{`
        .credits-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 2px solid #d4e8d6; }
        .credits-tab {
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          color: #5a7a5e;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        .credits-tab.active { color: #2d7a3a; border-bottom-color: #2d7a3a; }
        .credits-tab:hover { color: #2d7a3a; }

        .usage-card {
          background: #f7fbf7;
          border: 1px solid #d4e8d6;
          border-radius: 14px;
          padding: 24px 28px;
          margin-bottom: 16px;
        }
        .usage-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .usage-card-left { display: flex; align-items: center; gap: 20px; }
        .credits-big { font-size: 48px; font-weight: 800; color: #2d7a3a; line-height: 1; }
        .credits-big-label { font-size: 13px; color: #5a7a5e; margin-top: 4px; }
        .credits-low-warning { font-size: 12px; color: #e08a00; font-weight: 600; margin-top: 6px; }
        .buy-more-btn {
          background: #2d7a3a;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .buy-more-btn:hover { background: #3d9e4e; }

        .monthly-summary {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #d4e8d6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .monthly-summary-left { font-size: 14px; color: #1c2e1e; }
        .monthly-summary-left strong { color: #2d7a3a; }
        .toggle-daily-btn {
          background: none;
          border: 1px solid #d4e8d6;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #5a7a5e;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-daily-btn:hover { border-color: #2d7a3a; color: #2d7a3a; }

        .daily-chart {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #d4e8d6;
        }
        .daily-chart-title { font-size: 12px; font-weight: 600; color: #5a7a5e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
        .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 70px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
        .bar { width: 100%; background: #2d7a3a; border-radius: 4px 4px 0 0; min-height: 3px; transition: height 0.3s ease; }
        .bar-day { font-size: 10px; color: #5a7a5e; white-space: nowrap; }
        .bar-count { font-size: 10px; font-weight: 700; color: #2d7a3a; }

        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .pricing-card {
          background: white;
          border: 1.5px solid #d4e8d6;
          border-radius: 14px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }
        .pricing-card.highlighted { border-color: #2d7a3a; box-shadow: 0 0 0 3px #e8f5ea; }
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #2d7a3a;
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 12px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .pkg-name { font-size: 16px; font-weight: 700; color: #0f1a10; }
        .pkg-price { font-size: 32px; font-weight: 800; color: #2d7a3a; line-height: 1; }
        .pkg-credits { font-size: 13px; color: #5a7a5e; }
        .pkg-per { font-size: 12px; color: #5a7a5e; }
        .pkg-desc { font-size: 13px; color: #1c2e1e; margin-top: 4px; flex: 1; }
        .btn-buy {
          margin-top: 8px;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-align: center;
        }
        .btn-buy.btn-primary { background: #2d7a3a; color: white; }
        .btn-buy.btn-primary:hover { background: #3d9e4e; }
        .btn-buy.btn-outline { background: white; color: #2d7a3a; border: 1.5px solid #2d7a3a; }
        .btn-buy.btn-outline:hover { background: #f7fbf7; }
        .btn-buy:disabled { opacity: 0.6; cursor: not-allowed; }
        .pricing-note { font-size: 12px; color: #5a7a5e; text-align: center; margin-top: 8px; }
      `}</style>

      <div className="credits-tabs">
        <button className={`credits-tab ${activeTab === "usage" ? "active" : ""}`} onClick={() => setActiveTab("usage")}>
          My Credits
        </button>
        <button className={`credits-tab ${activeTab === "buy" ? "active" : ""}`} onClick={() => setActiveTab("buy")}>
          Buy Credits
        </button>
      </div>

      {activeTab === "usage" && (
        <div className="usage-card">
          <div className="usage-card-header">
            <div className="usage-card-left">
              <div>
                <div className="credits-big">{credits === null ? "—" : credits}</div>
                <div className="credits-big-label">credits remaining</div>
                {credits !== null && credits <= 5 && (
                  <div className="credits-low-warning">⚠ Running low</div>
                )}
              </div>
            </div>
            <button className="buy-more-btn" onClick={() => setActiveTab("buy")}>Buy more</button>
          </div>

          <div className="monthly-summary">
            <div className="monthly-summary-left">
              Last 7 days: <strong>{totalUsed} {
                usageType === 'visibility_check' ? 'visibility checks' :
                usageType === 'ai_audit' ? 'AI audits' :
                usageType === 'seo_audit' ? 'SEO audits' : 'descriptions'
              }</strong>
            </div>
          </div>

          {/* Tool radio buttons */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { value: 'visibility_check', label: 'AI Visibility Check' },
              { value: 'ai_audit',         label: 'AI Visibility Audit' },
              { value: 'seo_audit',        label: 'SEO Audit' },
              { value: 'generate',         label: 'Generate' },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '7px 14px', border: `1px solid ${usageType === opt.value ? '#2d7a3a' : '#d4e8d6'}`, borderRadius: '100px', background: usageType === opt.value ? '#e8f5ea' : 'white', transition: 'all 0.2s' }}>
                <input type="radio" name="usageType" value={opt.value} checked={usageType === opt.value}
                  onChange={() => setUsageType(opt.value)} style={{ display: 'none' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: usageType === opt.value ? '#2d7a3a' : '#5a7a5e' }}>{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="daily-chart">
            <div className="daily-chart-title">Daily usage — last 7 days</div>
            <div className="bar-chart">
              {usage.map((d, i) => {
                const heightPct = (d.count / maxUsage) * 100;
                const label = new Date(d.day + "T12:00:00").toLocaleDateString("en", { weekday: "short" });
                return (
                  <div className="bar-col" key={i}>
                    {d.count > 0 && <div className="bar-count">{d.count}</div>}
                    <div className="bar" style={{ height: `${Math.max(heightPct, 4)}%`, opacity: d.count === 0 ? 0.15 : 1 }} />
                    <div className="bar-day">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "buy" && (
        <>
          <p className="page-sub">Credits never expire. Pay only for what you use.</p>
          <div className="pricing-grid">
            {PACKAGES.map(pkg => (
              <div className={`pricing-card ${pkg.highlight ? "highlighted" : ""}`} key={pkg.id}>
                {pkg.highlight && <div className="popular-badge">Most popular</div>}
                <div className="pkg-name">{pkg.name}</div>
                <div className="pkg-price">{pkg.price}</div>
                <div className="pkg-credits">{pkg.credits} credits</div>
                <div className="pkg-per">{pkg.perCredit} per description</div>
                <div className="pkg-desc">{pkg.desc}</div>
                <button
                  className={`btn-buy ${pkg.highlight ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleBuy(pkg.id, pkg.price)}
                  disabled={loading === pkg.id}
                >
                  {loading === pkg.id ? "Redirecting..." : `Buy ${pkg.name}`}
                </button>
              </div>
            ))}
          </div>
          <div className="pricing-note">
            Payments are processed securely by Stripe. Credits are added instantly after payment.
          </div>
        </>
      )}
    </div>
  );
}
