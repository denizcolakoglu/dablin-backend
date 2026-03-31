import { useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { trackEvent } from "../../analytics";

const NAV_GROUPS = [
  {
    label: "AI Visibility",
    items: [
      { href: "/ai-visibility-audit", icon: "⌕", label: "AI Visibility Audit",  desc: "12 checks for AI engine discoverability" },
      { href: "/ai-visibility-check", icon: "◎", label: "AI Visibility Check",  desc: "See if ChatGPT, Gemini & Claude mention you" },
      { href: "/dashboard/query-check", icon: "↗", label: "AI Query Check",      desc: "Run custom queries across AI engines" },
    ],
  },
  {
    label: "SEO Expert",
    items: [
      { href: "/seo-audit",                    icon: "✓", label: "SEO Audit",               desc: "18-point SEO check with AI fixes" },
      { href: "/dashboard/search-console",     icon: "📊", label: "Google Search Console",   desc: "Index status, vitals and query data" },
      { href: "/dashboard",                    icon: "⊞", label: "SEO/GEO Dashboard",        desc: "Your full visibility kanban board" },
    ],
  },
];

const RESOURCES = [
  { href: "https://blog.dablin.co",                       icon: "✍", label: "Blog",            desc: "AI visibility, GEO and SEO guides", external: true },
  { href: "https://www.linkedin.com/company/dablin",      icon: "in", label: "Dablin on LinkedIn", desc: "Follow us for SEO & AI insights",   external: true },
  { href: "https://medium.com/dablin",                    icon: "M",  label: "Dablin on Medium",   desc: "In-depth articles and guides",      external: true },
];

function DropdownMenu({ group, activePath }) {
  const [open, setOpen] = useState(false);
  const isActive = group.items?.some(i => activePath === i.href);
  return (
    <div
      style={{ position:"relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button style={{
        fontSize:"15px", fontWeight: isActive ? "700" : "500",
        color: isActive ? "#1a7a3a" : "#2a3d2b",
        background:"none", border:"none", cursor:"pointer",
        display:"flex", alignItems:"center", gap:"5px", padding:"4px 0",
        fontFamily:"'Roboto',sans-serif",
      }}>
        {group.label}
        <span style={{ fontSize:"10px", color:"#9ab09c", marginTop:"1px" }}>▾</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 12px)", left:"50%", transform:"translateX(-50%)",
          background:"white", border:"1px solid #eef2ee", borderRadius:"14px",
          boxShadow:"0 8px 32px rgba(0,0,0,0.1)", padding:"8px", minWidth:"280px", zIndex:200,
        }}>
          {group.items.map(item => (
            <a key={item.href} href={item.href} style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"10px 12px", borderRadius:"9px", textDecoration:"none", transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background="#eef8f0"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <div>
                <div style={{ fontSize:"13px", fontWeight:"600", color:"#0d1f0e", marginBottom:"2px" }}>{item.label}</div>
                <div style={{ fontSize:"12px", color:"#4a6b4c", lineHeight:"1.4" }}>{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourcesMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ position:"relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button style={{
        fontSize:"15px", fontWeight:"500", color:"#2a3d2b",
        background:"none", border:"none", cursor:"pointer",
        display:"flex", alignItems:"center", gap:"5px", padding:"4px 0",
        fontFamily:"'Roboto',sans-serif",
      }}>
        Resources
        <span style={{ fontSize:"10px", color:"#9ab09c", marginTop:"1px" }}>▾</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 12px)", left:"50%", transform:"translateX(-50%)",
          background:"white", border:"1px solid #eef2ee", borderRadius:"14px",
          boxShadow:"0 8px 32px rgba(0,0,0,0.1)", padding:"8px", minWidth:"260px", zIndex:200,
        }}>
          {RESOURCES.map(item => (
            <a key={item.href} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
              style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"10px 12px", borderRadius:"9px", textDecoration:"none", transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background="#eef8f0"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <div>
                <div style={{ fontSize:"13px", fontWeight:"600", color:"#0d1f0e", marginBottom:"2px" }}>{item.label}</div>
                <div style={{ fontSize:"12px", color:"#4a6b4c", lineHeight:"1.4" }}>{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function NavBar({ activePath }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 48px", height:"72px", position:"sticky", top:0, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid #eef2ee", zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <button onClick={() => setMenuOpen(true)} className="pl-hamburger" aria-label="Open menu"><span /><span /><span /></button>
          <a href="/" style={{ textDecoration:"none" }}><img src="/logo.svg" alt="Dablin" height="44" /></a>
        </div>
        <div className="pl-nav-links" style={{ display:"flex", alignItems:"center", gap:"28px" }}>
          {NAV_GROUPS.map(group => (
            <DropdownMenu key={group.label} group={group} activePath={activePath} />
          ))}
          <a href="/pricing" style={{ fontSize:"15px", fontWeight: activePath==="/pricing" ? "700" : "500", color: activePath==="/pricing" ? "#1a7a3a" : "#2a3d2b", textDecoration:"none" }}>Pricing</a>
          <ResourcesMenu />
        </div>
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          <SignInButton mode="modal"><button className="pl-btn-ghost">Sign in</button></SignInButton>
          <div onClick={() => trackEvent("sign_up_modal_opened", { location:"nav" })}>
            <SignUpButton mode="modal"><button className="pl-btn-primary">Sign up</button></SignUpButton>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, right:0, bottom:0, background:"white", zIndex:500, padding:"24px", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
            <img src="/logo.svg" alt="Dablin" height="40" />
            <button onClick={() => setMenuOpen(false)} style={{ background:"none", border:"none", fontSize:"28px", color:"#2a3d2b", cursor:"pointer" }}>×</button>
          </div>
          {/* AI Visibility group */}
          <div style={{ fontSize:"11px", fontWeight:"700", color:"#9ab09c", textTransform:"uppercase", letterSpacing:"1px", padding:"12px 0 8px" }}>AI Visibility</div>
          {NAV_GROUPS[0].items.map(item => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display:"flex", alignItems:"flex-start", gap:"14px", padding:"12px 0", borderBottom:"1px solid #eef2ee", textDecoration:"none" }}>
              <div><div style={{ fontSize:"15px", fontWeight:"600", color:"#0d1f0e", marginBottom:"2px" }}>{item.label}</div><div style={{ fontSize:"12px", color:"#4a6b4c" }}>{item.desc}</div></div>
            </a>
          ))}
          {/* SEO Expert group */}
          <div style={{ fontSize:"11px", fontWeight:"700", color:"#9ab09c", textTransform:"uppercase", letterSpacing:"1px", padding:"16px 0 8px" }}>SEO Expert</div>
          {NAV_GROUPS[1].items.map(item => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display:"flex", alignItems:"flex-start", gap:"14px", padding:"12px 0", borderBottom:"1px solid #eef2ee", textDecoration:"none" }}>
              <div><div style={{ fontSize:"15px", fontWeight:"600", color:"#0d1f0e", marginBottom:"2px" }}>{item.label}</div><div style={{ fontSize:"12px", color:"#4a6b4c" }}>{item.desc}</div></div>
            </a>
          ))}
          {/* Pricing */}
          <a href="/pricing" onClick={() => setMenuOpen(false)} style={{ display:"flex", alignItems:"flex-start", gap:"14px", padding:"12px 0", borderBottom:"1px solid #eef2ee", textDecoration:"none" }}>
                        <div><div style={{ fontSize:"15px", fontWeight:"600", color:"#0d1f0e", marginBottom:"2px" }}>Pricing</div><div style={{ fontSize:"12px", color:"#4a6b4c" }}>Simple monthly plans</div></div>
          </a>
          {/* Resources */}
          <div style={{ fontSize:"11px", fontWeight:"700", color:"#9ab09c", textTransform:"uppercase", letterSpacing:"1px", padding:"16px 0 8px" }}>Resources</div>
          {RESOURCES.map(item => (
            <a key={item.href} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} onClick={() => setMenuOpen(false)} style={{ display:"flex", alignItems:"flex-start", gap:"14px", padding:"12px 0", borderBottom:"1px solid #eef2ee", textDecoration:"none" }}>
              <div><div style={{ fontSize:"15px", fontWeight:"600", color:"#0d1f0e", marginBottom:"2px" }}>{item.label}</div><div style={{ fontSize:"12px", color:"#4a6b4c" }}>{item.desc}</div></div>
            </a>
          ))}
          <div style={{ marginTop:"24px", display:"flex", flexDirection:"column", gap:"12px" }}>
            <div onClick={() => { trackEvent("sign_up_modal_opened", { location:"mobile_menu" }); setMenuOpen(false); }}>
              <SignUpButton mode="modal"><button className="pl-btn-primary" style={{ width:"100%", padding:"14px", fontSize:"16px", borderRadius:"10px" }}>Sign up free</button></SignUpButton>
            </div>
            <SignInButton mode="modal"><button className="pl-btn-ghost" style={{ width:"100%", padding:"14px", fontSize:"16px", borderRadius:"10px" }} onClick={() => setMenuOpen(false)}>Sign in</button></SignInButton>
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  const col = (label, links) => (
    <div>
      <div style={{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"16px" }}>{label}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {links.map(([text, href]) => (
          <a key={text} href={href} style={{ fontSize:"13px", color:"rgba(255,255,255,0.55)", textDecoration:"none" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}>
            {text}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <footer style={{ background:"#0a1a0b", padding:"56px 48px 32px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="pl-footer-grid">

        {/* Brand */}
        <div>
          <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
            <img src="/logo.svg" alt="Dablin" height="32" />
            <span style={{ color:"white", fontSize:"17px", fontWeight:"700", letterSpacing:"-0.3px" }}>dablin</span>
          </a>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)", lineHeight:"1.65", maxWidth:"260px", margin:"0 0 24px" }}>
            Be visible everywhere search happens. SEO and AI visibility for brands and e-commerce sellers.
          </p>
          <div style={{ display:"flex", gap:"10px" }}>
            <a href="https://www.linkedin.com/company/dablin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
              style={{ width:"34px", height:"34px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 9h4v12H2z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4" cy="4" r="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8"/></svg>
            </a>
            <a href="https://medium.com/dablin" target="_blank" rel="noopener noreferrer" aria-label="Medium"
              style={{ width:"34px", height:"34px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
            </a>
          </div>
        </div>

        {col("Tools", [
          ["AI Visibility Check", "/ai-visibility-check"],
          ["AI Visibility Audit", "/ai-visibility-audit"],
          ["SEO Audit",           "/seo-audit"],
          ["AI Query Check",      "/dashboard/query-check"],
        ])}

        {col("Product", [
          ["Step by Step SEO",      "/dashboard/get-started"],
          ["SEO/GEO Dashboard",     "/dashboard"],
          ["Google Search Console", "/dashboard/search-console"],
          ["Pricing",               "/pricing"],
          ["Blog",                  "https://blog.dablin.co"],
        ])}

        {col("Company", [
          ["Contact us",       "mailto:hello@dablin.co"],
          ["Privacy Policy",   "/legal.html"],
          ["Terms of Service", "/legal.html"],
        ])}

      </div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:"24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
        <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.25)" }}>© 2026 Dablin. All rights reserved.</span>
        <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.25)" }}>Built for the AI search era.</span>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// Usage: <PageLayout activePath="/seo-audit">...</PageLayout>
// activePath highlights the current page link in the nav.
// ─────────────────────────────────────────────────────────────
export default function PageLayout({ children, activePath }) {
  return (
    <div style={{ fontFamily:"'Roboto', sans-serif", color:"#2a3d2b", background:"white", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@700;800&display=swap');
        :root { --green:#1a7a3a; --green-light:#2d9a4e; --green-pale:#eef8f0; --green-mid:#d0e8d4; --dark:#0d1f0e; --text:#2a3d2b; --muted:#4a6b4c; --border:#eef2ee; }
        * { box-sizing:border-box; margin:0; padding:0; }
        .pl-hamburger { display:none; background:none; border:1px solid #eef2ee; border-radius:8px; padding:8px 10px; cursor:pointer; flex-direction:column; gap:4px; }
        .pl-hamburger span { display:block; width:18px; height:2px; background:#2a3d2b; border-radius:2px; }
        .pl-btn-primary { background:var(--green); color:white; border:none; padding:10px 22px; border-radius:8px; font-family:'Roboto',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .pl-btn-primary:hover { background:var(--green-light); }
        .pl-btn-ghost { background:none; border:1.5px solid var(--border); color:var(--text); padding:10px 22px; border-radius:8px; font-family:'Roboto',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.2s; }
        .pl-btn-ghost:hover { border-color:var(--green); color:var(--green); }
        .pl-btn-large { padding:15px 36px; font-size:16px; border-radius:10px; font-weight:600; }
        .pl-btn-outline { background:none; border:2px solid rgba(255,255,255,0.3); color:white; padding:14px 32px; border-radius:10px; font-family:'Roboto',sans-serif; font-size:15px; font-weight:500; cursor:pointer; }
        .pl-hero { max-width:860px; margin:0 auto; padding:72px 48px 64px; text-align:center; }
        .pl-hero-badge { display:inline-block; background:var(--green-pale); color:var(--green); border:1px solid var(--green-mid); padding:6px 16px; border-radius:100px; font-size:13px; font-weight:600; margin-bottom:24px; }
        .pl-hero-title { font-family:'Roboto Condensed',sans-serif; font-size:clamp(36px,5vw,64px); font-weight:800; line-height:1.05; letter-spacing:-2px; color:var(--dark); margin-bottom:20px; }
        .pl-hero-accent { color:var(--green); }
        .pl-hero-sub { font-size:18px; color:var(--muted); max-width:560px; margin:0 auto 36px; line-height:1.6; font-weight:300; }
        .pl-section { padding:72px 48px; max-width:1100px; margin:0 auto; }
        .pl-section-dark { background:var(--dark); padding:72px 48px; }
        .pl-section-green { background:var(--green-pale); border-top:1px solid var(--green-mid); border-bottom:1px solid var(--green-mid); padding:72px 48px; }
        .pl-section-inner { max-width:1100px; margin:0 auto; }
        .pl-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--green); margin-bottom:16px; }
        .pl-label-light { color:#6fcf8a; }
        .pl-h2 { font-family:'Roboto Condensed',sans-serif; font-size:clamp(26px,3.5vw,40px); font-weight:800; color:var(--dark); margin-bottom:16px; letter-spacing:-1px; }
        .pl-h2-white { color:white; }
        .pl-sub { font-size:16px; color:var(--muted); max-width:520px; line-height:1.6; }
        .pl-sub-white { color:rgba(255,255,255,0.55); max-width:520px; line-height:1.6; font-size:16px; }
        .pl-center { text-align:center; }
        .pl-center .pl-sub, .pl-center .pl-sub-white { margin:0 auto; }
        .pl-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; margin-top:56px; }
        .pl-step { text-align:center; }
        .pl-step-num { width:44px; height:44px; border-radius:50%; background:var(--green); color:white; font-size:18px; font-weight:800; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-family:'Roboto Condensed',sans-serif; }
        .pl-step-title { font-size:16px; font-weight:700; color:var(--dark); margin-bottom:8px; }
        .pl-step-desc { font-size:14px; color:var(--muted); line-height:1.6; }
        .pl-checks-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-top:48px; }
        .pl-check-item { display:flex; gap:12px; align-items:flex-start; background:white; border:1px solid var(--border); border-radius:10px; padding:16px; }
        .pl-check-icon { font-size:16px; flex-shrink:0; }
        .pl-check-title { font-size:14px; font-weight:600; color:var(--dark); margin-bottom:3px; }
        .pl-check-desc { font-size:13px; color:var(--muted); line-height:1.5; }
        .pl-features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:48px; }
        .pl-feature-card { background:white; border:1px solid var(--border); border-radius:12px; padding:28px; }
        .pl-feature-title { font-family:'Roboto Condensed',sans-serif; font-size:16px; font-weight:700; color:var(--dark); margin-bottom:8px; }
        .pl-feature-desc { font-size:14px; color:var(--muted); line-height:1.55; }
        .pl-cta-box { background:var(--dark); border-radius:20px; padding:56px 48px; text-align:center; margin-top:48px; }
        .pl-cta-title { font-family:'Roboto Condensed',sans-serif; font-size:clamp(24px,3vw,40px); font-weight:800; color:white; margin-bottom:14px; letter-spacing:-1px; }
        .pl-cta-title span { color:#6fcf8a; }
        .pl-cta-sub { font-size:16px; color:rgba(255,255,255,0.5); margin-bottom:32px; }
        .pl-cta-actions { display:flex; gap:14px; justify-content:center; align-items:center; flex-wrap:wrap; }
        .pl-faq-list { max-width:720px; margin:48px auto 0; }
        .pl-faq-item { border-bottom:1px solid var(--border); padding:20px 0; cursor:pointer; }
        .pl-faq-item:first-child { border-top:1px solid var(--border); }
        .pl-faq-q { display:flex; justify-content:space-between; align-items:center; gap:16px; font-size:15px; font-weight:600; color:var(--dark); }
        .pl-faq-icon { font-size:20px; color:var(--green); flex-shrink:0; }
        .pl-faq-a { font-size:14px; color:var(--muted); line-height:1.65; margin-top:10px; padding-right:24px; }
        .pl-footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:48px; }
        @media (max-width:900px) {
          .pl-nav-links { display:none !important; }
          .pl-hamburger { display:flex !important; }
          .pl-footer-grid { grid-template-columns:1fr 1fr; gap:28px; }
          .pl-steps { grid-template-columns:1fr; }
          .pl-checks-grid { grid-template-columns:1fr; }
          .pl-features-grid { grid-template-columns:1fr; }
        }
        @media (max-width:600px) {
          .pl-hero { padding:40px 20px 48px; }
          .pl-section { padding:48px 20px; }
          .pl-section-dark, .pl-section-green { padding:48px 20px; }
          .pl-footer-grid { grid-template-columns:1fr; }
          .pl-cta-box { padding:40px 20px; }
          .pl-cta-actions { flex-direction:column; }
        }
      `}</style>

      <NavBar activePath={activePath} />
      {children}
      <Footer />
    </div>
  );
}
