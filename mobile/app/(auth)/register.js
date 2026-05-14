// app/(auth)/register.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ZnInput, ZnButton } from '../../src/components/ZnComponents';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { API_BASE_URL } from '../../src/constants/api';

// Steps: 1=Email+OTP, 2=Password+Username, 3=Profile details
const STEPS = ['Verify Email', 'Account Setup', 'Profile'];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Step 2
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Step 3
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,20}$/;

  // ── Step 1 handlers ────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Enter a valid email' }); return;
    }
    setSendingOtp(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/send-otp`, { email: email.trim() });
      // OTP returned — in production, send via email
      setOtpSent(true);
      Toast.show({ type: 'success', text1: 'OTP Sent', text2: `OTP: ${res.data.otp}` });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setErrors({ otp: 'Enter 6-digit OTP' }); return;
    }
    setVerifyingOtp(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email: email.trim(), otp: otp.trim() });
      setOtpVerified(true);
      setErrors({});
      setTimeout(() => setStep(2), 500);
    } catch (err) {
      setErrors({ otp: err.response?.data?.error || 'Invalid OTP' });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Step 2 handlers ────────────────────────────────────────────────────────
  const handleStep2 = async () => {
    const e = {};
    if (!username.trim() || username.length < 3) e.username = 'At least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = 'Only letters, numbers, underscores';
    if (!pwRegex.test(password)) e.password = '8-20 chars, upper, lower, digit, special char';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // Check username availability
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/check-username?username=${username.trim()}`);
      if (!res.data.available) { setErrors({ username: 'Username already taken' }); return; }
    } catch {}
    setStep(3);
  };

  // ── Step 3 — Final register ────────────────────────────────────────────────
  const handleRegister = async () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!age.trim()) e.age = 'Age is required';
    else if (isNaN(age) || Number(age) < 18 || Number(age) > 99) e.age = 'Must be 18-99';
    if (!gender) e.gender = 'Please select gender';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const data = await register(email.trim(), password, username.trim());
      // Update profile details
      await axios.post(`${API_BASE_URL}/user/update-profile-at-registration`, {
        fullName: fullName.trim(),
        age: age.trim(),
        gender,
      }, { headers: { Authorization: `Bearer ${data.token}` } });

      router.replace('/(tabs)');
      Toast.show({ type: 'success', text1: 'Welcome to Zonnecto! 🎉' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {step > 1 ? 'Back' : 'Home'}</Text>
          </TouchableOpacity>

          {/* Progress */}
          <View style={styles.progressWrap}>
            {STEPS.map((s, i) => (
              <View key={i} style={styles.progressItem}>
                <View style={[styles.progressDot, step > i && styles.progressDotDone, step === i + 1 && styles.progressDotActive]}>
                  {step > i + 1
                    ? <Text style={styles.progressCheck}>✓</Text>
                    : <Text style={[styles.progressNum, step === i + 1 && { color: '#fff' }]}>{i + 1}</Text>
                  }
                </View>
                {i < STEPS.length - 1 && <View style={[styles.progressLine, step > i + 1 && styles.progressLineDone]} />}
              </View>
            ))}
          </View>
          <Text style={styles.stepTitle}>{STEPS[step - 1]}</Text>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardTopLine} />

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <View>
                <ZnInput
                  label="Email Address"
                  placeholder="you@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  icon="mail-outline"
                  error={errors.email}
                  editable={!otpSent}
                />
                {!otpSent ? (
                  <ZnButton title="Send OTP →" onPress={handleSendOtp} loading={sendingOtp} />
                ) : (
                  <>
                    <ZnInput
                      label="Enter OTP"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      icon="key-outline"
                      error={errors.otp}
                    />
                    {otpVerified
                      ? <Text style={styles.verifiedText}>✓ Email Verified</Text>
                      : <ZnButton title="Verify OTP" onPress={handleVerifyOtp} loading={verifyingOtp} />
                    }
                    <TouchableOpacity onPress={handleSendOtp} style={styles.resendBtn}>
                      <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <View>
                <ZnInput
                  label="Username"
                  placeholder="akshat123"
                  value={username}
                  onChangeText={setUsername}
                  icon="at-outline"
                  error={errors.username}
                />
                <ZnInput
                  label="Password"
                  placeholder="Min 8 chars"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  icon="lock-closed-outline"
                  rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPass(v => !v)}
                  error={errors.password}
                />
                <ZnInput
                  label="Confirm Password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPass}
                  icon="lock-closed-outline"
                  error={errors.confirmPassword}
                />
                <Text style={styles.pwHint}>8-20 chars with uppercase, lowercase, digit & special character</Text>
                <ZnButton title="Continue →" onPress={handleStep2} />
              </View>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <View>
                <ZnInput
                  label="Full Name"
                  placeholder="Akshat Parate"
                  value={fullName}
                  onChangeText={setFullName}
                  icon="person-outline"
                  autoCapitalize="words"
                  error={errors.fullName}
                />
                <ZnInput
                  label="Age"
                  placeholder="21"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  icon="calendar-outline"
                  error={errors.age}
                />
                <Text style={styles.genderLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    >
                      <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>
                        {g === 'Male' ? '♂ ' : g === 'Female' ? '♀ ' : '⚧ '}{g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                <ZnButton title="Create Account 🎉" onPress={handleRegister} loading={loading} style={{ marginTop: SPACING.lg }} />
              </View>
            )}

            {step === 1 && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>already have an account?</Text>
                  <View style={styles.dividerLine} />
                </View>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ alignItems: 'center' }}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(124,58,237,0.1)', top: -80, right: -60 },
  orb2: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(6,182,212,0.07)', bottom: 80, left: -80 },
  scroll: { padding: SPACING.lg, paddingBottom: 60 },
  backBtn: { marginTop: 50, marginBottom: SPACING.lg },
  backText: { color: COLORS.textMuted, fontSize: 15 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  progressItem: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  progressDotActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purpleLight },
  progressDotDone: { backgroundColor: 'rgba(74,222,128,0.2)', borderColor: 'rgba(74,222,128,0.4)' },
  progressNum: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  progressCheck: { fontSize: 13, color: COLORS.green, fontWeight: '700' },
  progressLine: { width: 40, height: 1, backgroundColor: COLORS.border },
  progressLineDone: { backgroundColor: 'rgba(74,222,128,0.4)' },
  stepTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: SPACING.xl },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.xl, position: 'relative', overflow: 'hidden' },
  cardTopLine: { position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, backgroundColor: 'rgba(168,85,247,0.5)' },
  verifiedText: { color: COLORS.green, fontSize: 14, fontWeight: '700', textAlign: 'center', padding: SPACING.md },
  resendBtn: { alignItems: 'center', marginTop: SPACING.md },
  resendText: { color: COLORS.purplePale, fontSize: 13 },
  pwHint: { fontSize: 11, color: COLORS.textMuted, marginBottom: SPACING.lg, lineHeight: 16 },
  genderLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm },
  genderRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgInput, alignItems: 'center' },
  genderBtnActive: { borderColor: COLORS.purpleBorder, backgroundColor: COLORS.purpleBg },
  genderBtnText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  genderBtnTextActive: { color: COLORS.purplePale },
  errorText: { fontSize: 12, color: COLORS.redLight, marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginVertical: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: 12 },
  loginLink: { color: COLORS.purplePale, fontWeight: '700', fontSize: 14 },
});
