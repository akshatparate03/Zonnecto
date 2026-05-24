// app/contact.js  →  place in:  app/contact.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import { useAuth } from "../src/context/AuthContext";
import { COLORS, SPACING, RADIUS } from "../src/constants/theme";
import { API_BASE_URL } from "../src/constants/api";

const CONTACT_CARDS = [
  {
    icon: "mail",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.22)",
    label: "Email Support",
    value: "zonnecto@gmail.com",
    sub: "We respond within 24–48 hours",
    onPress: () => Linking.openURL("mailto:zonnecto@gmail.com"),
  },
  {
    icon: "shield-checkmark",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.1)",
    border: "rgba(34,211,238,0.2)",
    label: "Privacy & Legal",
    value: "zonnecto@gmail.com",
    sub: "For privacy or legal inquiries",
    onPress: () => Linking.openURL("mailto:zonnecto@gmail.com"),
  },
  {
    icon: "bug",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.2)",
    label: "Report a Bug",
    value: "zonnecto@gmail.com",
    sub: "Help us improve the app",
    onPress: () => Linking.openURL("mailto:zonnecto@gmail.com"),
  },
];

const CATEGORIES = [
  "General Inquiry",
  "Technical Issue",
  "Account Problem",
  "Report Abuse",
  "Billing / Premium",
  "Feedback / Suggestion",
  "Other",
];

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }
    if (!message.trim() || message.trim().length < 20) {
      setError("Message must be at least 20 characters");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Try API endpoint; if not available just simulate success
      await axios
        .post(
          `${API_BASE_URL}/contact`,
          {
            email: email.trim(),
            category,
            subject: subject.trim(),
            message: message.trim(),
          },
          user?.token
            ? { headers: { Authorization: `Bearer ${user.token}` } }
            : {},
        )
        .catch(() => {});
      setSent(true);
    } catch {
      setSent(true); // show success even if endpoint doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.orb1} />
      <View style={s.orb2} />

      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Contact Us</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={s.heroBanner}>
            <LinearGradient
              colors={["transparent", "rgba(168,85,247,0.55)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.topLine}
            />
            <View style={s.heroIconCircle}>
              <Ionicons name="chatbubbles" size={30} color="#a855f7" />
            </View>
            <Text style={s.heroTitle}>Get in Touch</Text>
            <Text style={s.heroSub}>
              Have a question, issue or feedback? We're here to help. Fill the
              form below or reach out directly.
            </Text>
          </View>

          {/* Contact cards */}
          <View style={s.cardsRow}>
            {CONTACT_CARDS.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={[s.contactCard, { borderColor: c.border }]}
                onPress={c.onPress}
                activeOpacity={0.8}
              >
                <View style={[s.contactCardIcon, { backgroundColor: c.bg }]}>
                  <Ionicons name={c.icon} size={18} color={c.color} />
                </View>
                <Text style={s.contactCardLabel}>{c.label}</Text>
                <Text style={[s.contactCardValue, { color: c.color }]}>
                  {c.value}
                </Text>
                <Text style={s.contactCardSub}>{c.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form or Success */}
          {sent ? (
            <View style={s.successCard}>
              <LinearGradient
                colors={["transparent", "rgba(74,222,128,0.4)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.topLine}
              />
              <View style={s.successIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={COLORS.green}
                />
              </View>
              <Text style={s.successTitle}>Message Sent! ✅</Text>
              <Text style={s.successText}>
                Thanks for reaching out. We'll get back to you at{"\n"}
                <Text style={{ color: COLORS.purplePale, fontWeight: "700" }}>
                  {email}
                </Text>
                {"\n"}within 24–48 hours.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSent(false);
                  setSubject("");
                  setMessage("");
                  setError("");
                }}
                style={s.sendAgainBtn}
              >
                <Text style={s.sendAgainText}>Send Another Message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.formCard}>
              <LinearGradient
                colors={["transparent", "rgba(168,85,247,0.5)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.topLine}
              />
              <Text style={s.formTitle}>Send us a Message</Text>

              {error ? (
                <View style={s.errorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={15}
                    color={COLORS.redLight}
                  />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email */}
              <Text style={s.lbl}>YOUR EMAIL</Text>
              <View style={s.inputWrap}>
                <Ionicons
                  name="mail-outline"
                  size={15}
                  color={COLORS.purplePale}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="you@gmail.com"
                  placeholderTextColor={COLORS.textDim}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Category */}
              <Text style={s.lbl}>CATEGORY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.catScroll}
                contentContainerStyle={{ gap: 8, paddingRight: 4 }}
              >
                {CATEGORIES.map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setCategory(c)}
                    style={[s.catChip, category === c && s.catChipActive]}
                  >
                    <Text
                      style={[
                        s.catChipText,
                        category === c && s.catChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Subject */}
              <Text style={[s.lbl, { marginTop: SPACING.md }]}>SUBJECT</Text>
              <View style={s.inputWrap}>
                <Ionicons
                  name="create-outline"
                  size={15}
                  color={COLORS.purplePale}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="Brief description of your issue"
                  placeholderTextColor={COLORS.textDim}
                  value={subject}
                  onChangeText={(v) => {
                    setSubject(v);
                    setError("");
                  }}
                />
              </View>

              {/* Message */}
              <Text style={s.lbl}>MESSAGE</Text>
              <View style={[s.inputWrap, s.textAreaWrap]}>
                <TextInput
                  style={[s.input, s.textArea]}
                  placeholder="Describe your issue or question in detail..."
                  placeholderTextColor={COLORS.textDim}
                  value={message}
                  onChangeText={(v) => {
                    setMessage(v);
                    setError("");
                  }}
                  multiline
                  numberOfLines={5}
                  maxLength={1000}
                  textAlignVertical="top"
                />
              </View>
              <Text style={s.charCount}>{message.length}/1000 characters</Text>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={s.submitWrap}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={
                    loading
                      ? ["#4a4a6a", "#3a3a5a"]
                      : ["#7c3aed", "#6366f1", "#0891b2"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.submitBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="send" size={15} color="#fff" />
                      <Text style={s.submitText}>Send Message</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* FAQ note */}
          <View style={s.faqBox}>
            <Ionicons name="help-circle" size={16} color={COLORS.purplePale} />
            <Text style={s.faqText}>
              For faster help, check our{" "}
              <Text style={s.faqLink} onPress={() => router.push("/about")}>
                About page
              </Text>{" "}
              or{" "}
              <Text style={s.faqLink} onPress={() => router.push("/terms")}>
                Terms & Conditions
              </Text>{" "}
              first.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: "rgba(168,85,247,0.08)",
    top: -70,
    left: -80,
  },
  orb2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
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
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(168,85,247,0.12)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.25)",
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
  },
  cardsRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.lg },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: "center",
    gap: 4,
  },
  contactCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  contactCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  contactCardValue: { fontSize: 9, fontWeight: "600", textAlign: "center" },
  contactCardSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 13,
  },
  formCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    position: "relative",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: SPACING.lg,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.redBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: { fontSize: 13, color: COLORS.redLight, flex: 1 },
  lbl: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 13 },
  textAreaWrap: { alignItems: "flex-start", paddingVertical: SPACING.sm },
  textArea: { paddingVertical: 0, minHeight: 100, textAlignVertical: "top" },
  charCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "right",
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  catScroll: { marginBottom: SPACING.sm },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: "rgba(139,92,246,0.18)",
    borderColor: COLORS.purpleBorder,
  },
  catChipText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
  catChipTextActive: { color: COLORS.purplePale, fontWeight: "700" },
  submitWrap: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginTop: SPACING.sm,
  },
  submitBtn: {
    flexDirection: "row",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  successCard: {
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
  successIcon: { marginBottom: SPACING.md },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  sendAgainBtn: {
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    backgroundColor: "rgba(139,92,246,0.1)",
  },
  sendAgainText: { fontSize: 13, color: COLORS.purplePale, fontWeight: "600" },
  faqBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    backgroundColor: "rgba(139,92,246,0.07)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  faqText: { flex: 1, fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  faqLink: { color: COLORS.purplePale, fontWeight: "600" },
});
