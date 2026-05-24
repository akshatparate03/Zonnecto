// app/premium.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
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

// ─── Razorpay Key (same as website + backend) ────────────────────────────────
const RAZORPAY_KEY_ID = "rzp_test_SmYLU6W8NbDdEc";

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
    period: "/ 1 year",
    durationDays: 360,
    amountPaise: 30000,
    color: "#4ade80",
    tag: "LIFETIME DEAL",
    features: [
      "All Pro features",
      "1 year of access",
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

// ─── Razorpay HTML (same as website checkout.js flow) ────────────────────────
function buildRazorpayHtml({
  orderId,
  keyId,
  amount,
  planName,
  period,
  email,
  name,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #070710;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: -apple-system, sans-serif;
    }
    .loader {
      text-align: center;
      color: rgba(255,255,255,0.5);
      font-size: 14px;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(139,92,246,0.3);
      border-top-color: #a855f7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Opening Razorpay...</p>
  </div>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function openRazorpay() {
      var options = {
        key: "${keyId}",
        amount: ${amount},
        currency: "INR",
        name: "Zonnecto",
        description: "${planName} Plan — ${period}",
        image: "https://zonnecto.netlify.app/Zonnecto.svg",
        order_id: "${orderId}",
        handler: function(response) {
          // Payment successful → send result back to React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "PAYMENT_SUCCESS",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }));
        },
        prefill: {
          email: "${email}",
          name: "${name}",
          contact: "",
        },
        theme: {
          color: "#7c3aed",
          backdrop_color: "rgba(7,7,16,0.85)",
        },
        modal: {
          ondismiss: function() {
            // User closed the Razorpay modal
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "PAYMENT_CANCELLED",
            }));
          },
          animation: true,
        },
      };
      var rzp = new Razorpay(options);
      rzp.on("payment.failed", function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "PAYMENT_FAILED",
          error: response.error.description || "Payment failed",
        }));
      });
      rzp.open();
    }

    // Wait for Razorpay script to load
    if (window.Razorpay) {
      openRazorpay();
    } else {
      document.querySelector("script[src*='razorpay']").addEventListener("load", openRazorpay);
      document.querySelector("script[src*='razorpay']").addEventListener("error", function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "PAYMENT_FAILED",
          error: "Razorpay failed to load. Check internet connection.",
        }));
      });
    }
  </script>
</body>
</html>`;
}

// ─── Razorpay WebView Modal ───────────────────────────────────────────────────
function RazorpayModal({ visible, html, onMessage, onClose }) {
  const [webLoading, setWebLoading] = useState(true);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#070710" }}>
        {/* Header */}
        <View style={rzStyles.header}>
          <TouchableOpacity onPress={onClose} style={rzStyles.closeBtn}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={rzStyles.headerTitle}>Secure Payment</Text>
          <View style={rzStyles.secureBadge}>
            <Ionicons name="lock-closed" size={11} color={COLORS.green} />
            <Text style={rzStyles.secureText}>Razorpay</Text>
          </View>
        </View>

        {webLoading && (
          <View style={rzStyles.webLoader}>
            <ActivityIndicator size="large" color={COLORS.purplePale} />
            <Text style={rzStyles.webLoaderText}>
              Loading payment gateway...
            </Text>
          </View>
        )}

        <WebView
          source={{ html }}
          style={{ flex: 1, backgroundColor: "#070710" }}
          onLoadEnd={() => setWebLoading(false)}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={["*"]}
        />
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PremiumScreen() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("STARTER");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Razorpay WebView state
  const [rzHtml, setRzHtml] = useState("");
  const [rzModalVisible, setRzModalVisible] = useState(false);
  const currentPlanRef = useRef(null);
  const tokenRef = useRef(null);

  const handleGetPlan = async (plan) => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    setError("");
    setLoading(true);
    const token = user.token;
    tokenRef.current = token;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Step 1: Create Razorpay order on backend (same as website)
      const orderRes = await axios.post(
        `${API_BASE_URL}/payment/create-order`,
        {
          planId: plan.id,
          durationDays: plan.durationDays,
          amount: plan.amountPaise,
        },
        { headers },
      );
      const { orderId, keyId } = orderRes.data;

      // Step 2: Build Razorpay HTML and open WebView modal
      currentPlanRef.current = plan;
      const html = buildRazorpayHtml({
        orderId,
        keyId: keyId || RAZORPAY_KEY_ID,
        amount: plan.amountPaise,
        planName: plan.name,
        period: plan.period,
        email: user.email || "",
        name: user.fullName || user.username || "",
      });
      setRzHtml(html);
      setRzModalVisible(true);
      setLoading(false);
    } catch (err) {
      // Agar backend order create nahi kar paya (test env) → direct activate
      const status = err.response?.status;
      const errMsg =
        err.response?.data?.error || err.response?.data?.message || "";
      const isFallback =
        status === 500 ||
        status === 400 ||
        errMsg.toLowerCase().includes("authentication") ||
        errMsg.toLowerCase().includes("bad_request");

      if (isFallback) {
        // Dev/test mode: direct activate
        try {
          const activateRes = await axios.post(
            `${API_BASE_URL}/payment/activate`,
            { planId: plan.id, durationDays: plan.durationDays },
            { headers: { Authorization: `Bearer ${user.token}` } },
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
        } catch {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError(errMsg || "Failed to create payment order. Try again.");
      }
      setLoading(false);
    }
  };

  // ── Handle messages from Razorpay WebView ────────────────────────────────
  const handleWebViewMessage = async (event) => {
    let data;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    const plan = currentPlanRef.current;
    const token = tokenRef.current;
    const headers = { Authorization: `Bearer ${token}` };

    if (data.type === "PAYMENT_SUCCESS") {
      setRzModalVisible(false);
      setLoading(true);
      // Step 3: Verify payment on backend (same as website)
      try {
        const verifyRes = await axios.post(
          `${API_BASE_URL}/payment/verify`,
          {
            razorpayOrderId: data.razorpayOrderId,
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature,
            planId: plan.id,
            durationDays: plan.durationDays,
          },
          { headers },
        );
        if (verifyRes.data?.success) {
          await refreshUserProfile();
          setSuccess(true);
          Toast.show({
            type: "success",
            text1: "⭐ Payment Successful!",
            text2: `${plan.name} plan activated`,
          });
        }
      } catch {
        setError("Payment verification failed. Contact support.");
        Toast.show({
          type: "error",
          text1: "Verification failed",
          text2: "Contact support with your payment ID",
        });
      } finally {
        setLoading(false);
      }
    } else if (data.type === "PAYMENT_CANCELLED") {
      setRzModalVisible(false);
      Toast.show({ type: "info", text1: "Payment cancelled" });
    } else if (data.type === "PAYMENT_FAILED") {
      setRzModalVisible(false);
      setError(data.error || "Payment failed. Please try again.");
      Toast.show({ type: "error", text1: "Payment Failed", text2: data.error });
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
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

      {/* Razorpay WebView Modal */}
      <RazorpayModal
        visible={rzModalVisible}
        html={rzHtml}
        onMessage={handleWebViewMessage}
        onClose={() => setRzModalVisible(false)}
      />

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
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={s.btnText}>Get {plan.name} →</Text>
                      )}
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

// ── Razorpay Modal Styles ─────────────────────────────────────────────────────
const rzStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: 52,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#0a0a18",
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
  },
  secureText: { fontSize: 11, color: COLORS.green, fontWeight: "600" },
  webLoader: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  webLoaderText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: SPACING.sm,
  },
});

// ── Main Styles ───────────────────────────────────────────────────────────────
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
