// app/(tabs)/friends.js — Friends Screen (exact website Friends.jsx match)
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { ZnDialog } from "../../src/components/ZnComponents";
import { API_BASE_URL } from "../../src/constants/api";
import Toast from "react-native-toast-message";

const API_IMG = API_BASE_URL.replace("/api", "");
const TABS = ["Friends", "Requests", "Blocked", "Search"];

function Avatar({ username, uri, size = 42 }) {
  const initials = (username || "?").slice(0, 2).toUpperCase();
  return (
    <LinearGradient
      colors={["#7c3aed", "#6366f1"]}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.34 }}>
        {initials}
      </Text>
    </LinearGradient>
  );
}

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const token = user?.token;
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const [tab, setTab] = useState("Friends");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [reqSent, setReqSent] = useState(false);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchFriends(), fetchRequests(), fetchBlocked()]);
    setLoading(false);
  };

  const fetchFriends = async () => {
    try {
      const r = await axios.get(`${API_BASE_URL}/friends`, headers);
      setFriends(Array.isArray(r.data) ? r.data : []);
    } catch {}
  };
  const fetchRequests = async () => {
    try {
      const r = await axios.get(`${API_BASE_URL}/friends/requests`, headers);
      setRequests(Array.isArray(r.data) ? r.data : []);
    } catch {}
  };
  const fetchBlocked = async () => {
    try {
      const r = await axios.get(`${API_BASE_URL}/friends/blocked`, headers);
      setBlocked(Array.isArray(r.data) ? r.data : []);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const handleAccept = async (reqId) => {
    setActionLoading(reqId);
    try {
      await axios.post(`${API_BASE_URL}/friends/accept/${reqId}`, {}, headers);
      await fetchAll();
      setTab("Friends");
      Toast.show({ type: "success", text1: "Friend request accepted!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reqId) => {
    setActionLoading(reqId);
    try {
      await axios.post(`${API_BASE_URL}/friends/reject/${reqId}`, {}, headers);
      await fetchRequests();
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = (id, username) => {
    setDialog({
      title: "Remove Friend?",
      message: `${username} will be removed from your friends.`,
      icon: "👤",
      confirmLabel: "Remove",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setDialog(null);
        setActionLoading(id);
        try {
          await axios.delete(`${API_BASE_URL}/friends/remove/${id}`, headers);
          await fetchFriends();
        } catch {
          Toast.show({ type: "error", text1: "Failed" });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleBlock = (id, username) => {
    setDialog({
      title: `Block ${username}?`,
      message: "They won't be matched with you.",
      icon: "🚫",
      confirmLabel: "Block",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        setDialog(null);
        setActionLoading(id);
        try {
          await axios.post(`${API_BASE_URL}/friends/block/${id}`, {}, headers);
          await fetchAll();
        } catch {
          Toast.show({ type: "error", text1: "Failed" });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleUnblock = async (id) => {
    setActionLoading(id);
    try {
      await axios.delete(`${API_BASE_URL}/friends/unblock/${id}`, headers);
      await fetchBlocked();
      Toast.show({ type: "success", text1: "User unblocked" });
    } catch {
      Toast.show({ type: "error", text1: "Failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenChat = async (friendId) => {
    setActionLoading(friendId);
    try {
      const r = await axios.post(
        `${API_BASE_URL}/friends/chat/${friendId}`,
        {},
        headers,
      );
      await SecureStore.setItemAsync(
        "zn_chat_room_id",
        String(r.data.chatRoomId),
      );
      router.push("/(tabs)/match");
    } catch {
      Toast.show({ type: "error", text1: "Could not open chat" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    setReqSent(false);
    try {
      const r = await axios.get(
        `${API_BASE_URL}/friends/search?username=${searchQ.trim()}`,
        headers,
      );
      setSearchResult(r.data);
    } catch {
      setSearchResult(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendReq = async () => {
    if (!searchResult) return;
    try {
      await axios.post(
        `${API_BASE_URL}/friends/request/${searchResult.id}`,
        {},
        headers,
      );
      setReqSent(true);
      Toast.show({ type: "success", text1: "Friend request sent!" });
    } catch (err) {
      const m = err.response?.data?.error || "Failed";
      if (m.toLowerCase().includes("already")) setReqSent(true);
      else Toast.show({ type: "error", text1: m });
    }
  };

  const renderFriend = ({ item }) => (
    <View style={s.card}>
      <Avatar username={item.username} size={44} />
      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
        <Text style={s.cardName}>{item.username}</Text>
        {item.unreadCount > 0 && (
          <View style={s.unreadBadge}>
            <Text style={s.unreadText}>{item.unreadCount} new</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => handleOpenChat(item.id || item.friendId)}
        style={s.chatBtn}
        disabled={actionLoading === (item.id || item.friendId)}
      >
        <Ionicons name="chatbubble" size={14} color={COLORS.purplePale} />
        <Text style={s.chatBtnText}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleRemove(item.id || item.friendId, item.username)}
        style={s.iconBtn}
      >
        <Ionicons
          name="person-remove-outline"
          size={16}
          color={COLORS.redLight}
        />
      </TouchableOpacity>
    </View>
  );

  const renderRequest = ({ item }) => (
    <View style={s.card}>
      <Avatar username={item.senderUsername || item.username} size={44} />
      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
        <Text style={s.cardName}>{item.senderUsername || item.username}</Text>
        <Text style={s.cardSub}>Wants to be friends</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleAccept(item.id)}
        style={s.acceptBtn}
        disabled={actionLoading === item.id}
      >
        <Ionicons name="checkmark" size={18} color={COLORS.green} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleReject(item.id)}
        style={s.rejectBtn}
        disabled={actionLoading === item.id}
      >
        <Ionicons name="close" size={18} color={COLORS.redLight} />
      </TouchableOpacity>
    </View>
  );

  const renderBlocked = ({ item }) => (
    <View style={s.card}>
      <Avatar username={item.username} size={44} />
      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
        <Text style={s.cardName}>{item.username}</Text>
        <Text style={s.cardSub}>Blocked</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleUnblock(item.id || item.blockedId)}
        style={s.unblockBtn}
        disabled={actionLoading === (item.id || item.blockedId)}
      >
        <Text style={s.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View
        style={[
          s.container,
          {
            paddingTop: insets.top,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👥</Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: COLORS.textSecondary,
            marginBottom: 8,
          }}
        >
          Login Required
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: COLORS.textMuted,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Sign in to manage your friends
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={{ borderRadius: RADIUS.md, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["#7c3aed", "#6366f1", "#0891b2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 14, paddingHorizontal: 32 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Login
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ZnDialog
        visible={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        icon={dialog?.icon}
        confirmLabel={dialog?.confirmLabel}
        confirmColor={dialog?.confirmColor}
        onConfirm={dialog?.onConfirm}
        onCancel={() => setDialog(null)}
      />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Friends</Text>
        {requests.length > 0 && (
          <View style={s.reqBadge}>
            <Text style={s.reqBadgeText}>{requests.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[s.tabBtn, tab === t && s.tabBtnActive]}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
            {t === "Requests" && requests.length > 0 && (
              <View style={s.tabBadge}>
                <Text style={s.tabBadgeText}>{requests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Lists */}
      {tab !== "Search" && (
        <FlatList
          data={
            tab === "Friends"
              ? friends
              : tab === "Requests"
                ? requests
                : blocked
          }
          keyExtractor={(item, i) => String(item.id || i)}
          renderItem={
            tab === "Friends"
              ? renderFriend
              : tab === "Requests"
                ? renderRequest
                : renderBlocked
          }
          contentContainerStyle={[
            s.list,
            { paddingBottom: insets.bottom + 80 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.purplePale}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>
                {tab === "Friends" ? "👥" : tab === "Requests" ? "📭" : "✅"}
              </Text>
              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                {tab === "Friends"
                  ? "No friends yet — start matching!"
                  : tab === "Requests"
                    ? "No pending requests"
                    : "No blocked users"}
              </Text>
            </View>
          }
        />
      )}

      {/* Search tab */}
      {tab === "Search" && (
        <View style={[s.searchWrap, { paddingBottom: insets.bottom + 80 }]}>
          <View style={s.searchRow}>
            <TextInput
              style={s.searchInput}
              placeholder="Search by username..."
              placeholderTextColor={COLORS.textDim}
              value={searchQ}
              onChangeText={setSearchQ}
              autoCapitalize="none"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={handleSearch}
              style={s.searchBtn}
              disabled={searchLoading}
            >
              {searchLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="search" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          {searchResult === false && (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>🔍</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 15 }}>
                User not found
              </Text>
            </View>
          )}
          {searchResult && (
            <View
              style={[
                s.card,
                {
                  flexDirection: "column",
                  alignItems: "center",
                  padding: SPACING.xl,
                },
              ]}
            >
              <Avatar username={searchResult.username} size={64} />
              <Text style={[s.cardName, { fontSize: 18, marginTop: 12 }]}>
                {searchResult.username}
              </Text>
              {searchResult.fullName && (
                <Text style={s.cardSub}>{searchResult.fullName}</Text>
              )}
              <TouchableOpacity
                onPress={handleSendReq}
                disabled={reqSent}
                style={{
                  borderRadius: RADIUS.md,
                  overflow: "hidden",
                  marginTop: 16,
                  width: "100%",
                }}
              >
                <LinearGradient
                  colors={
                    reqSent
                      ? ["#4a4a6a", "#3a3a5a"]
                      : ["#7c3aed", "#6366f1", "#0891b2"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 13, alignItems: "center" }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}
                  >
                    {reqSent ? "✓ Request Sent" : "Send Friend Request"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

import { ActivityIndicator } from "react-native";
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
  reqBadge: {
    backgroundColor: COLORS.red,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reqBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: COLORS.purpleBg,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },
  tabText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "600" },
  tabTextActive: { color: COLORS.purplePale },
  tabBadge: {
    backgroundColor: COLORS.red,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tabBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },

  list: { paddingHorizontal: SPACING.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  cardSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  unreadBadge: {
    backgroundColor: "rgba(124,58,237,0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  unreadText: { fontSize: 11, color: COLORS.purplePale, fontWeight: "600" },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.purpleBg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },
  chatBtnText: { fontSize: 12, color: COLORS.purplePale, fontWeight: "600" },
  iconBtn: {
    padding: 7,
    backgroundColor: COLORS.redBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    marginLeft: SPACING.sm,
  },
  acceptBtn: {
    padding: 8,
    backgroundColor: COLORS.greenBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
  },
  rejectBtn: {
    padding: 8,
    backgroundColor: COLORS.redBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    marginLeft: SPACING.sm,
  },
  unblockBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unblockText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },

  searchWrap: { flex: 1, padding: SPACING.lg },
  searchRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
