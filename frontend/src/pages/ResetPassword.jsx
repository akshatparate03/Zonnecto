import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) setTokenValid(false);
  }, [token]);

  const validatePassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[\S]{8,20}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be 8-20 characters with uppercase, lowercase, digit, and at least one special character",
      );
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (
        msg?.toLowerCase().includes("expired") ||
        msg?.toLowerCase().includes("invalid")
      ) {
        setTokenValid(false);
      } else {
        setError(msg || "Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const sharedCss = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{overflow-x:hidden;max-width:100%;}
    .zn-root{min-height:100vh;min-height:100dvh;background:#070710;display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:'DM Sans',sans-serif;position:relative;overflow-x:hidden;}
    .zn-orb{position:fixed;border-radius:50%;filter:blur(90px);opacity:0.15;pointer-events:none;animation:floatOrb 12s ease-in-out infinite alternate;}
    .zn-orb-1{width:min(520px,90vw);height:min(520px,90vw);background:radial-gradient(circle,#a855f7,#7c3aed);top:-120px;left:-100px;animation-duration:14s;}
    .zn-orb-2{width:min(420px,85vw);height:min(420px,85vw);background:radial-gradient(circle,#06b6d4,#3b82f6);bottom:-100px;right:-100px;animation-duration:10s;animation-direction:alternate-reverse;}
    @keyframes floatOrb { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(40px,30px) scale(1.08)} }
    .zn-grid { position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px);background-size:48px 48px; }
    .zn-card { position:relative;width:100%;max-width:430px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.10);border-radius:24px;padding:2.5rem 2.25rem;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 0 0 1px rgba(139,92,246,0.15),0 32px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08);animation:cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes cardIn { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    .zn-card::before { content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(168,85,247,0.7),rgba(6,182,212,0.6),transparent); }
    .zn-center { display:flex;flex-direction:column;align-items:center;gap:1rem;animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .zn-icon-wrap { width:64px;height:64px;border-radius:18px;display:flex;align-items:center;justify-content:center; }
    .zn-title { font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:#fff;text-align:center;letter-spacing:-0.02em; }
    .zn-sub { font-size:0.83rem;color:rgba(255,255,255,0.38);text-align:center;line-height:1.6; }
    .zn-field { display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem; }
    .zn-label { font-size:0.74rem;font-weight:500;color:rgba(255,255,255,0.45);letter-spacing:0.06em;text-transform:uppercase; }
    .zn-input-wrap { position:relative;display:flex;align-items:center; }
    .zn-input-icon { position:absolute;left:14px;color:rgba(139,92,246,0.55);display:flex;pointer-events:none; }
    .zn-input { width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:0.75rem 2.75rem 0.75rem 2.75rem;color:#fff;font-family:'DM Sans',sans-serif;font-size:0.9rem;transition:all 0.2s;outline:none; }
    .zn-input::placeholder { color:rgba(255,255,255,0.2); }
    .zn-input:focus { border-color:rgba(139,92,246,0.5);background:rgba(139,92,246,0.07);box-shadow:0 0 0 3px rgba(139,92,246,0.12); }
    .zn-input:disabled { opacity:0.5;cursor:not-allowed; }
    .zn-pw-toggle { position:absolute;right:14px;background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;padding:0;display:flex;transition:color 0.2s; }
    .zn-pw-toggle:hover { color:rgba(139,92,246,0.8); }
    .zn-pw-hint { font-size:0.68rem;color:rgba(255,255,255,0.22);margin-top:0.15rem; }
    .zn-error { display:flex;align-items:center;gap:0.5rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#fca5a5;padding:0.7rem 0.9rem;border-radius:10px;font-size:0.82rem;margin-bottom:0.75rem; }
    .zn-btn { width:100%;padding:0.85rem;border:none;border-radius:12px;background:linear-gradient(135deg,#7c3aed 0%,#6366f1 50%,#0891b2 100%);color:#fff;font-family:'Syne',sans-serif;font-size:0.92rem;font-weight:700;letter-spacing:0.04em;cursor:pointer;position:relative;overflow:hidden;transition:opacity 0.2s,transform 0.15s;box-shadow:0 4px 24px rgba(124,58,237,0.35); }
    .zn-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent);pointer-events:none; }
    .zn-btn:hover:not(:disabled) { opacity:0.92;transform:translateY(-1px); }
    .zn-btn:disabled { opacity:0.5;cursor:not-allowed; }
    .zn-spinner { display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .zn-login-btn { display:inline-flex;align-items:center;gap:0.4rem;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;text-decoration:none;padding:0.75rem 1.75rem;border-radius:12px;font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;transition:opacity 0.2s,transform 0.15s;box-shadow:0 4px 20px rgba(124,58,237,0.35); }
    .zn-login-btn:hover { opacity:0.9;transform:translateY(-1px); }
    .zn-note { font-size:0.75rem;color:rgba(255,255,255,0.22);text-align:center;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:0.6rem 0.9rem; }
    @media(max-width:480px){
      .zn-card{padding:2rem 1.5rem;border-radius:20px;}
      .zn-title{font-size:1.15rem;}
    }
    @media(max-width:380px){
      .zn-root{padding:1rem;align-items:flex-start;padding-top:2rem;}
      .zn-card{padding:1.75rem 1.1rem;border-radius:18px;}
      .zn-title{font-size:1.05rem;}
      .zn-input{font-size:0.85rem;padding:0.7rem 0.85rem 0.7rem 2.4rem;}
      .zn-btn{padding:0.78rem;font-size:0.88rem;}
      .zn-icon-wrap{width:52px;height:52px;border-radius:14px;}
      .zn-login-btn{padding:0.65rem 1.3rem;font-size:0.85rem;}
    }
    @media(max-width:320px){
      .zn-card{padding:1.5rem 0.9rem;}
      .zn-input{font-size:0.82rem;}
    }
  `;

  // ── Invalid / missing token ──
  if (!tokenValid) {
    return (
      <>
        <style>{sharedCss}</style>
        <div className="zn-root">
          <div className="zn-orb zn-orb-1" />
          <div className="zn-orb zn-orb-2" />
          <div className="zn-grid" />
          <div className="zn-card">
            <div className="zn-center">
              <div
                className="zn-icon-wrap"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="zn-title">Link Expired</div>
              <div className="zn-sub">
                This password reset link is invalid or has expired. Links are
                only valid for 15 minutes.
              </div>
              <Link
                to="/forgot-password"
                className="zn-login-btn"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                }}
              >
                Request a new link
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Success ──
  if (done) {
    return (
      <>
        <style>{sharedCss}</style>
        <div className="zn-root">
          <div className="zn-orb zn-orb-1" />
          <div className="zn-orb zn-orb-2" />
          <div className="zn-grid" />
          <div className="zn-card">
            <div className="zn-center">
              <div
                className="zn-icon-wrap"
                style={{
                  background: "rgba(74,222,128,0.1)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  color: "#4ade80",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="zn-title">Password Reset!</div>
              <div className="zn-sub">
                Your password has been updated successfully. You can now login
                with your new password.
              </div>
              <Link to="/login" className="zn-login-btn">
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Reset Form ──
  return (
    <>
      <style>{sharedCss}</style>
      <div className="zn-root">
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />
        <div className="zn-grid" />
        <div className="zn-card">
          <div className="zn-center" style={{ marginBottom: "1.5rem" }}>
            <div
              className="zn-icon-wrap"
              style={{
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.25)",
                color: "#c084fc",
              }}
            >
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="zn-title">Set New Password</div>
            <div className="zn-sub">
              Choose a strong password for your Zonnecto account.
            </div>
          </div>

          {error && (
            <div className="zn-error">
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="zn-field">
              <label className="zn-label">New Password</label>
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
                  placeholder="Min 8 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
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
              <div className="zn-pw-hint">
                8-20 chars, uppercase, lowercase, digit, special char
              </div>
            </div>

            <div className="zn-field">
              <label className="zn-label">Confirm New Password</label>
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
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="zn-pw-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? (
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
              {loading ? "Resetting..." : "Reset Password →"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
