import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const BASE = "https://dablin-backend-production.up.railway.app";

export default function ShareButton({ type, data }) {
  const { getToken } = useAuth();
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  async function share() {
    setState("loading");
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setShareUrl(json.url);
      setState("done");
      // Auto-copy
      navigator.clipboard.writeText(json.url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'white', border: '1px solid #d4e8d6',
    color: state === 'done' ? '#2d7a3a' : '#1c2e1e',
    padding: '10px 20px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: "'Roboto', sans-serif",
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      {state !== 'done' ? (
        <button
          style={btnStyle}
          onClick={share}
          disabled={state === 'loading'}
          onMouseOver={e => { if (state !== 'loading') e.currentTarget.style.background = '#f7fbf7'; }}
          onMouseOut={e => e.currentTarget.style.background = 'white'}
        >
          {state === 'loading' ? '⏳ Creating link…' : state === 'error' ? '✗ Failed, try again' : '🔗 Share results'}
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e8f5ea', border: '1px solid #c8e6cb', borderRadius: '8px', padding: '10px 16px' }}>
          <span style={{ fontSize: '13px', color: '#2d7a3a', fontWeight: '600' }}>✓ Link created</span>
          <input
            readOnly
            value={shareUrl}
            style={{ border: '1px solid #c8e6cb', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#1c2e1e', background: 'white', width: '240px', fontFamily: 'monospace' }}
            onClick={e => e.target.select()}
          />
          <button
            onClick={copyUrl}
            style={{ background: '#2d7a3a', color: 'white', border: 'none', padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Roboto', sans-serif", whiteSpace: 'nowrap' }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <span style={{ fontSize: '11px', color: '#5a7a5e' }}>Expires in 30 days</span>
        </div>
      )}
    </div>
  );
}
