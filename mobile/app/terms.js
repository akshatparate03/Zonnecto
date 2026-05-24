// app/terms.js  →  place in:  app/terms.js
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
    id: 1,
    icon: "checkmark-circle",
    color: "#4ade80",
    title: "Acceptance of Terms",
    content: `By accessing or using Zonnecto, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.\n\nThese terms apply to all visitors, users and others who access or use the service, including registered and unregistered users.`,
  },
  {
    id: 2,
    icon: "person",
    color: "#a855f7",
    title: "User Eligibility",
    content: `You must be at least 18 years old to use Zonnecto. By using this service, you confirm that you are 18 years of age or older.\n\nIf we suspect or discover that you are under 18, we reserve the right to immediately terminate your account without notice or refund.`,
  },
  {
    id: 3,
    icon: "chatbubbles",
    color: "#38bdf8",
    title: "Acceptable Use",
    content: `You agree NOT to use Zonnecto to:\n\n• Share explicit, pornographic or adult content\n• Harass, bully or threaten other users\n• Share personal information of others without consent\n• Engage in spam, phishing or fraudulent activity\n• Share links to external websites (strictly prohibited)\n• Impersonate any person or entity\n• Violate any applicable local, national or international law`,
  },
  {
    id: 4,
    icon: "shield",
    color: "#22d3ee",
    title: "Privacy & Anonymity",
    content: `Zonnecto is designed to protect your anonymity. However:\n\n• Do not share your real name, phone number or address in chats\n• We log chat sessions for safety and abuse prevention\n• Reported chats may be reviewed by our moderation team\n• We cooperate with law enforcement when legally required to do so`,
  },
  {
    id: 5,
    icon: "star",
    color: "#f59e0b",
    title: "Premium Subscription",
    content: `By purchasing a premium plan, you agree to:\n\n• Payments are non-refundable once activated\n• Subscriptions auto-renew unless cancelled before the renewal date\n• Features are subject to change with prior notice\n• Refunds are not provided for partially used subscription periods\n• We reserve the right to modify pricing with 30 days notice`,
  },
  {
    id: 6,
    icon: "warning",
    color: "#fb923c",
    title: "Content & Moderation",
    content: `Zonnecto reserves the right to:\n\n• Remove any content that violates these terms\n• Suspend or permanently ban accounts for violations\n• Monitor chat activity for safety and abuse prevention\n• Report illegal content to appropriate authorities\n\nRepeated violations will result in permanent account termination without refund.`,
  },
  {
    id: 7,
    icon: "alert-circle",
    color: "#ef4444",
    title: "Limitation of Liability",
    content: `Zonnecto is provided "as is" without any warranties. We are not liable for:\n\n• Content shared between users\n• Any harm arising from interactions on the platform\n• Technical issues, downtime or data loss\n• Actions taken by users in violation of these terms\n\nYour use of Zonnecto is entirely at your own risk.`,
  },
  {
    id: 8,
    icon: "refresh-circle",
    color: "#818cf8",
    title: "Changes to Terms",
    content: `We reserve the right to modify these terms at any time. We will notify users of significant changes through the app or by email. Continued use of Zonnecto after changes constitutes your acceptance of the new terms.\n\nLast updated: January 2025`,
  },
];

function AccordionItem({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.accItem}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        style={s.accHeader}
        activeOpacity={0.8}
      >
        <View style={[s.accIcon, { backgroundColor: `${section.color}18` }]}>
          <Ionicons name={section.icon} size={15} color={section.color} />
        </View>
        <Text style={s.accNum}>{section.id}.</Text>
        <Text style={s.accTitle} numberOfLines={1}>
          {section.title}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={15}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>
      {open && (
        <View style={s.accBody}>
          <Text style={s.accText}>{section.content}</Text>
        </View>
      )}
    </View>
  );
}

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={s.container}>
      <View style={s.orb1} />

      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Terms & Conditions</Text>
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
            colors={["transparent", "rgba(129,140,248,0.55)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.topLine}
          />
          <View style={s.heroIcon}>
            <LinearGradient
              colors={["rgba(129,140,248,0.2)", "rgba(99,102,241,0.1)"]}
              style={s.heroIconGrad}
            >
              <Ionicons name="document-text" size={30} color="#818cf8" />
            </LinearGradient>
          </View>
          <Text style={s.heroTitle}>Terms & Conditions</Text>
          <Text style={s.heroSub}>
            Please read these terms carefully before using Zonnecto. By using
            our platform, you agree to be bound by these terms.
          </Text>
          <View style={s.updatedRow}>
            <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
            <Text style={s.updatedText}>Last updated: June 2026</Text>
          </View>
        </View>

        {/* Notice */}
        <View style={s.noticeBox}>
          <Ionicons
            name="information-circle"
            size={18}
            color={COLORS.purplePale}
          />
          <Text style={s.noticeText}>
            Tap each section to expand and read the full details.
          </Text>
        </View>

        {/* Accordion */}
        <View style={s.accWrap}>
          {SECTIONS.map((sec) => (
            <AccordionItem key={sec.id} section={sec} />
          ))}
        </View>

        {/* Contact footer */}
        <View style={s.contactBox}>
          <Text style={s.contactTitle}>Questions about our terms?</Text>
          <Text style={s.contactText}>
            Contact us at{" "}
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(129,140,248,0.08)",
    top: -80,
    right: -80,
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
  heroIcon: { marginBottom: SPACING.md },
  heroIconGrad: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(129,140,248,0.25)",
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
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    backgroundColor: "rgba(139,92,246,0.08)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  accWrap: { gap: SPACING.sm, marginBottom: SPACING.lg },
  accItem: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  accHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  accIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  accNum: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted },
  accTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: "#fff" },
  accBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  accText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 22 },
  contactBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: "center",
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
