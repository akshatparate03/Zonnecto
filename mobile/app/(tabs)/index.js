// app/(tabs)/index.js — Home Screen (exact website Home.jsx match)
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useWebSocket } from "../../src/context/WebSocketContext";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import axios from "axios";
import { API_BASE_URL } from "../../src/constants/api";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user } = useAuth();
  const { onlineCount, subscribe, connected } = useWebSocket();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({ friends: 0, pending: 0, chats: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState(null);
  const [searching, setSearching] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchPulse = useRef(new Animated.Value(1)).current;
  const searchRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Searching animation
  useEffect(() => {
    if (searching) {
      Animated.loop(
        Animated.timing(searchRotate, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(searchPulse, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(searchPulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      searchRotate.setValue(0);
      searchPulse.setValue(1);
    }
  }, [searching]);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  useEffect(() => {
    if (!connected) return;
    const unsub = subscribe("/topic/broadcast", (msg) => {
      try {
        const d = JSON.parse(msg.body);
        setBroadcastMsg(d.message);
      } catch {}
    });
    return unsub;
  }, [connected]);

  const fetchStats = async () => {
    if (!user?.token) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      // Use existing endpoints — /friends/home-stats may not exist on backend
      const [friendsRes, requestsRes] = await Promise.all([
        axios
          .get(`${API_BASE_URL}/friends`, { headers })
          .catch(() => ({ data: [] })),
        axios
          .get(`${API_BASE_URL}/friends/requests`, { headers })
          .catch(() => ({ data: [] })),
      ]);
      const friendsList = Array.isArray(friendsRes.data) ? friendsRes.data : [];
      const pendingList = Array.isArray(requestsRes.data)
        ? requestsRes.data
        : [];
      // Count unread: friends with unreadCount > 0
      const unread = friendsList.filter((f) => f.unreadCount > 0).length;
      setStats({
        friends: friendsList.length,
        pending: pendingList.length,
        chats: unread,
      });
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const spin = searchRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={s.container}>
      <View style={s.orb1} />
      <View style={s.orb2} />
      <View style={s.grid} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.purplePale}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Broadcast Banner */}
          {broadcastMsg && (
            <View style={s.broadcastBanner}>
              <Ionicons name="megaphone" size={16} color={COLORS.purplePale} />
              <Text style={s.broadcastText} numberOfLines={3}>
                {broadcastMsg}
              </Text>
              <TouchableOpacity onPress={() => setBroadcastMsg(null)}>
                <Ionicons name="close" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Header ── */}
          <View style={s.welcomeTag}>
            <Animated.View
              style={[s.welcomeDot, { transform: [{ scale: pulseAnim }] }]}
            />
            <Text style={s.welcomeTagText}>WELCOME BACK</Text>
          </View>

          {/* Username row with inline online badge */}
          <View style={s.heroRow}>
            <Text style={s.heroName}>
              Hey,{" "}
              <Text style={s.heroNameAccent}>{user?.username || "there"}</Text>{" "}
              👋
            </Text>
            {user && onlineCount > 0 && (
              <View style={s.onlinePill}>
                <Animated.View
                  style={[
                    s.onlinePillDot,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <Text style={s.onlinePillText}>{onlineCount} online</Text>
              </View>
            )}
          </View>
          <Text style={s.heroSub}>
            Ready to connect with someone new today?
          </Text>

          {/* ── FIND A MATCH CARD (exact website layout) ── */}
          <View style={s.sectionCard}>
            {/* Card header */}
            <View style={s.cardIconRow}>
              <View style={s.cardIconWrap}>
                <Ionicons name="search" size={20} color={COLORS.purplePale} />
              </View>
            </View>
            <Text style={s.cardTitle}>Find a Match</Text>
            <Text style={s.cardDesc}>
              Chat with someone anonymously and connect in real-time.
            </Text>

            {/* Searching state (website style) */}
            {searching ? (
              <View style={s.searchingArea}>
                <View style={s.ringsWrap}>
                  <View style={[s.ring, s.ring3]} />
                  <View style={[s.ring, s.ring2]} />
                  <View style={[s.ring, s.ring1]} />
                  <Animated.View
                    style={[s.spinnerOrbit, { transform: [{ rotate: spin }] }]}
                  >
                    <View style={s.spinnerDot} />
                  </Animated.View>
                  <Animated.View
                    style={[
                      s.searchCircleWrap,
                      { transform: [{ scale: searchPulse }] },
                    ]}
                  >
                    <LinearGradient
                      colors={["#7c3aed", "#6366f1", "#0891b2"]}
                      style={s.searchCircle}
                    >
                      <Ionicons name="search" size={28} color="#fff" />
                    </LinearGradient>
                  </Animated.View>
                </View>
                <Text style={s.searchingLabel}>Searching...</Text>
                <TouchableOpacity
                  onPress={() => setSearching(false)}
                  style={s.cancelBtn}
                >
                  <Text style={s.cancelBtnText}>Cancel Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  user
                    ? router.push("/(tabs)/match")
                    : router.push("/(auth)/login")
                }
                style={s.startMatchBtnWrap}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={["#7c3aed", "#6366f1", "#0891b2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.startMatchBtn}
                >
                  <Text style={s.startMatchBtnText}>Start Match</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Rules row (website style) */}
            {!searching && (
              <View style={s.rulesWrap}>
                {[
                  "100 matches per day",
                  "Media available after 2 mins",
                  "All links are strictly restricted",
                ].map((r, i) => (
                  <View key={i} style={s.ruleRow}>
                    <View style={s.ruleDot} />
                    <Text style={s.ruleText}>{r}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── FRIENDS CARD (exact website layout) ── */}
          <View style={s.sectionCard}>
            <View style={s.cardIconRow}>
              <View
                style={[
                  s.cardIconWrap,
                  {
                    backgroundColor: "rgba(34,211,238,0.1)",
                    borderColor: "rgba(34,211,238,0.2)",
                  },
                ]}
              >
                <Ionicons name="people" size={20} color={COLORS.cyan} />
              </View>
            </View>
            <Text style={s.cardTitle}>Friends</Text>
            <Text style={s.cardDesc}>
              Chat with people you've connected with before. View chats,
              messages and manage your friend list.
            </Text>

            {/* Stats row — FRIENDS / PENDING / UNREAD with actual numbers */}
            <View style={s.friendsStatsRow}>
              {[
                { label: "FRIENDS", value: stats.friends },
                { label: "PENDING", value: stats.pending },
                { label: "UNREAD", value: stats.chats },
              ].map((st, i) => (
                <View
                  key={i}
                  style={[s.friendsStatItem, i < 2 && s.friendsStatBorder]}
                >
                  <Text style={s.friendsStatValue}>{st.value}</Text>
                  <Text style={s.friendsStatLabel}>{st.label}</Text>
                </View>
              ))}
            </View>

            {/* View Friends button */}
            <TouchableOpacity
              onPress={() =>
                user
                  ? router.push("/(tabs)/friends")
                  : router.push("/(auth)/login")
              }
              style={s.viewFriendsWrap}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#7c3aed", "#6366f1", "#0891b2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.viewFriendsBtn}
              >
                <Ionicons
                  name="people"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={s.viewFriendsBtnText}>View Friends</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Premium upsell */}
          {user && !user.isPremium && (
            <TouchableOpacity
              onPress={() => router.push("/premium")}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["rgba(245,158,11,0.12)", "rgba(124,58,237,0.12)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.premiumBanner}
              >
                <Ionicons name="star" size={20} color={COLORS.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={s.premiumTitle}>Upgrade to Premium</Text>
                  <Text style={s.premiumSub}>
                    Filter by gender, age & location · From ₹30/mo
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.gold}
                />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Auth CTA for guests */}
          {!user && (
            <View style={s.authBox}>
              <Text style={s.authTitle}>Join Zonnecto</Text>
              <Text style={s.authSubText}>
                Create an account to save friends, history and more
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
                style={{
                  borderRadius: RADIUS.md,
                  overflow: "hidden",
                  marginBottom: SPACING.sm,
                }}
              >
                <LinearGradient
                  colors={["#7c3aed", "#6366f1", "#0891b2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.authBtnGrad}
                >
                  <Text style={s.authBtnPrimaryText}>Register Free</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                style={s.authBtnSecondary}
              >
                <Text style={s.authBtnSecondaryText}>Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(168,85,247,0.09)",
    top: -100,
    left: -80,
  },
  orb2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(6,182,212,0.07)",
    bottom: 80,
    right: -60,
  },
  grid: { position: "absolute", inset: 0 },
  scroll: { paddingHorizontal: SPACING.lg },

  broadcastBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(124,58,237,0.12)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  broadcastText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Hero header (website style) ──
  welcomeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(139,92,246,0.1)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  welcomeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  welcomeTagText: {
    fontSize: 10,
    color: COLORS.purplePale,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },
  heroName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  heroNameAccent: { color: COLORS.purplePale },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(74,222,128,0.1)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.22)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  onlinePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  onlinePillText: {
    fontSize: 11,
    color: COLORS.green,
    fontWeight: "700",
  },
  heroSub: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.xl },

  // ── Section Cards (website style) ──
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardIconRow: { marginBottom: SPACING.sm },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(139,92,246,0.1)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },

  // ── Start Match Button ──
  startMatchBtnWrap: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  startMatchBtn: { paddingVertical: 14, alignItems: "center" },
  startMatchBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // ── Rules ──
  rulesWrap: { gap: 6 },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ruleDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.purplePale,
  },
  ruleText: { fontSize: 12, color: COLORS.textMuted },

  // ── Searching animation (website style) ──
  searchingArea: { alignItems: "center", paddingVertical: SPACING.lg },
  ringsWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  ring: { position: "absolute", borderRadius: 999, borderWidth: 1 },
  ring1: { width: 108, height: 108, borderColor: "rgba(139,92,246,0.3)" },
  ring2: { width: 135, height: 135, borderColor: "rgba(139,92,246,0.18)" },
  ring3: { width: 160, height: 160, borderColor: "rgba(139,92,246,0.09)" },
  spinnerOrbit: {
    position: "absolute",
    width: 135,
    height: 135,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  spinnerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.purplePale,
    marginTop: 6,
  },
  searchCircleWrap: {},
  searchCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  cancelBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: RADIUS.md,
    paddingVertical: 11,
    paddingHorizontal: SPACING.xxl,
  },
  cancelBtnText: { color: COLORS.redLight, fontSize: 14, fontWeight: "700" },

  // ── Friends Card stats ──
  friendsStatsRow: {
    flexDirection: "row",
    marginBottom: SPACING.lg,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  friendsStatItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  friendsStatBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  friendsStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  friendsStatIconWrap: {},
  friendsStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  // ── View Friends Button ──
  viewFriendsWrap: { borderRadius: RADIUS.md, overflow: "hidden" },
  viewFriendsBtn: {
    paddingVertical: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  viewFriendsBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // ── Premium banner ──
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)",
    marginBottom: SPACING.xl,
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gold,
    marginBottom: 2,
  },
  premiumSub: { fontSize: 11, color: COLORS.textMuted, lineHeight: 15 },

  // ── Auth box ──
  authBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: SPACING.sm,
  },
  authSubText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  authBtnGrad: {
    paddingVertical: 14,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  authBtnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  authBtnSecondary: {
    paddingVertical: 13,
    paddingHorizontal: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  authBtnSecondaryText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
});
