import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import axios from "axios";
import ZnDialog from "../components/ZnDialog";

export default function Chat() {
  const chatRoomId = sessionStorage.getItem("chatRoomId");
  const { user } = useAuth();
  const {
    subscribe,
    send,
    connected,
    incomingReconnect,
    setIncomingReconnect,
  } = useWebSocket();
  const navigate = useNavigate();

  // ✅ Extra safety: profile API se bhi premium status verify karo
  const [premiumFromProfile, setPremiumFromProfile] = useState(false);

  // ✅ useMemo — user object ya premiumFromProfile change hone pe recompute hoga
  const isPremiumUser = useMemo(() => {
    if (premiumFromProfile) return true;
    if (user?.isPremium === true || user?.isPremium === "true") return true;
    const stored = localStorage.getItem("isPremium");
    return stored === "true";
  }, [user, premiumFromProfile]);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [linkWarningCount, setLinkWarningCount] = useState(0);
  const [linkAlert, setLinkAlert] = useState({ show: false, type: "" });
  const [relationship, setRelationship] = useState({
    friend: false,
    blocked: false,
    blockedByThem: false,
    requestSent: false,
  });
  const [relLoading, setRelLoading] = useState(false);
  // Friend chat: partner ka naam + dp
  const [partnerInfo, setPartnerInfo] = useState(null);
  // Reconnect feature (premium only)
  const [reconnectRequested, setReconnectRequested] = useState(false);
  const [reconnectIncoming, setReconnectIncoming] = useState(false);
  const [reconnectStatus, setReconnectStatus] = useState(""); // "pending" | "accepted" | "rejected" | ""
  // Custom dialog state
  const [znDialog, setZnDialog] = useState(null); // { title, message, icon, confirmLabel, confirmColor, cancelLabel, onConfirm, onCancel }

  const messagesEndRef = useRef(null);
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  // context-path = /api, so uploads served at /api/uploads/...
  // Keep /api — DO NOT strip it
  const MEDIA_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    if (!chatRoomId) {
      navigate("/");
      return;
    }
    fetchChatRoom();
    fetchMessages();
    // ✅ Profile se direct premium status fetch karo — most reliable source
    axios
      .get(`${API_BASE_URL}/user/profile`)
      .then((res) => {
        if (res.data?.isPremium === true) {
          setPremiumFromProfile(true);
          localStorage.setItem("isPremium", "true");
        }
      })
      .catch(() => {});
  }, [chatRoomId]);

  useEffect(() => {
    if (!connected || !chatRoomId) return;

    const unsubChat = subscribe(`/topic/chat/${chatRoomId}`, (msg) => {
      try {
        const message = JSON.parse(msg.body);
        // Normalize messageType
        message.messageType = (message.messageType || "TEXT").toUpperCase();
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    });

    const unsubStatus = subscribe(`/topic/room/${chatRoomId}/status`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        if (data.event === "PARTNER_LEFT") {
          // Friend chat mein PARTNER_LEFT nahi dikhana — WhatsApp style
          const storedRoomType = sessionStorage.getItem("chatRoomType");
          if (storedRoomType !== "FRIEND_CHAT") {
            setPartnerLeft(true);
          }
        } else if (data.event === "RECONNECT_REQUEST") {
          // Partner ne reconnect request bheji hai
          // Apna request apne paas nahi aana chahiye — userId check karo
          const myId = parseInt(
            user?.id || user?.userId || localStorage.getItem("userId"),
          );
          if (data.userId && parseInt(data.userId) === myId) {
            return; // Yeh apna hi request hai — ignore karo
          }
          setReconnectIncoming(true);
        } else if (data.event === "RECONNECT_ACCEPTED") {
          // Partner ne accept kiya — dono ke liye chat resume
          setPartnerLeft(false);
          setReconnectRequested(false);
          setReconnectStatus("accepted");
          setTimeout(() => setReconnectStatus(""), 3000);
        } else if (data.event === "RECONNECT_REJECTED") {
          setReconnectStatus("rejected");
          setReconnectRequested(false);
          setTimeout(() => setReconnectStatus(""), 3000);
        }
      } catch (e) {}
    });

    // ✅ Task 2: Edit events - dono users ke liye message update
    const unsubEdit = subscribe(`/topic/chat/${chatRoomId}/edit`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? { ...m, content: data.content, edited: true }
              : m,
          ),
        );
      } catch (e) {}
    });

    // ✅ Task 2: Delete events - dono users ke liye message delete
    const unsubDelete = subscribe(`/topic/chat/${chatRoomId}/delete`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      } catch (e) {}
    });

    return () => {
      if (unsubChat) unsubChat();
      if (unsubStatus) unsubStatus();
      if (unsubEdit) unsubEdit();
      if (unsubDelete) unsubDelete();
    };
  }, [connected, chatRoomId, subscribe]);

  // ✅ FIX: beforeunload listener hata diya
  // REASON: beforeunload refresh pe bhi fire hota hai → partner ko galat PARTNER_LEFT milta tha
  // PARTNER_LEFT sirf handleExitChat() aur handleFindNext() se send hota hai (intentional exit only)
  const prevMsgCount = React.useRef(0);
  useEffect(() => {
    // First load — instant jump to bottom; new messages — smooth scroll
    const isInitialLoad = prevMsgCount.current === 0 && messages.length > 0;
    scrollToBottom(isInitialLoad);
    prevMsgCount.current = messages.length;
  }, [messages]);

  // ✅ Global reconnect request sync — WebSocketContext se milne pe local state set karo
  useEffect(() => {
    if (
      incomingReconnect &&
      String(incomingReconnect.chatRoomId) === String(chatRoomId)
    ) {
      setReconnectIncoming(true);
      setIncomingReconnect(null); // global state clear karo
    }
  }, [incomingReconnect]);

  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: instant ? "instant" : "smooth",
      });
    }
  };

  const fetchChatRoom = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/rooms`);
      const room = response.data.find((r) => r.id === parseInt(chatRoomId));
      setChatRoom(room);
      setLoading(false);
      // Save roomType so status handler can check it
      if (room?.roomType) {
        sessionStorage.setItem("chatRoomType", room.roomType);
      }
      // Fetch relationship status with partner
      if (room) {
        const myId = parseInt(user?.id || user?.userId);
        const partnerId = room.user1Id === myId ? room.user2Id : room.user1Id;
        fetchRelationship(partnerId);
        // Friend chat: fetch partner's name + dp
        if (room.roomType === "FRIEND_CHAT") {
          fetchPartnerInfo(partnerId);
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchPartnerInfo = async (partnerId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile/${partnerId}`);
      setPartnerInfo(res.data);
    } catch (e) {}
  };

  const fetchRelationship = async (partnerId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/friends/status/${partnerId}`,
      );
      setRelationship(res.data);
      if (res.data.requestSent) setFriendRequestSent(true);
    } catch (e) {}
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/messages/${chatRoomId}`,
      );
      // Normalize messageType — DB may store null or mixed case
      const normalized = response.data.reverse().map((m) => ({
        ...m,
        messageType: (m.messageType || "TEXT").toUpperCase(),
      }));
      setMessages(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !connected) return;

    // Link detection — block all links, server tracks violations & bans
    LINK_REGEX.lastIndex = 0;
    if (LINK_REGEX.test(messageInput)) {
      setMessageInput("");
      // Fire ban tracking to backend (async — don't await to avoid blocking UI)
      applyLinkBan()
        .then((data) => {
          const count = data?.violationCount ?? linkWarningCount + 1;
          setLinkWarningCount(count);
          if (count === 1) {
            setLinkAlert({ show: true, type: "warning" });
          } else if (count === 2) {
            setLinkAlert({ show: true, type: "ban15" });
          } else {
            setLinkAlert({ show: true, type: "banPerm" });
          }
        })
        .catch(() => {
          setLinkWarningCount((c) => c + 1);
          setLinkAlert({ show: true, type: "warning" });
        });
      return;
    }

    const myId = parseInt(user?.id || user?.userId);
    const recipientId =
      chatRoom?.user1Id === myId ? chatRoom?.user2Id : chatRoom?.user1Id;
    send(`/app/chat/${chatRoomId}`, {
      senderId: myId,
      recipientId,
      content: messageInput,
      messageType: "TEXT",
    });
    setMessageInput("");
  };

  const handleExitChat = () => {
    if (connected && chatRoomId) {
      send(`/app/chat/${chatRoomId}/leave`, {
        userId: parseInt(user?.id || user?.userId),
        chatRoomId: parseInt(chatRoomId),
      });
    }
    sessionStorage.removeItem("chatRoomId");
    sessionStorage.removeItem("chatRoomType");
    navigate("/");
  };

  const handleFindNext = () => {
    if (connected && chatRoomId) {
      send(`/app/chat/${chatRoomId}/leave`, {
        userId: parseInt(user?.id || user?.userId),
        chatRoomId: parseInt(chatRoomId),
      });
    }
    sessionStorage.removeItem("chatRoomId");
    sessionStorage.removeItem("chatRoomType");
    navigate("/?findMatch=true");
  };

  // ─── Task 2: Edit message ─────────────────────────────────────────────────
  const handleEditMessage = async (msgId) => {
    if (!editContent.trim()) return;
    try {
      await axios.put(`${API_BASE_URL}/chat/message/${msgId}`, {
        content: editContent.trim(),
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, content: editContent.trim(), edited: true }
            : m,
        ),
      );
      send(`/app/chat/${chatRoomId}/edit`, {
        messageId: msgId,
        content: editContent.trim(),
      });
      setEditingMessageId(null);
      setEditContent("");
    } catch (err) {
      setZnDialog({
        title: "Edit Failed",
        message: "Could not edit the message. Please try again.",
        icon: "✏️",
        confirmLabel: "OK",
        cancelLabel: null,
        onConfirm: () => setZnDialog(null),
        onCancel: () => setZnDialog(null),
      });
    }
  };

  const handleDeleteMessage = async (msgId) => {
    setZnDialog({
      title: "Delete Message?",
      message: "This message will be deleted for both sides.",
      icon: "🗑️",
      confirmLabel: "Delete",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setZnDialog(null);
        try {
          await axios.delete(`${API_BASE_URL}/chat/message/${msgId}`);
          setMessages((prev) => prev.filter((m) => m.id !== msgId));
          send(`/app/chat/${chatRoomId}/delete`, { messageId: msgId });
        } catch (err) {
          setZnDialog({
            title: "Delete Failed",
            message: "Could not delete the message.",
            icon: "❌",
            confirmLabel: "OK",
            cancelLabel: null,
            onConfirm: () => setZnDialog(null),
            onCancel: () => setZnDialog(null),
          });
        }
      },
      onCancel: () => setZnDialog(null),
    });
  };

  // ─── Task 3: Link detection + ban system ──────────────────────────────────
  const LINK_REGEX =
    /(?:https?:\/\/|www\.)\S+|(?:[a-zA-Z0-9-]+\.(?:com|in|net|org|io|co|me|xyz|app|live|gg|dev|ai|tv|info|biz|site|online|shop|store|link|click|ly|gl)(?:\/\S*)?)/gi;

  const applyLinkBan = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/chat/link-ban`);
      return res.data; // { violationCount, banType }
    } catch (e) {
      return null;
    }
  };

  const handleReportMessage = async () => {
    if (!reportReason.trim()) {
      setZnDialog({
        title: "Reason Required",
        message: "Please provide a reason before reporting.",
        icon: "⚠️",
        confirmLabel: "OK",
        cancelLabel: null,
        onConfirm: () => setZnDialog(null),
        onCancel: () => setZnDialog(null),
      });
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/chat/report/${reportingMessageId}`, {
        reason: reportReason,
      });
      setShowReportModal(false);
      setReportReason("");
      setReportingMessageId(null);
    } catch (err) {
      setZnDialog({
        title: "Report Failed",
        message: "Could not submit the report. Please try again.",
        icon: "❌",
        confirmLabel: "OK",
        cancelLabel: null,
        onConfirm: () => setZnDialog(null),
        onCancel: () => setZnDialog(null),
      });
    }
  };

  const getPartnerId = () => {
    if (!chatRoom) return null;
    const myId = parseInt(user?.id || user?.userId);
    return chatRoom.user1Id === myId ? chatRoom.user2Id : chatRoom.user1Id;
  };

  const handleAddFriend = async () => {
    const partnerId = getPartnerId();
    if (!partnerId) return;
    setFriendRequestLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/friends/request/${partnerId}`);
      setFriendRequestSent(true);
      setRelationship((prev) => ({ ...prev, requestSent: true }));
    } catch (err) {
      const msg = err.response?.data?.error || "";
      if (
        msg.includes("already") ||
        msg.includes("Already") ||
        err.response?.status === 409
      ) {
        setFriendRequestSent(true);
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
      setFriendRequestLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    const partnerId = getPartnerId();
    if (!partnerId) return;
    setZnDialog({
      title: "Remove Friend?",
      message: "They will be removed from your friends list.",
      icon: "👤",
      confirmLabel: "Remove",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setZnDialog(null);
        setRelLoading(true);
        try {
          await axios.delete(`${API_BASE_URL}/friends/remove/${partnerId}`);
          setRelationship((prev) => ({ ...prev, friend: false }));
        } catch (e) {
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
          setRelLoading(false);
        }
      },
      onCancel: () => setZnDialog(null),
    });
  };

  const handleBlockUser = async () => {
    const partnerId = getPartnerId();
    if (!partnerId) return;
    setZnDialog({
      title: "Block User?",
      message: "They won't be able to match with you randomly or message you.",
      icon: "🚫",
      confirmLabel: "Block",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setZnDialog(null);
        setRelLoading(true);
        try {
          await axios.post(`${API_BASE_URL}/friends/block/${partnerId}`);
          setRelationship((prev) => ({
            ...prev,
            friend: false,
            blocked: true,
          }));
        } catch (e) {
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
          setRelLoading(false);
        }
      },
      onCancel: () => setZnDialog(null),
    });
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#070710",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "DM Sans,sans-serif",
            }}
          >
            Loading chat...
          </p>
        </div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#070710",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          fontFamily: "DM Sans,sans-serif",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Chat room not found</p>
        <button
          onClick={() => {
            sessionStorage.removeItem("chatRoomId");
            sessionStorage.removeItem("chatRoomType");
            navigate("/");
          }}
          style={{
            padding: "0.6rem 1.5rem",
            background: "linear-gradient(135deg,#7c3aed,#6366f1)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html,body{overflow-x:hidden;}
        .zn-chat-root { height: 100vh; height: 100dvh; display: flex; flex-direction: column; background: #070710; font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden; }
        .zn-chat-orb { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.1; pointer-events: none; }
        .zn-chat-orb-1 { width: min(500px,90vw); height: min(500px,90vw); background: radial-gradient(circle, #a855f7, #7c3aed); top: -200px; left: -150px; }
        .zn-chat-orb-2 { width: min(400px,80vw); height: min(400px,80vw); background: radial-gradient(circle, #06b6d4, #3b82f6); bottom: -100px; right: -100px; }
        .zn-chat-header { height: 60px; flex-shrink: 0; background: rgba(7,7,16,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(139,92,246,0.15); padding: 0 1rem; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 10; min-width: 0; }
        .zn-chat-header-left { display: flex; align-items: center; gap: 0.7rem; min-width: 0; flex: 1; overflow: hidden; min-width: 0; }
        .zn-chat-avatar { width: 38px; height: 38px; border-radius: 10px; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); display: flex; align-items: center; justify-content: center; color: #c084fc; overflow: hidden; }
        .zn-chat-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .zn-chat-title { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1; }
        .zn-chat-status { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 0.1rem; }
        .zn-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .zn-exit-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; border-radius: 8px; cursor: pointer; background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500; transition: all 0.2s; }
        .zn-exit-btn:hover { background: rgba(239,68,68,0.18); }
        .zn-messages { flex: 1; overflow-y: auto; padding: 1rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; position: relative; z-index: 1; scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.3) transparent; }
        .zn-messages::-webkit-scrollbar { width: 4px; }
        .zn-messages::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
        .zn-empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; color: rgba(255,255,255,0.3); font-size: 0.88rem; }
        .zn-empty-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15); display: flex; align-items: center; justify-content: center; color: rgba(139,92,246,0.5); }
        .zn-msg-row { display: flex; align-items: flex-end; gap: 0.5rem; animation: msgIn 0.2s ease both; }
        @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .zn-msg-row-self { justify-content: flex-end; }
        .zn-msg-row-other { justify-content: flex-start; }
        .zn-msg-avatar { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.2); display: flex; align-items: center; justify-content: center; color: rgba(139,92,246,0.7); }
        .zn-msg-wrap { display: flex; flex-direction: column; max-width: min(72%, 480px); }
        .zn-msg-wrap-self { align-items: flex-end; }
        .zn-msg-wrap-other { align-items: flex-start; }
        .zn-bubble { padding: 0.6rem 0.9rem; border-radius: 16px; font-size: 0.88rem; line-height: 1.5; word-break: break-word; }
        .zn-bubble-self { background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; border-bottom-right-radius: 4px; box-shadow: 0 4px 16px rgba(124,58,237,0.25); }
        .zn-bubble-other { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); border-bottom-left-radius: 4px; }
        .zn-msg-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; padding: 0 0.2rem; }
        .zn-msg-time { font-size: 0.68rem; color: rgba(255,255,255,0.28); }
        .zn-report-btn { font-size: 0.68rem; color: rgba(239,68,68,0.5); background: none; border: none; cursor: pointer; padding: 0; opacity: 0; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
        .zn-msg-row:hover .zn-report-btn { opacity: 1; }
        .zn-report-btn:hover { color: #f87171; }
        .zn-input-bar { flex-shrink: 0; padding: 0.75rem 1rem; background: rgba(7,7,16,0.9); backdrop-filter: blur(20px); border-top: 1px solid rgba(139,92,246,0.12); position: relative; z-index: 10; }
        .zn-input-form { display: flex; align-items: center; gap: 0.75rem; }
        .zn-input-wrap { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; display: flex; align-items: center; transition: all 0.2s; }
        .zn-input-wrap:focus-within { border-color: rgba(139,92,246,0.45); background: rgba(139,92,246,0.06); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
        .zn-text-input { flex: 1; background: none; border: none; outline: none; padding: 0.75rem 1rem; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; }
        .zn-text-input::placeholder { color: rgba(255,255,255,0.25); }
        .zn-text-input:disabled { opacity: 0.5; }
        .zn-disconnected-badge { padding: 0.3rem 0.7rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; color: #f87171; font-size: 0.72rem; }
        .zn-send-btn { width: 44px; height: 44px; border: none; border-radius: 12px; cursor: pointer; background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; box-shadow: 0 4px 14px rgba(124,58,237,0.3); }
        .zn-send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .zn-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .zn-photo-btn { width: 40px; height: 40px; border: none; border-radius: 12px; cursor: pointer; background: rgba(139,92,246,0.1); color: #c084fc; border: 1px solid rgba(139,92,246,0.25); display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .zn-photo-btn:hover { background: rgba(139,92,246,0.2); }
        .zn-edit-btn { font-size: 0.65rem; color: rgba(99,102,241,0.6); background: none; border: none; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; transition: color 0.2s; opacity: 0; }
        .zn-del-btn { font-size: 0.65rem; color: rgba(239,68,68,0.5); background: none; border: none; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; transition: color 0.2s; opacity: 0; }
        .zn-msg-row:hover .zn-edit-btn, .zn-msg-row:hover .zn-del-btn { opacity: 1; }
        .zn-edit-btn:hover { color: #818cf8; }
        .zn-del-btn:hover { color: #f87171; }
        .zn-edited-tag { font-size: 0.6rem; color: rgba(255,255,255,0.2); font-style: italic; }
        .zn-edit-input { background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.4); border-radius: 10px; padding: 0.4rem 0.7rem; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; outline: none; width: 100%; }
        .zn-link-alert { position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 300; padding: 0.85rem 1.25rem; border-radius: 14px; max-width: min(420px, calc(100vw - 2rem)); width: 90%; text-align: center; animation: slideDown 0.3s ease; font-size: 0.85rem; }
        @keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .zn-msg-img { max-width: min(220px, 60vw); border-radius: 12px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); }
        .zn-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; z-index: 200; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .zn-modal { background: rgba(18,10,35,0.97); border: 1px solid rgba(139,92,246,0.2); border-radius: 20px; padding: 2rem; width: 100%; max-width: 400px; box-shadow: 0 32px 80px rgba(0,0,0,0.7); }
        .zn-modal h2 { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:0.5rem; }
        .zn-modal-sub { font-size: 0.8rem; color: rgba(255,255,255,0.35); margin-bottom: 1.25rem; }
        .zn-modal-textarea { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 0.75rem 0.9rem; color: #fff; resize: vertical; min-height: 100px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; }
        .zn-modal-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .zn-modal-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
        .zn-report-submit { flex: 1; padding: 0.7rem; border: none; border-radius: 10px; cursor: pointer; background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; }
        .zn-modal-cancel { flex: 1; padding: 0.7rem; border: none; border-radius: 10px; cursor: pointer; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); font-family: 'DM Sans', sans-serif; font-size: 0.88rem; }
        .zn-modal-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }

        /* Header action buttons — shared base */
        .zn-hdr-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500; transition: all 0.2s; flex-shrink: 0; white-space: nowrap; border: none; }
        .zn-hdr-btn-remove { background: rgba(239,68,68,0.08); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
        .zn-hdr-btn-block  { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }
        .zn-hdr-btn-next   { background: rgba(34,197,94,0.1);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
        .zn-hdr-btn-add    { background: rgba(139,92,246,0.1); color: #c084fc; border: 1px solid rgba(139,92,246,0.25); }
        .zn-hdr-btn-sent   { background: rgba(34,197,94,0.1);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); cursor: default; }
        .zn-hdr-btn:disabled { opacity: 0.6; }
        .zn-hdr-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .zn-btn-lbl { display: inline; }

        @media(max-width:480px){
          .zn-chat-header { padding: 0 0.6rem; height: auto; min-height: 56px; }
          .zn-chat-avatar { width: 32px; height: 32px; border-radius: 8px; }
          .zn-chat-title { font-size: 0.82rem; }
          .zn-chat-status { font-size: 0.65rem; }
          .zn-hdr-btn { padding: 0.35rem 0.45rem; gap: 0; }
          .zn-btn-lbl { display: none; }
          .zn-exit-btn { padding: 0.35rem 0.45rem; font-size: 0.75rem; gap: 0; }
          .zn-exit-btn span { display: none; }
          .zn-hdr-right { gap: 0.3rem; }
          .zn-messages { padding: 0.85rem 0.75rem; }
          .zn-input-bar { padding: 0.65rem 0.75rem; }
          .zn-input-form { gap: 0.5rem; }
          .zn-send-btn { width: 40px; height: 40px; border-radius: 10px; }
          .zn-photo-btn { width: 36px; height: 36px; border-radius: 10px; }
          .zn-text-input { font-size: 0.85rem; padding: 0.65rem 0.75rem; }
          .zn-modal { padding: 1.5rem 1.25rem; border-radius: 16px; }
          .zn-msg-wrap { max-width: min(82%, 480px); }
          .zn-bubble { font-size: 0.85rem; padding: 0.55rem 0.8rem; }
        }
        @media(max-width:380px){
          .zn-chat-title { font-size: 0.78rem; }
          .zn-chat-status { display: none; }
          .zn-hdr-btn { padding: 0.3rem 0.4rem; }
          .zn-messages { padding: 0.75rem 0.6rem; gap: 0.4rem; }
          .zn-input-bar { padding: 0.6rem; }
          .zn-send-btn { width: 38px; height: 38px; }
          .zn-photo-btn { width: 34px; height: 34px; }
          .zn-msg-avatar { display: none; }
          .zn-msg-wrap { max-width: 88%; }
          .zn-bubble { font-size: 0.83rem; }
        }
      `}</style>

      <div className="zn-chat-root">
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
        <div className="zn-chat-orb zn-chat-orb-1" />
        <div className="zn-chat-orb zn-chat-orb-2" />

        {/* Header */}
        <header className="zn-chat-header">
          <div className="zn-chat-header-left">
            <div className="zn-chat-avatar">
              {chatRoom?.roomType === "FRIEND_CHAT" && partnerInfo?.dpUrl ? (
                <img
                  src={
                    partnerInfo.dpUrl.startsWith("http")
                      ? partnerInfo.dpUrl
                      : `${API_BASE_URL}${partnerInfo.dpUrl}`
                  }
                  alt={partnerInfo.username}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : chatRoom?.roomType === "FRIEND_CHAT" && partnerInfo ? (
                <span
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#c084fc",
                  }}
                >
                  {(partnerInfo.fullName ||
                    partnerInfo.username ||
                    "?")[0].toUpperCase()}
                </span>
              ) : (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="zn-chat-title">
                {chatRoom?.roomType === "FRIEND_CHAT" && partnerInfo
                  ? partnerInfo.fullName || partnerInfo.username || "Friend"
                  : "Anonymous Chat"}
              </div>
              <div className="zn-chat-status">
                <span className="zn-status-dot" />
                {connected ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>
          <div className="zn-hdr-right">
            {/* Buttons based on relationship */}
            {!relationship.blocked && !relationship.blockedByThem && (
              <>
                {relationship.friend ? (
                  <>
                    <button
                      className="zn-hdr-btn zn-hdr-btn-remove"
                      onClick={handleRemoveFriend}
                      disabled={relLoading}
                    >
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                      <span className="zn-btn-lbl">Remove</span>
                    </button>
                    <button
                      className="zn-hdr-btn zn-hdr-btn-block"
                      onClick={handleBlockUser}
                      disabled={relLoading}
                    >
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      <span className="zn-btn-lbl">Block</span>
                    </button>
                  </>
                ) : (
                  <button
                    className={`zn-hdr-btn ${friendRequestSent ? "zn-hdr-btn-sent" : "zn-hdr-btn-add"}`}
                    onClick={handleAddFriend}
                    disabled={friendRequestSent || friendRequestLoading}
                  >
                    {friendRequestSent ? (
                      <>
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
                        <span className="zn-btn-lbl">Request Sent</span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="13"
                          height="13"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" y1="8" x2="19" y2="14" />
                          <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                        <span className="zn-btn-lbl">
                          {friendRequestLoading ? "Sending..." : "Add Friend"}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
            {relationship.blocked && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#f87171",
                  padding: "0.3rem 0.6rem",
                  background: "rgba(239,68,68,0.08)",
                  borderRadius: "8px",
                  border: "1px solid rgba(239,68,68,0.2)",
                  whiteSpace: "nowrap",
                }}
              >
                🚫 <span className="zn-btn-lbl">Blocked</span>
              </span>
            )}
            {chatRoom?.roomType !== "FRIEND_CHAT" && (
              <button
                className="zn-hdr-btn zn-hdr-btn-next"
                onClick={handleFindNext}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="zn-btn-lbl">Next</span>
              </button>
            )}
            <button className="zn-exit-btn" onClick={handleExitChat}>
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span>Exit Chat</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="zn-messages">
          {messages.length === 0 ? (
            <div className="zn-empty-state">
              <div className="zn-empty-icon">
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <span>Say hello! Start the conversation ✨</span>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const myId = parseInt(user?.id || user?.userId);
              const isSelf = msg.senderId === myId;
              const isEditing = editingMessageId === msg.id;
              return (
                <div
                  key={idx}
                  className={`zn-msg-row ${isSelf ? "zn-msg-row-self" : "zn-msg-row-other"}`}
                >
                  {/* Anonymous avatar for partner */}
                  {!isSelf && (
                    <div className="zn-msg-avatar">
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`zn-msg-wrap ${isSelf ? "zn-msg-wrap-self" : "zn-msg-wrap-other"}`}
                  >
                    {/* ✅ Task 2: Edit mode inline input */}
                    {isEditing ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.4rem",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <input
                          className="zn-edit-input"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditMessage(msg.id);
                            if (e.key === "Escape") {
                              setEditingMessageId(null);
                              setEditContent("");
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditMessage(msg.id)}
                          style={{
                            background: "#7c3aed",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.35rem 0.6rem",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditContent("");
                          }}
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.35rem 0.6rem",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`zn-bubble ${isSelf ? "zn-bubble-self" : "zn-bubble-other"}`}
                      >
                        {/* Image message — triple fallback detection */}
                        {msg.messageType === "IMAGE" ||
                        msg.mediaUrl ||
                        (msg.content &&
                          /\/uploads\/chat\//.test(msg.content)) ? (
                          <img
                            src={
                              (msg.mediaUrl || msg.content).startsWith("http")
                                ? msg.mediaUrl || msg.content
                                : `${MEDIA_BASE_URL}${msg.mediaUrl || msg.content}`
                            }
                            alt="📷 Photo"
                            className="zn-msg-img"
                            onLoad={scrollToBottom}
                            onClick={() =>
                              window.open(
                                (msg.mediaUrl || msg.content).startsWith("http")
                                  ? msg.mediaUrl || msg.content
                                  : `${MEDIA_BASE_URL}${msg.mediaUrl || msg.content}`,
                                "_blank",
                              )
                            }
                          />
                        ) : (
                          msg.content
                        )}
                      </div>
                    )}
                    <div className="zn-msg-meta">
                      <span className="zn-msg-time">
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.edited && (
                        <span className="zn-edited-tag">edited</span>
                      )}
                      {/* ✅ Task 2: Edit/Delete for own messages */}
                      {isSelf &&
                        !isEditing &&
                        msg.messageType !== "IMAGE" &&
                        !msg.mediaUrl &&
                        !(
                          msg.content && /\/uploads\/chat\//.test(msg.content)
                        ) && (
                          <>
                            <button
                              className="zn-edit-btn"
                              onClick={() => {
                                setEditingMessageId(msg.id);
                                setEditContent(msg.content);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="zn-del-btn"
                              onClick={() => handleDeleteMessage(msg.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      {isSelf &&
                        !isEditing &&
                        (msg.messageType === "IMAGE" ||
                          msg.mediaUrl ||
                          (msg.content &&
                            /\/uploads\/chat\//.test(msg.content))) && (
                          <button
                            className="zn-del-btn"
                            onClick={() => handleDeleteMessage(msg.id)}
                          >
                            Delete
                          </button>
                        )}
                      {!isSelf && (
                        <button
                          className="zn-report-btn"
                          onClick={() => {
                            setReportingMessageId(msg.id);
                            setShowReportModal(true);
                          }}
                        >
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Anonymous avatar for self */}
                  {isSelf && (
                    <div className="zn-msg-avatar">
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="zn-input-bar">
          <form className="zn-input-form" onSubmit={handleSendMessage}>
            {/* ✅ Task 4: Photo share button */}
            <label className="zn-photo-btn" title="Share photo">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    setZnDialog({
                      title: "File Too Large",
                      message: "Image must be under 5MB.",
                      icon: "🖼️",
                      confirmLabel: "OK",
                      cancelLabel: null,
                      onConfirm: () => setZnDialog(null),
                      onCancel: () => setZnDialog(null),
                    });
                    e.target.value = "";
                    return;
                  }
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    await axios.post(
                      `${API_BASE_URL}/chat/upload-image/${chatRoomId}`,
                      fd,
                      { headers: { "Content-Type": "multipart/form-data" } },
                    );
                    // Backend saves to DB and broadcasts via WebSocket — image will appear automatically
                  } catch (err) {
                    const msg =
                      err.response?.data?.error || "Failed to send image";
                    setZnDialog({
                      title: "Upload Failed",
                      message: msg,
                      icon: "⚠️",
                      confirmLabel: "OK",
                      cancelLabel: null,
                      onConfirm: () => setZnDialog(null),
                      onCancel: () => setZnDialog(null),
                    });
                  }
                  e.target.value = "";
                }}
              />
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </label>

            <div className="zn-input-wrap">
              <input
                className="zn-text-input"
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={connected ? "Type a message..." : "Connecting..."}
                disabled={!connected}
              />
              {!connected && (
                <span className="zn-disconnected-badge">Offline</span>
              )}
            </div>
            <button
              className="zn-send-btn"
              type="submit"
              disabled={!connected || !messageInput.trim()}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* ✅ Task 3: Link Alert Banner */}
      {linkAlert.show && (
        <div
          className="zn-link-alert"
          style={{
            background:
              linkAlert.type === "warning"
                ? "rgba(239,68,68,0.95)"
                : "rgba(120,10,10,0.97)",
            border: "1px solid rgba(239,68,68,0.5)",
          }}
        >
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "0.3rem",
              fontSize: "0.95rem",
            }}
          >
            🚫{" "}
            {linkAlert.type === "warning"
              ? "Links Not Allowed!"
              : linkAlert.type === "ban15"
                ? "15-Day Ban Applied!"
                : "Permanently Banned!"}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.82rem",
              lineHeight: 1.5,
            }}
          >
            {linkAlert.type === "warning" &&
              "Links sharing is not allowed. ⚠️ Next time a 15-day ban will be applied automatically."}
            {linkAlert.type === "ban15" &&
              "You have been banned for 15 days for sharing links. ⚠️ If detected again, you will be permanently banned."}
            {linkAlert.type === "banPerm" &&
              "You have been permanently banned for repeatedly sharing links."}
          </div>
          <button
            onClick={() => setLinkAlert({ show: false, type: "" })}
            style={{
              marginTop: "0.6rem",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              padding: "0.3rem 1rem",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Reconnect Incoming Dialog — partner ne reconnect request bheji */}
      {reconnectIncoming && !partnerLeft && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 250,
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
                  send(`/app/chat/${chatRoomId}/reconnect-response`, {
                    accepted: true,
                    chatRoomId: parseInt(chatRoomId),
                  });
                  setReconnectIncoming(false);
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
                }}
              >
                Accept
              </button>
              <button
                onClick={() => {
                  send(`/app/chat/${chatRoomId}/reconnect-response`, {
                    accepted: false,
                    chatRoomId: parseInt(chatRoomId),
                  });
                  setReconnectIncoming(false);
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
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Left Overlay */}
      {partnerLeft && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(7,7,16,0.92)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              padding: "2.5rem 3rem",
              textAlign: "center",
              maxWidth: "380px",
              width: "90%",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👋</div>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                color: "#fff",
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              Partner Left
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.9rem",
                marginBottom: "2rem",
              }}
            >
              Your chat partner has disconnected from this chat.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexDirection: "column",
              }}
            >
              {/* ✅ Reconnect button (premium only) */}
              <button
                onClick={() => {
                  if (!isPremiumUser) {
                    navigate("/premium");
                    return;
                  }
                  // Send reconnect request via WebSocket
                  send(`/app/chat/${chatRoomId}/reconnect-request`, {
                    userId: parseInt(user?.id || user?.userId),
                    chatRoomId: parseInt(chatRoomId),
                  });
                  setReconnectRequested(true);
                  setReconnectStatus("pending");
                }}
                disabled={reconnectRequested}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "12px",
                  background: reconnectRequested
                    ? "rgba(139,92,246,0.3)"
                    : "linear-gradient(135deg,#7c3aed,#6366f1)",
                  color: "#fff",
                  fontFamily: "'Syne',sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: reconnectRequested ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  opacity: reconnectRequested ? 0.7 : 1,
                }}
              >
                🔄 {reconnectRequested ? "Request Sent..." : "Reconnect"}
                {!isPremiumUser && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      background: "rgba(255,255,255,0.15)",
                      padding: "0.1rem 0.5rem",
                      borderRadius: "20px",
                    }}
                  >
                    Premium
                  </span>
                )}
              </button>

              {/* Reconnect status feedback */}
              {reconnectStatus === "rejected" && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#f87171",
                    textAlign: "center",
                  }}
                >
                  Partner declined reconnect request.
                </div>
              )}

              <button
                onClick={handleFindNext}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  fontFamily: "'Syne',sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🔍 Find New Match
              </button>
              <button
                onClick={handleExitChat}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="zn-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowReportModal(false)
          }
        >
          <div className="zn-modal">
            <h2>🚨 Report Message</h2>
            <p className="zn-modal-sub">
              Tell us why this message is inappropriate.
            </p>
            <textarea
              className="zn-modal-textarea"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
            />
            <div className="zn-modal-actions">
              <button
                className="zn-report-submit"
                onClick={handleReportMessage}
              >
                Submit Report
              </button>
              <button
                className="zn-modal-cancel"
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportingMessageId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
