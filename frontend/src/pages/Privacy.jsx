import React from "react";
import { ZnNavbar, ZnFooter } from "../components/ZnLayout";

const sections = [
  {
    title: "Information We Collect",
    color: "#a855f7",
    content: `We collect only what is necessary to operate the platform:

• Email address (for account creation and recovery)
• Username (chosen by you, does not need to be your real name)
• Age range and gender preferences (optional, for matching)
• IP address and session data (for security and abuse prevention)
• Chat messages (stored temporarily for delivery; moderated for safety)

We do NOT collect: real names, phone numbers, location, or payment information.`,
  },
  {
    title: "How We Use Your Information",
    color: "#22d3ee",
    content: `Your data is used solely to:

• Provide and improve the Zonnecto service
• Match you with other users based on preferences
• Enforce community guidelines and prevent abuse
• Respond to support requests
• Comply with legal obligations

We do not use your data for advertising, and we never sell your data to third parties.`,
  },
  {
    title: "Data Storage & Security",
    color: "#4ade80",
    content: `Your data is stored on secure servers with industry-standard encryption. Access to user data is restricted to authorized personnel only.

Chat messages are stored in our database for functionality purposes. We employ JWT-based authentication and bcrypt password hashing to protect your account.

While we take security seriously, no system is 100% secure. We encourage users to use strong passwords and never share account credentials.`,
  },
  {
    title: "Data Retention",
    color: "#f59e0b",
    content: `We retain your account data for as long as your account is active. Chat messages are retained for platform functionality and moderation review.

You may request deletion of your account and associated data at any time by emailing zonnecto@gmail.com. Upon deletion request, your data will be removed within 30 days, except where retention is required by law.`,
  },
  {
    title: "Cookies & Tracking",
    color: "#818cf8",
    content: `Zonnecto uses minimal cookies strictly necessary for authentication and session management. We do NOT use:

• Advertising or tracking cookies
• Third-party analytics that profile you
• Fingerprinting or cross-site tracking

No cookies are placed without necessity.`,
  },
  {
    title: "Third-Party Services",
    color: "#f472b6",
    content: `Zonnecto does not share personal data with third-party services for marketing or advertising purposes. We may use third-party infrastructure providers (cloud hosting, etc.) who process data on our behalf under strict data protection agreements.`,
  },
  {
    title: "Your Rights",
    color: "#34d399",
    content: `You have the right to:

• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your account and data
• Withdraw consent for data processing

To exercise these rights, contact us at zonnecto@gmail.com.`,
  },
  {
    title: "Changes to This Policy",
    color: "#c084fc",
    content: `We may update this Privacy Policy from time to time. We will notify users of significant changes. Your continued use of Zonnecto after changes are posted constitutes your acceptance of the updated policy.

This policy was last updated in 2026.`,
  },
];

