import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { trackEvent } from "../analytics";

const BASE = "https://dablin-backend-production.up.railway.app";

const FEATURE_PRICES = {
  visibility_check: 0.35,
  ai_audit:         0.20,
  seo_audit:        0.10,
  generate:         0.05,
};

const FEATURE_LABELS = {
  visibility_check: 'AI Visibility Check',
  ai_audit:         'AI Visibility Audit',
  seo_audit:        'SEO Audit',
  generate:         'Generate Description',
};

export default function Pricing({ setPage }) {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("balance");
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState(null);
  const [usage, setUsage] = useState([]);
  const [usageType, setUsageType] = useState('visibility_check');

  useEffect(() => {
    trackEvent('pricing_viewed');
    fetchBalance();
    fetchUsage('visibility_check');
  }, []);

  async function fetchBalance() {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/balance`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setBalance(parseFloat(data.balance || 0));
    } catch(e) {}
  }

  async function fetchUsage(type) {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/usage/daily?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsage(data.days || []);
    } catch(e) {}
  }

  async function handleTopUp() {
    const amt = parseFloat(amount);
    if (!amt || amt < 3 || amt > 50) {
      setAmountError('Enter an amount between €3 and €50');
      return;
    }
    setAmountError(null);
    trackEvent('purchase_click', { amount: amt });
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch(e) {
      console.error('Checkout failed', e);
    } finally {
      setLoading(false);
    }
  }

  const totalUsed = usage.reduce((s, d) => s + d.count, 0);
  const maxUsage = Math.max(...usage.map(d => d.count), 1);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px', fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Roboto+Condensed:wght@700;800&display=swap');
        .pr-tab { padding:10px 24px; font-size:14px; font-weight:600; color:#5a7a5e; background:none; border:none; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s; font-family:'Roboto',sans-serif; }
        .pr-tab.active { color:#2d7a3a; border-bottom-color:#2d7a3a; }
        .pr-tab:hover { color:#2d7a3a; }
        .pr-input:focus { border-color:#2d7a3a !important; outline:none; }
        .pr-topup-btn { background:#2d7a3a; color:white; border:none; padding:11px 28px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Roboto',sans-serif; transition:background 0.2s; white-space:nowrap; }
        .pr-topup-btn:hover:not(:disabled) { background:#3d9e4e; }
        .pr-topup-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .pr-preset:hover { border-color:#2d7a3a !important; color:#2d7a3a !important; }
        .pr-usage-radio:hover { border-color:#2d7a3a !important; }
        .bar { background:#2d7a3a; border-radius:4px 4px 0 0; min-height:3px; transition:height 0.3s; }
      `}</style>

      {/* Tabs */}
      <div style={{ borderBottom:'2px solid #d4e8d6', display:'flex', marginBottom:'28px' }}>
        <button className={`pr-tab ${activeTab==='balance'?'active':''}`} onClick={() => setActiveTab('balance')}>My Balance</button>
        <button className={`pr-tab ${activeTab==='topup'?'active':''}`} onClick={() => setActiveTab('topup')}>Top Up</button>
      </div>

      {/* BALANCE TAB */}
      {activeTab === 'balance' && (
        <>
          {/* Balance card */}
          <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'28px', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div>
                <div style={{ fontSize:'13px', color:'#5a7a5e', marginBottom:'6px' }}>Available balance</div>
                <div style={{ fontFamily:"'Roboto Condensed',sans-serif", fontSize:'48px', fontWeight:'800', color:'#2d7a3a', lineHeight:1 }}>
                  €{balance === null ? '—' : balance.toFixed(2)}
                </div>
                {balance !== null && balance < 0.35 && (
                  <div style={{ fontSize:'12px', color:'#e08a00', fontWeight:'600', marginTop:'6px' }}>⚠ Low balance — top up to continue</div>
                )}
              </div>
              <button className="pr-topup-btn" onClick={() => setActiveTab('topup')}>Add balance</button>
            </div>

            {/* What you can run */}
            <div style={{ borderTop:'1px solid #e8f5ea', paddingTop:'20px' }}>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'#5a7a5e', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'14px' }}>What you can run with this balance</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px' }}>
                {Object.entries(FEATURE_PRICES).map(([key, price]) => {
                  const runs = balance !== null ? Math.floor(balance / price) : 0;
                  return (
                    <div key={key} style={{ background:'#f7fbf7', border:'1px solid #d4e8d6', borderRadius:'10px', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'13px', color:'#1c2e1e', fontWeight:'500' }}>{FEATURE_LABELS[key]}</span>
                      <span style={{ fontSize:'13px', fontWeight:'700', color: runs > 0 ? '#2d7a3a' : '#dc2626' }}>{runs}×</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Usage chart */}
          <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f1a10' }}>
                Last 7 days: <span style={{ color:'#2d7a3a' }}>{totalUsed} {FEATURE_LABELS[usageType]?.toLowerCase()}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
              {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                <label key={key} style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', padding:'6px 14px', border:`1px solid ${usageType===key?'#2d7a3a':'#d4e8d6'}`, borderRadius:'100px', background:usageType===key?'#e8f5ea':'white', transition:'all 0.2s' }}>
                  <input type="radio" name="usageType" value={key} checked={usageType===key} onChange={() => { setUsageType(key); fetchUsage(key); }} style={{ display:'none' }} />
                  <span style={{ fontSize:'12px', fontWeight:'600', color:usageType===key?'#2d7a3a':'#5a7a5e' }}>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:'70px' }}>
              {usage.map((d, i) => {
                const heightPct = (d.count / maxUsage) * 100;
                const label = new Date(d.day + 'T12:00:00').toLocaleDateString('en', { weekday:'short' });
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', height:'100%', justifyContent:'flex-end' }}>
                    {d.count > 0 && <div style={{ fontSize:'10px', fontWeight:'700', color:'#2d7a3a' }}>{d.count}</div>}
                    <div className="bar" style={{ width:'100%', height:`${Math.max(heightPct, 4)}%`, opacity:d.count===0?0.15:1 }} />
                    <div style={{ fontSize:'10px', color:'#5a7a5e', whiteSpace:'nowrap' }}>{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* TOP UP TAB */}
      {activeTab === 'topup' && (
        <div style={{ background:'white', border:'1px solid #d4e8d6', borderRadius:'14px', padding:'28px' }}>
          <div style={{ fontSize:'14px', fontWeight:'700', color:'#0f1a10', marginBottom:'6px' }}>Add balance to your account</div>
          <div style={{ fontSize:'13px', color:'#5a7a5e', marginBottom:'24px' }}>Minimum €3 · Maximum €50 · Secure payment via Stripe</div>

          {/* Preset amounts */}
          <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
            {['5', '10', '20', '50'].map(preset => (
              <button key={preset} className="pr-preset"
                onClick={() => setAmount(preset)}
                style={{ padding:'10px 20px', border:`1px solid ${amount===preset?'#2d7a3a':'#d4e8d6'}`, borderRadius:'8px', background:amount===preset?'#e8f5ea':'white', color:amount===preset?'#2d7a3a':'#1c2e1e', fontSize:'14px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s', fontFamily:"'Roboto',sans-serif" }}>
                €{preset}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'13px', fontWeight:'600', color:'#1c2e1e', display:'block', marginBottom:'8px' }}>Or enter a custom amount</label>
            <div style={{ display:'flex', gap:'10px' }}>
              <div style={{ position:'relative', flex:1 }}>
                <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', color:'#5a7a5e', fontWeight:'600' }}>€</span>
                <input
                  className="pr-input"
                  type="number" min="3" max="50" step="1"
                  placeholder="3 — 50"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setAmountError(null); }}
                  style={{ width:'100%', padding:'11px 14px 11px 28px', border:'1px solid #d4e8d6', borderRadius:'8px', fontSize:'14px', fontFamily:"'Roboto',sans-serif", color:'#1c2e1e', boxSizing:'border-box' }}
                />
              </div>
              <button className="pr-topup-btn" onClick={handleTopUp} disabled={loading}>
                {loading ? 'Redirecting…' : 'Pay with Stripe'}
              </button>
            </div>
            {amountError && <div style={{ fontSize:'12px', color:'#c0392b', marginTop:'8px' }}>{amountError}</div>}
          </div>

          {/* What you get */}
          {amount && parseFloat(amount) >= 3 && (
            <div style={{ background:'#f7fbf7', border:'1px solid #d4e8d6', borderRadius:'10px', padding:'16px', marginTop:'20px' }}>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'#5a7a5e', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'12px' }}>With €{parseFloat(amount).toFixed(0)} you can run</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {Object.entries(FEATURE_PRICES).map(([key, price]) => (
                  <div key={key} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                    <span style={{ color:'#5a7a5e' }}>{FEATURE_LABELS[key]}</span>
                    <span style={{ fontWeight:'700', color:'#2d7a3a' }}>{Math.floor(parseFloat(amount) / price)}× <span style={{ color:'#9ab09c', fontWeight:'400'}}>@ €{price}/run</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop:'20px', fontSize:'12px', color:'#9ab09c', textAlign:'center' }}>
            Balance never expires · Payments secured by Stripe
          </div>
        </div>
      )}

    </div>
  );
}
