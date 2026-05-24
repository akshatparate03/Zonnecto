// app/profile-edit.js — Profile Edit Screen
// Fix Issue 3: Premium users can set match preferences (gender/age/state)
// Non-premium users see same UI but get "Buy Premium" button instead of Save

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
  Modal,
  FlatList,
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

// ── Gender options ─────────────────────────────────────────────────────────────
const GENDER_OPTIONS = ["Male", "Female", "Any"];

// ── Age range options (no 40+) ────────────────────────────────────────────────
const AGE_RANGES = ["18-22", "22-25", "25-30", "30-40", "Any"];

// ── All Indian States + UTs ───────────────────────────────────────────────────
const INDIAN_STATES = [
  "Any",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// ── State Picker Modal ────────────────────────────────────────────────────────
function StatePicker({ visible, selected, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={sp.overlay}>
        <View style={sp.sheet}>
          <View style={sp.handle} />
          <Text style={sp.title}>Select State</Text>
          <View style={sp.searchWrap}>
            <Ionicons
              name="search-outline"
              size={16}
              color={COLORS.textMuted}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={sp.searchInput}
              placeholder="Search state..."
              placeholderTextColor={COLORS.textDim}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 340 }}
            renderItem={({ item }) => {
              const isSel = item === selected;
              return (
                <TouchableOpacity
                  style={[sp.item, isSel && sp.itemActive]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                    setSearch("");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[sp.itemText, isSel && sp.itemTextActive]}>
                    {item}
                  </Text>
                  {isSel && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={COLORS.purplePale}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={sp.closeBtn} onPress={onClose}>
            <Text style={sp.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const sp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0f0f1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 11 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  itemActive: {
    backgroundColor: "rgba(139,92,246,0.08)",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  itemText: { fontSize: 14, color: COLORS.textSecondary },
  itemTextActive: { color: COLORS.purplePale, fontWeight: "600" },
  closeBtn: {
    marginTop: SPACING.md,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  closeBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileEditScreen() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const token = user?.token;
  const headers = { Authorization: `Bearer ${token}` };
  const [loading, setLoading] = useState(false);
  const [statePickerVisible, setStatePickerVisible] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);

  // Check if user is premium
  const isPremium =
    user?.isPremium &&
    (!user?.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());

  // Editable profile fields
  const [form, setForm] = useState({ bio: "", age: "", interests: [] });

  // Read-only display fields
  const [displayInfo, setDisplayInfo] = useState({
    fullName: "",
    gender: "",
    state: "",
    username: "",
  });

  // Match Preferences (premium feature — editable by all, but saved only for premium)
  const [prefs, setPrefs] = useState({
    preferredGender: "Any",
    preferredAge: "Any",
    preferredState: "Any",
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile`, { headers });
      const d = res.data;
      setForm({
        bio: d.bio || "",
        age: d.age || "",
        interests: d.interests
          ? d.interests
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      });
      setDisplayInfo({
        fullName: d.fullName || "",
        gender: d.gender || "",
        state: d.state || "",
        username: d.username || "",
      });
      // Load existing preferences
      setPrefs({
        preferredGender: d.preferredGender || "Any",
        preferredAge: d.preferredAge || "Any",
        preferredState: d.preferredState || "Any",
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
        { bio: form.bio, age: form.age, interests: form.interests.join(",") },
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

  // Save preferences (only called for premium users)
  const handleSavePrefs = async () => {
    setPrefSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/user/profile`,
        {
          preferredGender:
            prefs.preferredGender === "Any" ? null : prefs.preferredGender,
          preferredAge:
            prefs.preferredAge === "Any" ? null : prefs.preferredAge,
          preferredState:
            prefs.preferredState === "Any" ? null : prefs.preferredState,
        },
        { headers },
      );
      await refreshUserProfile();
      Toast.show({ type: "success", text1: "Match preferences saved!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to save preferences" });
    } finally {
      setPrefSaving(false);
    }
  };

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));
  const setPref = (key) => (val) =>
    setPrefs((prev) => ({ ...prev, [key]: val }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatePicker
        visible={statePickerVisible}
        selected={prefs.preferredState}
        onSelect={setPref("preferredState")}
        onClose={() => setStatePickerVisible(false)}
      />

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
          keyboardShouldPersistTaps="handled"
        >
          {/* Read-only info */}
          <View style={s.readOnlyCard}>
            <View style={s.readOnlyHeader}>
              <Ionicons name="lock-closed" size={13} color={COLORS.textMuted} />
              <Text style={s.readOnlyHeaderText}>
                Account Info (not editable)
              </Text>
            </View>
            {[
              { label: "Username", value: `@${displayInfo.username || "—"}` },
              { label: "Full Name", value: displayInfo.fullName || "—" },
              { label: "Gender", value: displayInfo.gender || "—" },
              { label: "State", value: displayInfo.state || "—" },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={[
                  s.readOnlyRow,
                  i === arr.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={s.readOnlyLabel}>{row.label}</Text>
                <Text style={s.readOnlyValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Editable fields */}
          <Text style={s.sectionLabel}>Edit Your Info</Text>

          {/* Age */}
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
              placeholder="e.g. 21"
              placeholderTextColor={COLORS.textDim}
              value={form.age}
              onChangeText={set("age")}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          {/* Bio */}
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
              style={[s.input, { height: 90, textAlignVertical: "top" }]}
              placeholder="Tell others about yourself..."
              placeholderTextColor={COLORS.textDim}
              value={form.bio}
              onChangeText={set("bio")}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </View>
          <Text style={s.charCount}>{form.bio.length}/200</Text>

          {/* Interests */}
          <Text style={s.sectionLabel}>Interests</Text>
          <Text style={s.fieldHint}>
            Tap to select/deselect topics you like
          </Text>
          <View style={s.interestGrid}>
            {INTERESTS_OPTIONS.map((interest) => {
              const active = form.interests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[s.interestChip, active && s.chipActive]}
                  activeOpacity={0.75}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Match Preferences Section ── */}
          <View style={s.prefSection}>
            {/* Header row */}
            <View style={s.prefSectionHeader}>
              <Ionicons name="star" size={15} color={COLORS.gold} />
              <Text style={s.prefSectionTitle}>Match Preferences</Text>
              {isPremium ? (
                <View style={s.premiumActiveTag}>
                  <Text style={s.premiumActiveText}>✓ Active</Text>
                </View>
              ) : (
                <View style={s.premiumOnlyTag}>
                  <Text style={s.premiumOnlyText}>Premium only</Text>
                </View>
              )}
            </View>

            <Text style={s.prefSectionDesc}>
              {isPremium
                ? "Set your preferred match filters. These are applied when finding new matches."
                : "Preview your match filters below. Upgrade to Premium to activate them."}
            </Text>

            {/* Preferred Gender */}
            <Text style={s.prefLabel}>PREFERRED GENDER</Text>
            <View style={s.chipRow}>
              {GENDER_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setPref("preferredGender")(g)}
                  style={[
                    s.prefChip,
                    prefs.preferredGender === g && s.prefChipActive,
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      s.prefChipText,
                      prefs.preferredGender === g && s.prefChipTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preferred Age Range */}
            <Text style={s.prefLabel}>PREFERRED AGE RANGE</Text>
            <View style={s.chipRow}>
              {AGE_RANGES.map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setPref("preferredAge")(a)}
                  style={[
                    s.prefChip,
                    prefs.preferredAge === a && s.prefChipActive,
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      s.prefChipText,
                      prefs.preferredAge === a && s.prefChipTextActive,
                    ]}
                  >
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preferred State */}
            <Text style={s.prefLabel}>PREFERRED STATE</Text>
            <TouchableOpacity
              onPress={() => setStatePickerVisible(true)}
              style={s.statePickerBtn}
              activeOpacity={0.8}
            >
              <Ionicons
                name="location-outline"
                size={15}
                color={COLORS.purplePale}
              />
              <Text style={s.statePickerText}>
                {prefs.preferredState || "Any"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={15}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>

            {/* CTA button — Save prefs for premium, Buy premium for others */}
            {isPremium ? (
              <TouchableOpacity
                onPress={handleSavePrefs}
                disabled={prefSaving}
                style={s.prefSaveWrap}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    prefSaving
                      ? ["#4a4a6a", "#3a3a5a"]
                      : ["#7c3aed", "#6366f1", "#0891b2"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.prefSaveBtn}
                >
                  {prefSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#fff"
                      />
                      <Text style={s.prefSaveBtnText}>Save Preferences</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/premium")}
                style={s.prefSaveWrap}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#f59e0b", "#d97706"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.prefSaveBtn}
                >
                  <Ionicons name="star" size={16} color="#fff" />
                  <Text style={s.prefSaveBtnText}>
                    Upgrade to Premium to Activate
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Main Save button */}
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

  readOnlyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    opacity: 0.75,
  },
  readOnlyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  readOnlyHeaderText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  readOnlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  readOnlyLabel: { fontSize: 13, color: COLORS.textMuted },
  readOnlyValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

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
  fieldHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "right",
    marginBottom: SPACING.md,
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

  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  interestChip: {
    paddingHorizontal: 13,
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

  // ── Preferences section ────────────────────────────────────────────────────
  prefSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  prefSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  prefSectionTitle: { fontSize: 15, fontWeight: "700", color: "#fff", flex: 1 },
  premiumActiveTag: {
    backgroundColor: "rgba(74,222,128,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
  },
  premiumActiveText: { fontSize: 11, color: COLORS.green, fontWeight: "600" },
  premiumOnlyTag: {
    backgroundColor: "rgba(245,158,11,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)",
  },
  premiumOnlyText: { fontSize: 11, color: COLORS.gold },
  prefSectionDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },

  prefLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  prefChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgInput,
  },
  prefChipActive: {
    borderColor: COLORS.purpleBorder,
    backgroundColor: COLORS.purpleBg,
  },
  prefChipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "600" },
  prefChipTextActive: { color: COLORS.purplePale },

  statePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    marginBottom: SPACING.lg,
  },
  statePickerText: { flex: 1, color: "#fff", fontSize: 14 },

  prefSaveWrap: { borderRadius: RADIUS.md, overflow: "hidden" },
  prefSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
  },
  prefSaveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  saveBtnWrap: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  saveBtn: { paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
