// app/(tabs)/profile.js — Profile Screen
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Switch, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { ZnCard, ZnBadge, ZnAvatar, ZnDialog, ZnEmpty } from '../../src/components/ZnComponents';
import { API_BASE_URL } from '../../src/constants/api';
import Toast from 'react-native-toast-message';

const API_IMG = API_BASE_URL.replace('/api', '');

export default function ProfileScreen() {
  const { user, logout, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingDp, setUploadingDp] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  const token = user?.token;
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile`, headers);
      setProfile(res.data);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleUploadDp = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Toast.show({ type: 'error', text1: 'Permission needed' }); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (result.canceled) return;

    setUploadingDp(true);
    const asset = result.assets[0];
    const fd = new FormData();
    fd.append('file', { uri: asset.uri, name: 'avatar.jpg', type: 'image/jpeg' });

    try {
      const res = await axios.post(`${API_BASE_URL}/user/upload-dp`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => ({ ...prev, dpUrl: res.data.dpUrl }));
      Toast.show({ type: 'success', text1: 'Profile photo updated!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Upload failed' });
    } finally { setUploadingDp(false); }
  };

  const handleLogout = async () => {
    setLogoutDialog(false);
    await logout();
    router.replace('/');
  };

  const premiumActive = profile?.isPremium &&
    (!profile?.premiumExpiresAt || new Date(profile.premiumExpiresAt) > new Date());

  if (!user) {
    return (
      <View style={styles.container}>
        <ZnEmpty
          icon="👤" title="Not signed in"
          subtitle="Login to view your profile"
          action="Login" onAction={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ZnDialog
        visible={logoutDialog}
        title="Logout?" message="Are you sure you want to sign out?"
        icon="👋" confirmLabel="Logout" confirmColor="#ef4444"
        onConfirm={handleLogout} onCancel={() => setLogoutDialog(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purplePale} />}
      >
        {/* Header gradient */}
        <LinearGradient colors={['rgba(124,58,237,0.3)', 'rgba(7,7,16,0)']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            {/* Avatar */}
            <TouchableOpacity onPress={handleUploadDp} disabled={uploadingDp} style={styles.avatarWrap}>
              <ZnAvatar
                username={profile?.username || user?.username}
                uri={profile?.dpUrl ? `${API_IMG}${profile.dpUrl}` : null}
                size={88}
              />
              <View style={styles.avatarEditBadge}>
                <Ionicons name={uploadingDp ? 'hourglass' : 'camera'} size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.username}>{profile?.username || user?.username}</Text>
            {profile?.fullName && <Text style={styles.fullName}>{profile.fullName}</Text>}

            {/* Premium badge */}
            {premiumActive ? (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={13} color={COLORS.gold} />
                <Text style={styles.premiumBadgeText}>Premium · {profile?.premiumPlan}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => router.push('/premium')} style={styles.upgradeBadge}>
                <Text style={styles.upgradeBadgeText}>⭐ Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Age', value: profile?.age || '—' },
            { label: 'Gender', value: profile?.gender || '—' },
            { label: 'State', value: profile?.state || '—' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        {profile?.bio && (
          <ZnCard style={styles.bioCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </ZnCard>
        )}

        {/* Interests */}
        {profile?.interests && (
          <ZnCard style={styles.bioCard}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestTags}>
              {profile.interests.split(',').map((i, idx) => (
                <View key={idx} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{i.trim()}</Text>
                </View>
              ))}
            </View>
          </ZnCard>
        )}

        {/* Menu items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              onPress={() => item.action ? item.action(router) : router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium section */}
        {!premiumActive && (
          <TouchableOpacity onPress={() => router.push('/premium')} activeOpacity={0.88} style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
            <LinearGradient
              colors={['rgba(124,58,237,0.25)', 'rgba(99,102,241,0.2)']}
              style={styles.premiumCard}
            >
              <Ionicons name="star" size={28} color={COLORS.gold} />
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumCardSub}>Filter matches by gender, age & state. Starting ₹30/month</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gold} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity onPress={() => setLogoutDialog(true)} style={styles.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.redLight} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const MENU_ITEMS = [
  { icon: 'create-outline', label: 'Edit Profile', color: '#a855f7', route: '/profile-edit' },
  { icon: 'star-outline', label: 'Premium Plans', color: '#f59e0b', route: '/premium' },
  { icon: 'shield-checkmark-outline', label: 'Privacy Policy', color: '#22d3ee', route: '/privacy' },
  { icon: 'document-text-outline', label: 'Terms & Conditions', color: '#818cf8', route: '/terms' },
  { icon: 'information-circle-outline', label: 'About Zonnecto', color: '#4ade80', route: '/about' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerGradient: { paddingTop: 60, paddingBottom: SPACING.xl },
  headerContent: { alignItems: 'center', paddingHorizontal: SPACING.lg },
  avatarWrap: { position: 'relative', marginBottom: SPACING.md },
  avatarEditBadge: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: COLORS.purple, borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.bg,
  },
  username: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  fullName: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.sm },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', marginTop: SPACING.sm },
  premiumBadgeText: { fontSize: 12, color: COLORS.gold, fontWeight: '700' },
  upgradeBadge: { backgroundColor: 'rgba(124,58,237,0.12)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.purpleBorder, marginTop: SPACING.sm },
  upgradeBadgeText: { fontSize: 12, color: COLORS.purplePale, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  statValue: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  // Bio / Interests
  bioCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm },
  bioText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  interestTags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  interestTag: { backgroundColor: COLORS.purpleBg, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.purpleBorder },
  interestTagText: { fontSize: 12, color: COLORS.purplePale, fontWeight: '600' },

  // Menu
  menuSection: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  menuSectionTitle: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuItemText: { flex: 1, fontSize: 15, color: '#fff', fontWeight: '500' },

  // Premium card
  premiumCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  premiumCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.gold, marginBottom: 3 },
  premiumCardSub: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16 },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, paddingVertical: 14, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.08)' },
  logoutText: { fontSize: 15, color: COLORS.redLight, fontWeight: '700' },
});
