import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function ZnChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! I am Zonnecto Assistant 👋 Ask me anything related to platform — matching, premium, friends, chat, Anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/chatbot/message`, {
        message: text,
        history: newMessages.slice(-8),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong, Try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .znb-fab {
          position: fixed; bottom: 22px; right: 22px; z-index: 9998;
          width: 56px; height: 56px; border-radius: 50%; border: none;
          background: linear-gradient(135deg,#7c3aed,#6366f1,#0891b2);
          box-shadow: 0 8px 32px rgba(124,58,237,0.5);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #fff; font-size: 1.4rem;
        }
        .znb-panel {
          position: fixed; bottom: 90px; right: 22px; z-index: 9998;
          width: 340px; max-width: calc(100vw - 32px); height: 460px;
          background: #10091f; border: 1px solid rgba(139,92,246,0.25);
          border-radius: 18px; display: flex; flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6); overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .znb-head {
          padding: 14px 16px; background: rgba(139,92,246,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
        }
        .znb-title { font-family: 'Syne', sans-serif; font-weight: 800; color: #fff; font-size: 0.95rem; }
        .znb-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 1.1rem; }
        .znb-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
        .znb-msg { max-width: 85%; padding: 9px 12px; border-radius: 12px; font-size: 0.82rem; line-height: 1.5; }
        .znb-msg.user { align-self: flex-end; background: linear-gradient(135deg,#7c3aed,#6366f1); color: #fff; }
        .znb-msg.assistant { align-self: flex-start; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
        .znb-inputrow { display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .znb-input {
          flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 9px 12px; color: #fff; font-size: 0.82rem; outline: none;
        }
        .znb-send { background: linear-gradient(135deg,#7c3aed,#6366f1); border: none; border-radius: 10px; color: #fff; padding: 0 14px; cursor: pointer; font-weight: 700; font-size: 0.8rem; }
        .znb-send:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {open && (
        <div className="znb-panel">
          <div className="znb-head">
            <span className="znb-title">Zonnecto Assistant</span>
            <button className="znb-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="znb-body">
            {messages.map((m, i) => (
              <div key={i} className={`znb-msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="znb-msg assistant">Typing...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="znb-inputrow">
            <input
              className="znb-input"
              placeholder="Enter your query..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button
              className="znb-send"
              onClick={sendMessage}
              disabled={loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button className="znb-fab" onClick={() => setOpen((v) => !v)}>
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
