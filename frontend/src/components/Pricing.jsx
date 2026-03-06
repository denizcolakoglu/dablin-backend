import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

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
  const [loading, setLoading] = useState(null);

  async function handleBuy(packageId) {
    setLoading(packageId);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      console.error("Checkout failed", e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="pricing-page">
      <h2 className="page-title">Buy Credits</h2>
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
              onClick={() => handleBuy(pkg.id)}
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
    </div>
  );
}
