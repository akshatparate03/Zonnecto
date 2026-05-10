// app/profile-edit.js — Edit Profile Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { ZnInput, ZnButton } from '../src/components/ZnComponents';
import { API_BASE_URL } from '../src/constants/api';
import Toast from 'react-native-toast-message';

const INTERESTS_OPTIONS = ['Gaming', 'Music', 'Movies', 'Travel', 'Food', 'Sports', 'Tech', 'Books', 'Art', 'Fitness', 'Fashion', 'Bored', 'Friendship', 'Gossips', 'Study'];

export default function ProfileEditScreen() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const token = user?.token;
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', bio: '', age: '', gender: '', state: '',
    preferredGender: '', preferredAge: '', preferredState: '',
    interests: [],
  });

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile`, headers);
      const d = res.data;
      setForm({
        fullName: d.fullName || '',
        bio: d.bio || '',
        age: d.age || '',
        gender: d.gender || '',
        state: d.state || '',
        preferredGender: d.preferredGender || '',
        preferredAge: d.preferredAge || '',
        preferredState: d.preferredState || '',
        interests: d.interests ? d.interests.split(',').map(s => s.trim()) : [],
      });
    } catch {}
  };

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/user/profile`, {
        ...form,
        interests: form.interests.join(','),
      }, headers);
      await refreshUserProfile();
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update profile' });
    } finally { setLoading(false); }
  };

  const isPremium = user?.isPremium;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={styles.saveBtn}>{loading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Basic info */}
          <Text style={styles.sectionLabel}>Basic Info</Text>
          <ZnInput label="Full Name" placeholder="Akshat Parate" value={form.fullName} onChangeText={v => setForm(p => ({ ...p, fullName: v }))} icon="person-outline" autoCapitalize="words" />
          <ZnInput label="Bio" placeholder="Tell others about yourself..." value={form.bio} onChangeText={v => setForm(p => ({ ...p, bio: v }))} icon="document-text-outline" multiline numberOfLines={3} />
          <ZnInput label="Age" placeholder="21" value={form.age} onChangeText={v => setForm(p => ({ ...p, age: v }))} keyboardType="number-pad" icon="calendar-outline" />
          <ZnInput label="State" placeholder="Madhya Pradesh" value={form.state} onChangeText={v => setForm(p => ({ ...p, state: v }))} icon="location-outline" autoCapitalize="words" />

          {/* Gender */}
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {['Male', 'Female', 'Other'].map(g => (
              <TouchableOpacity key={g} onPress={() => setForm(p => ({ ...p, gender: g }))} style={[styles.chip, form.gender === g && styles.chipActive]}>
                <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Interests */}
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.interestGrid}>
            {INTERESTS_OPTIONS.map(interest => (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[styles.interestChip, form.interests.includes(interest) && styles.interestChipActive]}
              >
                <Text style={[styles.chipText, form.interests.includes(interest) && styles.chipTextActive]}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Premium preferences */}
          <View style={styles.premiumSection}>
            <View style={styles.premiumHeader}>
              <Ionicons name="star" size={16} color={COLORS.gold} />
              <Text style={styles.premiumHeaderText}>Match Preferences</Text>
              {!isPremium && <Text style={styles.premiumTag}>Premium only</Text>}
            </View>

            <View style={[!isPremium && styles.premiumBlur]}>
              <Text style={styles.fieldLabel}>Preferred Gender</Text>
              <View style={styles.chipRow}>
                {['Any', 'Male', 'Female'].map(g => (
                  <TouchableOpacity key={g} onPress={() => isPremium && setForm(p => ({ ...p, preferredGender: g }))} style={[styles.chip, form.preferredGender === g && styles.chipActive, !isPremium && styles.chipDisabled]}>
                    <Text style={[styles.chipText, form.preferredGender === g && styles.chipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Preferred Age Range</Text>
              <View style={styles.chipRow}>
                {['18-22', '22-25', '25-30', '30-40', '40+'].map(range => (
                  <TouchableOpacity key={range} onPress={() => isPremium && setForm(p => ({ ...p, preferredAge: range }))} style={[styles.chip, form.preferredAge === range && styles.chipActive, !isPremium && styles.chipDisabled]}>
                    <Text style={[styles.chipText, form.preferredAge === range && styles.chipTextActive]}>{range}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ZnInput
                label="Preferred State"
                placeholder="Maharashtra"
                value={form.preferredState}
                onChangeText={v => isPremium && setForm(p => ({ ...p, preferredState: v }))}
                icon="location-outline"
                editable={isPremium}
              />
            </View>

            {!isPremium && (
              <TouchableOpacity onPress={() => router.push('/premium')} style={styles.upgradeCta}>
                <Text style={styles.upgradeCtaText}>⭐ Upgrade to use preference filters</Text>
              </TouchableOpacity>
            )}
          </View>

          <ZnButton title="Save Changes" onPress={handleSave} loading={loading} style={{ marginTop: SPACING.lg }} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: 55, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  saveBtn: { fontSize: 15, color: COLORS.purplePale, fontWeight: '700' },
  scroll: { padding: SPACING.lg },
  sectionLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.md },
  fieldLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.sm },
  chipRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgInput },
  chipActive: { borderColor: COLORS.purpleBorder, backgroundColor: COLORS.purpleBg },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  chipTextActive: { color: COLORS.purplePale },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  interestChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgInput },
  interestChipActive: { borderColor: COLORS.purpleBorder, backgroundColor: COLORS.purpleBg },
  premiumSection: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.lg },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  premiumHeaderText: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  premiumTag: { fontSize: 11, color: COLORS.gold, backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' },
  premiumBlur: { opacity: 0.45 },
  upgradeCta: { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', marginTop: SPACING.md },
  upgradeCtaText: { color: COLORS.gold, fontWeight: '700', fontSize: 14 },
});
