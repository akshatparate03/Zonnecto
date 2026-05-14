// app/(auth)/login.js
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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient colors={['rgba(139,92,246,0.2)', 'rgba(6,182,212,0.15)']} style={styles.logoCircle}>
              <Text style={styles.logoText}>∞</Text>
            </LinearGradient>
            <Text style={styles.brand}>Zonnecto</Text>
            <Text style={styles.tagline}>Sign in to your account</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardTopLine} />

            <ZnInput
              label="Email"
              placeholder="you@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail-outline"
              error={errors.email}
            />
            <ZnInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              icon="lock-closed-outline"
              rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPass(v => !v)}
              error={errors.password}
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <ZnButton title="Sign In →" onPress={handleLogin} loading={loading} style={styles.submitBtn} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerBtn} activeOpacity={0.7}>
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerLink}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(124,58,237,0.1)', top: -100, left: -80 },
  orb2: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(6,182,212,0.07)', bottom: 50, right: -80 },
  scroll: { padding: SPACING.lg, paddingBottom: 60 },
  backBtn: { marginTop: 50, marginBottom: SPACING.lg },
  backText: { color: COLORS.textMuted, fontSize: 15 },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.xxl },
  logoCircle: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.purpleBorder },
  logoText: { fontSize: 32, color: COLORS.purplePale },
  brand: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 6 },
  tagline: { fontSize: 14, color: COLORS.textMuted },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.xl, position: 'relative', overflow: 'hidden' },
  cardTopLine: { position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, backgroundColor: 'rgba(168,85,247,0.5)' },
  forgotWrap: { alignItems: 'flex-end', marginBottom: SPACING.lg, marginTop: -SPACING.sm },
  forgotText: { fontSize: 13, color: COLORS.purplePale },
  submitBtn: { marginTop: SPACING.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginVertical: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: 13 },
  registerBtn: { alignItems: 'center' },
  registerText: { fontSize: 14, color: COLORS.textMuted },
  registerLink: { color: COLORS.purplePale, fontWeight: '700' },
});
