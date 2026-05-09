import React from "react";
import { ZnNavbar, ZnFooter } from "../components/ZnLayout";

const features = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Anonymous by Default",
    desc: "No real names, no phone numbers. Your identity stays yours until you choose otherwise.",
    color: "#a855f7",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Real-time Matching",
    desc: "WebSocket-powered instant connections. No waiting, no delays — just real conversations.",
    color: "#22d3ee",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Smart Preferences",
    desc: "Filter by age, gender, and interests once you unlock the premium subscription.",
    color: "#4ade80",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M1 6s4-2 11-2 11 2 11 2v12s-4 2-11 2-11-2-11-2V6z" />
        <path d="M1 6l11 7 11-7" />
      </svg>
    ),
    title: "Moderation System",
    desc: "Community-driven reporting with automatic ban enforcement to keep conversations safe.",
    color: "#f59e0b",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "Friend System",
    desc: "Found someone interesting? Send a friend request and stay connected beyond the anonymous chat.",
    color: "#818cf8",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
    title: "Privacy First",
    desc: "No data selling, no ads. What happens on Zonnecto, stays on Zonnecto.",
    color: "#f472b6",
  },
];

const team = [
  { name: "Akshat Parate", role: "@Founder of Zonnecto", emoji: "👨‍💻" },
];

