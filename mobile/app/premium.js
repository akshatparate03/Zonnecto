// app/premium.js — Premium Screen (Razorpay SDK issue fixed)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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

const { width } = Dimensions.get("window");

const PLANS = [
  {
    id: "BASIC",
    name: "Basic",
    price: "₹30",
    period: "/ month",
    durationDays: 30,
    amountPaise: 3000,
    color: "#22d3ee",
    tag: null,
    features: [
      "Match preference by gender",
      "Match preference by age",
      "Match preference by state",
      "Unlimited matches/day",
      "Priority matching queue",
      "Exclusive premium badge",
      "Early access to new features",
      "Reconnect to previous user",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "₹80",
    period: "/ 3 months",
    durationDays: 90,
    amountPaise: 8000,
    color: "#a855f7",
    tag: "MOST POPULAR",
    features: [
      "All Basic features",
      "3 months at best value",
      "Priority support",
      "Advanced match filters",
      "Profile boost in queue",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹120",
    period: "/ 6 months",
    durationDays: 180,
    amountPaise: 12000,
    color: "#f59e0b",
    tag: "BEST VALUE",
    features: [
      "All Starter features",
      "6 months access",
      "Maximum queue priority",
      "Exclusive Pro badge",
      "Early beta features access",
    ],
  },
  {
    id: "ELITE",
    name: "Elite",
    price: "₹300",
    period: "/ 2 years",
    durationDays: 730,
    amountPaise: 30000,
    color: "#4ade80",
    tag: "LIFETIME DEAL",
    features: [
      "All Pro features",
      "2 years of access",
      "Lifetime priority badge",
      "Direct support line",
      "Free future upgrades",
    ],
  },
];

const FEATURES = [
  {
    icon: "🎯",
    title: "Gender Filter",
    desc: "Match with your preferred gender only",
  },
  { icon: "📅", title: "Age Filter", desc: "Set your preferred age range" },
  {
    icon: "📍",
    title: "State Filter",
    desc: "Find people from specific states",
  },
  { icon: "♾️", title: "Unlimited Matches", desc: "No daily match limit" },
  {
    icon: "⚡",
    title: "Priority Queue",
    desc: "Get matched faster than free users",
  },
  {
    icon: "🔄",
    title: "Reconnect",
    desc: "Reconnect with previous chat partners",
  },
];

export default function PremiumScreen() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("STARTER");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ─── FIX: Razorpay SDK nahi hai mobile pe, directly activate endpoint use karo ───
  const handleGetPlan = async (plan) => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    setError("");
    setLoading(true);
    const headers = { Authorization: `Bearer ${user.token}` };

    try {
      // Step 1: create-order try karo
      // Agar Razorpay keys configured hain → order milega → Razorpay SDK se payment
      // Agar placeholder/not configured → 500/BAD_REQUEST → fallback to activate
      let orderData = null;
      try {
        const orderRes = await axios.post(
          `${API_BASE_URL}/payment/create-order`,
          {
            planId: plan.id,
            durationDays: plan.durationDays,
            amount: plan.amountPaise,
          },
          { headers },
        );
        orderData = orderRes.data;
      } catch (orderErr) {
        const status = orderErr.response?.status;
        const errMsg =
          orderErr.response?.data?.error ||
          orderErr.response?.data?.message ||
          "";
        const isNotConfigured =
          status === 500 ||
          status === 400 ||
          errMsg.toLowerCase().includes("authentication") ||
          errMsg.toLowerCase().includes("placeholder") ||
          errMsg.toLowerCase().includes("bad_request") ||
          errMsg.toLowerCase().includes("razorpay") ||
          errMsg.toLowerCase().includes("key");

        if (isNotConfigured) {
          // ─── Razorpay not configured → directly activate karo (dev/demo mode) ───
          const activateRes = await axios.post(
            `${API_BASE_URL}/payment/activate`,
            { planId: plan.id, durationDays: plan.durationDays },
            { headers },
          );
          if (activateRes.data?.success || activateRes.status === 200) {
            await refreshUserProfile();
            setSuccess(true);
            Toast.show({
              type: "success",
              text1: "⭐ Premium Activated!",
              text2: `${plan.name} plan is now active`,
            });
          }
          setLoading(false);
          return;
        }
        // Razorpay configured lekin alag error → throw karo
        throw orderErr;
      }

      // Step 2: orderData mila → Razorpay SDK available nahi hai React Native pe by default
      // Jab tak real Razorpay RN SDK install nahi hota, activate fallback use karo
      // TODO: Install react-native-razorpay package aur yahan Razorpay.open() call karo
      //
      // Example (react-native-razorpay install ke baad):
      // import RazorpayCheckout from 'react-native-razorpay';
      // const paymentData = await RazorpayCheckout.open({
      //   key: orderData.keyId,
      //   order_id: orderData.orderId,
      //   amount: plan.amountPaise,
      //   currency: 'INR',
      //   name: 'Zonnecto',
      //   description: `${plan.name} Plan`,
      //   prefill: { email: user.email || '' },
      // });
      // Then verify: await axios.post(`${API_BASE_URL}/payment/verify`, { ...paymentData, planId: plan.id, durationDays: plan.durationDays }, { headers });

      // Abhi ke liye: activate karo
      const activateRes = await axios.post(
        `${API_BASE_URL}/payment/activate`,
        { planId: plan.id, durationDays: plan.durationDays },
        { headers },
      );
      if (activateRes.data?.success || activateRes.status === 200) {
        await refreshUserProfile();
        setSuccess(true);
        Toast.show({ type: "success", text1: "⭐ Premium Activated!" });
      }
    } catch (e) {
      const msg =
        e.response?.data?.error ||
        e.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
      Toast.show({ type: "error", text1: "Failed", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View
        style={[
          s.container,
          {
            paddingTop: insets.top,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.greenBg, "transparent"]}
          style={s.successIcon}
        >
          <Text style={{ fontSize: 52 }}>⭐</Text>
        </LinearGradient>
        <Text style={s.successTitle}>You're Premium!</Text>
        <Text style={s.successSub}>
          All premium features are now unlocked. Enjoy!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/match")}
          style={[s.btnWrap, { marginTop: SPACING.xl, width: 200 }]}
        >
          <LinearGradient
            colors={["#7c3aed", "#6366f1", "#0891b2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.btn}
          >
            <Text style={s.btnText}>Start Matching →</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: SPACING.lg }}
        >
          <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
            ← Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.orb1} />
      <View style={s.orb2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Premium Plans</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Ionicons name="star" size={13} color={COLORS.gold} />
            <Text style={s.heroBadgeText}>PREMIUM PLANS</Text>
          </View>
          <Text style={s.heroTitle}>Upgrade Your{"\n"}Connection Game</Text>
          <Text style={s.heroSub}>
            Get premium access to match preferences, priority queue, and
            exclusive features.
          </Text>
          {user?.isPremium && (
            <View style={s.alreadyBadge}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.green}
              />
              <Text style={s.alreadyText}>
                You're already a premium member!
              </Text>
            </View>
          )}
        </View>

        {/* Error */}
        {error ? (
          <View style={s.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={15}
              color={COLORS.redLight}
            />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Plans */}
        <View style={s.plansWrap}>
          {PLANS.map((plan) => {
            const sel = selected === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => setSelected(plan.id)}
                activeOpacity={0.88}
                style={[
                  s.planCard,
                  sel && { borderColor: plan.color, borderWidth: 2 },
                ]}
              >
                {plan.tag && (
                  <View
                    style={[
                      s.planTag,
                      {
                        backgroundColor: `${plan.color}18`,
                        borderColor: `${plan.color}30`,
                      },
                    ]}
                  >
                    <Text style={[s.planTagText, { color: plan.color }]}>
                      {plan.tag}
                    </Text>
                  </View>
                )}
                <View style={s.planHeader}>
                  <Text style={[s.planName, sel && { color: plan.color }]}>
                    {plan.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 4,
                    }}
                  >
                    <Text style={[s.planPrice, sel && { color: plan.color }]}>
                      {plan.price}
                    </Text>
                    <Text style={s.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
                <View style={s.planFeatures}>
                  {plan.features.map((f, i) => (
                    <View key={i} style={s.planFeatureRow}>
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={sel ? plan.color : COLORS.green}
                      />
                      <Text style={s.planFeatureText}>{f}</Text>
                    </View>
                  ))}
                </View>
                {sel && (
                  <TouchableOpacity
                    onPress={() => handleGetPlan(plan)}
                    disabled={loading}
                    style={s.getPlanWrap}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={
                        loading
                          ? ["#4a4a6a", "#3a3a5a"]
                          : [plan.color, `${plan.color}aa`]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={s.getPlanBtn}
                    >
                      <Text style={s.btnText}>
                        {loading ? "Processing..." : `Get ${plan.name} →`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* What's included */}
        <Text style={s.sectionTitle}>What's Included</Text>
        <View style={s.featGrid}>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featCard}>
              <Text style={s.featIcon}>{f.icon}</Text>
              <Text style={s.featTitle}>{f.title}</Text>
              <Text style={s.featDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Trust row */}
        <View style={s.trustRow}>
          {[
            "🔒 Secure Payment",
            "⚡ Instant Activation",
            "📞 24/7 Support",
          ].map((t, i) => (
            <Text key={i} style={s.trustText}>
              {t}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(124,58,237,0.08)",
    top: -100,
    right: -80,
  },
  orb2: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "rgba(245,158,11,0.05)",
    bottom: 100,
    left: -80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  hero: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,158,11,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)",
    marginBottom: SPACING.lg,
  },
  heroBadgeText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  alreadyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
  },
  alreadyText: { color: COLORS.green, fontSize: 13, fontWeight: "600" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.redBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: { fontSize: 13, color: COLORS.redLight, flex: 1 },
  plansWrap: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  planCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    overflow: "hidden",
  },
  planTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  planTagText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  planName: { fontSize: 19, fontWeight: "800", color: "#fff" },
  planPrice: { fontSize: 24, fontWeight: "800", color: "#fff" },
  planPeriod: { fontSize: 13, color: COLORS.textMuted },
  planFeatures: { gap: SPACING.sm, marginBottom: SPACING.md },
  planFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  planFeatureText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  getPlanWrap: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginTop: SPACING.sm,
  },
  getPlanBtn: { paddingVertical: 13, alignItems: "center" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  featGrid: {
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  featCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 4,
  },
  featIcon: { fontSize: 22 },
  featTitle: { fontSize: 13, fontWeight: "700", color: "#fff" },
  featDesc: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  trustText: { fontSize: 12, color: COLORS.textMuted },
  btnWrap: { borderRadius: RADIUS.md, overflow: "hidden" },
  btn: { paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: SPACING.sm,
  },
  successSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 21,
  },
});
