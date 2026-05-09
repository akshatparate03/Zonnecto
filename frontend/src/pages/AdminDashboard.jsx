import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ZnDialog from "../components/ZnDialog";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const ADMIN_EMAIL = "zonnecto@gmail.com";

// ─── API Helper ──────────────────────────────────────────────────────────────
const authHdr = () => {
  // ✅ FIX: Token sources — localStorage primary, axios.defaults fallback
  const fromLocal = localStorage.getItem("token");
  const fromAxios = (
    axios.defaults.headers?.common?.["Authorization"] || ""
  ).replace("Bearer ", "");
  const t = fromLocal || fromAxios;
  if (!t) return {};
  return { headers: { Authorization: `Bearer ${t}` } };
};
const api = {
  get: (path) => axios.get(`${API}/admin${path}`, authHdr()),
  post: (path, data) => axios.post(`${API}/admin${path}`, data, authHdr()),
  put: (path, data) => axios.put(`${API}/admin${path}`, data, authHdr()),
  del: (path) => axios.delete(`${API}/admin${path}`, authHdr()),
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = "#7c3aed", sub }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "1.2rem 1.4rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        position: "relative",
        overflow: "hidden",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          flexShrink: 0,
          background: color + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {value ?? "—"}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.4)",
            marginTop: 3,
          }}
        >
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: "0.7rem", color: color, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        marginBottom: "1.25rem",
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h2
        style={{
          margin: 0,
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#c084fc",
          fontFamily: "Syne, sans-serif",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function Table({ columns, rows, onRowClick }) {
  if (!rows || rows.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "rgba(255,255,255,0.25)",
          fontSize: "0.85rem",
        }}
      >
        No data found
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.82rem",
        }}
      >
        <thead>
          <tr style={{ background: "rgba(139,92,246,0.08)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "0.6rem 0.9rem",
                  textAlign: "left",
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                cursor: onRowClick ? "pointer" : "default",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(139,92,246,0.07)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "0.65rem 0.9rem",
                    color: "rgba(255,255,255,0.75)",
                    whiteSpace: col.wrap ? "normal" : "nowrap",
                  }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ text, color }) {
  const colors = {
    green: {
      bg: "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.3)",
      text: "#4ade80",
    },
    red: {
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.3)",
      text: "#f87171",
    },
    yellow: {
      bg: "rgba(234,179,8,0.1)",
      border: "rgba(234,179,8,0.3)",
      text: "#facc15",
    },
    purple: {
      bg: "rgba(139,92,246,0.1)",
      border: "rgba(139,92,246,0.3)",
      text: "#c084fc",
    },
    gray: {
      bg: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.12)",
      text: "rgba(255,255,255,0.5)",
    },
  };
  const c = colors[color] || colors.gray;
  return (
    <span
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        padding: "0.2rem 0.5rem",
        borderRadius: 6,
        fontSize: "0.72rem",
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(0.75rem, 3vw, 1.5rem)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 18,
          padding: "clamp(1rem, 4vw, 1.75rem)",
          maxWidth: 680,
          width: "100%",
          maxHeight: "90dvh",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "1rem",
              fontFamily: "Syne, sans-serif",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.73rem",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "0.3rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "0.65rem 0.9rem",
          color: "#fff",
          fontSize: "0.88rem",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, color = "purple", size = "sm", disabled }) {
  const colors = {
    purple: "linear-gradient(135deg,#7c3aed,#6366f1)",
    red: "linear-gradient(135deg,#dc2626,#b91c1c)",
    green: "linear-gradient(135deg,#16a34a,#15803d)",
    yellow: "linear-gradient(135deg,#ca8a04,#a16207)",
    gray: "rgba(255,255,255,0.08)",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: colors[color],
        border: "none",
        borderRadius: 8,
        padding: size === "sm" ? "0.45rem 0.9rem" : "0.7rem 1.4rem",
        color: "#fff",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection({ stats, trend }) {
  return (
    <div>
      <SectionHeader title="Dashboard Overview" icon="📊" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(180px, calc(50% - 0.5rem)), 1fr))",
          gap: "0.85rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="#7c3aed"
        />
        <StatCard
          label="Online Now"
          value={stats.activeUsersOnline}
          icon="🟢"
          color="#22c55e"
        />
        <StatCard
          label="New Today"
          value={stats.todayNewRegistrations}
          icon="✨"
          color="#06b6d4"
        />
        <StatCard
          label="Total Messages"
          value={stats.totalMessages}
          icon="💬"
          color="#f59e0b"
          sub={
            stats.todayMessages !== undefined
              ? `+${stats.todayMessages} today`
              : undefined
          }
        />
        <StatCard
          label="Total Chats"
          value={stats.totalChatRooms}
          icon="🔗"
          color="#8b5cf6"
        />
        <StatCard
          label="Premium Users"
          value={stats.premiumUsers}
          icon="⭐"
          color="#f59e0b"
        />
        <StatCard
          label="Pending Reports"
          value={stats.pendingReports}
          icon="🚨"
          color="#ef4444"
        />
        <StatCard
          label="Active Bans"
          value={stats.activeBans}
          icon="🔨"
          color="#ef4444"
        />
        <StatCard
          label="Total Friends"
          value={stats.totalFriendships}
          icon="🤝"
          color="#22d3ee"
        />
        <StatCard
          label="Male Users"
          value={stats.maleUsers}
          icon="👨"
          color="#3b82f6"
        />
        <StatCard
          label="Female Users"
          value={stats.femaleUsers}
          icon="👩"
          color="#ec4899"
        />
        <StatCard
          label="Permanent Bans"
          value={stats.permanentBans}
          icon="☠️"
          color="#dc2626"
        />
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "1.25rem 1.5rem",
        }}
      >
        <div
          style={{
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          📈 Registration Trend (Last 30 Days)
        </div>

        {trend && trend.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {/* Chart wrapper with Y-axis gridlines */}
            <div style={{ position: "relative", height: 120 }}>
              {/* Y-axis gridlines — 4 levels */}
              {[0.25, 0.5, 0.75, 1].map((lvl) => (
                <div
                  key={lvl}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: `${lvl * 100}%`,
                    height: 1,
                    background: "rgba(255,255,255,0.06)",
                    pointerEvents: "none",
                  }}
                />
              ))}
              {/* Bars */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 3,
                  paddingTop: 8,
                }}
              >
                {(() => {
                  const max = Math.max(...trend.map((x) => x.count), 1);
                  const min = Math.min(...trend.map((x) => x.count));
                  const range = max - min;
                  return trend.map((d, i) => {
                    // If all values same → flat 50%; else normalize with 8% min floor
                    const pct =
                      range === 0
                        ? 50
                        : Math.max(8, ((d.count - min) / range) * 92) + 4;
                    const isToday = i === trend.length - 1;
                    const isHigh = d.count === max && max > 0;
                    return (
                      <div
                        key={i}
                        title={`${d.date}: ${d.count} registrations`}
                        style={{
                          flex: 1,
                          height: `${pct}%`,
                          background: isToday
                            ? "linear-gradient(to top,#7c3aed,#c084fc)"
                            : isHigh
                              ? "linear-gradient(to top,#5b21b6,#a78bfa)"
                              : d.count > 0
                                ? "rgba(139,92,246,0.6)"
                                : "rgba(255,255,255,0.07)",
                          borderRadius: "3px 3px 0 0",
                          cursor: "default",
                          transition: "opacity 0.15s, height 0.3s ease",
                          border: isToday
                            ? "1px solid rgba(192,132,252,0.5)"
                            : "none",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "0.75";
                          // show count tooltip on top
                          const tip = e.currentTarget.querySelector(".bar-tip");
                          if (tip) tip.style.display = "block";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "1";
                          const tip = e.currentTarget.querySelector(".bar-tip");
                          if (tip) tip.style.display = "none";
                        }}
                      >
                        <span
                          className="bar-tip"
                          style={{
                            display: "none",
                            position: "absolute",
                            top: -22,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(0,0,0,0.8)",
                            color: "#e2e8f0",
                            fontSize: "0.6rem",
                            padding: "2px 5px",
                            borderRadius: 4,
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                            zIndex: 10,
                          }}
                        >
                          {d.count}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            {/* X-axis baseline */}
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.08)",
                margin: "0 0 0.35rem",
              }}
            />
            {/* Date labels — first, middle, last */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {[
                trend[0],
                trend[Math.floor(trend.length / 2)],
                trend[trend.length - 1],
              ].map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.28)",
                  }}
                >
                  {d?.date?.slice(5)}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
              {[
                {
                  color: "linear-gradient(to right,#7c3aed,#c084fc)",
                  label: "Today",
                },
                {
                  color: "linear-gradient(to right,#5b21b6,#a78bfa)",
                  label: "Peak",
                },
                { color: "rgba(139,92,246,0.6)", label: "Registered" },
                { color: "rgba(255,255,255,0.07)", label: "None" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.62rem",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.2)",
              fontSize: "0.82rem",
              border: "1px dashed rgba(255,255,255,0.08)",
              borderRadius: 10,
            }}
          >
            No registration data for last 30 days
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection({ onToast, ready }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banPermanent, setBanPermanent] = useState(false);
  const [banHours, setBanHours] = useState(24);
  const [editModal, setEditModal] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  // Custom dialog state
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, icon, confirmLabel, confirmColor, onConfirm }

  const load = useCallback(async () => {
    if (!ready) return; // ✅ wait for auth token to be ready
    setLoading(true);
    try {
      const res = await api.get(
        `/users?page=${page}&size=20&search=${encodeURIComponent(search)}`,
      );
      // ✅ FIX: Safe data extraction — backend { users: [...], total: N }
      const data = res.data || {};
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (e) {
      console.error(
        "[Admin] Failed to load users:",
        e?.response?.status,
        e?.response?.data || e?.message,
      );
      onToast(
        `Failed to load users (${e?.response?.status || "network error"})`,
        "error",
      );
    }
    setLoading(false);
  }, [page, search, ready]);

  useEffect(() => {
    load();
  }, [load]);

  const loadDetail = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}`);
      setUserDetail(res.data);
    } catch (e) {
      onToast("Failed to load user detail", "error");
    }
  };

  const handleBan = async () => {
    try {
      await api.post(`/users/${banModal.id}/ban`, {
        reason: banReason,
        permanent: banPermanent,
        durationHours: banHours,
      });
      onToast("User banned successfully", "success");
      setBanModal(null);
      setBanReason("");
      load();
    } catch (e) {
      onToast("Ban failed", "error");
    }
  };

  const handleUnban = async (userId) => {
    setConfirmDialog({
      title: "Unban User?",
      message: "This user will be able to access the platform again.",
      icon: "🔓",
      confirmLabel: "Unban",
      confirmColor: "#7c3aed",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.post(`/users/${userId}/unban`);
          onToast("User unbanned", "success");
          load();
        } catch (e) {
          onToast("Unban failed", "error");
        }
      },
    });
  };

  const handleDelete = async (userId) => {
    setConfirmDialog({
      title: "Delete User?",
      message:
        "This will permanently delete the user and ALL their data. This cannot be undone!",
      icon: "🗑️",
      confirmLabel: "Delete Permanently",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.del(`/users/${userId}`);
          onToast("User deleted", "success");
          load();
          if (userDetail?.id === userId) setUserDetail(null);
        } catch (e) {
          onToast("Delete failed", "error");
        }
      },
    });
  };

  const handlePromote = async (userId) => {
    try {
      await api.post(`/users/${userId}/promote`);
      onToast("Promoted to premium ⭐", "success");
      load();
    } catch (e) {
      console.error(
        "[Admin] Promote failed:",
        e?.response?.status,
        e?.response?.data,
      );
      onToast(`Promote failed (${e?.response?.status || "error"})`, "error");
    }
  };

  const handleDemote = async (userId) => {
    try {
      await api.post(`/users/${userId}/demote`);
      onToast("Demoted to normal", "success");
      load();
    } catch (e) {
      console.error(
        "[Admin] Demote failed:",
        e?.response?.status,
        e?.response?.data,
      );
      onToast(`Demote failed (${e?.response?.status || "error"})`, "error");
    }
  };

  const handleEdit = async () => {
    try {
      await api.put(`/users/${editModal.id}`, {
        username: editUsername,
        email: editEmail,
      });
      onToast("User updated", "success");
      setEditModal(null);
      load();
    } catch (e) {
      onToast("Update failed", "error");
    }
  };

  return (
    <div>
      <ZnDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        icon={confirmDialog?.icon}
        confirmLabel={confirmDialog?.confirmLabel}
        confirmColor={confirmDialog?.confirmColor}
        onConfirm={confirmDialog?.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
      <SectionHeader title="User Management" icon="🧑‍💼" />
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search username or email..."
          style={{
            flex: 1,
            minWidth: 220,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "0.6rem 0.9rem",
            color: "#fff",
            fontSize: "0.85rem",
            outline: "none",
          }}
        />
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>
          Total: {total}
        </span>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Loading...
        </div>
      ) : (
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "username", label: "Username" },
            { key: "email", label: "Email" },
            {
              key: "preferred_gender",
              label: "Gender",
              render: (v) => v || "—",
            },
            { key: "age", label: "Age", render: (v) => v || "—" },
            {
              key: "preference_unlocked",
              label: "Plan",
              render: (v) => (
                <Badge
                  text={v > 0 ? "Premium" : "Free"}
                  color={v > 0 ? "yellow" : "gray"}
                />
              ),
            },
            { key: "messages_sent", label: "Msgs" },
            { key: "total_chats", label: "Chats" },
            {
              key: "active_ban_id",
              label: "Status",
              render: (v) => (
                <Badge
                  text={v ? "Banned" : "Active"}
                  color={v ? "red" : "green"}
                />
              ),
            },
            {
              key: "created_at",
              label: "Joined",
              render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
            },
            {
              key: "_actions",
              label: "Actions",
              render: (_, row) => (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <Btn
                    onClick={() => {
                      setUserDetail(null);
                      loadDetail(row.id);
                    }}
                  >
                    View
                  </Btn>
                  <Btn
                    onClick={() => {
                      setEditModal(row);
                      setEditUsername(row.username);
                      setEditEmail(row.email);
                    }}
                    color="gray"
                  >
                    Edit
                  </Btn>
                  {row.active_ban_id ? (
                    <Btn onClick={() => handleUnban(row.id)} color="green">
                      Unban
                    </Btn>
                  ) : (
                    <Btn onClick={() => setBanModal(row)} color="red">
                      Ban
                    </Btn>
                  )}
                  {row.preference_unlocked > 0 ? (
                    <Btn onClick={() => handleDemote(row.id)} color="gray">
                      Demote
                    </Btn>
                  ) : (
                    <Btn onClick={() => handlePromote(row.id)} color="yellow">
                      Promote
                    </Btn>
                  )}
                  <Btn onClick={() => handleDelete(row.id)} color="red">
                    Delete
                  </Btn>
                </div>
              ),
            },
          ]}
          rows={users}
        />
      )}

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1rem",
          justifyContent: "center",
        }}
      >
        <Btn
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          color="gray"
        >
          ← Prev
        </Btn>
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.82rem",
            alignSelf: "center",
          }}
        >
          Page {page + 1} of {Math.ceil(total / 20)}
        </span>
        <Btn
          onClick={() => setPage((p) => p + 1)}
          disabled={(page + 1) * 20 >= total}
          color="gray"
        >
          Next →
        </Btn>
      </div>

      {/* User Detail Modal */}
      {userDetail && (
        <Modal
          title={`User: ${userDetail.username} (#${userDetail.id})`}
          onClose={() => setUserDetail(null)}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
              gap: "0.5rem 1.5rem",
              marginBottom: "1rem",
            }}
          >
            {[
              ["Email", userDetail.email],
              ["Gender", userDetail.preferred_gender || "Not set"],
              ["Age", userDetail.age || "Not set"],
              ["Email Verified", userDetail.email_verified ? "Yes" : "No"],
              ["Plan", userDetail.preference_unlocked > 0 ? "Premium" : "Free"],
              ["Daily Matches Used", userDetail.daily_matches_used],
              ["Referral Count", userDetail.referral_count],
              [
                "Joined",
                userDetail.created_at
                  ? new Date(userDetail.created_at).toLocaleString()
                  : "—",
              ],
              ["Interests", userDetail.interests || "None"],
            ].map(([k, v]) => (
              <div key={k}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: 2,
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    color: "#fff",
                    fontSize: "0.85rem",
                    wordBreak: "break-all",
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          {userDetail.banHistory?.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#f87171",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                🔨 Ban History ({userDetail.banHistory.length})
              </div>
              {userDetail.banHistory.slice(0, 3).map((b, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 8,
                    padding: "0.5rem 0.75rem",
                    marginBottom: "0.4rem",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {b.is_permanent
                    ? "🔴 Permanent"
                    : `⏱ Until ${new Date(b.expires_at).toLocaleString()}`}{" "}
                  — {b.reason}
                </div>
              ))}
            </div>
          )}

          {userDetail.reportsReceived?.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#facc15",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                🚨 Reports Received ({userDetail.reportsReceived.length})
              </div>
              {userDetail.reportsReceived.slice(0, 3).map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(234,179,8,0.05)",
                    border: "1px solid rgba(234,179,8,0.15)",
                    borderRadius: 8,
                    padding: "0.5rem 0.75rem",
                    marginBottom: "0.4rem",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  By {r.reporter_username} — {r.reason}{" "}
                  <Badge
                    text={r.status}
                    color={r.status === "PENDING" ? "yellow" : "green"}
                  />
                </div>
              ))}
            </div>
          )}

          {userDetail.recentChats?.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#c084fc",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                💬 Recent Chats
              </div>
              {userDetail.recentChats.map((c, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: 3,
                  }}
                >
                  With {c.partner_username} —{" "}
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Ban Modal */}
      {banModal && (
        <Modal
          title={`Ban User: ${banModal.username}`}
          onClose={() => setBanModal(null)}
        >
          <Input
            label="Reason"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Reason for ban..."
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.85rem",
            }}
          >
            <label
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <input
                type="checkbox"
                checked={banPermanent}
                onChange={(e) => setBanPermanent(e.target.checked)}
              />
              Permanent Ban
            </label>
          </div>
          {!banPermanent && (
            <Input
              label="Duration (hours)"
              type="number"
              value={banHours}
              onChange={(e) => setBanHours(parseInt(e.target.value))}
            />
          )}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Btn onClick={() => setBanModal(null)} color="gray">
              Cancel
            </Btn>
            <Btn onClick={handleBan} color="red" disabled={!banReason}>
              🔨 Confirm Ban
            </Btn>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editModal && (
        <Modal
          title={`Edit User: ${editModal.username}`}
          onClose={() => setEditModal(null)}
        >
          <Input
            label="Username"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
          />
          <Input
            label="Email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Btn onClick={() => setEditModal(null)} color="gray">
              Cancel
            </Btn>
            <Btn onClick={handleEdit} color="purple">
              Save Changes
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Chats Section ────────────────────────────────────────────────────────────
function ChatsSection({ onToast, ready }) {
  const [chats, setChats] = useState([]);
  const [page, setPage] = useState(0);
  const [messages, setMessages] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    if (!ready) return; // ✅ wait for auth token to be ready
    api
      .get(`/chats?page=${page}&size=20`)
      .then((r) => {
        // ✅ FIX: Backend plain array return karta hai — safe extract
        setChats(Array.isArray(r.data) ? r.data : []);
      })
      .catch((e) => {
        console.error(
          "[Admin] Failed to load chats:",
          e?.response?.status,
          e?.response?.data || e?.message,
        );
        onToast(
          `Failed to load chats (${e?.response?.status || "network error"})`,
          "error",
        );
      });
  }, [page, ready]);

  const loadMessages = async (chatId, chatInfo) => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
      setActiveChat(chatInfo);
    } catch (e) {
      onToast("Failed to load messages", "error");
    }
  };

  const deleteChat = async (chatId) => {
    setConfirmDialog({
      title: "Delete Chat?",
      message:
        "This will permanently delete this chat room and ALL its messages.",
      icon: "🗑️",
      confirmLabel: "Delete Chat",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.del(`/chats/${chatId}`);
          onToast("Chat deleted", "success");
          setChats((prev) => prev.filter((c) => c.id !== chatId));
          if (activeChat?.id === chatId) {
            setMessages(null);
            setActiveChat(null);
          }
        } catch (e) {
          onToast("Delete failed", "error");
        }
      },
    });
  };

  return (
    <div>
      <ZnDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        icon={confirmDialog?.icon}
        confirmLabel={confirmDialog?.confirmLabel}
        confirmColor={confirmDialog?.confirmColor}
        onConfirm={confirmDialog?.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
      <SectionHeader title="Chat Monitoring" icon="💬" />
      <Table
        columns={[
          { key: "id", label: "Room ID" },
          { key: "user1_name", label: "User 1" },
          { key: "user2_name", label: "User 2" },
          {
            key: "room_type",
            label: "Type",
            render: (v) => <Badge text={v} color="purple" />,
          },
          { key: "message_count", label: "Messages" },
          {
            key: "reported_messages",
            label: "Reported",
            render: (v) => (v > 0 ? <Badge text={v} color="red" /> : "0"),
          },
          {
            key: "created_at",
            label: "Created",
            render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
          },
          {
            key: "_actions",
            label: "Actions",
            render: (_, row) => (
              <div style={{ display: "flex", gap: 4 }}>
                <Btn onClick={() => loadMessages(row.id, row)}>View Msgs</Btn>
                <Btn onClick={() => deleteChat(row.id)} color="red">
                  Delete
                </Btn>
              </div>
            ),
          },
        ]}
        rows={chats}
      />
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1rem",
          justifyContent: "center",
        }}
      >
        <Btn
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          color="gray"
        >
          ← Prev
        </Btn>
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.82rem",
            alignSelf: "center",
          }}
        >
          Page {page + 1}
        </span>
        <Btn
          onClick={() => setPage((p) => p + 1)}
          disabled={chats.length < 20}
          color="gray"
        >
          Next →
        </Btn>
      </div>

      {/* Messages Modal */}
      {messages && activeChat && (
        <Modal
          title={`Chat #${activeChat.id}: ${activeChat.user1_name} ↔ ${activeChat.user2_name}`}
          onClose={() => {
            setMessages(null);
            setActiveChat(null);
          }}
        >
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.3)",
                  padding: "1.5rem",
                }}
              >
                No messages
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "0.6rem",
                    padding: "0.6rem 0.85rem",
                    background: m.is_reported
                      ? "rgba(239,68,68,0.08)"
                      : "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    border: m.is_reported
                      ? "1px solid rgba(239,68,68,0.2)"
                      : "1px solid transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }} />
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "rgba(255,255,255,0.25)",
                          display: "block",
                        }}
                      >
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#c084fc",
                          fontWeight: 600,
                          display: "block",
                        }}
                      >
                        {m.sender_username}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.83rem",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.message_type === "IMAGE" || m.media_url ? (
                      <img
                        src={`${API_BASE_URL}${m.media_url || m.content}`}
                        alt="shared image"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 180,
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.1)",
                          display: "block",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          window.open(
                            `${API_BASE_URL}${m.media_url || m.content}`,
                            "_blank",
                          )
                        }
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling &&
                            (e.target.nextSibling.style.display = "block");
                        }}
                      />
                    ) : (
                      m.content || `[${m.message_type}]`
                    )}
                  </div>
                  {m.is_reported && <Badge text="Reported" color="red" />}
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Reports Section ──────────────────────────────────────────────────────────
function ReportsSection({ onToast, ready }) {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  const load = useCallback(() => {
    if (!ready) return;
    api
      .get(`/reports?status=${filter}&page=0&size=50`)
      .then((r) => setReports(Array.isArray(r.data) ? r.data : []))
      .catch(() => onToast("Failed to load reports", "error"));
  }, [filter, ready]);

  useEffect(() => {
    load();
  }, [load]);

  const openReport = async (row) => {
    setSelected(row);
    setAdminNotes(row.admin_notes || "");
    setBanReason(row.reason || "");
    setChatMessages([]);
    // Load chat messages for this room
    if (row.chat_room_id) {
      try {
        const r = await api.get(`/chats/${row.chat_room_id}/messages`);
        setChatMessages(r.data || []);
      } catch (e) {
        // non-critical
      }
    }
  };

  const updateReport = async (id, status) => {
    try {
      await api.put(`/reports/${id}`, { status, adminNotes });
      onToast(`Report marked as ${status}`, "success");
      setSelected(null);
      load();
    } catch (e) {
      onToast("Update failed", "error");
    }
  };

  // ─── 3 Admin Ban Actions ───────────────────────────────────────────────────
  const takeBanAction = async (action) => {
    if (!banReason.trim()) {
      onToast("Please enter a reason", "error");
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/reports/${selected.id}/action`, {
        reportedUserId: selected.reported_user_id,
        action,
        reason: banReason.trim(),
      });
      const labels = {
        WARNING: "Warning sent",
        BAN_15: "15-day ban applied",
        BAN_PERM: "Permanently banned",
      };
      onToast(`✅ ${labels[action]} — email sent to user`, "success");
      setSelected(null);
      load();
    } catch (e) {
      onToast(
        "Action failed: " + (e.response?.data?.error || e.message),
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <ZnDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        icon={confirmDialog?.icon}
        confirmLabel={confirmDialog?.confirmLabel}
        confirmColor={confirmDialog?.confirmColor}
        onConfirm={confirmDialog?.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
      <SectionHeader title="Reports Management" icon="🚨" />
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {["ALL", "PENDING", "REVIEWED", "DISMISSED"].map((s) => (
          <Btn
            key={s}
            onClick={() => setFilter(s)}
            color={filter === s ? "purple" : "gray"}
          >
            {s}
          </Btn>
        ))}
      </div>
      <Table
        columns={[
          { key: "id", label: "ID" },
          { key: "reported_username", label: "Reported User" },
          { key: "reporter_username", label: "Reported By" },
          { key: "reason", label: "Reason", wrap: true },
          {
            key: "message_content",
            label: "Message",
            render: (v) =>
              v ? v.slice(0, 50) + (v.length > 50 ? "..." : "") : "—",
          },
          {
            key: "status",
            label: "Status",
            render: (v) => (
              <Badge
                text={v}
                color={
                  v === "PENDING"
                    ? "yellow"
                    : v === "REVIEWED"
                      ? "green"
                      : "gray"
                }
              />
            ),
          },
          {
            key: "created_at",
            label: "Date",
            render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
          },
          {
            key: "_actions",
            label: "Actions",
            render: (_, row) => (
              <div style={{ display: "flex", gap: 4 }}>
                <Btn onClick={() => openReport(row)}>Review</Btn>
              </div>
            ),
          },
        ]}
        rows={reports}
      />

      {selected && (
        <Modal
          title={`🚨 Report #${selected.id} — ${selected.reported_username}`}
          onClose={() => {
            setSelected(null);
            setChatMessages([]);
          }}
        >
          {/* Report Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
              gap: "0.5rem 1.5rem",
              marginBottom: "1rem",
            }}
          >
            {[
              ["Reported User", selected.reported_username],
              ["Reported By", selected.reporter_username],
              ["Reported Email", selected.reported_email || "—"],
              ["Status", selected.status],
              [
                "Date",
                selected.created_at
                  ? new Date(selected.created_at).toLocaleString()
                  : "—",
              ],
            ].map(([k, v]) => (
              <div key={k}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {k}
                </div>
                <div style={{ color: "#fff", fontSize: "0.85rem" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Reported Message */}
          {selected.message_content && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "0.3rem",
                }}
              >
                🚨 REPORTED MESSAGE
              </div>
              <div
                style={{
                  color: "#fca5a5",
                  fontSize: "0.85rem",
                  wordBreak: "break-word",
                }}
              >
                {selected.message_type === "IMAGE" ||
                (selected.message_content &&
                  selected.message_content.startsWith("/uploads")) ? (
                  <img
                    src={`${API_BASE_URL}${selected.message_content}`}
                    alt="reported image"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 8,
                      border: "1px solid rgba(239,68,68,0.3)",
                      display: "block",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      window.open(
                        `${API_BASE_URL}${selected.message_content}`,
                        "_blank",
                      )
                    }
                  />
                ) : (
                  selected.message_content
                )}
              </div>
            </div>
          )}

          {/* Full Chat History */}
          {chatMessages.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                💬 Full Chat History ({chatMessages.length} messages)
              </div>
              <div
                style={{
                  maxHeight: 220,
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 10,
                  padding: "0.5rem",
                }}
              >
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "0.4rem 0.75rem",
                      marginBottom: "0.25rem",
                      borderRadius: 8,
                      background:
                        m.sender_username === selected.reported_username
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(255,255,255,0.04)",
                      borderLeft:
                        m.sender_username === selected.reported_username
                          ? "3px solid rgba(239,68,68,0.4)"
                          : "3px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color:
                          m.sender_username === selected.reported_username
                            ? "#fca5a5"
                            : "#a78bfa",
                        fontWeight: 600,
                      }}
                    >
                      {m.sender_username}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.6)",
                        marginLeft: "0.5rem",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.message_type === "IMAGE" ||
                      (m.content && m.content.startsWith("/uploads")) ? (
                        <img
                          src={`${API_BASE_URL}${m.media_url || m.content}`}
                          alt="image"
                          style={{
                            maxWidth: 120,
                            maxHeight: 80,
                            borderRadius: 6,
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "inline-block",
                            verticalAlign: "middle",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            window.open(
                              `${API_BASE_URL}${m.media_url || m.content}`,
                              "_blank",
                            )
                          }
                        />
                      ) : (
                        m.content
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "rgba(255,255,255,0.25)",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {m.timestamp
                        ? new Date(m.timestamp).toLocaleTimeString()
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ban Reason Input */}
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "0.4rem",
              }}
            >
              Reason / Admin Notes (will be sent in email)
            </div>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Describe the violation..."
              style={{
                width: "100%",
                minHeight: 70,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#fff",
                padding: "0.5rem 0.75rem",
                fontSize: "0.83rem",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* 3 Ban Action Buttons */}
          <div
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: 12,
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "0.75rem",
                fontWeight: 600,
              }}
            >
              🔨 Admin Action (email will be sent to user automatically)
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => takeBanAction("WARNING")}
                disabled={actionLoading}
                style={{
                  padding: "0.5rem 1rem",
                  background: "rgba(234,179,8,0.15)",
                  border: "1px solid rgba(234,179,8,0.4)",
                  color: "#fde68a",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                ⚠️ Send Warning
              </button>
              <button
                onClick={() => takeBanAction("BAN_15")}
                disabled={actionLoading}
                style={{
                  padding: "0.5rem 1rem",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "#fca5a5",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                🔒 15-Day Ban
              </button>
              <button
                onClick={() => takeBanAction("BAN_PERM")}
                disabled={actionLoading}
                style={{
                  padding: "0.5rem 1rem",
                  background: "rgba(127,29,29,0.4)",
                  border: "1px solid rgba(239,68,68,0.6)",
                  color: "#fca5a5",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                ☠️ Permanent Ban
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Btn
              onClick={() => {
                setSelected(null);
                setChatMessages([]);
              }}
              color="gray"
            >
              Cancel
            </Btn>
            <Btn
              onClick={() => updateReport(selected.id, "DISMISSED")}
              color="yellow"
            >
              Dismiss
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Bans Section ─────────────────────────────────────────────────────────────
function BansSection({ onToast, ready }) {
  const [bans, setBans] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const load = () => {
    if (!ready) return;
    api
      .get("/bans")
      .then((r) => setBans(Array.isArray(r.data) ? r.data : []))
      .catch(() => onToast("Failed to load bans", "error"));
  };
  useEffect(load, [ready]);

  const unban = async (userId) => {
    setConfirmDialog({
      title: "Unban User?",
      message: "This user will regain access to the platform.",
      icon: "🔓",
      confirmLabel: "Unban",
      confirmColor: "#7c3aed",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.post(`/users/${userId}/unban`);
          onToast("Unbanned", "success");
          load();
        } catch (e) {
          onToast("Failed", "error");
        }
      },
    });
  };

  return (
    <div>
      <ZnDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        icon={confirmDialog?.icon}
        confirmLabel={confirmDialog?.confirmLabel}
        confirmColor={confirmDialog?.confirmColor}
        onConfirm={confirmDialog?.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
      <SectionHeader title="Banned Users" icon="🔨" />
      <Table
        columns={[
          { key: "user_id", label: "User ID" },
          { key: "username", label: "Username" },
          { key: "email", label: "Email" },
          { key: "reason", label: "Reason", wrap: true },
          { key: "violation_count", label: "Violations" },
          {
            key: "is_permanent",
            label: "Type",
            render: (v) => (
              <Badge
                text={v ? "Permanent" : "Temporary"}
                color={v ? "red" : "yellow"}
              />
            ),
          },
          {
            key: "expires_at",
            label: "Expires",
            render: (v, row) =>
              row.is_permanent
                ? "Never"
                : v
                  ? new Date(v).toLocaleString()
                  : "—",
          },
          {
            key: "created_at",
            label: "Banned On",
            render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
          },
          {
            key: "_actions",
            label: "",
            render: (_, row) => (
              <Btn onClick={() => unban(row.user_id)} color="green">
                Unban
              </Btn>
            ),
          },
        ]}
        rows={bans}
      />
    </div>
  );
}

// ─── Analytics Section ────────────────────────────────────────────────────────
function AnalyticsSection({ onToast, ready }) {
  const [topChatters, setTopChatters] = useState([]);
  const [mostReported, setMostReported] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (!ready) return;
    api
      .get("/stats/top-chatters")
      .then((r) => setTopChatters(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    api
      .get("/stats/most-reported")
      .then((r) => setMostReported(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    api
      .get("/stats/gender")
      .then((r) => setGenderData(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    api
      .get("/stats/age")
      .then((r) => setAgeData(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    api
      .get("/stats/recent-activity")
      .then((r) => setActivity(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, [ready]);

  return (
    <div>
      <SectionHeader title="Analytics & Insights" icon="📈" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Gender Distribution */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "1rem",
            }}
          >
            👥 Gender Distribution
          </div>
          {genderData.map((g, i) => {
            const total =
              genderData.reduce((a, b) => a + (b.count || 0), 0) || 1;
            const pct = Math.round((g.count / total) * 100);
            return (
              <div key={i} style={{ marginBottom: "0.6rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: 4,
                  }}
                >
                  <span>{g.gender}</span>
                  <span>
                    {g.count} ({pct}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      width: pct + "%",
                      height: "100%",
                      background: "linear-gradient(90deg,#7c3aed,#22d3ee)",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "1.25rem",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "0.75rem",
            }}
          >
            ⚡ Recent Activity (24h)
          </div>
          {activity.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem" }}>
              No recent activity
            </div>
          ) : (
            activity.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.35rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontSize: "0.77rem",
                }}
              >
                <div>
                  <Badge
                    text={a.type}
                    color={
                      a.type === "NEW_USER"
                        ? "green"
                        : a.type === "NEW_BAN"
                          ? "red"
                          : "yellow"
                    }
                  />
                  <span
                    style={{ color: "rgba(255,255,255,0.55)", marginLeft: 6 }}
                  >
                    {a.detail}
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>
                  {new Date(a.time).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Chatters */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "0.75rem",
            fontWeight: 600,
          }}
        >
          🏆 Top 10 Most Active Users
        </div>
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "username", label: "Username" },
            { key: "email", label: "Email" },
            {
              key: "message_count",
              label: "Messages Sent",
              render: (v) => (
                <span style={{ color: "#c084fc", fontWeight: 700 }}>{v}</span>
              ),
            },
          ]}
          rows={topChatters}
        />
      </div>

      {/* Most Reported */}
      <div>
        <div
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "0.75rem",
            fontWeight: 600,
          }}
        >
          🚨 Most Reported Users
        </div>
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "username", label: "Username" },
            { key: "email", label: "Email" },
            {
              key: "report_count",
              label: "Report Count",
              render: (v) => (
                <Badge text={v} color={v > 5 ? "red" : "yellow"} />
              ),
            },
          ]}
          rows={mostReported}
        />
      </div>
    </div>
  );
}

// ─── Broadcast Section ────────────────────────────────────────────────────────
function BroadcastSection({ onToast }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setShowConfirm(true);
  };

  const doBroadcast = async () => {
    setShowConfirm(false);
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onToast("✅ Broadcast sent to all online users!", "success");
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setMessage("");
    } catch (err) {
      onToast(`❌ Broadcast failed: ${err.message}`, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <ZnDialog
        open={showConfirm}
        title="Send Broadcast?"
        message="This message will be sent to ALL currently online users as a persistent notification."
        highlight={message}
        icon="📢"
        confirmLabel="Send Broadcast"
        confirmColor="#7c3aed"
        onConfirm={doBroadcast}
        onCancel={() => setShowConfirm(false)}
      />
      <SectionHeader title="Broadcast Message" icon="📢" />
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "1.5rem",
          maxWidth: 600,
        }}
      >
        <div
          style={{
            marginBottom: "0.75rem",
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Send a real-time persistent notification to all currently online users
          via WebSocket. Users can dismiss it manually.
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your broadcast message here..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "0.75rem 1rem",
            color: "#fff",
            fontSize: "0.88rem",
            outline: "none",
            minHeight: 120,
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "DM Sans, sans-serif",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "0.75rem",
          }}
        >
          <Btn
            onClick={handleBroadcast}
            color="purple"
            size="md"
            disabled={!message.trim() || sending}
          >
            {sending ? "⏳ Sending..." : "📢 Send Broadcast"}
          </Btn>
        </div>
        {sent && (
          <div
            style={{
              marginTop: "0.75rem",
              color: "#4ade80",
              fontSize: "0.82rem",
              textAlign: "center",
            }}
          >
            ✅ Broadcast sent successfully!
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // ✅ FIX: Tab URL mein save karo — refresh pe bhi same tab rahega
  // Pehle: useState("overview") — refresh pe hamesha overview pe jaata tha
  const activeTab = searchParams.get("tab") || "overview";
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [stats, setStats] = useState({});
  const [trend, setTrend] = useState([]);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (authLoading) return; // wait — token verify ho raha hai
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate("/");
      return;
    }
    api
      .get("/stats")
      .then((r) => setStats(r.data))
      .catch(() => showToast("Failed to load stats", "error"));
    api
      .get("/stats/registration-trend")
      .then((r) => setTrend(r.data))
      .catch(() => {});
  }, [authLoading, user, navigate]);

  if (authLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#070710",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.35)",
          fontFamily: "DM Sans,sans-serif",
        }}
      >
        Verifying admin access...
      </div>
    );
  if (!user || user.email !== ADMIN_EMAIL) return null;

  const tabs = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "users", icon: "🧑‍💼", label: "Users" },
    { id: "chats", icon: "💬", label: "Chats" },
    { id: "reports", icon: "🚨", label: "Reports" },
    { id: "bans", icon: "🔨", label: "Bans" },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "broadcast", icon: "📢", label: "Broadcast" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{overflow-x:hidden;max-width:100%;}
        .adm-root { min-height: 100vh; min-height:100dvh; background: #070710; color: #fff; font-family: 'DM Sans', sans-serif; display: flex; overflow: hidden; }
        .adm-modal-inner::-webkit-scrollbar { display: none; }
        .adm-chat-hist::-webkit-scrollbar { display: none; }
        .adm-sidebar { width: 220px; background: #0a0a18; border-right: 1px solid rgba(139,92,246,0.18); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; height:100dvh; flex-shrink: 0; transition: width 0.25s cubic-bezier(0.4,0,0.2,1); overflow: hidden; z-index: 50; }
        .adm-sidebar.open { width: 220px; }
        .adm-sidebar.closed { width: 0px; border-right: none; }
        .adm-sidebar-top { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(139,92,246,0.15); display: flex; align-items: center; gap: 0.6rem; min-width: 220px; background: #0a0a18; }
        .adm-logo { width: 32px; height: 32px; border-radius: 8px; background: rgba(139,92,246,0.2); border: 1px solid rgba(139,92,246,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .adm-logo-close { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); display: none; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; color: rgba(255,255,255,0.6); transition: all 0.2s; }
        .adm-logo-close:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #f87171; }
        .adm-logo-desktop { display: flex; }
        @media(max-width:768px) {
          .adm-logo-desktop { display: none; }
          .adm-logo-close { display: flex; }
        }
        .adm-brand { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; background: linear-gradient(135deg,#c084fc,#22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; white-space: nowrap; }
        .adm-nav { padding: 0.75rem 0; flex: 1; overflow-y: auto; }
        .adm-nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; cursor: pointer; transition: all 0.15s; border-radius: 0; position: relative; white-space: nowrap; }
        .adm-nav-item:hover { background: rgba(139,92,246,0.1); }
        .adm-nav-item.active { background: rgba(139,92,246,0.15); border-right: 3px solid #7c3aed; }
        .adm-nav-item .adm-nav-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }
        .adm-nav-item .adm-nav-label { font-size: 0.82rem; color: rgba(255,255,255,0.65); }
        .adm-nav-item.active .adm-nav-label { color: #c084fc; font-weight: 600; }
        .adm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .adm-topbar { background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; gap: 0.5rem; flex-shrink: 0; }
        .adm-menu-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.55); cursor: pointer; font-size: 15px; padding: 0.3rem 0.5rem; border-radius: 7px; transition: all 0.2s; flex-shrink: 0; line-height: 1; }
        .adm-menu-btn:hover { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.3); color: #c084fc; }
        .adm-topbar-left { display: flex; align-items: center; gap: 0.65rem; min-width: 0; flex: 1; }
        .adm-topbar-title { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adm-topbar-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .adm-admin-badge { background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); color: #c084fc; padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
        .adm-back-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .adm-back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .adm-content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 1.5rem; }
        .adm-toggle { display: none; }

        /* Mobile overlay for sidebar */
        .adm-sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; }

        @media(max-width: 900px) {
          .adm-content { padding: 1.25rem; }
        }
        @media(max-width: 768px) {
          .adm-sidebar { position: fixed; left: 0; top: 0; height: 100%; width: 0px; border-right: none; }
          .adm-sidebar.open { width: 220px; border-right: 1px solid rgba(255,255,255,0.07); }
          .adm-sidebar-overlay { display: block; }
          .adm-content { padding: 1rem; }
          .adm-topbar { padding: 0.65rem 0.85rem; }
          .adm-admin-badge { display: none; }
        }
        @media(max-width: 480px) {
          .adm-content { padding: 0.85rem 0.75rem; }
          .adm-topbar { padding: 0.6rem 0.75rem; }
          .adm-topbar-title { font-size: 0.88rem; }
          .adm-back-btn { padding: 0.3rem 0.55rem; font-size: 0.73rem; }
          .adm-back-btn span { display: none; }
        }
        @media(max-width: 380px) {
          .adm-content { padding: 0.75rem 0.6rem; }
        }
      `}</style>

      <div className="adm-root">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="adm-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <div className={`adm-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="adm-sidebar-top">
            {/* Desktop: logo icon */}
            <div className="adm-logo adm-logo-desktop">⚡</div>
            {/* Mobile: close button */}
            <button
              className="adm-logo-close"
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
            >
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
            <span className="adm-brand">Admin Panel</span>
          </div>
          <nav className="adm-nav">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`adm-nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="adm-nav-icon">{tab.icon}</span>
                <span className="adm-nav-label">{tab.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Main */}
        <div className="adm-main">
          {/* Topbar */}
          <div className="adm-topbar">
            <div className="adm-topbar-left">
              <button
                className="adm-menu-btn"
                onClick={() => setSidebarOpen((v) => !v)}
                title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                ☰
              </button>
              <div className="adm-topbar-title">
                {tabs.find((t) => t.id === activeTab)?.icon}{" "}
                {tabs.find((t) => t.id === activeTab)?.label}
              </div>
            </div>
            <div className="adm-topbar-right">
              <span className="adm-admin-badge">⚡ Admin</span>
              <button className="adm-back-btn" onClick={() => navigate("/")}>
                ← Back to Site
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="adm-content">
            {activeTab === "overview" && (
              <OverviewSection stats={stats} trend={trend} />
            )}
            {activeTab === "users" && (
              <UsersSection onToast={showToast} ready={!authLoading} />
            )}
            {activeTab === "chats" && (
              <ChatsSection onToast={showToast} ready={!authLoading} />
            )}
            {activeTab === "reports" && (
              <ReportsSection onToast={showToast} ready={!authLoading} />
            )}
            {activeTab === "bans" && (
              <BansSection onToast={showToast} ready={!authLoading} />
            )}
            {activeTab === "analytics" && (
              <AnalyticsSection onToast={showToast} ready={!authLoading} />
            )}
            {activeTab === "broadcast" && (
              <BroadcastSection onToast={showToast} />
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 99999,
            background:
              toast.type === "error"
                ? "rgba(239,68,68,0.95)"
                : "rgba(22,163,74,0.95)",
            color: "#fff",
            padding: "0.75rem 1.25rem",
            borderRadius: 12,
            fontSize: "0.85rem",
            fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            animation: "slideUp 0.3s ease",
            maxWidth: 320,
          }}
        >
          {toast.type === "error" ? "❌ " : "✅ "}
          {toast.msg}
        </div>
      )}
    </>
  );
}
