import React, { useState } from "react";
import { ZnNavbar, ZnFooter } from "../components/ZnLayout";

const contactOptions = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email Us",
    value: "zonnecto@gmail.com",
    desc: "General inquiries & support",
    color: "#a855f7",
    href: "mailto:zonnecto@gmail.com",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="url(#igGradContact)"
      >
        <defs>
          <linearGradient
            id="igGradContact"
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
    ),
    label: "Instagram",
    value: "@zonnecto",
    desc: "Follow us for updates & reels",
    color: "#e1306c",
    href: "https://www.instagram.com/zonnecto",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#29b6f6">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    label: "Telegram",
    value: "t.me/Zonnecto",
    desc: "Join our community channel",
    color: "#29b6f6",
    href: "https://t.me/Zonnecto",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0000">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    label: "YouTube",
    value: "@zonnecto",
    desc: "Tutorials, demos & updates",
    color: "#ff0000",
    href: "https://youtube.com/@zonnecto",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const SCRIPT_URL =
        import.meta.env.VITE_OTP_SCRIPT_URL || "YOUR_APPS_SCRIPT_URL_HERE";
      // no-cors — fire and forget (Apps Script CORS allow nahi karta)
      // lekin email bhej deta hai
      fetch(
        `${SCRIPT_URL}?action=sendContactMsg` +
          `&name=${encodeURIComponent(form.name.trim())}` +
          `&email=${encodeURIComponent(form.email.trim())}` +
          `&subject=${encodeURIComponent(form.subject.trim())}` +
          `&message=${encodeURIComponent(form.message.trim())}`,
        { mode: "no-cors" },
      ).catch(() => {}); // no-cors response unreadable, ignore
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .zn-bg { min-height: 100vh; background: #070710; font-family: 'DM Sans', sans-serif; position: relative; display: flex; flex-direction: column; overflow-x: hidden; }
        .zn-orb { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.12; pointer-events: none; }
        .zn-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle,#a855f7,#7c3aed); top: -200px; right: -100px; }
        .zn-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle,#06b6d4,#3b82f6); bottom: -100px; left: -100px; }
        .zn-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px); background-size: 48px 48px; }

        .zn-content { max-width: 980px; margin: 0 auto; padding: 3.5rem 2rem 4rem; flex: 1; position: relative; z-index: 1; }

        .cnt-hero { text-align: center; margin-bottom: 3rem; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .cnt-tag {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.25);
          color: #c084fc; padding: 0.3rem 0.85rem; border-radius: 20px;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
          margin-bottom: 1rem;
        }
        .cnt-hero h1 {
          font-family: 'Syne', sans-serif; font-size: clamp(2rem,5vw,3rem); font-weight: 800;
          color: #fff; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1rem;
        }
        .cnt-hero h1 span { background: linear-gradient(135deg,#c084fc,#22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .cnt-hero p { color: rgba(255,255,255,0.42); font-size: 0.95rem; line-height: 1.65; }

        /* CONTACT OPTIONS */
        .cnt-options { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.85rem; margin-bottom: 2.5rem; }
        .cnt-option {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 1.25rem 1rem; text-align: center;
          text-decoration: none; transition: all 0.2s; cursor: pointer;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .cnt-option:hover { transform: translateY(-2px); }
        .cnt-option-icon {
          width: 42px; height: 42px; border-radius: 11px; margin: 0 auto 0.75rem;
          display: flex; align-items: center; justify-content: center;
        }
        .cnt-option-label { font-family: 'Syne', sans-serif; font-size: 0.82rem; font-weight: 700; color: #fff; margin-bottom: 0.2rem; }
        .cnt-option-value { font-size: 0.72rem; color: rgba(255,255,255,0.35); margin-bottom: 0.35rem; word-break: break-all; }
        .cnt-option-desc { font-size: 0.7rem; color: rgba(255,255,255,0.25); }

        /* TWO COL */
        .cnt-body { display: grid; grid-template-columns: 1fr 1.4fr; gap: 1.25rem; }

        /* FAQ */
        .cnt-faq { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 1.75rem; position: relative; overflow: hidden; animation: fadeUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .cnt-faq::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent); }
        .cnt-section-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; letter-spacing: -0.01em; }
        .cnt-faq-item { padding: 0.9rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .cnt-faq-item:last-child { border-bottom: none; padding-bottom: 0; }
        .cnt-faq-q { font-size: 0.82rem; font-weight: 500; color: rgba(255,255,255,0.75); margin-bottom: 0.35rem; }
        .cnt-faq-a { font-size: 0.77rem; color: rgba(255,255,255,0.35); line-height: 1.55; }

        /* FORM */
        .cnt-form-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 1.75rem; position: relative; overflow: hidden; animation: fadeUp 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both; }
        .cnt-form-wrap::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(34,211,238,0.35),rgba(139,92,246,0.3),transparent); }

        .cnt-field { margin-bottom: 1rem; }
        .cnt-label { display: block; font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.38); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 0.35rem; }
        .cnt-input, .cnt-textarea, .cnt-select {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 0.65rem 0.9rem; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; transition: all 0.2s;
        }
        .cnt-input::placeholder, .cnt-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .cnt-input:focus, .cnt-textarea:focus, .cnt-select:focus {
          border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.07);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .cnt-textarea { resize: vertical; min-height: 110px; }
        .cnt-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

        .cnt-submit {
          width: 100%; padding: 0.8rem; border: none; border-radius: 11px; cursor: pointer;
          background: linear-gradient(135deg,#7c3aed,#6366f1,#0891b2);
          color: #fff; font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.04em; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.3);
        }
        .cnt-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(124,58,237,0.4); }
        .cnt-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .cnt-success {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.75rem; padding: 2.5rem 1rem; text-align: center;
        }
        .cnt-success-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25);
          display: flex; align-items: center; justify-content: center; color: #4ade80;
        }
        .cnt-success h3 { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; }
        .cnt-success p { font-size: 0.82rem; color: rgba(255,255,255,0.38); }

        @media(max-width:768px){
          .zn-content { padding: 2.5rem 1.25rem 3rem; }
          .cnt-options { grid-template-columns: repeat(2,1fr); gap: 0.7rem; }
          .cnt-body { grid-template-columns: 1fr; }
          .cnt-row { grid-template-columns: 1fr; }
          .cnt-hero h1 { font-size: clamp(1.7rem,5vw,2.5rem); }
          .cnt-faq, .cnt-form-wrap { padding: 1.5rem 1.25rem; }
        }
        @media(max-width:560px){
          .zn-content { padding: 2rem 1rem 2.5rem; }
          .cnt-options { grid-template-columns: repeat(2,1fr); gap: 0.6rem; }
          .cnt-option { padding: 1rem 0.75rem; }
          .cnt-option-icon { width: 36px; height: 36px; }
          .cnt-option-label { font-size: 0.78rem; }
          .cnt-option-value { font-size: 0.68rem; }
          .cnt-option-desc { font-size: 0.65rem; }
        }
        @media(max-width:400px){
          .zn-content { padding: 1.5rem 0.85rem 2rem; }
          .cnt-options { grid-template-columns: 1fr 1fr; gap: 0.5rem; }
          .cnt-faq, .cnt-form-wrap { padding: 1.25rem 1rem; }
          .cnt-hero p { font-size: 0.87rem; }
          .cnt-submit { font-size: 0.85rem; padding: 0.72rem; }
        }
      `}</style>

      <div className="zn-bg">
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />
        <div className="zn-grid" />

        <ZnNavbar />

        <div className="zn-content">
          <div className="cnt-hero">
            <div className="cnt-tag">
              <svg width="9" height="9" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
              </svg>
              Get in Touch
            </div>
            <h1>
              We'd love to <span>hear from you</span>
            </h1>
            <p>
              Questions, feedback, or just want to say hi? Reach out anytime.
            </p>
          </div>

          {/* Contact Options */}
          <div className="cnt-options">
            {contactOptions.map((opt, i) => (
              <a
                key={i}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cnt-option"
                style={{ animationDelay: `${i * 0.07}s` }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = `${opt.color}35`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
                }
              >
                <div
                  className="cnt-option-icon"
                  style={{
                    background: `${opt.color}18`,
                    border: `1px solid ${opt.color}30`,
                    color: opt.color,
                  }}
                >
                  {opt.icon}
                </div>
                <div className="cnt-option-label">{opt.label}</div>
                <div className="cnt-option-value">{opt.value}</div>
                <div className="cnt-option-desc">{opt.desc}</div>
              </a>
            ))}
          </div>

          <div className="cnt-body">
            {/* FAQ */}
            <div className="cnt-faq">
              <div className="cnt-section-title">Common Questions</div>
              {[
                {
                  q: "How long does support take to respond?",
                  a: "We typically respond within 24–48 hours on business days.",
                },
                {
                  q: "I found a bug — how do I report it?",
                  a: "Email us at zonnecto@gmail.com with a description and screenshots if possible.",
                },
                {
                  q: "Can I appeal a ban?",
                  a: "Yes! Email us with your registered email and reason for appeal.",
                },
                {
                  q: "How do I delete my account?",
                  a: "Email zonnecto@gmail.com with your registered email and we'll process it within 3 business days.",
                },
                {
                  q: "Is Zonnecto safe?",
                  a: "Yes, completely safe. Fully secured, Fully anonymous.",
                },
              ].map((faq, i) => (
                <div className="cnt-faq-item" key={i}>
                  <div className="cnt-faq-q">{faq.q}</div>
                  <div className="cnt-faq-a">{faq.a}</div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="cnt-form-wrap">
              <div className="cnt-section-title">Send us a message</div>
              {submitted ? (
                <div className="cnt-success">
                  <div className="cnt-success-icon">
                    <svg
                      width="22"
                      height="22"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3>Message sent!</h3>
                  <p>We'll get back to you at your email within 24–48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="cnt-row">
                    <div className="cnt-field">
                      <label className="cnt-label">Name</label>
                      <input
                        className="cnt-input"
                        type="text"
                        placeholder="Your full name"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="cnt-field">
                      <label className="cnt-label">Email</label>
                      <input
                        className="cnt-input"
                        type="email"
                        placeholder="you@gmail.com"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="cnt-field">
                    <label className="cnt-label">Subject</label>
                    <input
                      className="cnt-input"
                      type="text"
                      placeholder="What's this about?"
                      required
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="cnt-field">
                    <label className="cnt-label">Message</label>
                    <textarea
                      className="cnt-textarea"
                      placeholder="Tell us more..."
                      required
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                    />
                  </div>
                  {error && (
                    <div
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#fca5a5",
                        padding: "0.6rem 0.9rem",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {error}
                    </div>
                  )}
                  <button
                    className="cnt-submit"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <ZnFooter />
      </div>
    </>
  );
}
