// app/premium.js — Premium Plans Screen
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { ZnButton, ZnCard } from '../src/components/ZnComponents';
import { API_BASE_URL } from '../src/constants/api';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const PLANS = [
  {
    id: 'BASIC', name: 'Basic', price: '₹30', period: '/ month',
    durationDays: 30, amountPaise: 3000,
    color: '#22d3ee', tag: null,
    features: ['Match preference by gender', 'Match preference by age', 'Match preference by state', 'Unlimited matches/day', 'Priority matching queue', 'Exclusive premium badge', 'Early access to new features', 'Reconnect to previous user'],
  },
  {
    id: 'STARTER', name: 'Starter', price: '₹80', period: '/ 3 months',
    durationDays: 90, amountPaise: 8000,
    color: '#a855f7', tag: 'MOST POPULAR',
    features: ['All Basic features', '3 months at best value', 'Priority support', 'Advanced match filters', 'Profile boost in queue'],
  },
  {
    id: 'PRO', name: 'Pro', price: '₹120', period: '/ 6 months',
    durationDays: 180, amountPaise: 12000,
    color: '#f59e0b', tag: 'BEST VALUE',
    features: ['All Starter features', '6 months access', 'Maximum queue priority', 'Exclusive Pro badge', 'Early beta features access'],
  },
  {
    id: 'ELITE', name: 'Elite', price: '₹300', period: '/ 2 years',
    durationDays: 730, amountPaise: 30000,
    color: '#4ade80', tag: 'LIFETIME DEAL',
    features: ['All Pro features', '2 years of access', 'Lifetime priority badge', 'Direct support line', 'Free future upgrades'],
  },
];

const FEATURES_LIST = [
  { icon: '🎯', title: 'Gender Filter', desc: 'Match with your preferred gender only' },
  { icon: '📅', title: 'Age Filter', desc: 'Set your preferred age range' },
  { icon: '📍', title: 'State Filter', desc: 'Find people from specific states' },
  { icon: '♾️', title: 'Unlimited Matches', desc: 'No daily match limit' },
  { icon: '⚡', title: 'Priority Queue', desc: 'Get matched faster than free users' },
  { icon: '🔄', title: 'Reconnect', desc: 'Reconnect with previous chat partners' },
];