export default function Privacy() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html,body { overflow-x: hidden; max-width: 100%; }
        .zn-bg { min-height: 100vh; min-height: 100dvh; background: #070710; font-family: 'DM Sans', sans-serif; position: relative; display: flex; flex-direction: column; overflow-x: hidden; width: 100%; }
        .zn-orb { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.1; pointer-events: none; }
        .zn-orb-1 { width: min(500px,85vw); height: min(500px,85vw); background: radial-gradient(circle,#22d3ee,#0891b2); top: -150px; right: -100px; }
        .zn-orb-2 { width: min(400px,80vw); height: min(400px,80vw); background: radial-gradient(circle,#a855f7,#7c3aed); bottom: -100px; left: -100px; }
        .zn-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px); background-size: 48px 48px; }

        .zn-body { display: flex; flex: 1; max-width: 1000px; margin: 0 auto; padding: 3rem 2rem 4rem; gap: 2.5rem; width: 100%; min-width: 0; position: relative; z-index: 1; }

        /* SIDEBAR TOC */
        .priv-toc { width: 220px; flex-shrink: 0; }
        .priv-toc-sticky { position: sticky; top: 80px; }
        .priv-toc-title { font-size: 0.7rem; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin-bottom: 0.75rem; }
        .priv-toc-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 0.6rem; border-radius: 7px; cursor: pointer;
          font-size: 0.76rem; color: rgba(255,255,255,0.35); transition: all 0.2s;
          text-decoration: none;
        }
        .priv-toc-item:hover { color: #c084fc; background: rgba(139,92,246,0.08); }
        .priv-toc-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* MAIN CONTENT */
        .priv-content { flex: 1; min-width: 0; overflow: hidden; }

        .priv-hero { margin-bottom: 2.5rem; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .priv-tag {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.2);
          color: #22d3ee; padding: 0.3rem 0.85rem; border-radius: 20px;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
          margin-bottom: 1rem;
        }
        .priv-hero h1 { font-family: 'Syne', sans-serif; font-size: clamp(1.8rem,4vw,2.6rem); font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 0.75rem; }
        .priv-hero h1 span { background: linear-gradient(135deg,#22d3ee,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .priv-hero p { color: rgba(255,255,255,0.38); font-size: 0.88rem; line-height: 1.65; }

        /* SECTIONS */
        .priv-sections { display: flex; flex-direction: column; gap: 1rem; }
        .priv-section {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.5rem;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
          position: relative; overflow: hidden;
        }
        .priv-section::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:0 2px 2px 0; }
        .priv-section:hover { border-color: rgba(255,255,255,0.11); }
        .priv-section-header { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.85rem; }
        .priv-section-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .priv-section h2 { font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; color: #fff; }
        .priv-section p { font-size: 0.82rem; color: rgba(255,255,255,0.4); line-height: 1.72; white-space: pre-line; }

        .priv-footer-note { margin-top: 1.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.1rem; font-size: 0.77rem; color: rgba(255,255,255,0.25); line-height: 1.6; text-align: center; }
        .priv-footer-note a { color: #22d3ee; text-decoration: none; }
        .priv-footer-note a:hover { text-decoration: underline; }

        @media(max-width:768px){
          .zn-body { flex-direction: column; padding: 2rem 1rem; gap: 1.5rem; }
          .priv-toc { width: 100%; }
          .priv-toc-sticky { position: static; display: flex; flex-wrap: wrap; gap: 0.35rem; }
          .priv-toc-title { width: 100%; }
          .priv-hero h1 { font-size: clamp(1.6rem,5vw,2.2rem); }
        }
        @media(max-width:480px){
          .zn-body { padding: 1.5rem 0.9rem; gap: 1.25rem; }
          .priv-section { padding: 1.25rem 1rem; }
          .priv-hero h1 { font-size: 1.6rem; }
          .priv-toc-item { font-size: 0.72rem; padding: 0.35rem 0.5rem; }
        }
        @media(max-width:380px){
          .zn-body { padding: 1.25rem 0.75rem; }
          .priv-hero h1 { font-size: 1.4rem; }
          .priv-section { padding: 1rem 0.85rem; }
          .priv-section p { font-size: 0.79rem; }
        }
      `}</style>

      <div className="zn-bg">
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />
        <div className="zn-grid" />
        <ZnNavbar />

        <div className="zn-body">
          {/* Sidebar TOC */}
          <div className="priv-toc">
            <div className="priv-toc-sticky">
              <div className="priv-toc-title">Contents</div>
              {sections.map((s, i) => (
                <a key={i} href={`#priv-${i}`} className="priv-toc-item">
                  <span
                    className="priv-toc-dot"
                    style={{ background: s.color }}
                  />
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="priv-content">
            <div className="priv-hero">
              <div className="priv-tag">Privacy</div>
              <h1>
                Privacy <span>Policy</span>
              </h1>
              <p>
                We believe privacy is a right, not a feature. Here's exactly
                what we collect, why, and how we protect it. No legalese, no
                surprises.
              </p>
            </div>

            <div className="priv-sections">
              {sections.map((s, i) => (
                <div
                  key={i}
                  id={`priv-${i}`}
                  className="priv-section"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    borderColor: `${s.color}15`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "3px",
                      borderRadius: "0 2px 2px 0",
                      background: s.color,
                      opacity: 0.7,
                    }}
                  />
                  <div className="priv-section-header">
                    <div
                      className="priv-section-icon"
                      style={{
                        background: `${s.color}18`,
                        border: `1px solid ${s.color}28`,
                        color: s.color,
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <h2>{s.title}</h2>
                  </div>
                  <p>{s.content}</p>
                </div>
              ))}
            </div>

            <div className="priv-footer-note">
              Last updated: 2026 · Questions?{" "}
              <a href="mailto:zonnecto@gmail.com">zonnecto@gmail.com</a> · Also
              see our <a href="/terms">Terms & Conditions</a> and{" "}
              <a href="/disclaimer">Disclaimer</a>.
            </div>
          </div>
        </div>

        <ZnFooter />
      </div>
    </>
  );
}
