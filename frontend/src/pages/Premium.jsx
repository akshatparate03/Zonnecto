import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ZnNavbar, ZnFooter } from "../components/ZnLayout";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const plans = [
  {
    id: "BASIC",
    name: "Basic",
    price: "₹30",
    priceNum: 30,
    amountPaise: 3000,
    period: "/ 1 month",
    durationDays: 30,
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.25)",
    badge: null,
    features: [
      "Match preference by gender",
      "Match preference by age",
      "Match preference by state",
      "Unlimited matches per day",
      "Priority matching queue",
      "Exclusive premium badge",
      "Early access to new features",
      "Reconnect to previous user",
    ],
    cta: "Get Basic",
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "₹80",
    priceNum: 80,
    amountPaise: 8000,
    period: "/ 3 months",
    durationDays: 90,
    color: "#c084fc",
    glow: "rgba(192,132,252,0.3)",
    badge: "Most Popular",
    features: [
      "Match preference by gender",
      "Match preference by age",
      "Match preference by state",
      "Unlimited matches per day",
      "Priority matching queue",
      "Exclusive premium badge",
      "Early access to new features",
      "Reconnect to previous user",
    ],
    cta: "Get Starter",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹120",
    priceNum: 120,
    amountPaise: 12000,
    period: "/ 6 months",
    durationDays: 180,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
    badge: "Best Value",
    features: [
      "Match preference by gender",
      "Match preference by age",
      "Match preference by state",
      "Unlimited matches per day",
      "Priority matching queue",
      "Exclusive premium badge",
      "Early access to new features",
      "Reconnect to previous user",
    ],
    cta: "Get Pro",
  },
  {
    id: "ULTIMATE",
    name: "Ultimate",
    price: "₹300",
    priceNum: 300,
    amountPaise: 30000,
    period: "/ 12 months",
    durationDays: 365,
    color: "#34d399",
    glow: "rgba(52,211,153,0.25)",
    badge: "Best Deal",
    features: [
      "Match preference by gender",
      "Match preference by age",
      "Match preference by state",
      "Unlimited matches per day",
      "Priority matching queue",
      "Exclusive premium badge",
      "Early access to new features",
      "Reconnect to previous user",
    ],
    cta: "Get Ultimate",
  },
];

