// app/(tabs)/profile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { ZnDialog } from "../../src/components/ZnComponents";
import { API_BASE_URL } from "../../src/constants/api";
import Toast from "react-native-toast-message";
import Svg, {
  Text as SvgText,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");

const MENU_ITEMS = [
  {
    icon: "create-outline",
    label: "Edit Profile",
    color: "#a855f7",
    route: "/profile-edit",
  },
  {
    icon: "star-outline",
    label: "Premium Plans",
    color: "#f59e0b",
    route: "/premium",
  },
  {
    icon: "shield-checkmark-outline",
    label: "Privacy Policy",
    color: "#22d3ee",
    route: "/privacy-policy",
  },
  {
    icon: "document-text-outline",
    label: "Terms & Conditions",
    color: "#818cf8",
    route: "/terms",
  },
  {
    icon: "information-circle-outline",
    label: "About Zonnecto",
    color: "#4ade80",
    route: "/about",
  },
  {
    icon: "mail-outline",
    label: "Contact Us",
    color: "#38bdf8",
    route: "/contact",
  },
  {
    icon: "alert-circle-outline",
    label: "Disclaimer",
    color: "#fb923c",
    route: "/disclaimer",
  },
];

// ── Zonnecto Logo SVG (replaces purple orb bg) ──────────────────────────────
function ZonnectoLogoBg() {
  return (
    <View style={s.logoBgWrap} pointerEvents="none">
      <Svg
        width={SCREEN_W * 0.75}
        height={SCREEN_W * 0.75}
        viewBox="0 0 200 200"
      >
        <Defs>
          <SvgGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#7c3aed" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#06b6d4" stopOpacity="0.10" />
          </SvgGradient>
        </Defs>
        {/* Big ∞ symbol as watermark */}
        <SvgText
          x="100"
          y="140"
          textAnchor="middle"
          fontSize="160"
          fontWeight="900"
          fill="url(#logoGrad)"
          fontFamily="serif"
        >
          ∞
        </SvgText>
      </Svg>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout, refreshUserProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingDp, setUploadingDp] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const token = user?.token;

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleUploadDp = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: "error", text1: "Permission needed" });
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (r.canceled) return;
    setUploadingDp(true);
    const fd = new FormData();
    fd.append("file", {
      uri: r.assets[0].uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    });
    try {
      const res = await axios.post(`${API_BASE_URL}/user/upload-dp`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile((prev) => ({ ...prev, dpUrl: res.data.dpUrl }));
      Toast.show({ type: "success", text1: "Profile photo updated!" });
    } catch {
      Toast.show({ type: "error", text1: "Upload failed" });
    } finally {
      setUploadingDp(false);
    }
  };

  const handleLogout = async () => {
    setLogoutDialog(false);
    await logout();
    router.replace("/");
  };

  const premiumActive =
    profile?.isPremium &&
    (!profile?.premiumExpiresAt ||
      new Date(profile.premiumExpiresAt) > new Date());
  const interests = profile?.interests
    ? profile.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

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
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: COLORS.textSecondary,
            marginBottom: 8,
          }}
        >
          Not signed in
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: COLORS.textMuted,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Login to view your profile
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
        visible={logoutDialog}
        title="Logout?"
        message="Are you sure you want to sign out?"
        icon="👋"
        confirmLabel="Logout"
        confirmColor="#ef4444"
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialog(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.purplePale}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* ── Hero section with Zonnecto logo watermark ── */}
        <View style={s.heroWrap}>
          {/* Logo watermark bg */}
          <ZonnectoLogoBg />

          {/* Gradient overlay */}
          <LinearGradient
            colors={["rgba(124,58,237,0.22)", "rgba(7,7,16,0)"]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Content */}
          <View style={s.heroContent}>
            {/* Avatar */}
            <TouchableOpacity
              onPress={handleUploadDp}
              disabled={uploadingDp}
              style={s.avatarWrap}
            >
              <LinearGradient colors={["#7c3aed", "#6366f1"]} style={s.avatar}>
                <Text style={s.avatarText}>
                  {(profile?.username || user?.username || "?")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={s.cameraBtn}>
                <Ionicons
                  name={uploadingDp ? "hourglass" : "camera"}
                  size={13}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>

            <Text style={s.username}>
              {profile?.username || user?.username}
            </Text>
            {profile?.fullName && (
              <Text style={s.fullName}>{profile.fullName}</Text>
            )}

            {premiumActive ? (
              <View style={s.premiumBadge}>
                <Ionicons name="star" size={12} color={COLORS.gold} />
                <Text style={s.premiumBadgeText}>
                  Premium · {profile?.premiumPlan}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/premium")}
                style={s.upgradeBadge}
              >
                <Text style={s.upgradeBadgeText}>⭐ Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Stats row — FIXED: equal spacing, separator lines ── */}
        <View style={s.statsRow}>
          {[
            { label: "Age", value: profile?.age || "—" },
            { label: "Gender", value: profile?.gender || "—" },
            { label: "State", value: profile?.state || "—" },
          ].map((st, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.statDivider} />}
              <View style={s.statItem}>
                <Text
                  style={s.statValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {st.value}
                </Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Bio */}
        {profile?.bio && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>About</Text>
            <Text style={s.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Interests</Text>
            <View style={s.tagsRow}>
              {interests.map((tag, i) => (
                <View key={i} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Menu */}
        <View style={s.menuSection}>
          <Text style={s.sectionLabel}>Account</Text>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={s.menuItem}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View
                style={[s.menuIcon, { backgroundColor: `${item.color}18` }]}
              >
                <Ionicons name={item.icon} size={17} color={item.color} />
              </View>
              <Text style={s.menuText}>{item.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={15}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium card */}
        {!premiumActive && (
          <TouchableOpacity
            onPress={() => router.push("/premium")}
            activeOpacity={0.88}
            style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }}
          >
            <LinearGradient
              colors={["rgba(124,58,237,0.22)", "rgba(99,102,241,0.18)"]}
              style={s.premiumCard}
            >
              <Ionicons name="star" size={26} color={COLORS.gold} />
              <View style={{ flex: 1 }}>
                <Text style={s.premiumCardTitle}>Upgrade to Premium</Text>
                <Text style={s.premiumCardSub}>
                  Filter matches by gender, age & state · From ₹30/mo
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity
          onPress={() => setLogoutDialog(true)}
          style={s.logoutBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={17} color={COLORS.redLight} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // ── Hero with logo bg ──────────────────────────────────────────────────────
  heroWrap: {
    paddingBottom: SPACING.xl,
    overflow: "hidden",
    position: "relative",
  },
  logoBgWrap: {
    position: "absolute",
    top: -SCREEN_W * 0.1,
    left: SCREEN_W * 0.125,
    opacity: 1,
  },
  heroContent: {
    paddingTop: 20,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
  },

  avatarWrap: { position: "relative", marginBottom: SPACING.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.bg,
  },

  username: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 4 },
  fullName: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.sm },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,158,11,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.28)",
  },
  premiumBadgeText: { fontSize: 12, color: COLORS.gold, fontWeight: "700" },
  upgradeBadge: {
    backgroundColor: COLORS.purpleBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },
  upgradeBadgeText: {
    fontSize: 12,
    color: COLORS.purplePale,
    fontWeight: "600",
  },

  // ── Stats row FIXED ────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  statItem: {
    flex: 1, // ← equal width for all 3
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: 4, // ← small horizontal padding so text doesn't touch separator
  },
  statDivider: {
    // ← vertical line between stats
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
    textAlign: "center",
  },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600" },

  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  bioText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  tag: {
    backgroundColor: COLORS.purpleBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },
  tagText: { fontSize: 12, color: COLORS.purplePale, fontWeight: "600" },

  menuSection: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1, fontSize: 14, color: "#fff", fontWeight: "500" },

  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.18)",
  },
  premiumCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gold,
    marginBottom: 3,
  },
  premiumCardSub: { fontSize: 11, color: COLORS.textMuted, lineHeight: 15 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.22)",
    backgroundColor: "rgba(239,68,68,0.07)",
  },
  logoutText: { fontSize: 15, color: COLORS.redLight, fontWeight: "700" },
});
