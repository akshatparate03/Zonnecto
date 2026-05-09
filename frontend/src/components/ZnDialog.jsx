import React, { useEffect } from "react";
import ReactDOM from "react-dom";

// ─── ZnDialog — Custom confirm/alert dialog ────────────────────────────────────
// Usage:
//   <ZnDialog
//     open={bool}
//     title="Are you sure?"
//     message="This will delete the item."
//     confirmLabel="Delete"        // optional, default "Confirm"
//     cancelLabel="Cancel"         // optional, default "Cancel"; set to null for alert-only
//     confirmColor="#ef4444"       // optional, default purple
//     icon="🗑️"                   // optional
//     onConfirm={() => {}}
//     onCancel={() => {}}          // called on cancel OR backdrop click
//   />

const STYLES = `
  .znd-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(7,7,16,0.82);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: zndFadeIn 0.18s ease both;
  }
  @keyframes zndFadeIn { from{opacity:0} to{opacity:1} }

  .znd-card {
    width: 100%; max-width: 400px;
    background: #10091f;
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 20px;
    padding: 1.75rem 1.75rem 1.5rem;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1);
    animation: zndSlideUp 0.22s cubic-bezier(0.16,1,0.3,1) both;
    position: relative;
  }
  .znd-card::before {
    content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent);
  }
  @keyframes zndSlideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97) }
    to   { opacity: 1; transform: translateY(0)    scale(1)    }
  }

  .znd-icon {
    font-size: 2rem; text-align: center; margin-bottom: 0.75rem;
    line-height: 1;
  }
  .znd-title {
    font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 800;
    color: #fff; text-align: center; letter-spacing: -0.01em;
    margin-bottom: 0.5rem;
  }
  .znd-msg {
    font-size: 0.84rem; color: rgba(255,255,255,0.45);
    text-align: center; line-height: 1.6; margin-bottom: 1.35rem;
    white-space: pre-line;
  }
  .znd-highlight {
    background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15);
    border-radius: 8px; padding: 0.5rem 0.75rem;
    font-size: 0.83rem; color: rgba(255,255,255,0.7);
    margin-bottom: 1.35rem; text-align: center;
    font-style: italic;
  }
  .znd-actions {
    display: flex; gap: 0.65rem;
  }
  .znd-btn {
    flex: 1; padding: 0.72rem 1rem; border-radius: 11px; border: none;
    font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700;
    cursor: pointer; transition: all 0.18s; letter-spacing: 0.02em;
  }
  .znd-btn-cancel {
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .znd-btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .znd-btn-confirm {
    color: #fff; border: none;
  }
  .znd-btn-confirm:hover { opacity: 0.88; transform: translateY(-1px); }

  @media (max-width: 480px) {
    .znd-card { padding: 1.5rem 1.25rem 1.25rem; border-radius: 16px; }
    .znd-title { font-size: 0.98rem; }
    .znd-msg { font-size: 0.8rem; }
  }
`;

let styleInjected = false;
function injectStyles() {
  if (styleInjected) return;
  styleInjected = true;
  const el = document.createElement("style");
  el.textContent = STYLES;
  document.head.appendChild(el);
}

export default function ZnDialog({
  open,
  title = "Are you sure?",
  message = "",
  highlight = null, // extra quoted text block (e.g. broadcast message preview)
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "#7c3aed",
  icon = null,
  onConfirm,
  onCancel,
}) {
  injectStyles();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape" && onCancel) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const confirmBg =
    confirmColor === "#ef4444"
      ? "linear-gradient(135deg,#ef4444,#dc2626)"
      : confirmColor === "#f59e0b"
        ? "linear-gradient(135deg,#f59e0b,#d97706)"
        : "linear-gradient(135deg,#7c3aed,#6366f1)";

  return ReactDOM.createPortal(
    <div className="znd-overlay" onClick={onCancel}>
      <div className="znd-card" onClick={(e) => e.stopPropagation()}>
        {icon && <div className="znd-icon">{icon}</div>}
        <div className="znd-title">{title}</div>
        {message && <div className="znd-msg">{message}</div>}
        {highlight && <div className="znd-highlight">"{highlight}"</div>}
        <div className="znd-actions">
          {cancelLabel && (
            <button className="znd-btn znd-btn-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            className="znd-btn znd-btn-confirm"
            style={{ background: confirmBg }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