const CheckIcon = ({ color }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Premium() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("STARTER");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  // Helper — token always from user context first, then localStorage fallback
  const getToken = () => user?.token || localStorage.getItem("token");

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (e) {}
  };

  const isPremiumActive =
    profile?.isPremium || localStorage.getItem("isPremium") === "true";

  const handleGetPlan = async (plan) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setError("");
    setLoading(plan.id);

    // Token from context (most reliable) with localStorage fallback
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    // Also set defaults as backup
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      // Step 1: Try to create Razorpay order
      let orderData = null;
      try {
        const orderRes = await axios.post(
          `${API_BASE_URL}/payment/create-order`,
          {
            planId: plan.id,
            durationDays: plan.durationDays,
            amount: plan.amountPaise,
          },
          authHeader,
        );
        orderData = orderRes.data;
      } catch (orderErr) {
        // Agar Razorpay placeholder/test keys hain ya backend error aaya
        // to direct activate fallback use karo (dev/demo mode)
        const errMsg = orderErr.response?.data?.error || "";
        const isPlaceholder =
          errMsg.includes("Authentication failed") ||
          errMsg.includes("PLACEHOLDER") ||
          errMsg.includes("BAD_REQUEST") ||
          orderErr.response?.status === 500;

        if (isPlaceholder) {
          // Dev mode — seedha activate karo with explicit auth header
          const activateRes = await axios.post(
            `${API_BASE_URL}/payment/activate`,
            {
              planId: plan.id,
              durationDays: plan.durationDays,
            },
            authHeader,
          );
          if (activateRes.data.success) {
            localStorage.setItem("isPremium", "true");
            localStorage.setItem("premiumPlan", plan.id);
            if (activateRes.data.premiumExpiresAt) {
              localStorage.setItem(
                "premiumExpiresAt",
                activateRes.data.premiumExpiresAt,
              );
            }
            setSuccess(true);
            fetchProfile();
          }
          setLoading(false);
          return;
        }
        throw orderErr;
      }

      // Step 2: Load Razorpay script (only if we have a real order)
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError(
          "Razorpay failed to load. Please check your internet connection.",
        );
        setLoading(false);
        return;
      }

      const { orderId, keyId } = orderData;

      // Step 3: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: plan.amountPaise,
        currency: "INR",
        name: "Zonnecto",
        description: `${plan.name} Plan — ${plan.period}`,
        image: "https://zonnecto.netlify.app/Zonnecto.svg",
        order_id: orderId,
        handler: async (response) => {
          // Step 4: Verify payment on backend
          // token already captured in closure from handleGetPlan
          try {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/payment/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planId: plan.id,
                durationDays: plan.durationDays,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );

            if (verifyRes.data.success) {
              localStorage.setItem("isPremium", "true");
              localStorage.setItem("premiumPlan", plan.id);
              if (verifyRes.data.premiumExpiresAt) {
                localStorage.setItem(
                  "premiumExpiresAt",
                  verifyRes.data.premiumExpiresAt,
                );
              }
              setSuccess(true);
              fetchProfile();
            }
          } catch (e) {
            setError("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: user?.email || "",
          name: user?.fullName || user?.username || "",
          contact: "", // Empty rakho — Razorpay account ka number auto-fill na ho
        },
        theme: {
          color: "#7c3aed",
          backdrop_color: "rgba(7,7,16,0.85)",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (e) {
      setError(
        e.response?.data?.error || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }
        html, body, #root { min-height: 100%; background: #070710; }
        .pm-bg {
          min-height: 100vh; min-height: 100dvh; background: #070710;
          font-family: 'DM Sans', sans-serif;
          position: relative; display: flex; flex-direction: column;
          overflow-x: hidden; width: 100%;
        }
        .pm-orb { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.13; pointer-events: none; }
        .pm-orb-1 { width: min(600px,90vw); height: min(600px,90vw); background: radial-gradient(circle,#a855f7,#7c3aed); top:-200px; left:-150px; }
        .pm-orb-2 { width: min(500px,85vw); height: min(500px,85vw); background: radial-gradient(circle,#f59e0b,#d97706); bottom:-100px; right:-100px; }
        .pm-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px); background-size: 48px 48px; }
        .pm-content { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem 4rem; flex: 1; position: relative; z-index: 1; }

        .pm-hero { text-align: center; margin-bottom: 3rem; }
        .pm-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; padding: 0.3rem 0.9rem; border-radius: 20px; font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin-bottom: 1rem; }
        .pm-hero h1 { font-family: 'Syne', sans-serif; font-size: clamp(2rem,5vw,3rem); font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1rem; }
        .pm-hero h1 span { background: linear-gradient(135deg,#f59e0b,#fbbf24,#c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .pm-hero p { color: rgba(255,255,255,0.42); font-size: 1rem; line-height: 1.65; max-width: 500px; margin: 0 auto; }

        .pm-error { display: flex; align-items: center; gap: 0.5rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; padding: 0.8rem 1rem; border-radius: 12px; font-size: 0.83rem; margin-bottom: 1.5rem; }

        .pm-active-banner { display: flex; align-items: center; gap: 1rem; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 2rem; }
        .pm-active-banner-icon { font-size: 2rem; flex-shrink: 0; }
        .pm-active-banner-text strong { font-family: 'Syne',sans-serif; font-size: 1rem; font-weight: 700; color: #fbbf24; display: block; margin-bottom: 0.2rem; }
        .pm-active-banner-text span { font-size: 0.82rem; color: rgba(255,255,255,0.4); }

        .pm-plans { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.25rem; margin-bottom: 3rem; }
        .pm-plan { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.75rem 1.5rem; position: relative; overflow: hidden; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; }
        .pm-plan:hover { transform: translateY(-3px); }
        .pm-plan.active { border-color: var(--plan-color); background: rgba(255,255,255,0.05); box-shadow: 0 0 40px var(--plan-glow), inset 0 1px 0 rgba(255,255,255,0.08); }
        .pm-plan::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg,transparent,var(--plan-color),transparent); opacity:0; transition:opacity 0.2s; }
        .pm-plan.active::before { opacity:1; }
        .pm-plan-badge { position: absolute; top: 1rem; right: 1rem; background: var(--plan-color); color: #070710; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em; padding: 0.2rem 0.55rem; border-radius: 20px; text-transform: uppercase; }
        .pm-plan-name { font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; color: var(--plan-color); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
        .pm-plan-price { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 0.25rem; }
        .pm-plan-price-val { font-family: 'Syne', sans-serif; font-size: 2.4rem; font-weight: 800; color: #fff; }
        .pm-plan-price-period { font-size: 0.8rem; color: rgba(255,255,255,0.35); }
        .pm-plan-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 1rem 0; }
        .pm-features { display: flex; flex-direction: column; gap: 0.6rem; flex: 1; margin-bottom: 1.5rem; }
        .pm-feature { display: flex; align-items: center; gap: 0.6rem; font-size: 0.82rem; color: rgba(255,255,255,0.65); }
        .pm-cta-btn { width: 100%; padding: 0.75rem; border: none; border-radius: 12px; cursor: pointer; font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; transition: all 0.2s; background: var(--plan-color); color: #070710; box-shadow: 0 4px 20px var(--plan-glow); position: relative; display: flex; align-items: center; justify-content: center; gap: 0.4rem; }
        .pm-cta-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px var(--plan-glow); opacity: 0.92; }
        .pm-cta-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .pm-btn-spinner { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(0,0,0,0.25); border-top-color: #070710; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .pm-note { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.5rem; text-align: center; color: rgba(255,255,255,0.35); font-size: 0.82rem; line-height: 1.6; }
        .pm-note strong { color: rgba(255,255,255,0.6); }

        .pm-back { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.55); padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.82rem; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; margin-bottom: 2.5rem; }
        .pm-back:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .pm-success { text-align: center; padding: 4rem 1.5rem; animation: fadeUp 0.5s both; }
        .pm-success-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        .pm-success h2 { font-family: 'Syne',sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
        .pm-success p { color: rgba(255,255,255,0.45); font-size: 0.9rem; margin-bottom: 2rem; }
        .pm-success-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg,rgba(245,158,11,0.15),rgba(168,85,247,0.15)); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; padding: 0.5rem 1.25rem; border-radius: 20px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.9rem; margin-bottom: 2rem; }
        .pm-go-home { padding: 0.85rem 2rem; border: none; border-radius: 12px; background: rgba(255,255,255,0.08); color: #fff; font-family: 'Syne',sans-serif; font-weight: 700; cursor: pointer; transition: background 0.2s; font-size: 0.95rem; }
        .pm-go-home:hover { background: rgba(255,255,255,0.14); }

        .pm-faq { margin-top: 3rem; }
        .pm-faq-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1rem; text-align: center; }
        .pm-faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .pm-faq-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.2rem 1.4rem; }
        .pm-faq-q { font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .pm-faq-a { font-size: 0.8rem; color: rgba(255,255,255,0.38); line-height: 1.55; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .pm-content { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }

        @media(max-width:900px){ .pm-plans { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:640px){ .pm-content { padding: 2.5rem 1rem 3rem; } .pm-hero h1 { font-size: clamp(1.6rem,5vw,2.2rem); } .pm-plans { grid-template-columns: repeat(2,1fr); gap: 0.75rem; } }
        @media(max-width:560px){ .pm-plans { grid-template-columns: 1fr; } .pm-faq-grid { grid-template-columns: 1fr; } }
        @media(max-width:430px){ .pm-content { padding: 2rem 0.9rem 2.5rem; } .pm-hero { margin-bottom: 2rem; } .pm-plans { gap: 0.6rem; } }
        @media(max-width:380px){ .pm-content { padding: 1.5rem 0.75rem 2rem; } .pm-hero h1 { font-size: 1.5rem; } }
      `}</style>

      <div className="pm-bg">
        <div className="pm-orb pm-orb-1" />
        <div className="pm-orb pm-orb-2" />
        <div className="pm-grid" />

        <ZnNavbar />

        <div className="pm-content">
          {success ? (
            <div className="pm-success">
              <div className="pm-success-icon">🎉</div>
              <h2>Welcome to Premium!</h2>
              <p>
                Your premium plan is now active. Enjoy unlimited matches and all
                premium features.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "2rem",
                }}
              >
                <div className="pm-success-badge">⭐ Premium Member</div>
              </div>
              <button className="pm-go-home" onClick={() => navigate("/")}>
                Go to Home →
              </button>
            </div>
          ) : (
            <>
              <button className="pm-back" onClick={() => navigate("/")}>
                ← Back to Home
              </button>

              <div className="pm-hero">
                <div className="pm-badge">⭐ Premium Plans</div>
                <h1>
                  Upgrade Your
                  <br />
                  <span>Connection Game</span>
                </h1>
                <p>
                  Get premium access to match preferences, priority queue, and
                  exclusive features.
                </p>
              </div>

              {error && (
                <div className="pm-error">
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

              {isPremiumActive && (
                <div className="pm-active-banner">
                  <div className="pm-active-banner-icon">⭐</div>
                  <div className="pm-active-banner-text">
                    <strong>You're already a Premium member!</strong>
                    <span>
                      Plan:{" "}
                      {profile?.premiumPlan ||
                        localStorage.getItem("premiumPlan") ||
                        "—"}
                      {profile?.premiumExpiresAt
                        ? ` · Expires: ${new Date(profile.premiumExpiresAt).toLocaleDateString("en-IN")}`
                        : " · Active"}
                    </span>
                  </div>
                </div>
              )}

              <div className="pm-plans">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`pm-plan ${selected === plan.id ? "active" : ""}`}
                    style={{
                      "--plan-color": plan.color,
                      "--plan-glow": plan.glow,
                    }}
                    onClick={() => setSelected(plan.id)}
                  >
                    {plan.badge && (
                      <div className="pm-plan-badge">{plan.badge}</div>
                    )}
                    <div className="pm-plan-name">{plan.name}</div>
                    <div className="pm-plan-price">
                      <span className="pm-plan-price-val">{plan.price}</span>
                      <span className="pm-plan-price-period">
                        {plan.period}
                      </span>
                    </div>
                    <div className="pm-plan-divider" />
                    <div className="pm-features">
                      {plan.features.map((f) => (
                        <div className="pm-feature" key={f}>
                          <CheckIcon color={plan.color} />
                          {f}
                        </div>
                      ))}
                    </div>
                    <button
                      className="pm-cta-btn"
                      disabled={!!loading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetPlan(plan);
                      }}
                    >
                      {loading === plan.id ? (
                        <>
                          <span className="pm-btn-spinner" /> Opening...
                        </>
                      ) : isPremiumActive ? (
                        `Extend — ${plan.price}`
                      ) : (
                        plan.cta
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pm-note">
                <strong>🔒 Secured by Razorpay</strong> — Industry-standard
                256-bit SSL encryption. Supports UPI, Cards, Net Banking &
                Wallets. Premium activates instantly after payment.
              </div>

              <div className="pm-faq">
                <div className="pm-faq-title">Frequently Asked Questions</div>
                <div className="pm-faq-grid">
                  {[
                    {
                      q: "What happens when my plan expires?",
                      a: "Your account reverts to the free tier. Your matches and friend connections remain intact — only preference filters are disabled.",
                    },
                    {
                      q: "Can I extend my plan later?",
                      a: "Yes! You can extend your plan anytime. The new duration is added on top of your existing expiry date.",
                    },
                    {
                      q: "Is my identity still anonymous?",
                      a: "Absolutely. Premium doesn't change your anonymity. You still chat anonymously — preferences just help you find better matches.",
                    },
                    {
                      q: "How do match preferences work?",
                      a: "After enabling premium, your match preferences (gender, age, state) are applied before joining the queue, improving match quality.",
                    },
                  ].map((item) => (
                    <div className="pm-faq-item" key={item.q}>
                      <div className="pm-faq-q">{item.q}</div>
                      <div className="pm-faq-a">{item.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <ZnFooter />
      </div>
    </>
  );
}
