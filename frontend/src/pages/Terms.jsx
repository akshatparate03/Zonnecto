import React from "react";
import { ZnNavbar, ZnFooter } from "../components/ZnLayout";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using Zonnecto, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use the platform. These terms apply to all visitors, users, and others who access or use Zonnecto.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years of age to use Zonnecto. By using this platform, you represent and warrant that you are 18 years of age or older. Accounts found to belong to minors will be terminated immediately.`,
  },
  {
    title: "3. User Accounts",
    content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Zonnecto will not be liable for any loss that results from someone else using your account, with or without your knowledge.`,
  },
  {
    title: "4. Prohibited Conduct",
    content: `Users may NOT use Zonnecto to:
• Share illegal content including child sexual abuse material (CSAM)
• Harass, bully, threaten, or intimidate other users
• Impersonate any person or entity
• Share spam, malware, or phishing content
• Engage in commercial solicitation or advertising
• Attempt to reverse-engineer or exploit the platform
• Coordinate real-world violence or illegal activity

Violations will result in immediate and permanent banning.`,
  },
  {
    title: "5. Content Standards",
    content: `All content shared on Zonnecto must comply with applicable laws. You retain ownership of content you create, but grant Zonnecto a limited license to store and transmit that content for platform functionality. We reserve the right to remove any content that violates these terms without prior notice.`,
  },
  {
    title: "6. Moderation & Bans",
    content: `Zonnecto employs a community-driven moderation system. Reported content is reviewed and users with two or more violations will receive escalating bans up to permanent suspension. Ban decisions are made at our sole discretion and may not always be reversible.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `Zonnecto is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, the platform. Our total liability to you for any claims under these terms shall not exceed the amount you paid to use Zonnecto (which is zero, as the service is free).`,
  },
  {
    title: "8. Governing Law",
    content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in India.`,
  },
  {
    title: "9. Changes to Terms",
    content: `Zonnecto reserves the right to modify these Terms at any time. We will notify users of significant changes by posting the new Terms on this page. Your continued use of the platform following any changes constitutes your acceptance of the new Terms.`,
  },
];

export default function Terms() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html,body { overflow-x: hidden; max-width: 100%; }
        .zn-bg { min-height: 100vh; min-height: 100dvh; background: #070710; font-family: 'DM Sans', sans-serif; position: relative; display: flex; flex-direction: column; overflow-x: hidden; width: 100%; }
        .zn-orb { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.1; pointer-events: none; }
        .zn-orb-1 { width: min(500px,85vw); height: min(500px,85vw); background: radial-gradient(circle,#818cf8,#6366f1); top: -150px; right: -100px; }
        .zn-orb-2 { width: min(400px,80vw); height: min(400px,80vw); background: radial-gradient(circle,#a855f7,#7c3aed); bottom: -100px; left: -100px; }
        .zn-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px); background-size: 48px 48px; }
        .zn-content { max-width: 760px; width: 100%; margin: 0 auto; padding: 3.5rem 2rem 4rem; flex: 1; position: relative; z-index: 1; }

        .legal-hero { margin-bottom: 2.5rem; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .legal-tag {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(129,140,248,0.1); border: 1px solid rgba(129,140,248,0.22);
          color: #818cf8; padding: 0.3rem 0.85rem; border-radius: 20px;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
          margin-bottom: 1rem;
        }
        .legal-hero h1 { font-family: 'Syne', sans-serif; font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 0.75rem; }
        .legal-hero h1 span { background: linear-gradient(135deg,#818cf8,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .legal-meta { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
        .legal-meta-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.77rem; color: rgba(255,255,255,0.3); }

        .legal-sections { display: flex; flex-direction: column; gap: 0; }
        .legal-section {
          padding: 1.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.06);
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .legal-section:last-child { border-bottom: none; }
        .legal-section h2 { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.6rem; }
        .legal-section h2::before { content:''; width: 3px; height: 14px; border-radius: 2px; background: linear-gradient(to bottom,#818cf8,#c084fc); flex-shrink: 0; }
        .legal-section p { font-size: 0.84rem; color: rgba(255,255,255,0.4); line-height: 1.72; white-space: pre-line; }

        .legal-footer-note { margin-top: 2.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.25rem; font-size: 0.78rem; color: rgba(255,255,255,0.25); line-height: 1.6; text-align: center; animation: fadeUp 0.4s 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .legal-footer-note a { color: #818cf8; text-decoration: none; }
        .legal-footer-note a:hover { text-decoration: underline; }

        @media(max-width:768px){
          .zn-content { padding: 2.5rem 1.25rem 3rem; }
          .legal-hero h1 { font-size: clamp(1.6rem,5vw,2.2rem); }
        }
        @media(max-width:480px){
          .zn-content { padding: 2rem 1rem 2.5rem; }
          .legal-hero h1 { font-size: 1.7rem; }
          .legal-section { padding: 1.25rem 0; }
          .legal-section p { font-size: 0.81rem; }
          .legal-meta { gap: 0.75rem; }
        }
        @media(max-width:380px){
          .zn-content { padding: 1.5rem 0.75rem 2rem; }
          .legal-hero h1 { font-size: 1.5rem; }
          .legal-hero { margin-bottom: 1.75rem; }
          .legal-section h2 { font-size: 0.88rem; }
          .legal-section p { font-size: 0.79rem; }
        }
        @media(max-width:320px){
          .zn-content { padding: 1.25rem 0.6rem 1.75rem; }
          .legal-hero h1 { font-size: 1.35rem; }
        }
      `}</style>

      <div className="zn-bg">
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />
        <div className="zn-grid" />
        <ZnNavbar />
        <div className="zn-content">
          <div className="legal-hero">
            <div className="legal-tag">Legal</div>
            <h1>
              Terms & <span>Conditions</span>
            </h1>
            <div className="legal-meta">
              <span className="legal-meta-item">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Last updated: 2026
              </span>
              <span className="legal-meta-item">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                ~5 min read
              </span>
            </div>
          </div>

          <div className="legal-sections">
            {sections.map((s, i) => (
              <div
                key={i}
                className="legal-section"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <h2>{s.title}</h2>
                <p>{s.content}</p>
              </div>
            ))}
          </div>

          <div className="legal-footer-note">
            By using Zonnecto, you agree to these Terms. For questions, contact{" "}
            <a href="mailto:zonnecto@gmail.com">zonnecto@gmail.com</a>. Also see
            our <a href="/privacy">Privacy Policy</a> and{" "}
            <a href="/disclaimer">Disclaimer</a>.
          </div>
        </div>
        <ZnFooter />
      </div>
    </>
  );
}
