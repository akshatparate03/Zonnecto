// app/(auth)/register.js — Register Screen (exact website Register.jsx match)
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
import { useAuth } from "../../src/context/AuthContext";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { API_BASE_URL } from "../../src/constants/api";
import Toast from "react-native-toast-message";

const STEPS = ["Verify Email", "Account Setup", "Profile"];
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,20}$/;

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Step 2
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Step 3
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Step 1 ────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Enter a valid email" });
      return;
    }
    setSendingOtp(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        email: email.trim(),
      });
      setOtpSent(true);
      Toast.show({
        type: "success",
        text1: "OTP Sent!",
        text2: `OTP: ${res.data.otp}`,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.error || "Failed to send OTP",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setErrors({ otp: "Enter 6-digit OTP" });
      return;
    }
    setVerifyingOtp(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email: email.trim(),
        otp: otp.trim(),
      });
      setOtpVerified(true);
      setErrors({});
      setTimeout(() => setStep(2), 400);
    } catch (err) {
      setErrors({ otp: err.response?.data?.error || "Invalid OTP" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const handleStep2 = async () => {
    const e = {};
    if (!username.trim() || username.length < 3)
      e.username = "At least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      e.username = "Only letters, numbers, underscores";
    if (!PW_REGEX.test(password))
      e.password = "8-20 chars, upper, lower, digit, special";
    if (password !== confirmPw) e.confirmPw = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/auth/check-username?username=${username.trim()}`,
      );
      if (!res.data.available) {
        setErrors({ username: "Username already taken" });
        return;
      }
    } catch {}
    setStep(3);
  };

  // ── Step 3 ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!age.trim()) e.age = "Age is required";
    else if (isNaN(age) || Number(age) < 18 || Number(age) > 99)
      e.age = "Must be 18-99";
    if (!gender) e.gender = "Please select gender";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const data = await register(email.trim(), password, username.trim());
      await axios.post(
        `${API_BASE_URL}/user/update-profile-at-registration`,
        {
          fullName: fullName.trim(),
          age: age.trim(),
          gender,
        },
        { headers: { Authorization: `Bearer ${data.token}` } },
      );
      router.replace("/(tabs)");
      Toast.show({ type: "success", text1: "Welcome to Zonnecto! 🎉" });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.error || "Registration failed",
      });
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
          <TouchableOpacity
            onPress={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
            style={s.backBtn}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.textMuted} />
            <Text style={s.backText}>{step > 1 ? "Back" : "Home"}</Text>
          </TouchableOpacity>

          {/* Progress steps */}
          <View style={s.stepsRow}>
            {STEPS.map((st, i) => (
              <View key={i} style={s.stepItem}>
                <View
                  style={[
                    s.stepDot,
                    step > i + 1 && s.stepDone,
                    step === i + 1 && s.stepActive,
                  ]}
                >
                  {step > i + 1 ? (
                    <Ionicons name="checkmark" size={13} color={COLORS.green} />
                  ) : (
                    <Text
                      style={[s.stepNum, step === i + 1 && { color: "#fff" }]}
                    >
                      {i + 1}
                    </Text>
                  )}
                </View>
                {i < 2 && (
                  <View style={[s.stepLine, step > i + 1 && s.stepLineDone]} />
                )}
              </View>
            ))}
          </View>
          <Text style={s.stepTitle}>{STEPS[step - 1]}</Text>

          {/* Card */}
          <View style={s.card}>
            <LinearGradient
              colors={["transparent", "rgba(168,85,247,0.55)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.cardTopLine}
            />

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <View>
                <Text style={s.label}>EMAIL ADDRESS</Text>
                <View style={[s.inputWrap, errors.email && s.inputError]}>
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
                      setErrors({});
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!otpSent}
                  />
                </View>
                {errors.email ? (
                  <Text style={s.errText}>{errors.email}</Text>
                ) : null}

                {!otpSent ? (
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={sendingOtp}
                    style={s.btnWrap}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={["#7c3aed", "#6366f1", "#0891b2"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={s.btn}
                    >
                      {sendingOtp ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={s.btnText}>Send OTP →</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <>
                    <Text style={[s.label, { marginTop: SPACING.md }]}>
                      ENTER OTP
                    </Text>
                    <View style={[s.inputWrap, errors.otp && s.inputError]}>
                      <Ionicons
                        name="key-outline"
                        size={16}
                        color={COLORS.purplePale}
                        style={s.inputIcon}
                      />
                      <TextInput
                        style={s.input}
                        placeholder="6-digit OTP"
                        placeholderTextColor={COLORS.textDim}
                        value={otp}
                        onChangeText={(v) => {
                          setOtp(v);
                          setErrors({});
                        }}
                        keyboardType="number-pad"
                      />
                    </View>
                    {errors.otp ? (
                      <Text style={s.errText}>{errors.otp}</Text>
                    ) : null}
                    {otpVerified ? (
                      <Text style={s.verifiedText}>✓ Email Verified</Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleVerifyOtp}
                        disabled={verifyingOtp}
                        style={s.btnWrap}
                        activeOpacity={0.88}
                      >
                        <LinearGradient
                          colors={["#7c3aed", "#6366f1", "#0891b2"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={s.btn}
                        >
                          {verifyingOtp ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={s.btnText}>Verify OTP</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={handleSendOtp}
                      style={{ alignItems: "center", marginTop: SPACING.md }}
                    >
                      <Text style={{ fontSize: 13, color: COLORS.purplePale }}>
                        Resend OTP
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                <View style={s.divider}>
                  <View style={s.divLine} />
                  <Text style={s.divText}>already have an account?</Text>
                  <View style={s.divLine} />
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                  style={{ alignItems: "center" }}
                >
                  <Text
                    style={{
                      color: COLORS.purplePale,
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <View>
                <Text style={s.label}>USERNAME</Text>
                <View style={[s.inputWrap, errors.username && s.inputError]}>
                  <Ionicons
                    name="at-outline"
                    size={16}
                    color={COLORS.purplePale}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="akshat123"
                    placeholderTextColor={COLORS.textDim}
                    value={username}
                    onChangeText={(v) => {
                      setUsername(v);
                      setErrors({});
                    }}
                    autoCapitalize="none"
                  />
                </View>
                {errors.username ? (
                  <Text style={s.errText}>{errors.username}</Text>
                ) : null}

                <Text style={[s.label, { marginTop: SPACING.md }]}>
                  PASSWORD
                </Text>
                <View style={[s.inputWrap, errors.password && s.inputError]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={COLORS.purplePale}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="Min 8 chars"
                    placeholderTextColor={COLORS.textDim}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      setErrors({});
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

                <Text style={[s.label, { marginTop: SPACING.md }]}>
                  CONFIRM PASSWORD
                </Text>
                <View style={[s.inputWrap, errors.confirmPw && s.inputError]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={COLORS.purplePale}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="Repeat password"
                    placeholderTextColor={COLORS.textDim}
                    value={confirmPw}
                    onChangeText={(v) => {
                      setConfirmPw(v);
                      setErrors({});
                    }}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                  />
                </View>
                {errors.confirmPw ? (
                  <Text style={s.errText}>{errors.confirmPw}</Text>
                ) : null}

                <Text style={s.pwHint}>
                  8-20 chars with uppercase, lowercase, digit & special
                  character
                </Text>

                <TouchableOpacity
                  onPress={handleStep2}
                  style={s.btnWrap}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={["#7c3aed", "#6366f1", "#0891b2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.btn}
                  >
                    <Text style={s.btnText}>Continue →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <View>
                <Text style={s.label}>FULL NAME</Text>
                <View style={[s.inputWrap, errors.fullName && s.inputError]}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={COLORS.purplePale}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="Akshat Parate"
                    placeholderTextColor={COLORS.textDim}
                    value={fullName}
                    onChangeText={(v) => {
                      setFullName(v);
                      setErrors({});
                    }}
                    autoCapitalize="words"
                  />
                </View>
                {errors.fullName ? (
                  <Text style={s.errText}>{errors.fullName}</Text>
                ) : null}

                <Text style={[s.label, { marginTop: SPACING.md }]}>AGE</Text>
                <View style={[s.inputWrap, errors.age && s.inputError]}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={COLORS.purplePale}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="21"
                    placeholderTextColor={COLORS.textDim}
                    value={age}
                    onChangeText={(v) => {
                      setAge(v);
                      setErrors({});
                    }}
                    keyboardType="number-pad"
                  />
                </View>
                {errors.age ? (
                  <Text style={s.errText}>{errors.age}</Text>
                ) : null}

                <Text style={[s.label, { marginTop: SPACING.md }]}>GENDER</Text>
                <View style={s.genderRow}>
                  {["Male", "Female", "Other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => {
                        setGender(g);
                        setErrors({});
                      }}
                      style={[s.genderBtn, gender === g && s.genderBtnActive]}
                    >
                      <Text
                        style={[
                          s.genderBtnText,
                          gender === g && s.genderBtnTextActive,
                        ]}
                      >
                        {g === "Male"
                          ? "♂ Male"
                          : g === "Female"
                            ? "♀ Female"
                            : "⚧ Other"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.gender ? (
                  <Text style={s.errText}>{errors.gender}</Text>
                ) : null}

                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}
                  style={[s.btnWrap, { marginTop: SPACING.lg }]}
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
                      <Text style={s.btnText}>Create Account 🎉</Text>
                    )}
                  </LinearGradient>
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
    right: -60,
  },
  orb2: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(6,182,212,0.07)",
    bottom: 80,
    left: -80,
  },
  scroll: { paddingHorizontal: SPACING.lg },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  backText: { fontSize: 14, color: COLORS.textMuted },

  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purpleLight,
  },
  stepDone: {
    backgroundColor: "rgba(74,222,128,0.15)",
    borderColor: "rgba(74,222,128,0.35)",
  },
  stepNum: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted },
  stepLine: { width: 44, height: 1, backgroundColor: COLORS.border },
  stepLineDone: { backgroundColor: "rgba(74,222,128,0.4)" },
  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: SPACING.xl,
  },

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
  inputError: { borderColor: COLORS.redBorder },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  errText: { fontSize: 12, color: COLORS.redLight, marginBottom: 4 },

  verifiedText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    padding: SPACING.md,
  },

  pwHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 17,
  },

  genderRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: 4 },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgInput,
    alignItems: "center",
  },
  genderBtnActive: {
    borderColor: COLORS.purpleBorder,
    backgroundColor: COLORS.purpleBg,
  },
  genderBtnText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "600" },
  genderBtnTextActive: { color: COLORS.purplePale },

  btnWrap: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginTop: SPACING.sm,
  },
  btn: { paddingVertical: 15, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginVertical: SPACING.lg,
  },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { fontSize: 12, color: COLORS.textMuted },
});
