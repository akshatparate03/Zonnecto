// app/(tabs)/index.js — Home Screen
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useWebSocket } from '../../src/context/WebSocketContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../../src/constants/theme';
import { ZnCard, ZnBadge } from '../../src/components/ZnComponents';
import axios from 'axios';
import { API_BASE_URL } from '../../src/constants/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { onlineCount, subscribe, connected } = useWebSocket();
  const router = useRouter();
  const [stats, setStats] = useState({ friends: 0, chats: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for online dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  useEffect(() => {
    if (!connected) return;
    const unsub = subscribe('/topic/broadcast', (msg) => {
      try {
        const data = JSON.parse(msg.body);
        setBroadcastMsg(data.message);
      } catch {}
    });
    return unsub;
  }, [connected]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/friends/home-stats`);
      setStats(res.data);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Background orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.grid} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purplePale} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hey, ${user.username || 'there'} 👋` : 'Welcome to'}
            </Text>
            <Text style={styles.brand}>Zonnecto</Text>
          </View>
          <View style={styles.onlineBadge}>
            <Animated.View style={[styles.onlineDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.onlineText}>{onlineCount} online</Text>
          </View>
        </View>

        {/* Broadcast banner */}
        {broadcastMsg && (
          <View style={styles.broadcastBanner}>
            <Ionicons name="megaphone" size={18} color={COLORS.purplePale} />
            <Text style={styles.broadcastText} numberOfLines={3}>{broadcastMsg}</Text>
            <TouchableOpacity onPress={() => setBroadcastMsg(null)}>
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Main CTA — Start Matching */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => user ? router.push('/(tabs)/match') : router.push('/(auth)/login')}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={['rgba(124,58,237,0.9)', 'rgba(99,102,241,0.85)', 'rgba(8,145,178,0.8)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <View style={styles.ctaIconWrap}>
              <Ionicons name="flash" size={36} color="#fff" />
            </View>
            <Text style={styles.ctaTitle}>Start Matching</Text>
            <Text style={styles.ctaSubtitle}>
              Connect with a random stranger instantly
            </Text>
            <View style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>Find Someone →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats row */}
        {user && (
          <View style={styles.statsRow}>
            <ZnCard style={styles.statCard}>
              <Ionicons name="people" size={22} color={COLORS.purplePale} />
              <Text style={styles.statNum}>{stats.friends || 0}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </ZnCard>
            <ZnCard style={styles.statCard}>
              <Ionicons name="chatbubbles" size={22} color={COLORS.cyan} />
              <Text style={[styles.statNum, { color: COLORS.cyan }]}>{stats.chats || 0}</Text>
              <Text style={styles.statLabel}>Chats</Text>
            </ZnCard>
            <ZnCard style={styles.statCard}>
              <Ionicons name="people-circle" size={22} color={COLORS.green} />
              <Text style={[styles.statNum, { color: COLORS.green }]}>{onlineCount}</Text>
              <Text style={styles.statLabel}>Online</Text>
            </ZnCard>
          </View>
        )}

        {/* Feature cards */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <TouchableOpacity
              key={i} activeOpacity={0.8}
              onPress={() => f.route && router.push(f.route)}
              style={styles.featureCardWrap}
            >
              <ZnCard style={styles.featureCard}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </ZnCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium banner */}
        {user && !user.isPremium && (
          <TouchableOpacity onPress={() => router.push('/premium')} activeOpacity={0.88} style={{ marginBottom: SPACING.xl }}>
            <LinearGradient
              colors={['rgba(245,158,11,0.15)', 'rgba(124,58,237,0.15)']}
              style={styles.premiumBanner}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumTitle}>⭐ Upgrade to Premium</Text>
                <Text style={styles.premiumSub}>Filter by gender, age & location. Starting ₹30/month</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Auth prompt for guests */}
        {!user && (
          <View style={styles.authPrompt}>
            <Text style={styles.authPromptTitle}>Join Zonnecto</Text>
            <Text style={styles.authPromptSub}>Create an account to save friends, history and more</Text>
            <View style={styles.authBtns}>
              <TouchableOpacity style={styles.authBtnPrimary} onPress={() => router.push('/(auth)/register')} activeOpacity={0.85}>
                <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.authBtnGradient}>
                  <Text style={styles.authBtnPrimaryText}>Register Free</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.authBtnSecondary} onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                <Text style={styles.authBtnSecondaryText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const FEATURES = [
  { icon: '🎲', title: 'Random Match', desc: 'Chat with strangers instantly', route: '/(tabs)/match' },
  { icon: '👥', title: 'Friends', desc: 'Keep your favourite connections', route: '/(tabs)/friends' },
  { icon: '🖼️', title: 'Image Sharing', desc: 'Share photos in chats' },
  { icon: '⭐', title: 'Premium', desc: 'Filter by gender, age & more', route: '/premium' },
  { icon: '🛡️', title: 'Safe & Moderated', desc: 'Report & block bad actors' },
  { icon: '🔒', title: 'Anonymous', desc: 'Your identity stays private' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(168,85,247,0.08)', top: -80, left: -80,
  },
  orb2: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(6,182,212,0.06)', bottom: 100, right: -60,
  },
  grid: { position: 'absolute', inset: 0 }, // grid bg subtle
  scroll: { padding: SPACING.lg, paddingBottom: 40 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: SPACING.xl },
  greeting: { fontSize: 14, color: COLORS.textMuted, marginBottom: 2 },
  brand: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,222,128,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)' },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  onlineText: { fontSize: 12, color: COLORS.green, fontWeight: '600' },

  // Broadcast
  broadcastBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.purpleBorder,
    padding: SPACING.md, marginBottom: SPACING.lg,
  },
  broadcastText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },

  // CTA
  ctaWrap: { marginBottom: SPACING.xl, borderRadius: RADIUS.xl, overflow: 'hidden' },
  ctaCard: { padding: SPACING.xxl, alignItems: 'center' },
  ctaIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  ctaTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: SPACING.sm },
  ctaSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: SPACING.xl },
  ctaBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard: { flex: 1, alignItems: 'center', gap: 4, padding: SPACING.md },
  statNum: { fontSize: 22, fontWeight: '800', color: COLORS.purplePale },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  // Features
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.md },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  featureCardWrap: { width: (width - SPACING.lg * 2 - SPACING.sm) / 2 },
  featureCard: { padding: SPACING.md, gap: SPACING.xs },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  featureDesc: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },

  // Premium
  premiumBanner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', gap: SPACING.sm },
  premiumTitle: { fontSize: 15, fontWeight: '700', color: COLORS.gold, marginBottom: 3 },
  premiumSub: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16 },

  // Auth prompt
  authPrompt: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.xl },
  authPromptTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: SPACING.sm },
  authPromptSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.xl },
  authBtns: { width: '100%', gap: SPACING.sm },
  authBtnPrimary: { borderRadius: RADIUS.md, overflow: 'hidden' },
  authBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  authBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  authBtnSecondary: { paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md },
  authBtnSecondaryText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15 },
});
