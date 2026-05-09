import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | "checking" | "registered" | "unregistered"
  const emailCheckRef = React.useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  // Real-time email check — fires when email looks complete (has @x.xx pattern)
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setError("");
    setEmailStatus(null);

    // Clear previous debounce
    if (emailCheckRef.current) clearTimeout(emailCheckRef.current);

    // Only check when email looks complete — has @ and ends with .xx (2+ chars after dot)
    const looksComplete = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/.test(val.trim());
    if (!looksComplete) return;

    setEmailStatus("checking");
    emailCheckRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(val.trim())}`,
        );
        const data = await res.json();
        setEmailStatus(data.registered ? "registered" : "unregistered");
      } catch {
        setEmailStatus(null); // silently fail — don't block login
      }
    }, 500); // 500ms debounce
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      // Parse backend error message properly
      const backendMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "";
      if (
        backendMsg.toLowerCase().includes("no account") ||
        backendMsg.toLowerCase().includes("not found") ||
        backendMsg.toLowerCase().includes("register")
      ) {
        setEmailStatus("unregistered");
        setError(""); // show inline hint instead of red error
      } else if (
        backendMsg.toLowerCase().includes("password") ||
        backendMsg.toLowerCase().includes("incorrect") ||
        backendMsg.toLowerCase().includes("invalid")
      ) {
        setError("Incorrect password. Please try again.");
      } else if (backendMsg.toLowerCase().includes("banned")) {
        setError("Your account has been banned. Contact support.");
      } else {
        setError(backendMsg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{overflow-x:hidden;max-width:100%;}
        .zn-root {
          min-height:100vh; min-height:100dvh; background:#070710;
          display:flex; align-items:center; justify-content:center;
          padding:1.5rem; font-family:'DM Sans',sans-serif;
          position:relative; overflow-x:hidden;
        }
        .zn-orb{position:fixed;border-radius:50%;filter:blur(90px);opacity:0.18;pointer-events:none;animation:floatOrb 12s ease-in-out infinite alternate;}
        .zn-orb-1{width:min(520px,90vw);height:min(520px,90vw);background:radial-gradient(circle,#a855f7,#7c3aed);top:-120px;left:-100px;animation-duration:14s;}
        .zn-orb-2{width:min(480px,85vw);height:min(480px,85vw);background:radial-gradient(circle,#06b6d4,#3b82f6);bottom:-100px;right:-100px;animation-duration:10s;animation-direction:alternate-reverse;}
        .zn-orb-3{width:min(300px,70vw);height:min(300px,70vw);background:radial-gradient(circle,#ec4899,#8b5cf6);top:40%;left:50%;transform:translate(-50%,-50%);animation-duration:18s;opacity:0.10;}
        @keyframes floatOrb{0%{transform:translate(0,0) scale(1)}100%{transform:translate(40px,30px) scale(1.08)}}
        .zn-grid{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px);background-size:48px 48px;}
        .zn-card{
          position:relative;width:100%;max-width:440px;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.10);
          border-radius:24px;padding:2.5rem 2.25rem;
          backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
          box-shadow:0 0 0 1px rgba(139,92,246,0.15),0 32px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08);
          animation:cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn{from{opacity:0;transform:translateY(28px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .zn-card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(168,85,247,0.7),rgba(6,182,212,0.7),transparent);border-radius:100%;}
        .zn-logo-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:2rem;}
        .zn-logo-img-wrap{width:68px;height:68px;border-radius:18px;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.25);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;box-shadow:0 0 24px rgba(139,92,246,0.2);overflow:hidden;}
        .zn-logo-img-wrap img{width:52px;height:52px;object-fit:contain;}
        .zn-brand{font-family:'Syne',sans-serif;font-size:1.85rem;font-weight:800;background:linear-gradient(135deg,#c084fc 0%,#818cf8 50%,#22d3ee 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.02em;line-height:1;margin-bottom:0.35rem;}
        .zn-tagline{font-size:0.78rem;color:rgba(255,255,255,0.38);letter-spacing:0.12em;text-transform:uppercase;font-weight:500;}
        .zn-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);margin-bottom:1.75rem;}
        .zn-form{display:flex;flex-direction:column;gap:1rem;}
        .zn-field{display:flex;flex-direction:column;gap:0.4rem;}
        .zn-label{font-size:0.75rem;font-weight:500;color:rgba(255,255,255,0.5);letter-spacing:0.06em;text-transform:uppercase;}
        .zn-input-wrap{position:relative;display:flex;align-items:center;}
        .zn-input-icon{position:absolute;left:14px;color:rgba(139,92,246,0.6);display:flex;pointer-events:none;}
        .zn-input{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:0.75rem 1rem 0.75rem 2.75rem;color:#fff;font-family:'DM Sans',sans-serif;font-size:0.9rem;transition:all 0.2s;outline:none;}
        .zn-input::placeholder{color:rgba(255,255,255,0.2);}
        .zn-input:focus{border-color:rgba(139,92,246,0.5);background:rgba(139,92,246,0.07);box-shadow:0 0 0 3px rgba(139,92,246,0.12);}
        .zn-input:disabled{opacity:0.5;cursor:not-allowed;}
        .zn-pw-toggle{position:absolute;right:14px;background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;padding:0;display:flex;transition:color 0.2s;}
        .zn-pw-toggle:hover{color:rgba(139,92,246,0.8);}
        .zn-error{display:flex;align-items:center;gap:0.5rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#fca5a5;padding:0.75rem 1rem;border-radius:10px;font-size:0.83rem;animation:shake 0.4s ease;}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}60%{transform:translateX(6px)}}
        .zn-field-header{display:flex;align-items:center;justify-content:space-between;}
        .zn-forgot-link{font-size:0.72rem;color:rgba(139,92,246,0.7);text-decoration:none;transition:color 0.2s;font-weight:500;}
        .zn-forgot-link:hover{color:#c084fc;}
        .zn-btn{width:100%;margin-top:0.5rem;padding:0.85rem;border:none;border-radius:12px;background:linear-gradient(135deg,#7c3aed 0%,#6366f1 50%,#0891b2 100%);color:#fff;font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;letter-spacing:0.04em;cursor:pointer;position:relative;overflow:hidden;transition:opacity 0.2s,transform 0.15s;box-shadow:0 4px 24px rgba(124,58,237,0.35),0 0 0 1px rgba(255,255,255,0.08) inset;}
        .zn-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent);pointer-events:none;}
        .zn-btn:hover:not(:disabled){opacity:0.92;transform:translateY(-1px);box-shadow:0 8px 32px rgba(124,58,237,0.45);}
        .zn-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .zn-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .zn-footer-link{text-align:center;margin-top:1.5rem;font-size:0.83rem;color:rgba(255,255,255,0.3);}
        .zn-footer-link a{color:#a78bfa;font-weight:600;text-decoration:none;transition:color 0.2s;}
        .zn-footer-link a:hover{color:#c4b5fd;}
        .zn-email-hint{display:flex;align-items:center;gap:0.4rem;font-size:0.78rem;margin-top:0.4rem;padding:0.5rem 0.75rem;border-radius:8px;animation:fadeHint 0.25s ease both;}
        @keyframes fadeHint{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        .zn-email-hint.unregistered{background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.25);color:#fdba74;}
        .zn-email-hint.registered{background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);color:#86efac;}
        .zn-email-hint.checking{color:rgba(255,255,255,0.3);font-style:italic;}
        .zn-input-wrap.email-ok .zn-input{border-color:rgba(74,222,128,0.35);}
        .zn-input-wrap.email-bad .zn-input{border-color:rgba(251,146,60,0.4);}

        @media(max-width:480px){
          .zn-card{padding:2rem 1.5rem;border-radius:20px;}
          .zn-brand{font-size:1.6rem;}
          .zn-logo-img-wrap{width:60px;height:60px;}
          .zn-logo-img-wrap img{width:44px;height:44px;}
        }
        @media(max-width:380px){
          .zn-root{padding:1rem;align-items:flex-start;padding-top:2rem;}
          .zn-card{padding:1.75rem 1.1rem;border-radius:18px;}
          .zn-brand{font-size:1.4rem;}
          .zn-logo-img-wrap{width:54px;height:54px;}
          .zn-input{font-size:0.85rem;padding:0.7rem 0.85rem 0.7rem 2.5rem;}
          .zn-btn{padding:0.78rem;font-size:0.88rem;}
          .zn-logo-wrap{margin-bottom:1.5rem;}
        }
        @media(max-width:320px){
          .zn-card{padding:1.5rem 0.9rem;}
          .zn-brand{font-size:1.3rem;}
          .zn-input{font-size:0.82rem;}
        }
      `}</style>

      <div className="zn-root">
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />
        <div className="zn-orb zn-orb-3" />
        <div className="zn-grid" />

        <div className="zn-card">
          <div className="zn-logo-wrap">
            <div className="zn-logo-img-wrap">
              <img src="/Zonnecto.png" alt="Zonnecto" />
            </div>
            <div className="zn-brand">Zonnecto</div>
            <div className="zn-tagline">Connect Anonymously</div>
          </div>
          <div className="zn-divider" />

          <form className="zn-form" onSubmit={handleSubmit}>
            {error && (
              <div className="zn-error">
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  {error}
                  {error.toLowerCase().includes("register") && (
                    <>
                      {" "}
                      <Link
                        to="/register"
                        style={{
                          color: "#c084fc",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Register here →
                      </Link>
                    </>
                  )}
                </span>
              </div>
            )}

            <div className="zn-field">
              <label className="zn-label">Email</label>
              <div
                className={`zn-input-wrap${emailStatus === "registered" ? " email-ok" : emailStatus === "unregistered" ? " email-bad" : ""}`}
              >
                <span className="zn-input-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                </span>
                <input
                  className="zn-input"
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={loading}
                />
              </div>
              {emailStatus === "checking" && (
                <div className="zn-email-hint checking">⏳ Checking...</div>
              )}
              {emailStatus === "unregistered" && (
                <div className="zn-email-hint unregistered">
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  This email is not registered.{" "}
                  <a
                    href="/register"
                    style={{
                      color: "#fb923c",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Register instead →
                  </a>
                </div>
              )}
              {emailStatus === "registered" && (
                <div className="zn-email-hint registered">
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Email found! Enter your password.
                </div>
              )}
            </div>

            <div className="zn-field">
              <div className="zn-field-header">
                <label className="zn-label">Password</label>
                <Link to="/forgot-password" className="zn-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="zn-input-wrap">
                <span className="zn-input-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  className="zn-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="zn-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="zn-btn" type="submit" disabled={loading}>
              {loading && <span className="zn-spinner" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="zn-footer-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </>
  );
}
