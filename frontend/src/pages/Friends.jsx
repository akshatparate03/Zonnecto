import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ZnDialog from "../components/ZnDialog";

// ─── Helpers (module level — component ke bahar) ──────────────────────────────

const getInitial = (str) => (str || "?")[0].toUpperCase();

const buildDpUrl = (dpUrl) => {
  if (!dpUrl) return null;
  if (dpUrl.startsWith("http")) return dpUrl;
  // API_BASE_URL already includes /api (e.g. http://localhost:8080/api)
  // Backend serves uploads at /api/uploads/... via Spring context-path
  const base = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return base + dpUrl;
};

// ✅ KEY FIX: Avatar ko Friends() function ke BAHAR define karo
// Andar define karne se har parent re-render pe naya component banta tha
// jisse React unmount+remount karta tha aur dp kabhi load nahi hoti thi
const Avatar = ({
  dpUrl,
  username,
  className = "zn-avatar",
  style = {},
  onClick,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const url = buildDpUrl(dpUrl);
  return (
    <div
      className={className}
      style={{ padding: 0, overflow: "hidden", ...style }}
      onClick={onClick}
    >
      {url && !imgFailed ? (
        <img
          src={url}
          alt={username || "user"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getInitial(username)}
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

// ─── Premium Badge — Home page jesa exact badge ───────────────────────────────
const PremiumBadge = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.3rem",
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      fontSize: "0.58rem",
      fontFamily: "'DM Sans',sans-serif",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      padding: "0.18rem 0.55rem",
      borderRadius: "20px",
      verticalAlign: "middle",
      marginLeft: "0.35rem",
      boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
      flexShrink: 0,
    }}
  >
    <span
      style={{
        color: "#000",
        WebkitTextFillColor: "#000",
        fontSize: "0.75rem",
        lineHeight: 1,
        fontStyle: "normal",
      }}
    >
      &#9733;
    </span>
    <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>Premium</span>
  </span>
);

export default function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("friends");
  const [actionLoading, setActionLoading] = useState(null);
  const [chatLoading, setChatLoading] = useState(null);
  const pollRef = useRef(null);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchRequestSent, setSearchRequestSent] = useState(false);
  // ─── Profile view modal ───────────────────────────────────────────────────
  const [viewProfile, setViewProfile] = useState(null); // { userId, dpUrl, username, ... }
  const [viewProfileLoading, setViewProfileLoading] = useState(false);
  // ─── Custom dialog ────────────────────────────────────────────────────────
  const [znDialog, setZnDialog] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 8000);
    return () => clearInterval(pollRef.current);
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchFriends(), fetchRequests(), fetchBlocked()]);
    setLoading(false);
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/friends`);
      setFriends(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/friends/requests`);
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBlocked = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/friends/blocked`);
      setBlockedUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Open profile modal — fetch full profile by userId ───────────────────
  const openProfile = async (userId) => {
    setViewProfileLoading(true);
    setViewProfile({ userId }); // open modal immediately (shows loader)
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile/${userId}`);
      setViewProfile(res.data);
    } catch (err) {
      setViewProfile(null);
    } finally {
      setViewProfileLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      await axios.post(`${API_BASE_URL}/friends/accept/${requestId}`);
      await fetchAll();
      setTab("friends");
    } catch (err) {
      setZnDialog({
        title: "Failed",
        message: "Could not accept request.",
        icon: "❌",
        confirmLabel: "OK",
        cancelLabel: null,
        onConfirm: () => setZnDialog(null),
        onCancel: () => setZnDialog(null),
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      await axios.post(`${API_BASE_URL}/friends/reject/${requestId}`);
      await fetchRequests();
    } catch (err) {
      setZnDialog({
        title: "Failed",
        message: "Could not reject request.",
        icon: "❌",
        confirmLabel: "OK",
        cancelLabel: null,
        onConfirm: () => setZnDialog(null),
        onCancel: () => setZnDialog(null),
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = (friendId, username) => {
    setZnDialog({
      title: "Remove Friend?",
      message: `${username} will be removed from your friends list.`,
      icon: "👤",
      confirmLabel: "Remove",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setZnDialog(null);
        setActionLoading(friendId);
        try {
          await axios.delete(`${API_BASE_URL}/friends/remove/${friendId}`);
          await fetchFriends();
        } catch (err) {
          setZnDialog({
            title: "Failed",
            message: "Could not remove friend.",
            icon: "❌",
            confirmLabel: "OK",
            cancelLabel: null,
            onConfirm: () => setZnDialog(null),
            onCancel: () => setZnDialog(null),
          });
        } finally {
          setActionLoading(null);
        }
      },
      onCancel: () => setZnDialog(null),
    });
  };

  const handleBlockUser = (targetId, username) => {
    setZnDialog({
      title: `Block ${username}?`,
      message: "They won't be matched with you randomly and can't message you.",
      icon: "🚫",
      confirmLabel: "Block",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setZnDialog(null);
        setActionLoading(targetId);
        try {
          await axios.post(`${API_BASE_URL}/friends/block/${targetId}`);
          await fetchAll();
        } catch (err) {
          setZnDialog({
            title: "Failed",
            message: "Could not block user.",
            icon: "❌",
            confirmLabel: "OK",
            cancelLabel: null,
            onConfirm: () => setZnDialog(null),
            onCancel: () => setZnDialog(null),
          });
        } finally {
          setActionLoading(null);
        }
      },
      onCancel: () => setZnDialog(null),
    });
  };

  const handleUnblock = async (targetId) => {
    setActionLoading(targetId);
    try {
      await axios.delete(`${API_BASE_URL}/friends/unblock/${targetId}`);
      await fetchBlocked();
    } catch (err) {
      setZnDialog({
        title: "Failed",
        message: "Could not unblock user.",
        icon: "❌",
        confirmLabel: "OK",
        cancelLabel: null,
        onConfirm: () => setZnDialog(null),
        onCancel: () => setZnDialog(null),
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartChat = async (friendId, existingRoomId) => {
    setChatLoading(friendId);
    try {
      let roomId = existingRoomId;
      if (!roomId) {
        const res = await axios.post(
          `${API_BASE_URL}/friends/chat/${friendId}`,
        );
        roomId = res.data.chatRoomId;
      }
      try {
        await axios.post(`${API_BASE_URL}/friends/chat/${roomId}/read`);
      } catch (e) {}
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, unreadCount: 0 } : f)),
      );
      sessionStorage.setItem("chatRoomId", String(roomId));
      navigate("/chat");
    } catch (err) {
      setZnDialog({
        title: "Chat Failed",
        message: err.response?.data?.error || "Could not open chat.",
        icon: "💬",
        confirmLabel: "OK",
        cancelLabel: null,
        onConfirm: () => setZnDialog(null),
        onCancel: () => setZnDialog(null),
      });
    } finally {
      setChatLoading(null);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  };

  const handleSearchUser = async () => {
    const uname = searchUsername.trim();
    if (!uname) return;
    setSearchLoading(true);
    setSearchResult(null);
    setSearchRequestSent(false);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/friends/search?username=${encodeURIComponent(uname)}`,
      );
      if (res.data && res.data.id) {
        setSearchResult(res.data);
        setSearchRequestSent(res.data.requestStatus === "PENDING");
      } else {
        setSearchResult(false);
      }
    } catch {
      setSearchResult(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSendRequest = async () => {
    if (!searchResult) return;
    setActionLoading("search");
    try {
      await axios.post(`${API_BASE_URL}/friends/request/${searchResult.id}`);
      setSearchRequestSent(true);
      setSearchResult((prev) => ({ ...prev, requestStatus: "PENDING" }));
    } catch (err) {
      const msg = err.response?.data?.error || "";
      if (
        msg.toLowerCase().includes("already") ||
        err.response?.status === 409
      ) {
        setSearchRequestSent(true);
      } else {
        setZnDialog({
          title: "Request Failed",
          message: msg || "Failed to send friend request.",
          icon: "⚠️",
          confirmLabel: "OK",
          cancelLabel: null,
          onConfirm: () => setZnDialog(null),
          onCancel: () => setZnDialog(null),
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const totalUnread = friends.reduce((sum, f) => sum + (f.unreadCount || 0), 0);
  const friendsWithUnreadCount = friends.filter(
    (f) => f.unreadCount > 0,
  ).length;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#070710",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "DM Sans,sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid rgba(139,92,246,0.3)",
              borderTopColor: "#a855f7",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html,body{overflow-x:hidden;max-width:100%;}
        .zn-bg { min-height: 100vh; min-height:100dvh; background: #070710; font-family: 'DM Sans', sans-serif; position: relative; overflow-x: hidden; width:100%; }
        .zn-orb { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.12; pointer-events: none; }
        .zn-orb-1 { width: min(600px,90vw); height: min(600px,90vw); background: radial-gradient(circle, #a855f7, #7c3aed); top: -200px; left: -150px; }
        .zn-orb-2 { width: min(500px,85vw); height: min(500px,85vw); background: radial-gradient(circle, #06b6d4, #3b82f6); bottom: -150px; right: -150px; }
        .zn-nav { position: sticky; top: 0; z-index: 100; background: rgba(7,7,16,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(139,92,246,0.15); padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; min-width: 0; }
        .zn-nav-brand { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 800; background: linear-gradient(135deg, #c084fc, #818cf8, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: flex; align-items: center; gap: 0.5rem; }
        .zn-nav-logo { width: 32px; height: 32px; border-radius: 8px; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .zn-nav-logo img { width: 24px; height: 24px; object-fit: contain; }
        .zn-back-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65); font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; transition: all 0.2s; }
        .zn-back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .zn-content { max-width: 780px; width:100%; margin: 0 auto; padding: 2.5rem 1.5rem; position: relative; z-index: 1; }
        .zn-page-tag { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.25); color: #c084fc; padding: 0.28rem 0.7rem; border-radius: 20px; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; margin-bottom: 0.6rem; }
        .zn-page-title { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; }
        .zn-page-sub { color: rgba(255,255,255,0.38); font-size: 0.85rem; margin-top: 0.3rem; margin-bottom: 2rem; }
        .zn-tabs { display: flex; gap: 0.2rem; padding: 0.25rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 1.5rem; max-width: 100%; overflow-x: auto; scrollbar-width: none; }
        .zn-tabs::-webkit-scrollbar{display:none;}
        .zn-tab { padding: 0.45rem 1.1rem; border-radius: 9px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; gap: 0.45rem; }
        .zn-tab-off { background: none; color: rgba(255,255,255,0.4); }
        .zn-tab-off:hover { color: rgba(255,255,255,0.7); }
        .zn-tab-on { background: rgba(139,92,246,0.15); color: #c084fc; border: 1px solid rgba(139,92,246,0.25); }
        .zn-badge { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 6px; font-size: 0.62rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .zn-badge-purple { background: rgba(139,92,246,0.2); color: #c084fc; }
        .zn-badge-red { background: rgba(239,68,68,0.2); color: #f87171; }
        .zn-badge-green { background: rgba(34,197,94,0.2); color: #4ade80; }
        .zn-badge-orange { background: rgba(234,88,12,0.2); color: #fb923c; }
        .zn-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; gap: 0.75rem; color: rgba(255,255,255,0.3); text-align: center; }
        .zn-empty-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(139,92,246,0.07); border: 1px solid rgba(139,92,246,0.12); display: flex; align-items: center; justify-content: center; color: rgba(139,92,246,0.4); margin-bottom: 0.25rem; }
        .zn-empty p { font-size: 0.88rem; }
        .zn-list { display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
        .zn-friend-row { background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0.85rem 1.1rem; display: flex; align-items: center; gap: 0.85rem; transition: background 0.15s; position: relative; }
        .zn-friend-row:last-child { border-bottom: none; }
        .zn-friend-row-clickable { cursor: pointer; }
        .zn-friend-row-clickable:hover { background: rgba(139,92,246,0.06); }
        .zn-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.15)); border: 1.5px solid rgba(139,92,246,0.3); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: #c084fc; flex-shrink: 0; }
        .zn-avatar-block { background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(100,100,100,0.1)); border-color: rgba(239,68,68,0.25); color: #f87171; }
        .zn-avatar-req { background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1)); border-color: rgba(139,92,246,0.3); color: #c084fc; }
        .zn-avatar-clickable { cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
        .zn-avatar-clickable:hover { transform: scale(1.08); box-shadow: 0 0 0 3px rgba(168,85,247,0.4); }
        /* ── Profile view modal ── */
        .znp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; animation: znpFadeIn 0.18s ease; }
        @keyframes znpFadeIn { from { opacity: 0 } to { opacity: 1 } }
        .znp-card { background: rgba(13,12,26,0.97); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 100%; max-width: 380px; padding: 2rem 1.75rem; box-shadow: 0 0 0 1px rgba(139,92,246,0.15), 0 32px 80px rgba(0,0,0,0.7); animation: znpSlideIn 0.22s cubic-bezier(0.16,1,0.3,1); position: relative; overflow-y: auto; max-height: 90dvh; }
        @keyframes znpSlideIn { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        .znp-close { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(255,255,255,0.5); transition: all 0.15s; }
        .znp-close:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #f87171; }
        .znp-avatar { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2)); border: 2px solid rgba(139,92,246,0.4); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-family: 'Syne',sans-serif; font-size: 2rem; font-weight: 800; color: #c084fc; flex-shrink: 0; }
        .znp-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .znp-name { font-family: 'Syne',sans-serif; font-size: 1.15rem; font-weight: 800; color: #fff; text-align: center; margin-bottom: 0.25rem; }
        .znp-username { font-size: 0.8rem; color: rgba(168,85,247,0.8); text-align: center; margin-bottom: 1.25rem; }
        .znp-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); margin-bottom: 1.25rem; }
        .znp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1rem; }
        .znp-field { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 0.6rem 0.75rem; }
        .znp-field-label { font-size: 0.62rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin-bottom: 0.2rem; }
        .znp-field-val { font-size: 0.82rem; color: rgba(255,255,255,0.8); font-weight: 500; }
        .znp-bio { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 0.6rem 0.75rem; margin-bottom: 0.6rem; }
        .znp-interests { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem; }
        .znp-tag { background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.25); color: #c084fc; font-size: 0.7rem; padding: 0.2rem 0.55rem; border-radius: 20px; font-weight: 500; }
        .znp-loader { display: flex; align-items: center; justify-content: center; height: 120px; }
        .znp-spinner { width: 32px; height: 32px; border: 3px solid rgba(139,92,246,0.2); border-top-color: #a855f7; border-radius: 50%; animation: znpSpin 0.7s linear infinite; }
        @keyframes znpSpin { to { transform: rotate(360deg) } }
        .zn-row-mid { flex: 1; min-width: 0; }
        .zn-row-top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.2rem; }
        .zn-fname { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .zn-fname-bold { color: #fff; font-weight: 800; }
        .zn-time { font-size: 0.68rem; color: rgba(255,255,255,0.3); white-space: nowrap; flex-shrink: 0; }
        .zn-time-bold { color: #a78bfa; font-weight: 700; }
        .zn-row-bottom { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .zn-preview { font-size: 0.78rem; color: rgba(255,255,255,0.3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .zn-preview-bold { color: rgba(255,255,255,0.65); font-weight: 500; }
        .zn-unread-bubble { min-width: 20px; height: 20px; border-radius: 10px; background: #7c3aed; color: #fff; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 5px; flex-shrink: 0; }
        .zn-actions { display: flex; gap: 0.4rem; flex-shrink: 0; flex-wrap: wrap; }
        .zn-btn { display: flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.7rem; border-radius: 7px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 500; transition: all 0.15s; white-space: nowrap; }
        .zn-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-chat { background: rgba(16,185,129,0.1); color: #4ade80; border: 1px solid rgba(16,185,129,0.2); }
        .btn-chat:hover:not(:disabled) { background: rgba(16,185,129,0.18); }
        .btn-remove { background: rgba(239,68,68,0.07); color: #f87171; border: 1px solid rgba(239,68,68,0.15); }
        .btn-remove:hover:not(:disabled) { background: rgba(239,68,68,0.13); }
        .btn-block { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .btn-block:hover:not(:disabled) { background: rgba(239,68,68,0.18); }
        .btn-accept { background: rgba(124,58,237,0.1); color: #c084fc; border: 1px solid rgba(124,58,237,0.22); }
        .btn-accept:hover:not(:disabled) { background: rgba(124,58,237,0.18); }
        .btn-reject { background: rgba(239,68,68,0.07); color: #f87171; border: 1px solid rgba(239,68,68,0.15); }
        .btn-reject:hover:not(:disabled) { background: rgba(239,68,68,0.13); }
        .btn-unblock { background: rgba(34,197,94,0.08); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
        .btn-unblock:hover:not(:disabled) { background: rgba(34,197,94,0.14); }
        @media (max-width: 600px) {
          .zn-content { padding: 1.5rem 0.9rem; }
          .zn-nav { padding: 0 1rem; height: 58px; }
          .zn-tabs { gap: 0.1rem; }
          .zn-tab { padding: 0.4rem 0.7rem; font-size: 0.78rem; }
          .zn-friend-row { flex-wrap: wrap; }
          .zn-actions { width: 100%; justify-content: flex-end; margin-top: 0.3rem; }
          .znp-grid { grid-template-columns: 1fr 1fr; }
          .znp-card { padding: 1.5rem 1.25rem; border-radius: 16px; }
        }
        @media (max-width: 430px) {
          .zn-content { padding: 1.25rem 0.75rem; }
          .zn-nav { padding: 0 0.85rem; }
          .zn-nav-brand { font-size: 1.05rem; }
          .zn-tab { padding: 0.35rem 0.6rem; font-size: 0.74rem; gap: 0.3rem; }
          .zn-avatar { width: 40px; height: 40px; font-size: 1rem; }
          .zn-fname { font-size: 0.85rem; }
          .zn-btn { font-size: 0.7rem; padding: 0.3rem 0.55rem; }
          .zn-friend-row { padding: 0.75rem 0.85rem; gap: 0.65rem; }
          .znp-card { padding: 1.25rem 1rem; max-width: calc(100vw - 2rem); }
          .znp-avatar { width: 64px; height: 64px; font-size: 1.5rem; }
          .znp-grid { grid-template-columns: 1fr; gap: 0.4rem; }
        }
        @media (max-width: 360px) {
          .zn-content { padding: 1rem 0.65rem; }
          .zn-tab span:not(.zn-badge) { display: none; }
          .zn-tab { padding: 0.35rem 0.5rem; }
          .zn-avatar { width: 36px; height: 36px; }
          .zn-actions { gap: 0.3rem; }
        }
      `}</style>

      <div className="zn-bg">
        <ZnDialog
          open={!!znDialog}
          title={znDialog?.title}
          message={znDialog?.message}
          icon={znDialog?.icon}
          confirmLabel={znDialog?.confirmLabel}
          confirmColor={znDialog?.confirmColor}
          cancelLabel={
            znDialog?.cancelLabel !== undefined
              ? znDialog.cancelLabel
              : "Cancel"
          }
          onConfirm={znDialog?.onConfirm}
          onCancel={znDialog?.onCancel || (() => setZnDialog(null))}
        />
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />

        <nav className="zn-nav">
          <div className="zn-nav-brand">
            <div className="zn-nav-logo">
              <img src="/Zonnecto.png" alt="Z" />
            </div>
            Zonnecto
          </div>
          <button className="zn-back-btn" onClick={() => navigate("/")}>
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Home
          </button>
        </nav>

        <div className="zn-content">
          <div className="zn-page-tag">
            <svg
              width="10"
              height="10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Your Network
          </div>
          <h1 className="zn-page-title">Friends</h1>
          <p className="zn-page-sub">
            Manage your connections and friend requests
          </p>

          <div className="zn-tabs">
            <button
              className={`zn-tab ${tab === "friends" ? "zn-tab-on" : "zn-tab-off"}`}
              onClick={() => setTab("friends")}
            >
              Friends{" "}
              <span className="zn-badge zn-badge-purple">{friends.length}</span>
              {friendsWithUnreadCount > 0 && (
                <span className="zn-badge zn-badge-green">
                  {friendsWithUnreadCount} unread
                </span>
              )}
            </button>
            <button
              className={`zn-tab ${tab === "requests" ? "zn-tab-on" : "zn-tab-off"}`}
              onClick={() => setTab("requests")}
            >
              Requests{" "}
              {requests.length > 0 && (
                <span className="zn-badge zn-badge-red">{requests.length}</span>
              )}
            </button>
            <button
              className={`zn-tab ${tab === "blocked" ? "zn-tab-on" : "zn-tab-off"}`}
              onClick={() => setTab("blocked")}
            >
              Blocked{" "}
              {blockedUsers.length > 0 && (
                <span className="zn-badge zn-badge-orange">
                  {blockedUsers.length}
                </span>
              )}
            </button>
            <button
              className={`zn-tab ${tab === "search" ? "zn-tab-on" : "zn-tab-off"}`}
              onClick={() => setTab("search")}
            >
              Find User
            </button>
          </div>

          {/* FRIENDS TAB */}
          {tab === "friends" &&
            (friends.length === 0 ? (
              <div className="zn-empty">
                <div className="zn-empty-icon">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <p>No friends yet — make some matches and add friends!</p>
              </div>
            ) : (
              <div className="zn-list">
                {friends.map((friend) => {
                  const hasUnread = friend.unreadCount > 0;
                  return (
                    <div
                      key={friend.id}
                      className="zn-friend-row zn-friend-row-clickable"
                      onClick={() =>
                        handleStartChat(friend.id, friend.chatRoomId)
                      }
                    >
                      <Avatar
                        dpUrl={friend.dpUrl}
                        username={friend.username}
                        style={
                          hasUnread
                            ? {
                                borderColor: "#7c3aed",
                                boxShadow: "0 0 0 2.5px rgba(124,58,237,0.35)",
                              }
                            : {}
                        }
                      />
                      <div className="zn-row-mid">
                        <div className="zn-row-top">
                          <span
                            className={`zn-fname ${hasUnread ? "zn-fname-bold" : ""}`}
                          >
                            {friend.username}
                            {friend.isPremium && <PremiumBadge />}
                          </span>
                          {friend.lastMessageAt && (
                            <span
                              className={`zn-time ${hasUnread ? "zn-time-bold" : ""}`}
                            >
                              {formatTime(friend.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <div className="zn-row-bottom">
                          <span
                            className={`zn-preview ${hasUnread ? "zn-preview-bold" : ""}`}
                          >
                            {friend.lastMessage
                              ? friend.lastMessage.startsWith("/uploads/chat/")
                                ? "📷 Photo"
                                : friend.lastMessage
                              : friend.fullName || friend.username}
                          </span>
                          {hasUnread && (
                            <span className="zn-unread-bubble">
                              {friend.unreadCount > 99
                                ? "99+"
                                : friend.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="zn-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="zn-btn btn-chat"
                          disabled={chatLoading === friend.id}
                          onClick={() =>
                            handleStartChat(friend.id, friend.chatRoomId)
                          }
                        >
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                          {chatLoading === friend.id ? "..." : "Chat"}
                        </button>
                        <button
                          className="zn-btn btn-remove"
                          disabled={actionLoading === friend.id}
                          onClick={() =>
                            handleRemoveFriend(friend.id, friend.username)
                          }
                        >
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                          </svg>
                          Remove
                        </button>
                        <button
                          className="zn-btn btn-block"
                          disabled={actionLoading === friend.id}
                          onClick={() =>
                            handleBlockUser(friend.id, friend.username)
                          }
                        >
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                          Block
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {/* REQUESTS TAB */}
          {tab === "requests" &&
            (requests.length === 0 ? (
              <div className="zn-empty">
                <div className="zn-empty-icon">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <p>No pending friend requests</p>
              </div>
            ) : (
              <div className="zn-list">
                {requests.map((req) => (
                  <div key={req.id} className="zn-friend-row">
                    <Avatar
                      dpUrl={req.senderDpUrl}
                      username={req.senderUsername}
                      className="zn-avatar zn-avatar-req zn-avatar-clickable"
                      style={{ cursor: "pointer" }}
                      onClick={() => openProfile(req.senderId)}
                    />
                    <div className="zn-row-mid">
                      <div className="zn-row-top">
                        <span className="zn-fname zn-fname-bold">
                          {req.senderUsername || "Unknown"}
                          {req.senderIsPremium && <PremiumBadge />}
                        </span>
                        <span className="zn-time">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="zn-row-bottom">
                        <span className="zn-preview">
                          {req.senderFullName || req.senderUsername} • Wants to
                          be friends
                        </span>
                      </div>
                    </div>
                    <div className="zn-actions">
                      <button
                        className="zn-btn btn-accept"
                        onClick={() => handleAcceptRequest(req.id)}
                        disabled={actionLoading === req.id}
                      >
                        <svg
                          width="11"
                          height="11"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {actionLoading === req.id ? "..." : "Accept"}
                      </button>
                      <button
                        className="zn-btn btn-reject"
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={actionLoading === req.id}
                      >
                        <svg
                          width="11"
                          height="11"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {/* BLOCKED TAB */}
          {tab === "blocked" &&
            (blockedUsers.length === 0 ? (
              <div className="zn-empty">
                <div className="zn-empty-icon">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </div>
                <p>You haven't blocked anyone</p>
              </div>
            ) : (
              <div className="zn-list">
                {blockedUsers.map((u) => (
                  <div key={u.id} className="zn-friend-row">
                    <Avatar
                      dpUrl={u.dpUrl}
                      username={u.username}
                      className="zn-avatar zn-avatar-block"
                    />
                    <div className="zn-row-mid">
                      <div className="zn-row-top">
                        <span
                          className="zn-fname"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {u.username}
                          {u.isPremium && <PremiumBadge />}
                        </span>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: "#f87171",
                            background: "rgba(239,68,68,0.1)",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "6px",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          Blocked
                        </span>
                      </div>
                      <div className="zn-row-bottom">
                        <span className="zn-preview">
                          {u.fullName || u.username} • Cannot match or message
                          you
                        </span>
                      </div>
                    </div>
                    <div className="zn-actions">
                      <button
                        className="zn-btn btn-unblock"
                        onClick={() => handleUnblock(u.id)}
                        disabled={actionLoading === u.id}
                      >
                        <svg
                          width="11"
                          height="11"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        {actionLoading === u.id ? "..." : "Unblock"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {/* SEARCH TAB */}
          {tab === "search" && (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  marginBottom: "1.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Enter Username..."
                  value={searchUsername}
                  onChange={(e) => {
                    setSearchUsername(e.target.value);
                    setSearchResult(null);
                    setSearchRequestSent(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "10px",
                    padding: "0.65rem 1rem",
                    color: "#fff",
                    fontFamily: "DM Sans,sans-serif",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSearchUser}
                  disabled={!searchUsername.trim() || searchLoading}
                  style={{
                    padding: "0.65rem 1.4rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(139,92,246,0.3)",
                    background: "rgba(139,92,246,0.2)",
                    color: "#c084fc",
                    fontFamily: "DM Sans,sans-serif",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor:
                      searchUsername.trim() && !searchLoading
                        ? "pointer"
                        : "not-allowed",
                    opacity: searchUsername.trim() && !searchLoading ? 1 : 0.5,
                  }}
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>

              {searchResult === false && (
                <div className="zn-empty">
                  <div className="zn-empty-icon">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <p>No user found with that username</p>
                </div>
              )}

              {searchResult && searchResult.id && (
                <div className="zn-list">
                  <div className="zn-friend-row">
                    <Avatar
                      dpUrl={searchResult.dpUrl}
                      username={searchResult.username}
                    />
                    <div className="zn-row-mid">
                      <div className="zn-row-top">
                        <span className="zn-fname">
                          {searchResult.username}
                          {searchResult.isPremium && <PremiumBadge />}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "rgba(255,255,255,0.3)",
                          }}
                        >
                          ID: {searchResult.id}
                        </span>
                      </div>
                      <div className="zn-row-bottom">
                        <span className="zn-preview">
                          {searchResult.alreadyFriend
                            ? "Already friends"
                            : searchRequestSent
                              ? "Friend request sent"
                              : "Send a friend request to connect"}
                        </span>
                      </div>
                    </div>
                    <div className="zn-actions">
                      {!searchResult.alreadyFriend && !searchRequestSent && (
                        <button
                          className="zn-btn btn-accept"
                          onClick={handleSearchSendRequest}
                          disabled={actionLoading === "search"}
                        >
                          {actionLoading === "search" ? "..." : "Add Friend"}
                        </button>
                      )}
                      {searchResult.alreadyFriend && (
                        <button
                          className="zn-btn btn-chat"
                          onClick={() => setTab("friends")}
                        >
                          Go to Friends
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {searchResult === null && !searchLoading && (
                <div className="zn-empty">
                  <div className="zn-empty-icon">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <p>Enter a Username to find and add someone as a friend</p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.2)",
                      marginTop: "0.3rem",
                    }}
                  >
                    Your ID:{" "}
                    <span style={{ color: "#c084fc", fontWeight: 600 }}>
                      #{localStorage.getItem("userId") || "?"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Profile View Modal ───────────────────────────────────────── */}
      {viewProfile && (
        <div className="znp-overlay" onClick={() => setViewProfile(null)}>
          <div className="znp-card" onClick={(e) => e.stopPropagation()}>
            <button className="znp-close" onClick={() => setViewProfile(null)}>
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {viewProfileLoading ? (
              <div className="znp-loader">
                <div className="znp-spinner" />
              </div>
            ) : (
              <>
                {/* Avatar */}
                <div className="znp-avatar">
                  {viewProfile.dpUrl ? (
                    <img
                      src={buildDpUrl(viewProfile.dpUrl)}
                      alt={viewProfile.username}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    (viewProfile.fullName ||
                      viewProfile.username ||
                      "?")[0].toUpperCase()
                  )}
                </div>

                {/* Name & username */}
                <div className="znp-name">
                  {viewProfile.fullName || viewProfile.username || "—"}
                </div>
                <div className="znp-username">
                  @{viewProfile.username || "—"}
                </div>
                <div className="znp-divider" />

                {/* Info grid */}
                <div className="znp-grid">
                  <div className="znp-field">
                    <div className="znp-field-label">Age</div>
                    <div className="znp-field-val">
                      {viewProfile.age || "Not set"}
                    </div>
                  </div>
                  <div className="znp-field">
                    <div className="znp-field-label">Gender</div>
                    <div className="znp-field-val">
                      {viewProfile.gender
                        ? viewProfile.gender.charAt(0).toUpperCase() +
                          viewProfile.gender.slice(1)
                        : "Not set"}
                    </div>
                  </div>
                  <div className="znp-field">
                    <div className="znp-field-label">City</div>
                    <div className="znp-field-val">
                      {viewProfile.city || "Not set"}
                    </div>
                  </div>
                  <div className="znp-field">
                    <div className="znp-field-label">State</div>
                    <div className="znp-field-val">
                      {viewProfile.state || "Not set"}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {viewProfile.bio && (
                  <div className="znp-bio">
                    <div className="znp-field-label">Bio</div>
                    <div
                      className="znp-field-val"
                      style={{ marginTop: "0.25rem", lineHeight: 1.5 }}
                    >
                      {viewProfile.bio}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {viewProfile.interests && (
                  <div>
                    <div
                      className="znp-field-label"
                      style={{ marginBottom: "0.4rem" }}
                    >
                      Interests
                    </div>
                    <div className="znp-interests">
                      {(Array.isArray(viewProfile.interests)
                        ? viewProfile.interests
                        : viewProfile.interests
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                      ).map((tag, i) => (
                        <span key={i} className="znp-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
