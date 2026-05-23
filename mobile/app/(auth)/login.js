// app/(auth)/login.js — Login Screen (exact website Login.jsx match)
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
import { useAuth } from "../../src/context/AuthContext";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } catch (err) {
      const msg =
        err.response?.data?.error || "Login failed. Please try again.";
      Toast.show({ type: "error", text1: "Login Failed", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      {/* Orbs */}
      <View style={s.orb1} />
      <View style={s.orb2} />
      {/* Grid */}
      <View style={s.grid} />

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
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={s.logoWrap}>
            <LinearGradient
              colors={["rgba(139,92,246,0.18)", "rgba(6,182,212,0.12)"]}
              style={s.logoCircle}
            >
              <Text style={s.logoIcon}>∞</Text>
            </LinearGradient>
            <Text style={s.brand}>Zonnecto</Text>
            <Text style={s.tagline}>Sign in to your account</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            {/* Top shimmer line */}
            <LinearGradient
              colors={[
                "transparent",
                "rgba(168,85,247,0.65)",
                "rgba(6,182,212,0.5)",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.cardTopLine}
            />

            {/* Email */}
            <Text style={s.label}>EMAIL</Text>
            <View
              style={[
                s.inputWrap,
                errors.email && s.inputError,
                email && !errors.email && s.inputFocused,
              ]}
            >
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
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {errors.email ? (
              <Text style={s.errText}>{errors.email}</Text>
            ) : null}

            {/* Password */}
            <Text style={[s.label, { marginTop: SPACING.md }]}>PASSWORD</Text>
            <View
              style={[
                s.inputWrap,
                errors.password && s.inputError,
                password && !errors.password && s.inputFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={COLORS.purplePale}
                style={s.inputIcon}
              />
              <TextInput
                style={s.input}
                placeholder="Your password"
                placeholderTextColor={COLORS.textDim}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrors((p) => ({ ...p, password: "" }));
                }}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPass((v) => !v)}
                style={s.eyeBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={s.errText}>{errors.password}</Text>
            ) : null}

            {/* Forgot */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              style={s.forgotWrap}
            >
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleLogin}
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
                  <Text style={s.submitText}>Sign In →</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Register link */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              style={{ alignItems: "center" }}
              activeOpacity={0.7}
            >
              <Text style={s.registerText}>
                Don't have an account?{" "}
                <Text style={s.registerLink}>Register</Text>
              </Text>
            </TouchableOpacity>
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
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(124,58,237,0.11)",
    top: -100,
    left: -80,
  },
  orb2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(6,182,212,0.08)",
    bottom: 50,
    right: -80,
  },
  grid: { position: "absolute", inset: 0 },
  scroll: { paddingHorizontal: SPACING.lg },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  backText: { fontSize: 14, color: COLORS.textMuted },

  logoWrap: { alignItems: "center", marginBottom: SPACING.xxl },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },
  logoIcon: { fontSize: 30, color: COLORS.purplePale },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: { fontSize: 13, color: COLORS.textMuted },

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
    marginBottom: 4,
  },
  inputFocused: {
    borderColor: COLORS.purpleBorder,
    backgroundColor: "rgba(139,92,246,0.07)",
  },
  inputError: { borderColor: COLORS.redBorder },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  errText: { fontSize: 12, color: COLORS.redLight, marginBottom: 4 },

  forgotWrap: {
    alignItems: "flex-end",
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  forgotText: { fontSize: 13, color: COLORS.purplePale },

  submitWrap: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  submitBtn: { paddingVertical: 15, alignItems: "center" },
  submitText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginVertical: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: 13 },

  registerText: { fontSize: 14, color: COLORS.textMuted },
  registerLink: { color: COLORS.purplePale, fontWeight: "700" },
});
