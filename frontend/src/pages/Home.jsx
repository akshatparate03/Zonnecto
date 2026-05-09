import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import { ZnNavbar, ZnFooter } from "../components/ZnLayout";
import axios from "axios";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { min-height: 100%; background: #070710; }
  .zn-bg {
    min-height: 100vh; background: #070710;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    display: flex; flex-direction: column;
  }
  .zn-orb {
    position: fixed; border-radius: 50%;
    filter: blur(100px); opacity: 0.15; pointer-events: none;
    animation: floatOrb 14s ease-in-out infinite alternate;
  }
  .zn-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #a855f7, #7c3aed); top: -200px; left: -150px; }
  .zn-orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #06b6d4, #3b82f6); bottom: -150px; right: -150px; animation-duration: 10s; animation-direction: alternate-reverse; }
  @keyframes floatOrb { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(40px,30px) scale(1.08)} }
  .zn-grid {
    position: fixed; inset: 0; pointer-events: none;
    background-image: linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }
`;

export default function Home() {
  const { user, logout } = useAuth();
  const {
    onlineCount,
    incomingReconnect,
    setIncomingReconnect,
    send,
    subscribe,
    connected,
  } = useWebSocket();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileTab, setProfileTab] = useState("view"); // "view" | "edit"
  const [profileForm, setProfileForm] = useState({
    age: "",
    bio: "",
    interests: [],
    dp: null,
  });
  const [prefForm, setPrefForm] = useState({
    gender: "",
    ageRange: "",
    state: "",
  });
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);
  const [dpPreview, setDpPreview] = useState(null);
  const [findingMatch, setFindingMatch] = useState(false);
  const [friendStats, setFriendStats] = useState({
    friends: 0,
    pending: 0,
    unread: 0,
  });
  const [matchError, setMatchError] = useState("");
  const [searchSeconds, setSearchSeconds] = useState(0);
  const [broadcastToast, setBroadcastToast] = useState(null); // { message, sentAt }
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const findingMatchRef = useRef(false); // track actual search state for cleanup
  const SEARCH_TIMEOUT = 60; // 60 seconds max search

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFriendStats();
      // Poll friend stats every 10 sec for real-time badge update
      const interval = setInterval(fetchFriendStats, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Agar chat se "Find Next" click karke aaya hai toh auto search karo
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("findMatch") === "true" && user) {
      // Small delay taaki page load ho jaaye
      const timer = setTimeout(() => {
        handleFindMatch();
        // URL clean karo
        navigate("/", { replace: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.search, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSearching();
    };
  }, []);

  // ─── Broadcast toast from admin ──────────────────────────────────────────────
  useEffect(() => {
    if (!connected) return;
    const unsub = subscribe("/topic/broadcast", (msg) => {
      try {
        const data = JSON.parse(msg.body);
        setBroadcastToast({ message: data.message, sentAt: data.sentAt });
        // No auto-dismiss — user must manually close it
      } catch (e) {}
    });
    return () => {
      if (unsub) unsub();
    };
  }, [connected, subscribe]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`);
      setProfile(response.data);
      setProfileForm({
        age: response.data.age || "",
        bio: response.data.bio || "",
        interests: response.data.interests
          ? Array.isArray(response.data.interests)
            ? response.data.interests
            : response.data.interests
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
          : [],
        dp: null,
      });
      if (response.data.dpUrl) {
        const dp = response.data.dpUrl;
        // API_BASE_URL already includes /api context-path (e.g. http://localhost:8080/api)
        // Backend serves uploads at /api/uploads/... so use API_BASE_URL directly
        setDpPreview(dp.startsWith("http") ? dp : `${API_BASE_URL}${dp}`);
      }
      // Populate preference form from existing profile data
      setPrefForm({
        gender: response.data.preferredGender || "",
        ageRange: response.data.preferredAge || "",
        state: response.data.preferredState || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFriendStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/friends/home-stats`);
      setFriendStats({
        friends: res.data.friendsCount || 0,
        pending: res.data.pendingCount || 0,
        unread: res.data.friendsWithUnread || 0,
      });
    } catch (err) {
      /* silent */
    }
  };

  const stopSearching = useCallback(
    async (cancelQueue = true) => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (cancelQueue && findingMatchRef.current) {
        try {
          await axios.post(`${API_BASE_URL}/match/leave`);
        } catch (e) {}
      }
      findingMatchRef.current = false;
      setFindingMatch(false);
      setSearchSeconds(0);
    },
    [API_BASE_URL],
  );

  const handleFindMatch = async () => {
    if (!requireAuth()) return;
    setFindingMatch(true);
    findingMatchRef.current = true;
    setMatchError("");
    setSearchSeconds(0);

    try {
      // Join queue
      const res = await axios.post(`${API_BASE_URL}/match/join`);

      if (res.data.matched) {
        // Instant match mila!
        sessionStorage.setItem("chatRoomId", res.data.chatRoomId);
        navigate("/chat");
        return;
      }

      // Queue mein hain - polling shuru karo
      // Timer - 60 seconds countdown
      timerRef.current = setInterval(() => {
        setSearchSeconds((prev) => {
          if (prev >= SEARCH_TIMEOUT - 1) {
            // Timeout - stop searching
            stopSearching(true);
            setMatchError("No match found. Please try again!");
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      // Poll every 2 seconds
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await axios.get(`${API_BASE_URL}/match/poll`);
          if (pollRes.data.matched) {
            stopSearching(false); // Queue se already nikal gaye
            sessionStorage.setItem("chatRoomId", pollRes.data.chatRoomId);
            navigate("/chat");
          }
        } catch (e) {
          console.error("Poll error:", e);
        }
      }, 2000);
    } catch (err) {
      setMatchError(
        err.response?.data?.message || "Could not start search. Try again!",
      );
      setFindingMatch(false);
      findingMatchRef.current = false;
    }
  };

  const handleCancelMatch = () => {
    stopSearching(true);
    setMatchError("");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    let dpError = null;

    // ✅ FIX: DP upload alag try-catch mein — agar fail ho toh profile update rok mat
    if (profileForm.dp) {
      try {
        const fd = new FormData();
        fd.append("file", profileForm.dp);
        await axios.post(`${API_BASE_URL}/user/upload-dp`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        dpError =
          err.response?.data?.error || "Photo upload failed (file too large?)";
      }
    }

    // Profile update — age, bio, interests
    try {
      const payload = {
        age: profileForm.age,
        bio: profileForm.bio,
        interests: profileForm.interests.join(","),
      };
      await axios.put(`${API_BASE_URL}/user/profile`, payload);
      await fetchProfile();
      setProfileTab("view");

      // DP fail hua tha toh user ko batao (profile toh save ho gayi)
      if (dpError) {
        alert(`Profile saved! But photo upload failed: ${dpError}`);
      }
    } catch (err) {
      alert(
        "Failed to update profile: " +
          (err.response?.data?.error || err.message),
      );
    }
  };

  const handleDpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileForm({ ...profileForm, dp: file });
      setDpPreview(URL.createObjectURL(file));
    }
  };

  const toggleInterest = (interest) => {
    setProfileForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSavePreference = async () => {
    setPrefSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/user/profile`, {
        preferredGender: prefForm.gender || "",
        preferredAge: prefForm.ageRange || "",
        preferredState: prefForm.state || "",
      });
      await fetchProfile();
      setPrefSaved(true);
      setTimeout(() => {
        setPrefSaved(false);
        setShowPreferenceModal(false);
      }, 1500);
    } catch (e) {
      alert(
        "Failed to save preferences: " + (e.response?.data?.error || e.message),
      );
    } finally {
      setPrefSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // If not logged in, redirect to login with return path
  const requireAuth = (action) => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  return (
    <>
      <style>{`
        ${SHARED_STYLES}
        /* MAIN */
        .zn-main {
          max-width: 1100px; margin: 0 auto; padding: 1rem 2rem;
          position: relative; z-index: 1; flex: 1; width: 100%;
          display: flex; flex-direction: column; justify-content: center;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* ─── Broadcast Toast ─── */
        .zn-broadcast-toast {
          position: fixed; top: 72px; left: 50%; transform: translateX(-50%);
          z-index: 9999;
          background: linear-gradient(135deg, rgba(124,58,237,0.97), rgba(99,102,241,0.97));
          border: 1px solid rgba(192,132,252,0.5); border-radius: 16px;
          padding: 1rem 1.25rem; max-width: min(560px, calc(100vw - 2rem));
          width: max-content; display: flex; align-items: flex-start; gap: 0.85rem;
          box-shadow: 0 12px 40px rgba(124,58,237,0.45), 0 2px 12px rgba(0,0,0,0.5);
          animation: bcToastIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
          backdrop-filter: blur(16px);
        }
        @keyframes bcToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.96); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        .zn-broadcast-toast-icon {
          font-size: 1.4rem; flex-shrink: 0; margin-top: 0.05rem;
        }
        .zn-broadcast-toast-body { flex: 1; min-width: 0; }
        .zn-broadcast-toast-label {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 0.3rem;
          font-family: 'Syne', sans-serif;
        }
        .zn-broadcast-toast-msg {
          font-size: 0.92rem; color: #fff; line-height: 1.5; word-break: break-word;
          font-weight: 500;
        }
        .zn-broadcast-toast-close {
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; color: rgba(255,255,255,0.8);
          cursor: pointer; font-size: 0.85rem; flex-shrink: 0; padding: 0.25rem 0.5rem;
          transition: all 0.15s; line-height: 1; font-family: 'DM Sans',sans-serif;
        }
        .zn-broadcast-toast-close:hover { background: rgba(255,255,255,0.25); color: #fff; }

        .zn-greeting {
          margin-bottom: 1rem;
        }
        .zn-greeting-tag {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.25);
          color: #c084fc; padding: 0.3rem 0.8rem; border-radius: 20px;
          font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase;
          font-weight: 600; margin-bottom: 0.75rem;
        }
        .zn-greeting h1 {
          font-family: 'Syne', sans-serif; font-size: 1.85rem; font-weight: 800;
          color: #fff; letter-spacing: -0.02em; line-height: 1.1;
        }
        .zn-greeting h1 span {
          background: linear-gradient(135deg, #c084fc, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .zn-greeting p { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-top: 0.5rem; }

        /* CARDS GRID */
        .zn-grid-cards {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
          margin-bottom: 0; align-items: stretch;
        }
        .zn-grid-cards > .zn-card { min-height: 380px; }
        .zn-grid-cards-full { display: grid; grid-template-columns: 1fr; gap: 1rem; }

        .zn-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px; padding: 1.75rem;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .zn-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent);
        }
        .zn-card:hover { border-color: rgba(139,92,246,0.25); transform: translateY(-2px); }

        .zn-card-icon {
          width: 44px; height: 44px; border-radius: 12px; margin-bottom: 1rem;
          display: flex; align-items: center; justify-content: center;
        }
        .zn-card-icon-purple { background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.25); color: #c084fc; }
        .zn-card-icon-cyan { background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.25); color: #22d3ee; }
        .zn-card-icon-green { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #4ade80; }

        .zn-card h2 {
          font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700;
          color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.01em;
        }
        .zn-card p { color: rgba(255,255,255,0.42); font-size: 0.85rem; line-height: 1.5; margin-bottom: 1.25rem; }

        /* BUTTONS */
        .zn-btn-primary {
          width: 100%; padding: 0.8rem; border: none; border-radius: 11px; cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #6366f1, #0891b2);
          color: #fff; font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.04em; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative; overflow: hidden;
        }
        .zn-btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.1),transparent); pointer-events:none; }
        .zn-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(124,58,237,0.4); }
        .zn-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .zn-btn-green {
          width: 100%; padding: 0.8rem; border: none; border-radius: 11px; cursor: pointer;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff; font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.04em; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative; overflow: hidden;
        }
        .zn-btn-green::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.1),transparent); pointer-events:none; }
        .zn-btn-green:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(16,185,129,0.35); }
        .zn-btn-green:disabled { opacity: 0.55; cursor: not-allowed; }

        .zn-btn-outline {
          padding: 0.65rem 1.5rem; border-radius: 10px; cursor: pointer;
          background: rgba(139,92,246,0.08); color: #c084fc;
          border: 1px solid rgba(139,92,246,0.3);
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
          transition: all 0.2s;
        }
        .zn-btn-outline:hover { background: rgba(139,92,246,0.15); }

        /* MATCH FINDING STATE */
        .zn-finding {
          display: flex; flex-direction: column; align-items: center;
          padding: 1rem 0; gap: 0.75rem;
        }
        .zn-radar {
          width: 56px; height: 56px; position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .zn-radar-ring {
          position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(139,92,246,0.5);
          animation: radarPulse 2s ease-out infinite;
        }
        .zn-radar-ring:nth-child(1) { width: 100%; height: 100%; animation-delay: 0s; }
        .zn-radar-ring:nth-child(2) { width: 70%; height: 70%; animation-delay: 0.5s; }
        .zn-radar-ring:nth-child(3) { width: 40%; height: 40%; animation-delay: 1s; }
        @keyframes radarPulse { 0%{opacity:1;transform:scale(0.5)} 100%{opacity:0;transform:scale(1.5)} }
        .zn-radar-dot { width: 10px; height: 10px; border-radius: 50%; background: #a855f7; z-index: 1; }
        .zn-finding-text { color: rgba(255,255,255,0.5); font-size: 0.85rem; letter-spacing: 0.04em; }

        /* ERROR */
        .zn-error {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5; padding: 0.5rem 0.85rem; border-radius: 9px;
          font-size: 0.78rem; margin-top: 0.5rem;
        }

        /* INFO PILLS */
        .zn-info-pills { display: flex; flex-direction: column; gap: 0.45rem; margin-top: 0; }
        .zn-pill {
          display: flex; align-items: center; gap: 0.6rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          padding: 0.5rem 0.8rem; border-radius: 9px;
          font-size: 0.77rem; color: rgba(255,255,255,0.45);
        }
        .zn-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(139,92,246,0.7); flex-shrink:0; }

        /* PROFILE STATS */
        .zn-stats { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
        .zn-stat {
          flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 0.75rem; text-align: center;
        }
        .zn-stat-val { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: #c084fc; }
        .zn-stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.35); margin-top: 0.15rem; text-transform: uppercase; letter-spacing: 0.06em; }

        /* MODAL */
        .zn-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 1.5rem;
          z-index: 200; animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .zn-modal {
          background: rgba(18,10,35,0.97); border: 1px solid rgba(139,92,246,0.2);
          border-radius: 20px; padding: 2rem; width: 100%; max-width: 420px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.15);
          position: relative; animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .zn-modal::before {
          content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
          background: linear-gradient(90deg,transparent,rgba(139,92,246,0.6),rgba(6,182,212,0.4),transparent);
        }
        .zn-modal h2 {
          font-family:'Syne',sans-serif; font-size:1.2rem; font-weight:700;
          color:#fff; margin-bottom:1.5rem; letter-spacing:-0.01em;
        }
        .zn-modal-field { margin-bottom: 1rem; }
        .zn-modal-label {
          display: block; font-size: 0.72rem; font-weight: 500;
          color: rgba(255,255,255,0.4); letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 0.35rem;
        }
        .zn-modal-input, .zn-modal-select, .zn-modal-textarea {
          width: 100%; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 9px;
          padding: 0.65rem 0.9rem; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          transition: all 0.2s; outline: none;
        }
        .zn-modal-input {
          width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0.55rem 0.8rem; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem; outline: none; transition: all 0.2s;
        }
        .zn-modal-input::-webkit-inner-spin-button, .zn-modal-input::-webkit-outer-spin-button { -webkit-appearance: none; }
        .zn-modal-input::placeholder { color: rgba(255,255,255,0.25); }
        .zn-modal-input:focus { border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.08); box-shadow: 0 0 0 2px rgba(139,92,246,0.12); }
        .zn-modal-select {
          appearance: none; -webkit-appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%23a78bfa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center; background-size: 12px;
          padding-right: 2.2rem;
        }
        .zn-modal-select option { background: #1c1033; color: #e2e8f0; }
        .zn-modal-input::placeholder, .zn-modal-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .zn-modal-input:focus, .zn-modal-select:focus, .zn-modal-textarea:focus {
          border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.07);
          box-shadow: 0 0 0 2.5px rgba(139,92,246,0.12);
        }
        .zn-modal-textarea { resize: vertical; min-height: 80px; }
        .zn-modal-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
        .zn-modal { max-height: 90vh; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.3) transparent; }
        .zn-modal-btn-save {
          flex: 1; padding: 0.7rem; border: none; border-radius: 10px; cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          color: #fff; font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .zn-modal-btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.4); }
        .zn-modal-btn-cancel {
          flex: 1; padding: 0.7rem; border: none; border-radius: 10px; cursor: pointer;
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500;
          transition: all 0.2s;
        }
        .zn-modal-btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .zn-main { padding: 1.5rem 1.25rem; }
          .zn-grid-cards { grid-template-columns: 1fr; }
          .zn-grid-cards > .zn-card { min-height: unset; }
          .zn-greeting h1 { font-size: 1.6rem; }
          .zn-stats { gap: 0.6rem; }
          .zn-modal { padding: 1.5rem; }
          .zn-modal-actions { flex-direction: column; }
        }
        @media (max-width: 480px) {
          .zn-main { padding: 1.25rem 0.9rem; }
          .zn-greeting h1 { font-size: 1.35rem; }
          .zn-greeting-tag { font-size: 0.68rem; }
          .zn-card { padding: 1.25rem; border-radius: 16px; }
          .zn-card h2 { font-size: 1rem; }
          .zn-card p { font-size: 0.82rem; }
          .zn-btn-primary, .zn-btn-green { font-size: 0.85rem; padding: 0.72rem; }
          .zn-stats { flex-direction: column; gap: 0.5rem; }
          .zn-stat { padding: 0.6rem; }
          .zn-stat-val { font-size: 1rem; }
          .zn-pill { font-size: 0.72rem; padding: 0.4rem 0.65rem; }
          .zn-modal { padding: 1.25rem; border-radius: 16px; }
          .zn-modal h2 { font-size: 1.05rem; }
          .zn-modal-overlay { padding: 1rem 0.75rem; align-items: flex-end; }
          .zn-modal { border-radius: 20px 20px 14px 14px; }
        }
        @media (max-width: 360px) {
          .zn-main { padding: 1rem 0.75rem; }
          .zn-card { padding: 1rem; }
          .zn-greeting h1 { font-size: 1.2rem; }
        }
      `}</style>

      <div className="zn-bg">
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />
        <div className="zn-grid" />

        <ZnNavbar
          onlineCount={onlineCount}
          onProfileClick={() => {
            setProfileTab("view");
            setShowProfileModal(true);
          }}
          onPreferenceClick={() => setShowPreferenceModal(true)}
        />

        {/* Main */}
        <div className="zn-main">
          {/* Greeting */}
          <div className="zn-greeting">
            <div className="zn-greeting-tag">
              <span className="zn-online-dot" />
              Welcome back
            </div>
            <h1>
              {user ? (
                <>
                  Hey,{" "}
                  <span>{profile?.username || user?.username || "there"}</span>{" "}
                  👋
                  {/* Premium badge */}
                  {(profile?.isPremium ||
                    user?.isPremium ||
                    localStorage.getItem("isPremium") === "true") && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        fontSize: "0.62rem",
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "0.22rem 0.65rem",
                        borderRadius: "20px",
                        verticalAlign: "middle",
                        marginLeft: "0.4rem",
                        boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
                        WebkitTextFillColor: "unset",
                      }}
                    >
                      <span
                        style={{
                          color: "#000",
                          WebkitTextFillColor: "#000",
                          fontSize: "0.8rem",
                          lineHeight: 1,
                          fontStyle: "normal",
                        }}
                      >
                        &#9733;
                      </span>
                      <span
                        style={{
                          color: "#fff",
                          WebkitTextFillColor: "#fff",
                        }}
                      >
                        Premium
                      </span>
                    </span>
                  )}
                </>
              ) : (
                <>
                  Welcome to <span>Zonnecto</span> ✨
                </>
              )}
            </h1>
            <p>
              {user
                ? "Ready to connect with someone new today?"
                : "Connect anonymously with people around the world."}
            </p>
          </div>

          {/* Top cards */}
          <div className="zn-grid-cards">
            {/* Find Match */}
            <div className="zn-card">
              <div className="zn-card-icon zn-card-icon-purple">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <h2>Find a Match</h2>
              <p>Chat with someone anonymously and connect in real-time.</p>

              {findingMatch ? (
                <div className="zn-finding">
                  <div className="zn-radar">
                    <div className="zn-radar-ring" />
                    <div className="zn-radar-ring" />
                    <div className="zn-radar-ring" />
                    <div className="zn-radar-dot" />
                  </div>
                  <div className="zn-finding-text">
                    Searching... ({SEARCH_TIMEOUT - searchSeconds}s)
                  </div>
                  <button
                    onClick={handleCancelMatch}
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.4rem 1rem",
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    Cancel Search
                  </button>
                </div>
              ) : (
                <button
                  className="zn-btn-green"
                  onClick={handleFindMatch}
                  disabled={findingMatch}
                >
                  Start Match
                </button>
              )}

              {matchError && (
                <div className="zn-error">
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {matchError}
                </div>
              )}

              {!findingMatch && (
                <div className="zn-info-pills" style={{ marginTop: "1rem" }}>
                  {profile?.isPremium ||
                  user?.isPremium ||
                  localStorage.getItem("isPremium") === "true" ? (
                    <>
                      <div className="zn-pill">
                        <span
                          className="zn-pill-dot"
                          style={{ background: "#f59e0b" }}
                        />
                        Unlimited matches with users
                      </div>
                      <div className="zn-pill">
                        <span
                          className="zn-pill-dot"
                          style={{ background: "#f59e0b" }}
                        />
                        Select preference for user match
                      </div>
                      <div className="zn-pill">
                        <span
                          className="zn-pill-dot"
                          style={{ background: "#f59e0b" }}
                        />
                        Reconnect with previous users
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="zn-pill">
                        <span className="zn-pill-dot" />
                        100 matches per day
                      </div>
                      <div className="zn-pill">
                        <span className="zn-pill-dot" />
                        Media available after 2 mins
                      </div>
                      <div className="zn-pill">
                        <span className="zn-pill-dot" />
                        All links are strictly restricted
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Friends */}
            <div className="zn-card">
              <div className="zn-card-icon zn-card-icon-cyan">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h2>Friends</h2>
              <p>
                Chat with people you've connected with before. View chats
                meassage and manage your friend list.
              </p>

              <div className="zn-stats">
                <div className="zn-stat">
                  <div className="zn-stat-val">{friendStats.friends}</div>
                  <div className="zn-stat-label">Friends</div>
                </div>
                <div className="zn-stat">
                  <div className="zn-stat-val">{friendStats.pending}</div>
                  <div className="zn-stat-label">Pending</div>
                </div>
                <div className="zn-stat">
                  <div
                    className="zn-stat-val"
                    style={{
                      color: friendStats.unread > 0 ? "#4ade80" : undefined,
                    }}
                  >
                    {friendStats.unread}
                  </div>
                  <div className="zn-stat-label">Unread</div>
                </div>
              </div>

              <button
                className="zn-btn-primary"
                onClick={() => {
                  if (requireAuth()) navigate("/friends");
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    display: "inline",
                    marginRight: "6px",
                    verticalAlign: "middle",
                  }}
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                View Friends
              </button>
            </div>
          </div>
        </div>

        <ZnFooter />
      </div>

      {/* ── Profile Modal ── */}
      {showProfileModal && (
        <div
          className="zn-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowProfileModal(false)
          }
        >
          <div className="zn-modal" style={{ maxWidth: 480, width: "95%" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#c084fc" }}>👤</span> My Profile
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Tab switcher */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.25rem",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 10,
                padding: "0.25rem",
              }}
            >
              {["view", "edit"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProfileTab(tab)}
                  style={{
                    flex: 1,
                    padding: "0.45rem",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background:
                      profileTab === tab ? "rgba(139,92,246,0.25)" : "none",
                    color:
                      profileTab === tab ? "#c084fc" : "rgba(255,255,255,0.4)",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: profileTab === tab ? 600 : 400,
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "view" ? "👁 View Profile" : "✏️ Edit Profile"}
                </button>
              ))}
            </div>

            {profileTab === "view" ? (
              /* ── VIEW TAB ── */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                {/* DP + Name row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid rgba(139,92,246,0.4)",
                      flexShrink: 0,
                      background: "rgba(139,92,246,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {dpPreview ? (
                      <img
                        src={dpPreview}
                        alt="dp"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 28 }}>👤</span>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {profile?.fullName || profile?.username || "—"}
                      {profile?.isPremium && (
                        <span
                          style={{
                            background:
                              "linear-gradient(135deg,#f59e0b,#d97706)",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding: "0.15rem 0.55rem",
                            borderRadius: "20px",
                            boxShadow: "0 2px 6px rgba(245,158,11,0.35)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            WebkitTextFillColor: "unset",
                          }}
                        >
                          <span
                            style={{
                              color: "#000",
                              WebkitTextFillColor: "#000",
                              fontSize: "0.68rem",
                              lineHeight: 1,
                            }}
                          >
                            &#9733;
                          </span>
                          <span
                            style={{
                              color: "#fff",
                              WebkitTextFillColor: "#fff",
                            }}
                          >
                            Premium
                          </span>
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "#c084fc",
                        marginTop: 2,
                      }}
                    >
                      @{profile?.username || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 2,
                      }}
                    >
                      {profile?.email || "—"}
                    </div>
                  </div>
                </div>
                {/* Info grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.6rem",
                  }}
                >
                  {[
                    {
                      label: "Age",
                      value: profile?.age || "Not set",
                      icon: "🎂",
                    },
                    {
                      label: "Gender",
                      value: profile?.gender
                        ? profile.gender.charAt(0).toUpperCase() +
                          profile.gender.slice(1)
                        : "Not set",
                      icon: "⚧",
                    },
                    {
                      label: "City",
                      value: profile?.city || "Not set",
                      icon: "🏙",
                    },
                    {
                      label: "State",
                      value: profile?.state || "Not set",
                      icon: "📍",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 10,
                        padding: "0.6rem 0.75rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "rgba(255,255,255,0.35)",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 3,
                        }}
                      >
                        {item.icon} {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#fff",
                          fontWeight: 500,
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Bio */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    padding: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 6,
                    }}
                  >
                    💬 Bio
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: profile?.bio ? "#fff" : "rgba(255,255,255,0.25)",
                      fontStyle: profile?.bio ? "normal" : "italic",
                    }}
                  >
                    {profile?.bio || "No bio yet — add one in Edit tab"}
                  </div>
                </div>
                {/* Interests */}
                <div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 8,
                    }}
                  >
                    ✨ Interests
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {profileForm.interests.length > 0 ? (
                      profileForm.interests.map((i) => (
                        <span
                          key={i}
                          style={{
                            background: "rgba(139,92,246,0.15)",
                            border: "1px solid rgba(139,92,246,0.3)",
                            color: "#c084fc",
                            padding: "0.25rem 0.7rem",
                            borderRadius: 20,
                            fontSize: "0.78rem",
                            fontWeight: 500,
                          }}
                        >
                          {i}
                        </span>
                      ))
                    ) : (
                      <span
                        style={{
                          fontSize: "0.82rem",
                          color: "rgba(255,255,255,0.25)",
                          fontStyle: "italic",
                        }}
                      >
                        No interests set — add in Edit tab
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setProfileTab("edit")}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                    color: "#fff",
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    marginTop: "0.25rem",
                  }}
                >
                  ✏️ Edit Profile
                </button>
              </div>
            ) : (
              /* ── EDIT TAB ── */
              <form
                onSubmit={handleUpdateProfile}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* Profile Photo + Age — same row */}
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Profile Photo
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {/* DP circle */}
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid rgba(139,92,246,0.4)",
                        flexShrink: 0,
                        background: "rgba(139,92,246,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {dpPreview ? (
                        <img
                          src={dpPreview}
                          alt="dp"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 24 }}>👤</span>
                      )}
                    </div>

                    {/* Update Photo button */}
                    <label
                      style={{
                        cursor: "pointer",
                        padding: "0.45rem 1rem",
                        background: "rgba(139,92,246,0.1)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        color: "#c084fc",
                        borderRadius: 9,
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Update Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleDpChange}
                      />
                    </label>

                    {/* ✅ FIX: Age field beside photo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "rgba(255,255,255,0.4)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 5,
                        }}
                      >
                        Age
                      </div>
                      <input
                        className="zn-modal-input"
                        type="number"
                        placeholder="e.g. 21"
                        min="13"
                        max="100"
                        value={profileForm.age}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            age: e.target.value,
                          })
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="zn-modal-field" style={{ margin: 0 }}>
                  <label className="zn-modal-label">Bio</label>
                  <textarea
                    className="zn-modal-textarea"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    placeholder="Tell people about yourself..."
                    rows={3}
                    style={{ resize: "none" }}
                  />
                </div>

                {/* Interests */}
                <div>
                  <label className="zn-modal-label">
                    Interests (select all that apply)
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginTop: 8,
                    }}
                  >
                    {[
                      "Friendship",
                      "Relationship",
                      "Situationship",
                      "Bored",
                      "Gossips",
                      "Extrovert",
                      "Introvert",
                      "Gaming",
                      "Movies",
                      "Music",
                      "Travel",
                      "Study",
                      "Foodie",
                    ].map((interest) => {
                      const active = profileForm.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          style={{
                            padding: "0.35rem 0.85rem",
                            borderRadius: 20,
                            border: "1px solid",
                            borderColor: active
                              ? "rgba(139,92,246,0.6)"
                              : "rgba(255,255,255,0.12)",
                            background: active
                              ? "rgba(139,92,246,0.2)"
                              : "rgba(255,255,255,0.04)",
                            color: active
                              ? "#c084fc"
                              : "rgba(255,255,255,0.45)",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            fontWeight: active ? 600 : 400,
                            transition: "all 0.15s",
                          }}
                        >
                          {active ? "✓ " : ""}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <button type="submit" className="zn-modal-btn-save">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="zn-modal-btn-cancel"
                    onClick={() => setProfileTab("view")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Preference Modal ── */}
      {showPreferenceModal &&
        (() => {
          const isPrem =
            profile?.isPremium ||
            user?.isPremium ||
            localStorage.getItem("isPremium") === "true";
          return (
            <div
              className="zn-modal-overlay"
              onClick={(e) =>
                e.target === e.currentTarget && setShowPreferenceModal(false)
              }
            >
              <div className="zn-modal" style={{ maxWidth: 440, width: "95%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span>✦</span> Match Preferences
                    <span
                      style={{
                        background: "linear-gradient(135deg,#f59e0b,#d97706)",
                        fontSize: "0.58rem",
                        padding: "0.15rem 0.55rem",
                        borderRadius: 20,
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        verticalAlign: "middle",
                        marginLeft: 4,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        boxShadow: "0 2px 6px rgba(245,158,11,0.3)",
                      }}
                    >
                      <span
                        style={{
                          color: "#000",
                          WebkitTextFillColor: "#000",
                          fontSize: "0.65rem",
                          lineHeight: 1,
                        }}
                      >
                        &#9733;
                      </span>
                      <span
                        style={{ color: "#fff", WebkitTextFillColor: "#fff" }}
                      >
                        Premium
                      </span>
                    </span>
                  </h2>
                  <button
                    onClick={() => setShowPreferenceModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      fontSize: 20,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {isPrem ? (
                  /* ── PREMIUM USER: Working preference form ── */
                  <>
                    <div
                      style={{
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: 10,
                        padding: "0.75rem 1rem",
                        marginBottom: "1.25rem",
                        display: "flex",
                        gap: "0.6rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>🌟</span>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.6)",
                          lineHeight: 1.5,
                        }}
                      >
                        Set your match preferences below. Leave a field empty to
                        match with anyone. Only users matching your filters will
                        be shown.
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {/* Gender preference */}
                      <div className="zn-modal-field" style={{ margin: 0 }}>
                        <label className="zn-modal-label">
                          Preferred Gender
                        </label>
                        <select
                          className="zn-modal-select"
                          value={prefForm.gender}
                          onChange={(e) =>
                            setPrefForm({ ...prefForm, gender: e.target.value })
                          }
                        >
                          <option value="">No preference (any)</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="ANY">Any</option>
                        </select>
                      </div>

                      {/* Age range */}
                      <div className="zn-modal-field" style={{ margin: 0 }}>
                        <label className="zn-modal-label">
                          Preferred Age Range
                        </label>
                        <select
                          className="zn-modal-select"
                          value={prefForm.ageRange}
                          onChange={(e) =>
                            setPrefForm({
                              ...prefForm,
                              ageRange: e.target.value,
                            })
                          }
                        >
                          <option value="">No preference (any)</option>
                          <option value="18-22">18–22</option>
                          <option value="22-25">22–25</option>
                          <option value="25-30">25–30</option>
                          <option value="30-35">30–35</option>
                          <option value="35-45">35–45</option>
                          <option value="45+">45+</option>
                        </select>
                      </div>

                      {/* State */}
                      <div className="zn-modal-field" style={{ margin: 0 }}>
                        <label className="zn-modal-label">
                          Preferred State (India)
                        </label>
                        <select
                          className="zn-modal-select"
                          value={prefForm.state}
                          onChange={(e) =>
                            setPrefForm({ ...prefForm, state: e.target.value })
                          }
                        >
                          <option value="">Any state</option>
                          {[
                            "Andhra Pradesh",
                            "Arunachal Pradesh",
                            "Assam",
                            "Bihar",
                            "Chhattisgarh",
                            "Goa",
                            "Gujarat",
                            "Haryana",
                            "Himachal Pradesh",
                            "Jharkhand",
                            "Karnataka",
                            "Kerala",
                            "Madhya Pradesh",
                            "Maharashtra",
                            "Manipur",
                            "Meghalaya",
                            "Mizoram",
                            "Nagaland",
                            "Odisha",
                            "Punjab",
                            "Rajasthan",
                            "Sikkim",
                            "Tamil Nadu",
                            "Telangana",
                            "Tripura",
                            "Uttar Pradesh",
                            "Uttarakhand",
                            "West Bengal",
                            "Delhi",
                            "Jammu & Kashmir",
                            "Ladakh",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        marginTop: "1.25rem",
                      }}
                    >
                      <button
                        onClick={handleSavePreference}
                        disabled={prefSaving || prefSaved}
                        style={{
                          flex: 1,
                          padding: "0.75rem",
                          border: "none",
                          borderRadius: 10,
                          cursor:
                            prefSaving || prefSaved ? "not-allowed" : "pointer",
                          background: prefSaved
                            ? "linear-gradient(135deg,#22c55e,#16a34a)"
                            : "linear-gradient(135deg,#7c3aed,#6366f1)",
                          color: "#fff",
                          fontFamily: "'Syne',sans-serif",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          boxShadow: prefSaved
                            ? "0 4px 16px rgba(34,197,94,0.3)"
                            : "0 4px 16px rgba(124,58,237,0.3)",
                          opacity: prefSaving ? 0.7 : 1,
                          transition: "all 0.2s",
                        }}
                      >
                        {prefSaved
                          ? "✓ Saved!"
                          : prefSaving
                            ? "Saving..."
                            : "Save Preferences"}
                      </button>
                      <button
                        type="button"
                        className={
                          isPrem ? "zn-modal-btn-save" : "zn-modal-btn-cancel"
                        }
                        style={
                          isPrem
                            ? {
                                background:
                                  "linear-gradient(135deg,#f59e0b,#d97706)",
                                boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                              }
                            : {}
                        }
                        onClick={() => {
                          setShowPreferenceModal(false);
                          if (isPrem) navigate("/premium");
                        }}
                      >
                        {isPrem ? "✦ Change Plan" : "Cancel"}
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── NON-PREMIUM USER: Upgrade prompt ── */
                  <>
                    <div
                      style={{
                        background: "rgba(250,204,21,0.07)",
                        border: "1px solid rgba(250,204,21,0.2)",
                        borderRadius: 10,
                        padding: "0.75rem 1rem",
                        marginBottom: "1.25rem",
                        display: "flex",
                        gap: "0.6rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>⭐</span>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.55)",
                          lineHeight: 1.5,
                        }}
                      >
                        Match preferences let you filter who you connect with.
                        This is a{" "}
                        <span style={{ color: "#fbbf24", fontWeight: 600 }}>
                          Premium
                        </span>{" "}
                        feature — upgrade to unlock.
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        opacity: 0.45,
                        pointerEvents: "none",
                      }}
                    >
                      <div className="zn-modal-field" style={{ margin: 0 }}>
                        <label className="zn-modal-label">
                          Preferred Gender
                        </label>
                        <select className="zn-modal-select" disabled>
                          <option>No preference</option>
                        </select>
                      </div>
                      <div className="zn-modal-field" style={{ margin: 0 }}>
                        <label className="zn-modal-label">
                          Preferred Age Range
                        </label>
                        <select className="zn-modal-select" disabled>
                          <option>No preference</option>
                        </select>
                      </div>
                      <div className="zn-modal-field" style={{ margin: 0 }}>
                        <label className="zn-modal-label">
                          Preferred State
                        </label>
                        <select className="zn-modal-select" disabled>
                          <option>Any state</option>
                        </select>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        marginTop: "1.25rem",
                      }}
                    >
                      <button
                        onClick={() => navigate("/premium")}
                        style={{
                          flex: 1,
                          padding: "0.75rem",
                          border: "none",
                          borderRadius: 10,
                          cursor: "pointer",
                          background: "linear-gradient(135deg,#d97706,#f59e0b)",
                          color: "#fff",
                          fontFamily: "'Syne',sans-serif",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
                        }}
                      >
                        ⭐ Upgrade to Premium
                      </button>
                      <button
                        type="button"
                        className="zn-modal-btn-cancel"
                        onClick={() => setShowPreferenceModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}

      {/* ── Global Reconnect Incoming Dialog — user kahi bhi ho ── */}
      {/* ─── Admin Broadcast Toast ─── */}
      {broadcastToast && (
        <div className="zn-broadcast-toast">
          <span className="zn-broadcast-toast-icon">📢</span>
          <div className="zn-broadcast-toast-body">
            <div className="zn-broadcast-toast-label">
              📣 Message from Admin
            </div>
            <div className="zn-broadcast-toast-msg">
              {broadcastToast.message}
            </div>
          </div>
          <button
            className="zn-broadcast-toast-close"
            onClick={() => setBroadcastToast(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {incomingReconnect && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(7,7,16,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(18,10,35,0.97)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "20px",
              padding: "2rem",
              maxWidth: "340px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔄</div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#fff",
                marginBottom: "0.5rem",
              }}
            >
              Reconnect Request
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.45)",
                marginBottom: "1.5rem",
              }}
            >
              Your previous partner wants to reconnect with you.
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => {
                  // Accept — reconnect-response bhejo aur chat pe jao
                  send(
                    `/app/chat/${incomingReconnect.chatRoomId}/reconnect-response`,
                    {
                      accepted: true,
                      chatRoomId: parseInt(incomingReconnect.chatRoomId),
                    },
                  );
                  sessionStorage.setItem(
                    "chatRoomId",
                    incomingReconnect.chatRoomId,
                  );
                  setIncomingReconnect(null);
                  navigate("/chat");
                }}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "none",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Accept
              </button>
              <button
                onClick={() => {
                  send(
                    `/app/chat/${incomingReconnect.chatRoomId}/reconnect-response`,
                    {
                      accepted: false,
                      chatRoomId: parseInt(incomingReconnect.chatRoomId),
                    },
                  );
                  setIncomingReconnect(null);
                }}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "'DM Sans',sans-serif",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
