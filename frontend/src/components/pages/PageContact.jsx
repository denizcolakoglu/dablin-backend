import { useState } from "react";
import PageLayout from "./PageLayout";
import { trackEvent } from "../../analytics";

const TOPICS = [
  "General question",
  "Account or billing",
  "Technical issue",
  "Feature request",
  "Partnership",
  "Other",
];

export default function PageContact() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", topic: TOPICS[0], message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  function set(field, val) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  async function submit() {
    if (!form.firstName || !form.email || !form.message) return;
    setStatus("sending");
    trackEvent("contact_form_submit", { topic: form.topic });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <PageLayout activePath="/contact">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ct-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .ct-field label { font-size: 13px; font-weight: 600; color: #0d1f0e; }
        .ct-field input, .ct-field select, .ct-field textarea {
          border: 1.5px solid #eef2ee; border-radius: 9px; padding: 11px 14px;
          font-size: 14px; font-family: 'Roboto', sans-serif; color: #0d1f0e;
          outline: none; background: white; transition: border-color 0.2s;
          width: 100%;
        }
        .ct-field input:focus, .ct-field select:focus, .ct-field textarea:focus { border-color: #1a7a3a; }
        .ct-field textarea { resize: vertical; min-height: 130px; }
        .ct-field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234a6b4c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; background-color: white;
        }
        .ct-btn { width: 100%; background: #1a7a3a; color: white; border: none; padding: 14px; border-radius: 10px; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .ct-btn:hover:not(:disabled) { background: #2d9a4e; transform: translateY(-1px); }
        .ct-btn:disabled { opacity: 0.6; cursor: default; }
        @media (max-width: 900px) {
          .ct-hero { flex-direction: column !important; }
          .ct-left { flex: none !important; width: 100% !important; }
        }
        @media (max-width: 600px) {
          .ct-hero { padding: 48px 20px !important; }
          .ct-name-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO / FORM ── */}
      <div className="ct-hero" style={{ background: '#eef8f0', backgroundImage: 'linear-gradient(rgba(26,122,58,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,58,0.06) 1px,transparent 1px)', backgroundSize: '36px 36px', padding: 'clamp(56px,7vw,96px) 56px', borderBottom: '1px solid #d0e8d4', display: 'flex', gap: '72px', alignItems: 'flex-start' }}>

        {/* Left */}
        <div className="ct-left" style={{ flex: '0 0 320px' }}>
          <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(44px,5vw,64px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-2.5px', color: '#0d1f0e', marginBottom: '20px' }}>
            Let's<br /><span style={{ color: '#1a7a3a' }}>talk.</span>
          </h1>
          <p style={{ fontSize: '17px', color: '#4a6b4c', fontWeight: '300', lineHeight: '1.65', marginBottom: '36px' }}>
            Have a question about Dablin, need help with your account, or want to give feedback? We read every message.
          </p>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '38px', height: '38px', background: 'white', border: '1px solid #d0e8d4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px', color: '#1a7a3a' }}>✉</div>
            <div>
              <div style={{ fontSize: '12px', color: '#4a6b4c', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Email</div>
              <a href="mailto:hello@dablin.co" style={{ fontSize: '15px', color: '#0d1f0e', fontWeight: '500', textDecoration: 'none' }}>hello@dablin.co</a>
            </div>
          </div>

          {/* LinkedIn */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', background: 'white', border: '1px solid #d0e8d4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', color: '#1a7a3a', fontWeight: '700' }}>in</div>
            <div>
              <div style={{ fontSize: '12px', color: '#4a6b4c', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>LinkedIn</div>
              <a href="https://www.linkedin.com/company/dablin" target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px', color: '#0d1f0e', fontWeight: '500', textDecoration: 'none' }}>Dablin on LinkedIn</a>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div style={{ flex: 1, background: 'white', border: '1px solid #d0e8d4', borderRadius: '20px', padding: '36px', boxShadow: '0 8px 32px rgba(26,122,58,0.08)' }}>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '24px', fontWeight: '800', color: '#0d1f0e', marginBottom: '10px' }}>Message sent!</div>
              <div style={{ fontSize: '15px', color: '#4a6b4c', lineHeight: '1.6' }}>Thanks for reaching out. We'll get back to you at <strong>{form.email}</strong> within 1 business day.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0d1f0e', marginBottom: '6px' }}>Send us a message</div>
              <div style={{ fontSize: '13px', color: '#4a6b4c', marginBottom: '28px' }}>We'll get back to you within 1 business day.</div>

              <div className="ct-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="ct-field" style={{ margin: 0 }}>
                  <label>First name</label>
                  <input placeholder="First name" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                </div>
                <div className="ct-field" style={{ margin: 0 }}>
                  <label>Last name</label>
                  <input placeholder="Last name" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>

              <div className="ct-field">
                <label>Email</label>
                <input type="email" placeholder="hello@yoursite.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>

              <div className="ct-field">
                <label>Topic</label>
                <select value={form.topic} onChange={e => set('topic', e.target.value)}>
                  {TOPICS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="ct-field">
                <label>Message</label>
                <textarea placeholder="Tell us what's on your mind..." value={form.message} onChange={e => set('message', e.target.value)} />
              </div>

              {status === 'error' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c0392b', marginBottom: '14px' }}>
                  Something went wrong. Please try emailing us directly at hello@dablin.co
                </div>
              )}

              <button className="ct-btn" disabled={status === 'sending'} onClick={submit}>
                {status === 'sending' ? 'Sending...' : 'Send message →'}
              </button>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
