// app/(auth)/forgot-password.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { ZnInput, ZnButton } from '../../src/components/ZnComponents';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { API_BASE_URL } from '../../src/constants/api';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>

          {!sent ? (
            <>
              <View style={styles.iconWrap}>
                <LinearGradient colors={COLORS.gradientPurple} style={styles.iconCircle}>
                  <Ionicons name="lock-closed" size={32} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your registered email and we'll send you a reset link.
              </Text>

              <View style={styles.card}>
                <View style={styles.cardTopLine} />
                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={16} color={COLORS.redLight} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                <ZnInput
                  label="Your Email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  icon="mail-outline"
                />
                <ZnButton
                  title="Send Reset Link →"
                  onPress={handleSubmit}
                  loading={loading}
                />
              </View>
            </>
          ) : (
            <View style={styles.successWrap}>
              <LinearGradient colors={[COLORS.greenBg, 'rgba(74,222,128,0.05)']} style={styles.successIcon}>
                <Ionicons name="checkmark" size={40} color={COLORS.green} />
              </LinearGradient>
              <Text style={styles.title}>Check your inbox!</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  The link expires in 15 minutes. Check your spam folder if you don't see it.
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
                <Text style={styles.loginLinkText}>← Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(124,58,237,0.1)', top: -80, left: -80 },
  orb2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(6,182,212,0.07)', bottom: 80, right: -60 },
  scroll: { padding: SPACING.lg, paddingBottom: 60, flexGrow: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 50, marginBottom: SPACING.xl },
  backText: { fontSize: 15, color: COLORS.textMuted },
  iconWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  iconCircle: { width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: SPACING.sm, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.xl, position: 'relative', overflow: 'hidden' },
  cardTopLine: { position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, backgroundColor: 'rgba(168,85,247,0.5)' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.redBg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.redBorder, padding: SPACING.sm, marginBottom: SPACING.md },
  errorText: { fontSize: 13, color: COLORS.redLight, flex: 1 },
  successWrap: { flex: 1, alignItems: 'center', paddingTop: SPACING.xl },
  successIcon: { width: 90, height: 90, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.greenBorder },
  emailHighlight: { color: COLORS.purplePale, fontWeight: '700' },
  noteBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.xl },
  noteText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  loginLink: { padding: SPACING.md },
  loginLinkText: { color: COLORS.purplePale, fontSize: 15, fontWeight: '600' },
});
