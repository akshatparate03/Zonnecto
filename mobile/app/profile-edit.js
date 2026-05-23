// app/profile-edit.js — Profile Edit Screen (exact website match)
import React, { useState, useEffect } from "react";
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
import { useAuth } from "../src/context/AuthContext";
import { COLORS, SPACING, RADIUS } from "../src/constants/theme";
import { API_BASE_URL } from "../src/constants/api";
import Toast from "react-native-toast-message";

const INTERESTS_OPTIONS = [
  "Gaming",
  "Music",
  "Movies",
  "Travel",
  "Food",
  "Sports",
  "Tech",
  "Books",
  "Art",
  "Fitness",
  "Fashion",
  "Bored",
  "Friendship",
  "Gossips",
  "Study",
];

export default function ProfileEditScreen() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const token = user?.token;
  const headers = { Authorization: `Bearer ${token}` };
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    age: "",
    gender: "",
    state: "",
    preferredGender: "",
    preferredAge: "",
    preferredState: "",
    interests: [],
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile`, { headers });
      const d = res.data;
      setForm({
        fullName: d.fullName || "",
        bio: d.bio || "",
        age: d.age || "",
        gender: d.gender || "",
        state: d.state || "",
        preferredGender: d.preferredGender || "",
        preferredAge: d.preferredAge || "",
        preferredState: d.preferredState || "",
        interests: d.interests
          ? d.interests
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      });
    } catch {}
  };

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/user/profile`,
        {
          ...form,
          interests: form.interests.join(","),
        },
        { headers },
      );
      await refreshUserProfile();
      Toast.show({ type: "success", text1: "Profile updated!" });
      router.back();
    } catch {
      Toast.show({ type: "error", text1: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const isPremium = user?.isPremium;

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.purplePale} />
            ) : (
              <Text style={s.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic info */}
          <Text style={s.sectionLabel}>Basic Info</Text>

          <Text style={s.fieldLabel}>FULL NAME</Text>
          <View style={s.inputWrap}>
            <Ionicons
              name="person-outline"
              size={15}
              color={COLORS.purplePale}
              style={s.inputIcon}
            />
            <TextInput
              style={s.input}
              placeholder="Akshat Parate"
              placeholderTextColor={COLORS.textDim}
              value={form.fullName}
              onChangeText={set("fullName")}
              autoCapitalize="words"
            />
          </View>

          <Text style={s.fieldLabel}>BIO</Text>
          <View
            style={[s.inputWrap, { alignItems: "flex-start", paddingTop: 12 }]}
          >
            <Ionicons
              name="document-text-outline"
              size={15}
              color={COLORS.purplePale}
              style={[s.inputIcon, { marginTop: 2 }]}
            />
            <TextInput
              style={[s.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Tell others about yourself..."
              placeholderTextColor={COLORS.textDim}
              value={form.bio}
              onChangeText={set("bio")}
              multiline
              numberOfLines={3}
            />
          </View>

          <Text style={s.fieldLabel}>AGE</Text>
          <View style={s.inputWrap}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={COLORS.purplePale}
              style={s.inputIcon}
            />
            <TextInput
              style={s.input}
              placeholder="21"
              placeholderTextColor={COLORS.textDim}
              value={form.age}
              onChangeText={set("age")}
              keyboardType="number-pad"
            />
          </View>

          <Text style={s.fieldLabel}>STATE</Text>
          <View style={s.inputWrap}>
            <Ionicons
              name="location-outline"
              size={15}
              color={COLORS.purplePale}
              style={s.inputIcon}
            />
            <TextInput
              style={s.input}
              placeholder="Madhya Pradesh"
              placeholderTextColor={COLORS.textDim}
              value={form.state}
              onChangeText={set("state")}
              autoCapitalize="words"
            />
          </View>

          {/* Gender */}
          <Text style={s.fieldLabel}>GENDER</Text>
          <View style={s.chipRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => set("gender")(g)}
                style={[s.chip, form.gender === g && s.chipActive]}
              >
                <Text
                  style={[s.chipText, form.gender === g && s.chipTextActive]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Interests */}
          <Text style={s.sectionLabel}>Interests</Text>
          <View style={s.interestGrid}>
            {INTERESTS_OPTIONS.map((interest) => (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[
                  s.interestChip,
                  form.interests.includes(interest) && s.chipActive,
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    form.interests.includes(interest) && s.chipTextActive,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Premium preferences */}
          <View style={s.premiumSection}>
            <View style={s.premiumSectionHeader}>
              <Ionicons name="star" size={15} color={COLORS.gold} />
              <Text style={s.premiumSectionTitle}>Match Preferences</Text>
              {!isPremium && (
                <View style={s.premiumOnlyTag}>
                  <Text style={s.premiumOnlyText}>Premium only</Text>
                </View>
              )}
            </View>

            <View style={[!isPremium && { opacity: 0.45 }]}>
              <Text style={s.fieldLabel}>PREFERRED GENDER</Text>
              <View style={s.chipRow}>
                {["Any", "Male", "Female"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => isPremium && set("preferredGender")(g)}
                    style={[s.chip, form.preferredGender === g && s.chipActive]}
                  >
                    <Text
                      style={[
                        s.chipText,
                        form.preferredGender === g && s.chipTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.fieldLabel}>PREFERRED AGE RANGE</Text>
              <View style={[s.chipRow, { flexWrap: "wrap" }]}>
                {["18-22", "22-25", "25-30", "30-40", "40+"].map((range) => (
                  <TouchableOpacity
                    key={range}
                    onPress={() => isPremium && set("preferredAge")(range)}
                    style={[
                      s.chip,
                      form.preferredAge === range && s.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        s.chipText,
                        form.preferredAge === range && s.chipTextActive,
                      ]}
                    >
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.fieldLabel}>PREFERRED STATE</Text>
              <View style={s.inputWrap}>
                <Ionicons
                  name="location-outline"
                  size={15}
                  color={COLORS.purplePale}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="Maharashtra"
                  placeholderTextColor={COLORS.textDim}
                  value={form.preferredState}
                  onChangeText={(v) => isPremium && set("preferredState")(v)}
                  editable={isPremium}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {!isPremium && (
              <TouchableOpacity
                onPress={() => router.push("/premium")}
                style={s.upgradeCta}
              >
                <Ionicons name="star" size={14} color={COLORS.gold} />
                <Text style={s.upgradeCtaText}>
                  Upgrade to use preference filters
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={s.saveBtnWrap}
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
              style={s.saveBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.saveBtnText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  saveText: { fontSize: 15, color: COLORS.purplePale, fontWeight: "700" },

  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  fieldLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: SPACING.sm,
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
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 13 },

  chipRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgInput,
  },
  chipActive: {
    borderColor: COLORS.purpleBorder,
    backgroundColor: COLORS.purpleBg,
  },
  chipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "600" },
  chipTextActive: { color: COLORS.purplePale },

  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  interestChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgInput,
  },

  premiumSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  premiumSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  premiumSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  premiumOnlyTag: {
    backgroundColor: "rgba(245,158,11,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)",
  },
  premiumOnlyText: { fontSize: 11, color: COLORS.gold },

  upgradeCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)",
    marginTop: SPACING.md,
    justifyContent: "center",
  },
  upgradeCtaText: { color: COLORS.gold, fontWeight: "700", fontSize: 13 },

  saveBtnWrap: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.lg,
  },
  saveBtn: { paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
