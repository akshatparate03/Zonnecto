// app/(tabs)/match.js — Random Match Screen
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ZnButton } from '../../src/components/ZnComponents';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import axios from 'axios';
import { API_BASE_URL } from '../../src/constants/api';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');
const POLL_INTERVAL = 2500;

export default function MatchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | searching | matched | error
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateLoop = useRef(null);

  useEffect(() => {
    return () => {
      stopSearching();
    };
  }, []);

  const startAnimations = () => {
    rotateLoop.current = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    );
    rotateLoop.current.start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopAnimations = () => {
    rotateLoop.current?.stop();
    rotateAnim.setValue(0);
    pulseAnim.setValue(1);
  };

  const startSearching = async () => {
    if (!user) { router.push('/(auth)/login'); return; }

    setStatus('searching');
    setElapsedSecs(0);
    setErrorMsg('');
    startAnimations();

    timerRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000);

    try {
      const token = user.token;
      const res = await axios.post(`${API_BASE_URL}/match/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.matched) {
        handleMatched(res.data.chatRoomId);
        return;
      }

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await axios.get(`${API_BASE_URL}/match/poll`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pollRes.data.matched) {
            handleMatched(pollRes.data.chatRoomId);
          }
        } catch {}
      }, POLL_INTERVAL);

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join queue';
      setStatus('error');
      setErrorMsg(msg);
      stopAnimations();
      clearInterval(timerRef.current);
    }
  };

  const handleMatched = async (chatRoomId) => {
    stopSearching();
    setStatus('matched');
    await SecureStore.setItemAsync('zn_chat_room_id', String(chatRoomId));
    setTimeout(() => {
      router.push('/chat');
    }, 800);
  };

  const stopSearching = () => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    stopAnimations();
    if (status === 'searching' && user) {
      axios.post(`${API_BASE_URL}/match/leave`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).catch(() => {});
    }
    setStatus('idle');
    setElapsedSecs(0);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Random Match</Text>
        {user?.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
          </View>
        )}
      </View>

      {/* Main area */}
      <View style={styles.mainArea}>
        {/* Idle / Matched state */}
        {(status === 'idle' || status === 'matched') && (
          <View style={styles.idleWrap}>
            <Animated.View style={[styles.mainCircleWrap, status === 'matched' && { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={status === 'matched' ? [COLORS.green, '#16a34a'] : COLORS.gradientPrimary}
                style={styles.mainCircle}
              >
                <Ionicons
                  name={status === 'matched' ? 'checkmark' : 'flash'}
                  size={52}
                  color="#fff"
                />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.idleTitle}>
              {status === 'matched' ? 'Match Found! 🎉' : 'Find a Stranger'}
            </Text>
            <Text style={styles.idleSubtitle}>
              {status === 'matched'
                ? 'Opening chat...'
                : 'Press the button below to be matched with a random person'
              }
            </Text>
          </View>
        )}

        {/* Searching state */}
        {status === 'searching' && (
          <View style={styles.searchingWrap}>
            {/* Spinning rings */}
            <View style={styles.ringsWrap}>
              <View style={[styles.ring, styles.ring3]} />
              <View style={[styles.ring, styles.ring2]} />
              <View style={[styles.ring, styles.ring1]} />
              <Animated.View style={[styles.spinnerWrap, { transform: [{ rotate: spin }] }]}>
                <View style={styles.spinnerDot} />
              </Animated.View>
              <Animated.View style={[styles.mainCircleWrap, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient colors={COLORS.gradientPrimary} style={styles.mainCircle}>
                  <Ionicons name="search" size={44} color="#fff" />
                </LinearGradient>
              </Animated.View>
            </View>

            <Text style={styles.searchingTitle}>Searching...</Text>
            <Text style={styles.timerText}>{formatTime(elapsedSecs)}</Text>
            <Text style={styles.searchingHint}>Looking for someone to chat with</Text>
          </View>
        )}

        {/* Error state */}
        {status === 'error' && (
          <View style={styles.errorWrap}>
            <View style={[styles.mainCircleWrap]}>
              <LinearGradient colors={[COLORS.red, '#b91c1c']} style={styles.mainCircle}>
                <Ionicons name="alert-circle" size={44} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.idleTitle}>Oops!</Text>
            <Text style={styles.errorMsg}>{errorMsg}</Text>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {status === 'idle' || status === 'error' ? (
          <ZnButton
            title={status === 'error' ? 'Try Again' : '⚡  Start Matching'}
            onPress={startSearching}
            size="lg"
            style={styles.ctaBtn}
          />
        ) : status === 'searching' ? (
          <TouchableOpacity onPress={stopSearching} style={styles.cancelBtn} activeOpacity={0.8}>
            <Text style={styles.cancelText}>✕  Cancel Search</Text>
          </TouchableOpacity>
        ) : null}

        {/* Premium upsell */}
        {!user?.isPremium && status === 'idle' && (
          <TouchableOpacity onPress={() => router.push('/premium')} style={styles.premiumUpsell} activeOpacity={0.8}>
            <Ionicons name="star" size={14} color={COLORS.gold} />
            <Text style={styles.premiumUpsellText}>
              Premium: Filter by gender, age & state
            </Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.gold} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(124,58,237,0.08)', top: -100, right: -80 },
  orb2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(6,182,212,0.06)', bottom: 80, left: -80 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.lg },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  premiumBadge: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  premiumBadgeText: { fontSize: 12, color: COLORS.gold, fontWeight: '700' },

  mainArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Idle
  idleWrap: { alignItems: 'center', paddingHorizontal: SPACING.xxl },
  mainCircleWrap: { marginBottom: SPACING.xxl },
  mainCircle: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
  idleTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: SPACING.sm, textAlign: 'center' },
  idleSubtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },

  // Searching
  searchingWrap: { alignItems: 'center' },
  ringsWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xxl },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  ring1: { width: 160, height: 160, borderColor: 'rgba(139,92,246,0.3)' },
  ring2: { width: 200, height: 200, borderColor: 'rgba(139,92,246,0.18)' },
  ring3: { width: 240, height: 240, borderColor: 'rgba(139,92,246,0.1)' },
  spinnerWrap: { position: 'absolute', width: 200, height: 200, alignItems: 'center', justifyContent: 'flex-start' },
  spinnerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.purplePale, marginTop: 8 },
  searchingTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: SPACING.sm },
  timerText: { fontSize: 36, fontWeight: '300', color: COLORS.purplePale, marginBottom: SPACING.sm, letterSpacing: 3 },
  searchingHint: { fontSize: 14, color: COLORS.textMuted },

  // Error
  errorWrap: { alignItems: 'center', paddingHorizontal: SPACING.xxl },
  errorMsg: { fontSize: 14, color: COLORS.redLight, textAlign: 'center', marginTop: SPACING.sm },

  // Bottom
  bottomControls: { padding: SPACING.xl, paddingBottom: 30 },
  ctaBtn: { marginBottom: SPACING.md },
  cancelBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center', marginBottom: SPACING.md,
  },
  cancelText: { color: COLORS.redLight, fontSize: 15, fontWeight: '700' },
  premiumUpsell: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', paddingVertical: 10, paddingHorizontal: SPACING.lg,
  },
  premiumUpsellText: { fontSize: 13, color: COLORS.gold, flex: 1, textAlign: 'center' },
});
