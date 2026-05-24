// app/(auth)/forgot-password.js — Forgot Password (exact website ForgotPassword.jsx match)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { API_BASE_URL } from "../../src/constants/api";

// ✅ Apps Script URL — sends reset link email via Gmail (same as website)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx6JXFEkyXVZzqJDF9BLQJv390-ALPf0EptygsdqUPeCawKpg-eB0oegvuBWzDfB18/exec";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Step 1: Backend generates reset token
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: email.trim(),
      });
      const resetToken = res.data?.token;

      // Step 2: Send reset link email via Apps Script (same as website)
      if (resetToken) {
        const origin = "https://zonnecto.netlify.app";
        fetch(
          `${APPS_SCRIPT_URL}?action=sendResetLink&email=${encodeURIComponent(email.trim())}&token=${encodeURIComponent(resetToken)}&origin=${encodeURIComponent(origin)}`,
          { mode: "no-cors" },
        ).catch(() => {});
      }

      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.orb1} />
      <View style={s.orb2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textMuted} />
            <Text style={s.backText}>Back to Login</Text>
          </TouchableOpacity>

          {/* Card */}
          <View style={s.card}>
            <LinearGradient
              colors={["transparent", "rgba(168,85,247,0.55)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.cardTopLine}
            />

            {!sent ? (
              <>
                {/* Icon */}
                <View style={s.iconWrap}>
                  <LinearGradient
                    colors={["rgba(139,92,246,0.18)", "rgba(6,182,212,0.12)"]}
                    style={s.iconCircle}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={28}
                      color={COLORS.purplePale}
                    />
                  </LinearGradient>
                </View>

                <Text style={s.title}>Forgot Password?</Text>
                <Text style={s.subtitle}>
                  Enter your registered email and we'll send you a password
                  reset link.
                </Text>

                {/* Error */}
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

                {/* Email input */}
                <Text style={s.label}>YOUR EMAIL</Text>
                <View style={[s.inputWrap, error && s.inputError]}>
                  <Ionicons
                    name="mail-outline"
                    size={16}
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
                    autoFocus
                  />
                </View>

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={s.btnWrap}
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
                    style={s.btn}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={s.btnText}>Send Reset Link →</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              /* Success state */
              <View style={s.successWrap}>
                <LinearGradient
                  colors={["rgba(74,222,128,0.12)", "rgba(74,222,128,0.04)"]}
                  style={s.successIcon}
                >
                  <Ionicons name="checkmark" size={32} color={COLORS.green} />
                </LinearGradient>

                <Text style={s.title}>Check your inbox!</Text>
                <Text style={s.subtitle}>
                  We've sent a password reset link to{"\n"}
                  <Text style={{ color: COLORS.purplePale, fontWeight: "700" }}>
                    {email}
                  </Text>
                </Text>

                <View style={s.noteBox}>
                  <Text style={s.noteText}>
                    The link expires in 15 minutes. Check your spam folder if
                    you don't see it.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                  style={{ marginTop: SPACING.lg }}
                >
                  <Text style={s.backLinkText}>← Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}
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
    backgroundColor: "rgba(124,58,237,0.1)",
    top: -80,
    left: -80,
  },
  orb2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(6,182,212,0.07)",
    bottom: 80,
    right: -60,
  },
  scroll: { paddingHorizontal: SPACING.lg },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  backText: { fontSize: 14, color: COLORS.textMuted },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    position: "relative",
    overflow: "hidden",
  },
  cardTopLine: {
    position: "absolute",
    top: 0,
    left: "8%",
    right: "8%",
    height: 1,
  },

  iconWrap: { alignItems: "center", marginBottom: SPACING.lg },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.xl,
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

  label: {
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
  inputError: { borderColor: COLORS.redBorder },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 14 },

  btnWrap: { borderRadius: RADIUS.md, overflow: "hidden" },
  btn: { paddingVertical: 15, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Success
  successWrap: { alignItems: "center" },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
  },
  noteBox: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    width: "100%",
  },
  noteText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  backLinkText: { color: COLORS.purplePale, fontSize: 14, fontWeight: "600" },
});
