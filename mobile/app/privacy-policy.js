// app/privacy-policy.js  →  place in:  app/privacy-policy.js
import React, { useState } from "react";
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

const SECTIONS = [
  {
    icon: "server",
    color: "#a855f7",
    title: "Information We Collect",
    items: [
      {
        label: "Account Data",
        desc: "Username, email address and hashed password",
      },
      {
        label: "Profile Data",
        desc: "Age, gender, state, bio and interests you choose to share",
      },
      {
        label: "Chat Logs",
        desc: "Messages stored for safety monitoring and abuse prevention",
      },
      {
        label: "Usage Data",
        desc: "App interactions, session duration and feature usage patterns",
      },
      {
        label: "Device Info",
        desc: "Device type, OS version and app version for compatibility",
      },
    ],
  },
  {
    icon: "eye",
    color: "#22d3ee",
    title: "How We Use Your Data",
    items: [
      {
        label: "Matching",
        desc: "To connect you with relevant chat partners based on your filters",
      },
      {
        label: "Safety",
        desc: "To detect and prevent abuse, harassment and policy violations",
      },
      {
        label: "Improvement",
        desc: "To analyze usage patterns and improve our features",
      },
      {
        label: "Communication",
        desc: "To send important service updates and account notifications",
      },
      {
        label: "Legal",
        desc: "To comply with applicable laws and law enforcement requests",
      },
    ],
  },
  {
    icon: "share-social",
    color: "#4ade80",
    title: "Data Sharing",
    items: [
      {
        label: "Third Parties",
        desc: "We do not sell your personal data to advertisers or data brokers",
      },
      {
        label: "Service Providers",
        desc: "Limited sharing with hosting and payment providers under strict agreements",
      },
      {
        label: "Law Enforcement",
        desc: "We may share data when legally required by a valid court order",
      },
      {
        label: "Business Transfer",
        desc: "Data may transfer in case of merger or acquisition with prior notice",
      },
    ],
  },
  {
    icon: "shield-checkmark",
    color: "#38bdf8",
    title: "Data Security",
    items: [
      {
        label: "Encryption",
        desc: "All data transmitted is encrypted using industry-standard TLS/SSL",
      },
      {
        label: "Passwords",
        desc: "Passwords are hashed and salted — never stored in plain text",
      },
      {
        label: "Access Control",
        desc: "Strict internal controls limit who can access your data",
      },
      {
        label: "Monitoring",
        desc: "Regular security audits and vulnerability assessments",
      },
    ],
  },
  {
    icon: "person-circle",
    color: "#f59e0b",
    title: "Your Rights",
    items: [
      {
        label: "Access",
        desc: "Request a copy of the personal data we hold about you",
      },
      {
        label: "Correction",
        desc: "Update or correct inaccurate information in your profile",
      },
      {
        label: "Deletion",
        desc: "Request deletion of your account and associated data",
      },
      {
        label: "Portability",
        desc: "Export your data in a machine-readable format",
      },
      {
        label: "Opt-out",
        desc: "Opt out of non-essential communications at any time",
      },
    ],
  },
  {
    icon: "time",
    color: "#818cf8",
    title: "Data Retention",
    items: [
      {
        label: "Active Accounts",
        desc: "Data retained while your account is active",
      },
      {
        label: "Deleted Accounts",
        desc: "Most data deleted within 30 days of account deletion",
      },
      {
        label: "Legal Holds",
        desc: "Some data may be retained longer if required by law",
      },
      {
        label: "Backups",
        desc: "Backup copies may persist up to 90 days after deletion",
      },
    ],
  },
];

function SectionCard({ section }) {
  const [open, setOpen] = useState(true);
  return (
    <View style={s.secCard}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        style={s.secHeader}
        activeOpacity={0.8}
      >
        <View style={[s.secIcon, { backgroundColor: `${section.color}15` }]}>
          <Ionicons name={section.icon} size={15} color={section.color} />
        </View>
        <Text style={s.secTitle}>{section.title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={15}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>
      {open && (
        <View style={s.secBody}>
          {section.items.map((item, i) => (
            <View key={i} style={s.dataRow}>
              <View style={s.dataDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.dataLabel}>{item.label}</Text>
                <Text style={s.dataDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function PrivacyPolicyScreen() {
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
        <Text style={s.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.heroBanner}>
          <LinearGradient
            colors={["transparent", "rgba(34,211,238,0.55)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.topLine}
          />
          <View style={s.heroIconCircle}>
            <Ionicons name="shield-checkmark" size={32} color="#22d3ee" />
          </View>
          <Text style={s.heroTitle}>Privacy Policy</Text>
          <Text style={s.heroSub}>
            Your privacy matters to us. This policy explains what data we
            collect, how we use it, and your rights over it.
          </Text>
          <View style={s.updatedRow}>
            <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
            <Text style={s.updatedText}>Last updated: January 2025</Text>
          </View>
        </View>

        {/* Commitment */}
        <LinearGradient
          colors={["rgba(34,211,238,0.08)", "rgba(6,182,212,0.04)"]}
          style={s.commitBox}
        >
          <Ionicons name="lock-closed" size={18} color="#22d3ee" />
          <Text style={s.commitText}>
            <Text style={{ color: "#22d3ee", fontWeight: "700" }}>
              Our Promise:{" "}
            </Text>
            We never sell your personal data. We collect only what's necessary
            to provide a safe, quality experience.
          </Text>
        </LinearGradient>

        {/* Sections */}
        {SECTIONS.map((sec, i) => (
          <SectionCard key={i} section={sec} />
        ))}

        {/* Cookies */}
        <View style={s.cookieBox}>
          <View style={s.cookieHead}>
            <Ionicons name="browsers" size={16} color="#fb923c" />
            <Text style={s.cookieTitle}>Cookies & Local Storage</Text>
          </View>
          <Text style={s.cookieText}>
            Zonnecto uses minimal local storage only for session management and
            authentication tokens. We do not use advertising tracking, cross-app
            tracking or third-party analytics cookies.
          </Text>
        </View>

        {/* Contact */}
        <View style={s.contactBox}>
          <Text style={s.contactTitle}>Privacy Questions?</Text>
          <Text style={s.contactText}>
            Contact our Data Protection Officer at{" "}
            <Text
              style={s.contactLink}
              onPress={() => Linking.openURL("mailto:zonnecto@gmail.com")}
            >
              zonnecto@gmail.com
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(34,211,238,0.07)",
    top: -80,
    right: -60,
  },
  orb2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(124,58,237,0.07)",
    bottom: 100,
    left: -60,
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
  heroBanner: {
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
  heroIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "rgba(34,211,238,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: SPACING.sm,
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  updatedRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  updatedText: { fontSize: 12, color: COLORS.textMuted },
  commitBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.2)",
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  commitText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  secCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  secHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  secIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#fff" },
  secBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  dataRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm },
  dataDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.purplePale,
    marginTop: 6,
  },
  dataLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  dataDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },
  cookieBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  cookieHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cookieTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  cookieText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  contactBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: SPACING.sm,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  contactLink: { color: COLORS.purplePale, fontWeight: "600" },
});