export default function PremiumScreen() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState('STARTER');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const token = user?.token;

  const isPremiumActive = user?.isPremium;

  const handleGetPlan = async (plan) => {
    if (!user) { router.push('/(auth)/login'); return; }
    setError('');
    setLoading(true);

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Try create-order first (real Razorpay)
      try {
        const orderRes = await axios.post(`${API_BASE_URL}/payment/create-order`, {
          planId: plan.id, durationDays: plan.durationDays, amount: plan.amountPaise,
        }, { headers });

        // TODO: Integrate Razorpay React Native SDK here
        // For now show info toast
        Toast.show({
          type: 'info',
          text1: 'Razorpay Integration',
          text2: 'Use react-native-razorpay package for production checkout',
        });
        setLoading(false);
        return;

      } catch (orderErr) {
        const errMsg = orderErr.response?.data?.error || '';
        const isPlaceholder = errMsg.includes('Authentication failed') ||
          errMsg.includes('PLACEHOLDER') || errMsg.includes('BAD_REQUEST') ||
          orderErr.response?.status === 500;

        if (isPlaceholder) {
          // Dev mode — direct activate
          const activateRes = await axios.post(`${API_BASE_URL}/payment/activate`, {
            planId: plan.id, durationDays: plan.durationDays,
          }, { headers });

          if (activateRes.data.success) {
            setSuccess(true);
            await refreshUserProfile();
            Toast.show({ type: 'success', text1: '⭐ Premium Activated!', text2: `${plan.name} plan active` });
          }
          setLoading(false);
          return;
        }
        throw orderErr;
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successWrap}>
          <LinearGradient colors={[COLORS.greenBg, 'transparent']} style={styles.successIconWrap}>
            <Text style={styles.successEmoji}>⭐</Text>
          </LinearGradient>
          <Text style={styles.successTitle}>You're Premium!</Text>
          <Text style={styles.successSub}>All premium features are now unlocked. Enjoy!</Text>
          <ZnButton title="Start Matching →" onPress={() => router.push('/(tabs)/match')} style={{ marginTop: SPACING.xl }} />
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: SPACING.lg }}>
            <Text style={styles.backLinkText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Plans</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="star" size={14} color={COLORS.gold} />
            <Text style={styles.heroBadgeText}>PREMIUM PLANS</Text>
          </View>
          <Text style={styles.heroTitle}>Upgrade Your{'\n'}Connection Game</Text>
          <Text style={styles.heroSub}>
            Get premium access to match preferences, priority queue, and exclusive features.
          </Text>
          {isPremiumActive && (
            <View style={styles.alreadyPremium}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
              <Text style={styles.alreadyPremiumText}>You're already a premium member!</Text>
            </View>
          )}
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.redLight} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Plans */}
        <View style={styles.plansWrap}>
          {PLANS.map(plan => {
            const isSelected = selected === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => setSelected(plan.id)}
                activeOpacity={0.85}
                style={[styles.planCard, isSelected && { borderColor: plan.color, borderWidth: 2 }]}
              >
                {plan.tag && (
                  <View style={[styles.planTag, { backgroundColor: `${plan.color}22`, borderColor: `${plan.color}44` }]}>
                    <Text style={[styles.planTagText, { color: plan.color }]}>{plan.tag}</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, isSelected && { color: plan.color }]}>{plan.name}</Text>
                  <View style={styles.planPriceRow}>
                    <Text style={[styles.planPrice, isSelected && { color: plan.color }]}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
                <View style={styles.planFeatures}>
                  {plan.features.map((f, i) => (
                    <View key={i} style={styles.planFeatureRow}>
                      <Ionicons name="checkmark" size={14} color={isSelected ? plan.color : COLORS.green} />
                      <Text style={styles.planFeatureText}>{f}</Text>
                    </View>
                  ))}
                </View>
                {isSelected && (
                  <TouchableOpacity
                    onPress={() => handleGetPlan(plan)}
                    disabled={loading}
                    style={styles.getPlanBtnWrap}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[plan.color, plan.color + 'aa']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={styles.getPlanBtn}
                    >
                      <Text style={styles.getPlanBtnText}>
                        {loading ? 'Processing...' : `Get ${plan.name} →`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Features grid */}
        <Text style={styles.sectionTitle}>What's Included</Text>
        <View style={styles.featuresGrid}>
          {FEATURES_LIST.map((f, i) => (
            <ZnCard key={i} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </ZnCard>
          ))}
        </View>

        {/* Trust badges */}
        <View style={styles.trustRow}>
          {['🔒 Secure Payment', '⚡ Instant Activation', '📞 24/7 Support'].map((t, i) => (
            <Text key={i} style={styles.trustText}>{t}</Text>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(124,58,237,0.08)', top: -100, right: -80 },
  orb2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(245,158,11,0.05)', bottom: 100, left: -80 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: 55, paddingBottom: SPACING.md },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  hero: { alignItems: 'center', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', marginBottom: SPACING.lg },
  heroBadgeText: { fontSize: 11, color: COLORS.gold, fontWeight: '700', letterSpacing: 0.8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 34, marginBottom: SPACING.md, letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 21 },
  alreadyPremium: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.lg, backgroundColor: COLORS.greenBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.greenBorder },
  alreadyPremiumText: { color: COLORS.green, fontSize: 14, fontWeight: '600' },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, backgroundColor: COLORS.redBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.redBorder, padding: SPACING.md, marginBottom: SPACING.md },
  errorText: { fontSize: 13, color: COLORS.redLight, flex: 1 },

  plansWrap: { paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.xl },
  planCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, overflow: 'hidden' },
  planTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full, borderWidth: 1, marginBottom: SPACING.sm },
  planTagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  planName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  planPrice: { fontSize: 26, fontWeight: '800', color: '#fff' },
  planPeriod: { fontSize: 13, color: COLORS.textMuted },
  planFeatures: { gap: SPACING.sm, marginBottom: SPACING.md },
  planFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  planFeatureText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  getPlanBtnWrap: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  getPlanBtn: { paddingVertical: 14, alignItems: 'center' },
  getPlanBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  featuresGrid: { paddingHorizontal: SPACING.lg, flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  featureCard: { width: (width - SPACING.lg * 2 - SPACING.sm) / 2, gap: SPACING.xs },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  featureDesc: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },

  trustRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  trustText: { fontSize: 12, color: COLORS.textMuted },

  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  successIconWrap: { width: 100, height: 100, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  successEmoji: { fontSize: 52 },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: SPACING.sm },
  successSub: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  backLinkText: { color: COLORS.textMuted, fontSize: 14 },
});
