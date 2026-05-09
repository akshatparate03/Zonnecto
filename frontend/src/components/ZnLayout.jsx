import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ZnNavbar({ onlineCount, onProfileClick, onPreferenceClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.email === "zonnecto@gmail.com";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      // Don't close if clicking the hamburger button itself (it toggles)
      if (hamburgerRef.current && hamburgerRef.current.contains(e.target))
        return;
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Disclaimer", path: "/disclaimer" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        html, body { overflow-x: hidden; max-width: 100%; }
        .zn-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(7,7,16,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139,92,246,0.15);
          padding: 0 2rem; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'DM Sans', sans-serif;
        }
        .zn-nav-brand {
          display: flex; align-items: center; gap: 0.65rem;
          font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 800;
          background: linear-gradient(135deg, #c084fc, #818cf8, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          letter-spacing: -0.02em; text-decoration: none; cursor: pointer; flex-shrink: 0;
        }
        .zn-nav-logo {
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
          display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;
        }
        .zn-nav-logo img { width: 26px; height: 26px; object-fit: contain; }
        .zn-nav-center { display: flex; align-items: center; gap: 0.25rem; }
        .zn-nav-link {
          padding: 0.38rem 0.85rem; border-radius: 8px;
          font-size: 0.82rem; font-weight: 500; color: rgba(255,255,255,0.5);
          text-decoration: none; transition: all 0.2s; cursor: pointer;
          border: 1px solid transparent; white-space: nowrap;
        }
        .zn-nav-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.06); }
        .zn-nav-link-active { color: #c084fc; background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.2); }
        .zn-nav-right { display: flex; align-items: center; gap: 0.5rem; }
        .zn-online-badge {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.22);
          color: #4ade80; padding: 0.28rem 0.7rem; border-radius: 20px;
          font-size: 0.76rem; font-weight: 500; white-space: nowrap;
        }
        .zn-online-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #4ade80;
          animation: znPulse 2s ease-in-out infinite; flex-shrink: 0;
        }
        @keyframes znPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .zn-nav-btn {
          padding: 0.38rem 0.9rem; border-radius: 8px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
          transition: all 0.2s; white-space: nowrap;
        }
        .zn-nav-btn-ghost { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65); border: 1px solid rgba(255,255,255,0.1); }
        .zn-nav-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .zn-nav-btn-danger { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.22); }
        .zn-nav-btn-danger:hover { background: rgba(239,68,68,0.18); }
        .zn-nav-btn-primary { background: linear-gradient(135deg,#7c3aed,#6366f1); color: #fff; border: none; }
        .zn-nav-btn-primary:hover { opacity: 0.88; }

        /* Hamburger */
        .zn-hamburger {
          display: none; flex-direction: column; justify-content: center; align-items: center;
          width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05); cursor: pointer; gap: 5px; padding: 0;
          transition: all 0.2s; flex-shrink: 0;
        }
        .zn-hamburger:hover { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.3); }
        .zn-hamburger span {
          display: block; width: 18px; height: 1.5px; background: rgba(255,255,255,0.7);
          border-radius: 2px; transition: all 0.25s;
        }
        .zn-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .zn-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .zn-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* Drawer overlay */
        .zn-drawer-overlay {
          display: none; position: fixed; inset: 0; z-index: 98;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          animation: znFadeIn 0.2s ease;
        }
        .zn-drawer-overlay.show { display: block; }
        @keyframes znFadeIn { from{opacity:0} to{opacity:1} }

        /* Mobile drawer */
        .zn-drawer {
          display: none; position: fixed; top: 64px; left: 0; right: 0; z-index: 99;
          background: rgba(10,8,25,0.98); border-bottom: 1px solid rgba(139,92,246,0.2);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          padding: 1.25rem 1.25rem 1.5rem;
          animation: znSlideDown 0.25s cubic-bezier(0.16,1,0.3,1);
          max-height: calc(100vh - 64px); overflow-y: auto;
        }
        .zn-drawer.show { display: block; }
        @keyframes znSlideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .zn-drawer-section { margin-bottom: 1.25rem; }
        .zn-drawer-section-label {
          font-size: 0.65rem; font-weight: 600; color: rgba(255,255,255,0.25);
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; padding: 0 0.25rem;
        }
        .zn-drawer-link {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.75rem; border-radius: 10px; margin-bottom: 0.2rem;
          font-size: 0.9rem; font-weight: 500; color: rgba(255,255,255,0.65);
          text-decoration: none; transition: all 0.18s; cursor: pointer; border: 1px solid transparent;
        }
        .zn-drawer-link:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .zn-drawer-link-active { background: rgba(139,92,246,0.12); color: #c084fc; border-color: rgba(139,92,246,0.2); }
        .zn-drawer-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 1rem 0; }
        .zn-drawer-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.75rem; border-radius: 10px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
          transition: all 0.2s; margin-bottom: 0.5rem;
        }
        .zn-drawer-btn-ghost { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.09); }
        .zn-drawer-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .zn-drawer-btn-primary { background: linear-gradient(135deg,#7c3aed,#6366f1); color: #fff; }
        .zn-drawer-btn-primary:hover { opacity: 0.9; }
        .zn-drawer-btn-danger { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
        .zn-drawer-btn-danger:hover { background: rgba(239,68,68,0.18); }
        .zn-drawer-btn-admin { background: rgba(139,92,246,0.12); color: #c084fc; border: 1px solid rgba(139,92,246,0.28); font-weight: 600; }
        .zn-drawer-btn-admin:hover { background: rgba(139,92,246,0.2); }
        .zn-drawer-btn-yellow { background: rgba(250,204,21,0.08); color: #fbbf24; border: 1px solid rgba(250,204,21,0.25); font-weight: 600; }
        .zn-drawer-btn-yellow:hover { background: rgba(250,204,21,0.14); }
        .zn-drawer-online {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.18);
          color: #4ade80; padding: 0.55rem; border-radius: 10px;
          font-size: 0.82rem; font-weight: 500; margin-bottom: 0.75rem;
        }

        @media (max-width: 900px) {
          .zn-nav { padding: 0 1.25rem; }
          .zn-nav-center { display: none; }
          .zn-nav-right { display: none; }
          .zn-hamburger { display: flex; }
        }
        @media (max-width: 480px) {
          .zn-nav { padding: 0 1rem; }
          .zn-nav-brand { font-size: 1.2rem; }
          .zn-nav-logo { width: 30px; height: 30px; }
          .zn-nav-logo img { width: 22px; height: 22px; }
        }
      `}</style>

      <div
        className={`zn-drawer-overlay ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav className="zn-nav">
        <div className="zn-nav-brand" onClick={() => navigate("/")}>
          <div className="zn-nav-logo">
            <img src="/Zonnecto.png" alt="Z" />
          </div>
          Zonnecto
        </div>

        <div className="zn-nav-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`zn-nav-link ${location.pathname === link.path ? "zn-nav-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="zn-nav-right">
          {user && (
            <div className="zn-online-badge">
              <span className="zn-online-dot" />
              {onlineCount !== undefined ? `${onlineCount} online` : "Online"}
            </div>
          )}
          {user ? (
            <>
              {isAdmin && (
                <button
                  className="zn-nav-btn"
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    color: "#c084fc",
                    border: "1px solid rgba(139,92,246,0.35)",
                    fontWeight: 600,
                  }}
                  onClick={() => navigate("/admin")}
                >
                  ⚡ Admin
                </button>
              )}
              {onProfileClick && (
                <button
                  className="zn-nav-btn zn-nav-btn-ghost"
                  onClick={onProfileClick}
                >
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      display: "inline",
                      marginRight: "4px",
                      verticalAlign: "middle",
                    }}
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </button>
              )}
              {onPreferenceClick && (
                <button
                  className="zn-nav-btn"
                  style={{
                    background: "rgba(250,204,21,0.1)",
                    color: "#fbbf24",
                    border: "1px solid rgba(250,204,21,0.3)",
                    fontWeight: 600,
                  }}
                  onClick={onPreferenceClick}
                >
                  ✦ Preference
                </button>
              )}
              {!onProfileClick && (
                <button
                  className="zn-nav-btn zn-nav-btn-ghost"
                  onClick={() => navigate("/")}
                >
                  Home
                </button>
              )}
              <button
                className="zn-nav-btn zn-nav-btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="zn-nav-btn zn-nav-btn-ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="zn-nav-btn zn-nav-btn-primary"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          )}
        </div>

        <button
          ref={hamburgerRef}
          className={`zn-hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div ref={menuRef} className={`zn-drawer ${menuOpen ? "show" : ""}`}>
        {user && (
          <div className="zn-drawer-online">
            <span className="zn-online-dot" />
            {onlineCount !== undefined ? `${onlineCount} online` : "Online"}
          </div>
        )}
        <div className="zn-drawer-section">
          <div className="zn-drawer-section-label">Navigate</div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`zn-drawer-link ${location.pathname === link.path ? "zn-drawer-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="zn-drawer-divider" />
        {user ? (
          <div className="zn-drawer-section">
            <div className="zn-drawer-section-label">Account</div>
            {isAdmin && (
              <button
                className="zn-drawer-btn zn-drawer-btn-admin"
                onClick={() => {
                  navigate("/admin");
                  setMenuOpen(false);
                }}
              >
                ⚡ Admin Panel
              </button>
            )}
            {onProfileClick && (
              <button
                className="zn-drawer-btn zn-drawer-btn-ghost"
                onClick={() => {
                  onProfileClick();
                  setMenuOpen(false);
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
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>
            )}
            {onPreferenceClick && (
              <button
                className="zn-drawer-btn zn-drawer-btn-yellow"
                onClick={() => {
                  onPreferenceClick();
                  setMenuOpen(false);
                }}
              >
                ✦ Preference
              </button>
            )}
            {!onProfileClick && (
              <button
                className="zn-drawer-btn zn-drawer-btn-ghost"
                onClick={() => {
                  navigate("/");
                  setMenuOpen(false);
                }}
              >
                Home
              </button>
            )}
            <button
              className="zn-drawer-btn zn-drawer-btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="zn-drawer-section">
            <div className="zn-drawer-section-label">Get Started</div>
            <button
              className="zn-drawer-btn zn-drawer-btn-ghost"
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
            >
              Login
            </button>
            <button
              className="zn-drawer-btn zn-drawer-btn-primary"
              onClick={() => {
                navigate("/register");
                setMenuOpen(false);
              }}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function ZnFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  return (
    <>
      <style>{`
        .zn-footer {
          position: relative; z-index: 1;
          border-top: 1px solid rgba(139,92,246,0.12);
          background: rgba(7,7,16,0.6);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          padding: 1.75rem 2rem; font-family: 'DM Sans', sans-serif;
        }
        .zn-footer-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;
        }
        .zn-footer-brand { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; flex-shrink: 0; }
        .zn-footer-logo {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.25);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .zn-footer-logo img { width: 22px; height: 22px; object-fit: contain; }
        .zn-footer-name {
          font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
          background: linear-gradient(135deg, #c084fc, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .zn-footer-copy { font-size: 0.78rem; color: rgba(255,255,255,0.28); text-align: center; flex: 1; }
        .zn-footer-copy span { color: rgba(139,92,246,0.7); font-weight: 500; }
        .zn-footer-right { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; justify-content: flex-end; }
        .zn-footer-links { display: flex; align-items: center; gap: 0.1rem; flex-wrap: wrap; }
        .zn-footer-link {
          font-size: 0.76rem; color: rgba(255,255,255,0.35);
          text-decoration: none; padding: 0.2rem 0.5rem; border-radius: 6px;
          transition: all 0.2s; cursor: pointer; white-space: nowrap;
        }
        .zn-footer-link:hover { color: #c084fc; background: rgba(139,92,246,0.08); }
        .zn-footer-sep { color: rgba(255,255,255,0.12); font-size: 0.7rem; }
        .zn-footer-socials { display: flex; align-items: center; gap: 0.4rem; }
        .zn-social-btn {
          width: 30px; height: 30px; border-radius: 8px; cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; text-decoration: none; flex-shrink: 0;
        }
        .zn-social-btn:hover { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.25); color: #c084fc; }
        @media (max-width: 768px) {
          .zn-footer { padding: 1.5rem 1.25rem; }
          .zn-footer-inner { flex-direction: column; align-items: center; text-align: center; gap: 1rem; }
          .zn-footer-copy { flex: unset; }
          .zn-footer-right { flex-direction: column; align-items: center; gap: 0.75rem; }
          .zn-footer-links { justify-content: center; }
        }
        @media (max-width: 480px) {
          .zn-footer { padding: 1.25rem 1rem; }
          .zn-footer-name { font-size: 0.9rem; }
          .zn-footer-copy { font-size: 0.72rem; }
        }
      `}</style>
      <footer className="zn-footer">
        <div className="zn-footer-inner">
          <div className="zn-footer-brand" onClick={() => navigate("/")}>
            <div className="zn-footer-logo">
              <img src="/Zonnecto.png" alt="Z" />
            </div>
            <span className="zn-footer-name">Zonnecto</span>
          </div>
          <div className="zn-footer-copy">
            © {year} <span>Zonnecto</span>. All rights reserved. Unauthorized
            reproduction is prohibited.
          </div>
          <div className="zn-footer-right">
            <div className="zn-footer-socials">
              <a
                href="https://www.instagram.com/zonnecto"
                className="zn-social-btn"
                title="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="url(#igFoot2)"
                >
                  <defs>
                    <linearGradient
                      id="igFoot2"
                      x1="0%"
                      y1="100%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@zonnecto"
                className="zn-social-btn"
                title="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff0000">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://t.me/Zonnecto"
                className="zn-social-btn"
                title="Telegram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#29b6f6">
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
            <div className="zn-footer-links">
              <span
                className="zn-footer-link"
                onClick={() => navigate("/terms")}
              >
                Terms & Conditions
              </span>
              <span className="zn-footer-sep">·</span>
              <span
                className="zn-footer-link"
                onClick={() => navigate("/privacy")}
              >
                Privacy Policy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
