// app/about.js  →  place in:  app/about.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS } from "../src/constants/theme";

const FEATURES = [
  {
    icon: "flash",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.2)",
    title: "Instant Matching",
    desc: "Get matched with a random stranger in seconds — no swiping, no waiting.",
  },
  {
    icon: "shield-checkmark",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.1)",
    border: "rgba(34,211,238,0.18)",
    title: "Anonymous by Default",
    desc: "Your identity is always protected until you choose to reveal it.",
  },
  {
    icon: "people",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.18)",
    title: "Real Friendships",
    desc: "Add strangers as friends after a great conversation and keep chatting.",
  },
  {
    icon: "star",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.18)",
    title: "Premium Filters",
    desc: "Filter matches by gender, age & state for smarter connections.",
  },
  {
    icon: "flag",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.18)",
    title: "Safe Community",
    desc: "Report or block anyone instantly. Our team keeps the platform safe.",
  },
  {
    icon: "globe",
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.1)",
    border: "rgba(56,189,248,0.18)",
    title: "Made for India",
    desc: "Built specifically for Indian users with regional filters.",
  },
];
const STATS = [
  { value: "10K+", label: "Users" },
  { value: "50K+", label: "Chats" },
  { value: "4.8★", label: "Rating" },
];

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={s.container}>
      <View style={s.orb1} />
      <View style={s.orb2} />

      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>About Zonnecto</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ── */}
        <View style={s.heroCard}>
          <LinearGradient
            colors={["transparent", "rgba(168,85,247,0.55)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.topLine}
          />
          <LinearGradient
            colors={["#7c3aed", "#6366f1", "#0891b2"]}
            style={s.logoCircle}
          >
            <Text style={s.logoSym}>∞</Text>
          </LinearGradient>
          <Text style={s.heroTitle}>Zonnecto</Text>
          <Text style={s.heroVersion}>Version 1.0.0</Text>
          <View style={s.heroDivider} />
          <Text style={s.heroTagline}>
            Connect Anonymously. Make Real Friends.
          </Text>
          <Text style={s.heroDesc}>
            Zonnecto is India's anonymous random chat platform where you can
            meet new people, have genuine conversations, and build real
            friendships — all while staying completely anonymous.
          </Text>
          <View style={s.statsRow}>
            {STATS.map((st, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={s.statSep} />}
                <View style={s.statItem}>
                  <Text style={s.statVal}>{st.value}</Text>
                  <Text style={s.statLbl}>{st.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Mission ── */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <View
              style={[
                s.cardIcon,
                {
                  backgroundColor: "rgba(124,58,237,0.12)",
                  borderColor: "rgba(124,58,237,0.22)",
                },
              ]}
            >
              <Ionicons name="heart" size={17} color="#a855f7" />
            </View>
            <Text style={s.cardTitle}>Our Mission</Text>
          </View>
          <Text style={s.cardText}>
            In today's world it's hard to make genuine connections. Social media
            is curated, relationships are transactional. Zonnecto brings back
            the joy of talking to a complete stranger — no judgements, no
            history, just two people having a real conversation.{"\n\n"}We
            believe everyone deserves a safe space to talk, laugh, vent, and
            connect. That's what we're building — one chat at a time.
          </Text>
        </View>

        {/* ── Features ── */}
        <Text style={s.secHeading}>What makes us different</Text>
        {FEATURES.map((f, i) => (
          <View key={i} style={s.featureRow}>
            <View
              style={[
                s.featureIcon,
                { backgroundColor: f.bg, borderColor: f.border },
              ]}
            >
              <Ionicons name={f.icon} size={20} color={f.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>{f.title}</Text>
              <Text style={s.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}

        {/* ── Team ── */}
        <View style={[s.card, { marginTop: SPACING.md }]}>
          <View style={s.cardHead}>
            <View
              style={[
                s.cardIcon,
                {
                  backgroundColor: "rgba(74,222,128,0.1)",
                  borderColor: "rgba(74,222,128,0.18)",
                },
              ]}
            >
              <Ionicons name="code-slash" size={17} color="#4ade80" />
            </View>
            <Text style={s.cardTitle}>Built with ❤️ in India</Text>
          </View>
          <Text style={s.cardText}>
            Zonnecto is a passion project built by a small team of developers
            who believe in the power of human connection. We're constantly
            improving the app based on your feedback.{"\n\n"}
            Got suggestions? Reach out at{" "}
            <Text
              style={s.link}
              onPress={() => Linking.openURL("mailto:zonnecto@gmail.com")}
            >
              zonnecto@gmail.com
            </Text>
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footerLinks}>
          {[
            { l: "Privacy Policy", r: "/privacy-policy" },
            { l: "Terms", r: "/terms" },
            { l: "Contact", r: "/contact" },
            { l: "Disclaimer", r: "/disclaimer" },
          ].map((x, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text style={s.dot}>·</Text>}
              <TouchableOpacity onPress={() => router.push(x.r)}>
                <Text style={s.footLink}>{x.l}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
        <Text style={s.copy}>© 2026 Zonnecto. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(124,58,237,0.09)",
    top: -80,
    left: -80,
  },
  orb2: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(6,182,212,0.07)",
    bottom: 100,
    right: -60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(7,7,16,0.95)",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  heroCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.lg,
    overflow: "hidden",
    position: "relative",
  },
  topLine: { position: "absolute", top: 0, left: "5%", right: "5%", height: 1 },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  logoSym: { fontSize: 36, color: "#fff", fontWeight: "900" },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  heroVersion: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
    marginBottom: SPACING.sm,
  },
  heroDivider: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(139,92,246,0.4)",
    borderRadius: 1,
    marginBottom: SPACING.sm,
  },
  heroTagline: {
    fontSize: 14,
    color: COLORS.purplePale,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  heroDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: SPACING.md },
  statSep: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  statVal: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 2 },
  statLbl: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600" },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  cardText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 22 },
  link: { color: COLORS.purplePale, fontWeight: "600" },
  secHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  featureDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  footLink: { fontSize: 12, color: COLORS.purplePale, fontWeight: "600" },
  dot: { fontSize: 12, color: COLORS.textMuted },
  copy: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
});