export default function About() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }
        .zn-bg { min-height: 100vh; background: #070710; font-family: 'DM Sans', sans-serif; position: relative; display: flex; flex-direction: column; overflow-x: hidden; width: 100%; }
        .zn-orb { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.12; pointer-events: none; overflow: hidden; }
        .zn-orb-1 { width: min(600px, 80vw); height: min(600px, 80vw); background: radial-gradient(circle,#a855f7,#7c3aed); top: -200px; left: -150px; }
        .zn-orb-2 { width: min(500px, 70vw); height: min(500px, 70vw); background: radial-gradient(circle,#06b6d4,#3b82f6); bottom: -150px; right: -100px; }
        .zn-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px); background-size: 48px 48px; }

        .zn-content { max-width: 960px; width: 100%; margin: 0 auto; padding: 3.5rem 2rem 4rem; flex: 1; position: relative; z-index: 1; }

        /* HERO */
        .abt-hero { text-align: center; margin-bottom: 4rem; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .abt-tag {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.25);
          color: #c084fc; padding: 0.3rem 0.85rem; border-radius: 20px;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
          margin-bottom: 1rem;
        }
        .abt-hero h1 {
          font-family: 'Syne', sans-serif; font-size: clamp(2.2rem,5vw,3.5rem); font-weight: 800;
          color: #fff; letter-spacing: -0.03em; line-height: 1.08; margin-bottom: 1.25rem;
        }
        .abt-hero h1 span {
          background: linear-gradient(135deg,#c084fc,#818cf8,#22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .abt-hero p { color: rgba(255,255,255,0.45); font-size: 1.05rem; line-height: 1.65; max-width: 580px; margin: 0 auto; }

        /* DIVIDER */
        .abt-divider { display: flex; align-items: center; gap: 1rem; margin: 3rem 0; }
        .abt-divider-line { flex: 1; height: 1px; background: rgba(139,92,246,0.12); }
        .abt-divider-text { font-size: 0.7rem; color: rgba(255,255,255,0.2); letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; }

        /* MISSION */
        .abt-mission {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 2.5rem; margin-bottom: 1.25rem;
          position: relative; overflow: hidden;
          animation: fadeUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .abt-mission::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(139,92,246,0.5),rgba(34,211,238,0.3),transparent); }
        .abt-mission-label { font-size: 0.7rem; color: rgba(139,92,246,0.7); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; margin-bottom: 0.75rem; }
        .abt-mission h2 { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 1rem; letter-spacing: -0.01em; }
        .abt-mission p { color: rgba(255,255,255,0.45); font-size: 0.93rem; line-height: 1.7; }
        .abt-mission p + p { margin-top: 0.75rem; }

        /* FEATURES */
        .abt-features-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; letter-spacing: -0.01em; }
        .abt-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
        .abt-feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.4rem;
          transition: all 0.2s;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
          min-width: 0; overflow: hidden;
        }
        .abt-feature-card:hover { border-color: rgba(139,92,246,0.2); transform: translateY(-2px); background: rgba(139,92,246,0.04); }
        .abt-feature-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.9rem;
        }
        .abt-feature-card h3 { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #fff; margin-bottom: 0.45rem; }
        .abt-feature-card p { font-size: 0.78rem; color: rgba(255,255,255,0.38); line-height: 1.55; }

        /* STATS */
        .abt-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-bottom: 1.25rem; }
        .abt-stat {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 1.5rem; text-align: center;
          animation: fadeUp 0.4s 0.15s cubic-bezier(0.16,1,0.3,1) both;
          min-width: 0; overflow: hidden;
        }
        .abt-stat-val { font-family: 'Syne', sans-serif; font-size: clamp(1.35rem, 4vw, 2rem); font-weight: 800; background: linear-gradient(135deg,#c084fc,#22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .abt-stat-label { font-size: clamp(0.6rem, 1.8vw, 0.75rem); color: rgba(255,255,255,0.3); margin-top: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em; word-break: break-word; }

        /* TEAM */
        .abt-team { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .abt-team-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 1.75rem 1.5rem;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
          text-align: center;
          animation: fadeUp 0.4s 0.2s cubic-bezier(0.16,1,0.3,1) both;
          transition: all 0.2s;
          min-width: 0; overflow: hidden; text-decoration: none;
        }
        .abt-team-card:hover { border-color: rgba(139,92,246,0.25); transform: translateY(-2px); background: rgba(139,92,246,0.04); }
        .abt-team-card a { text-decoration: none; display: contents; }
        .abt-team-photo { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(139,92,246,0.35); box-shadow: 0 0 20px rgba(139,92,246,0.2); flex-shrink: 0; }
        .abt-team-photo img { width: 100%; height: 100%; object-fit: cover; }
        .abt-team-social-icon { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .abt-team-name { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; }
        .abt-team-role { font-size: 0.78rem; color: rgba(255,255,255,0.35); margin-top: 0.15rem; }
        .abt-team-handle { font-size: 0.78rem; margin-top: 0.15rem; font-weight: 500; }

        @media(max-width:900px){
          .abt-features-grid { grid-template-columns: repeat(2,1fr); }
          .abt-stats { grid-template-columns: repeat(3,1fr); }
          .abt-team { grid-template-columns: repeat(3,1fr); }
        }
        @media(max-width:768px){
          .zn-content { padding: 2.5rem 1.25rem 3rem; }
          .abt-hero h1 { font-size: clamp(1.7rem,5vw,2.5rem); }
          .abt-hero p { font-size: 0.95rem; }
          .abt-mission { padding: 1.75rem 1.25rem; }
          .abt-mission h2 { font-size: 1.2rem; }
          .abt-features-grid { grid-template-columns: repeat(2,1fr); gap: 0.75rem; }
          .abt-stats { grid-template-columns: repeat(3,1fr); gap: 0.75rem; }
          .abt-team { grid-template-columns: repeat(3,1fr); gap: 0.75rem; }
          .abt-team-card { padding: 1.25rem 1rem; }
        }
        @media(max-width:560px){
          .zn-content { padding: 2rem 1rem 2.5rem; }
          .abt-features-grid { grid-template-columns: repeat(2,1fr); gap: 0.65rem; }
          .abt-stats { grid-template-columns: repeat(3,1fr); gap: 0.5rem; }
          .abt-stat { padding: 1rem 0.5rem; }
          .abt-stat-val { font-size: 1.5rem; }
          .abt-stat-label { font-size: 0.65rem; }
          .abt-team { grid-template-columns: 1fr; }
          .abt-hero { margin-bottom: 2.5rem; }
          .abt-hero p { font-size: 0.9rem; }
        }
        @media(max-width:430px){
          .zn-content { padding: 1.5rem 0.9rem 2rem; }
          .abt-features-grid { grid-template-columns: 1fr; gap: 0.6rem; }
          .abt-stats { grid-template-columns: repeat(3,1fr); gap: 0.4rem; }
          .abt-stat { padding: 0.85rem 0.4rem; }
          .abt-stat-val { font-size: 1.35rem; }
          .abt-stat-label { font-size: 0.6rem; letter-spacing: 0.03em; }
          .abt-mission { padding: 1.25rem 1rem; }
          .abt-feature-card { padding: 1rem; }
          .abt-team-card { padding: 1rem 0.85rem; }
          .abt-team-photo { width: 65px; height: 65px; }
          .abt-team-social-icon { width: 65px; height: 65px; }
          .abt-divider-text { font-size: 0.6rem; }
        }
        @media(max-width:360px){
          .zn-content { padding: 1.25rem 0.75rem 1.75rem; }
          .abt-stats { grid-template-columns: 1fr; gap: 0.5rem; }
          .abt-hero h1 { font-size: 1.5rem; }
        }
      `}</style>

      <div className="zn-bg">
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />
        <div className="zn-grid" />

        <ZnNavbar />

        <div className="zn-content">
          {/* Hero */}
          <div className="abt-hero">
            <div className="abt-tag">
              <svg width="9" height="9" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
              </svg>
              About Zonnecto
            </div>
            <h1>
              Connect Without <span>Boundaries</span>
            </h1>
            <p>
              Zonnecto is an anonymous real-time chat platform built for genuine
              human connection — no judgement, no history, just conversation.
            </p>
          </div>

          {/* Mission */}
          <div className="abt-mission">
            <div className="abt-mission-label">Our Mission</div>
            <h2>Why we built Zonnecto</h2>
            <p>
              In a world of curated social media profiles and performative
              online identities, we wanted to create a space where people could
              just… talk. No followers, no likes, no permanent record.
            </p>
            <p>
              Zonnecto was born from a simple belief: the most honest
              conversations happen when there's nothing to prove and nothing to
              lose. That's why anonymity is our default, not an afterthought.
            </p>
          </div>

          <div className="abt-divider">
            <div className="abt-divider-line" />
            <div className="abt-divider-text">What makes us different</div>
            <div className="abt-divider-line" />
          </div>

          {/* Features */}
          <div className="abt-features-title">
            Built with purpose, designed for people
          </div>
          <div className="abt-features-grid">
            {features.map((f, i) => (
              <div
                className="abt-feature-card"
                key={i}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div
                  className="abt-feature-icon"
                  style={{
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="abt-divider">
            <div className="abt-divider-line" />
            <div className="abt-divider-text">By the numbers</div>
            <div className="abt-divider-line" />
          </div>

          {/* Stats */}
          <div className="abt-stats">
            <div className="abt-stat">
              <div className="abt-stat-val">100</div>
              <div className="abt-stat-label">Free Daily Matches</div>
            </div>
            <div className="abt-stat">
              <div className="abt-stat-val">100%</div>
              <div className="abt-stat-label">Anonymous</div>
            </div>
            <div className="abt-stat">
              <div className="abt-stat-val">100%</div>
              <div className="abt-stat-label">Secured</div>
            </div>
          </div>

          <div className="abt-divider">
            <div className="abt-divider-line" />
            <div className="abt-divider-text">
              Zonnecto Founder and Developer
            </div>
            <div className="abt-divider-line" />
          </div>

          {/* Team */}
          <div className="abt-team">
            {/* Card 1 — Photo */}
            <div className="abt-team-card">
              <div className="abt-team-photo">
                <img src="/Profile_Image.png" alt="Akshat Parate" />
              </div>
              <div>
                <div className="abt-team-name">Akshat Parate</div>
                <div className="abt-team-role">Founder & Developer</div>
              </div>
            </div>

            {/* Card 2 — LinkedIn */}
            <a
              className="abt-team-card"
              href="https://www.linkedin.com/in/akshatparate03"
              target="_blank"
              rel="noopener noreferrer"
              style={{ cursor: "pointer" }}
            >
              <div
                className="abt-team-social-icon"
                style={{
                  background: "rgba(10,102,194,0.15)",
                  border: "2px solid rgba(10,102,194,0.35)",
                  boxShadow: "0 0 20px rgba(10,102,194,0.15)",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#0a66c2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div>
                <div className="abt-team-name">LinkedIn</div>
                <div className="abt-team-handle" style={{ color: "#0a66c2" }}>
                  in/akshatparate03
                </div>
              </div>
            </a>

            {/* Card 3 — Instagram */}
            <a
              className="abt-team-card"
              href="https://www.instagram.com/akshatparate03"
              target="_blank"
              rel="noopener noreferrer"
              style={{ cursor: "pointer" }}
            >
              <div
                className="abt-team-social-icon"
                style={{
                  background: "rgba(225,48,108,0.12)",
                  border: "2px solid rgba(225,48,108,0.3)",
                  boxShadow: "0 0 20px rgba(225,48,108,0.12)",
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="url(#igGrad)"
                >
                  <defs>
                    <linearGradient
                      id="igGrad"
                      x1="0%"
                      y1="100%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <div>
                <div className="abt-team-name">Instagram</div>
                <div className="abt-team-handle" style={{ color: "#e1306c" }}>
                  @akshatparate03
                </div>
              </div>
            </a>
          </div>
        </div>

        <ZnFooter />
      </div>
    </>
  );
}
