// app/(tabs)/match.js — Match Screen (exact website Chat.jsx match)
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useAuth } from "../../src/context/AuthContext";
import { useWebSocket } from "../../src/context/WebSocketContext";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { ZnDialog } from "../../src/components/ZnComponents";
import { API_BASE_URL } from "../../src/constants/api";

const { width } = Dimensions.get("window");
const API_IMG = API_BASE_URL.replace("/api", "");
const POLL_INTERVAL = 2500;

// ─── Idle/Queue screen ───────────────────────────────────────────────────────
function MatchQueue({ user, router, onMatched }) {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState("idle"); // idle | searching | matched | error
  const [errorMsg, setErrorMsg] = useState("");
  const [secs, setSecs] = useState(0);
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateLoop = useRef(null);

  useEffect(
    () => () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
      rotateLoop.current?.stop();
    },
    [],
  );

  const startAnim = () => {
    rotateLoop.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    );
    rotateLoop.current.start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopAnim = () => {
    rotateLoop.current?.stop();
    rotateAnim.setValue(0);
    pulseAnim.setValue(1);
  };

  const startSearching = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    setStatus("searching");
    setSecs(0);
    setErrorMsg("");
    startAnim();
    timerRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/match/join`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      if (res.data.matched) {
        handleMatched(res.data.chatRoomId);
        return;
      }
      pollRef.current = setInterval(async () => {
        try {
          const p = await axios.get(`${API_BASE_URL}/match/poll`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (p.data.matched) handleMatched(p.data.chatRoomId);
        } catch {}
      }, POLL_INTERVAL);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to join queue");
      setStatus("error");
      stopAnim();
      clearInterval(timerRef.current);
    }
  };

  const handleMatched = async (roomId) => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    stopAnim();
    setStatus("matched");
    await SecureStore.setItemAsync("zn_chat_room_id", String(roomId));
    setTimeout(() => onMatched(), 600);
  };

  const stopSearching = () => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    stopAnim();
    if (status === "searching" && user) {
      axios
        .post(
          `${API_BASE_URL}/match/leave`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        )
        .catch(() => {});
    }
    setStatus("idle");
    setSecs(0);
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[mqS.container, { paddingTop: insets.top }]}>
      <View style={mqS.orb1} />
      <View style={mqS.orb2} />

      {/* Header */}
      <View style={mqS.header}>
        <Text style={mqS.title}>Random Match</Text>
        {user?.isPremium && (
          <View style={mqS.premiumTag}>
            <Ionicons name="star" size={12} color={COLORS.gold} />
            <Text style={mqS.premiumTagText}>Premium</Text>
          </View>
        )}
      </View>

      {/* Main area */}
      <View style={mqS.main}>
        {status === "searching" ? (
          <View style={mqS.searchingWrap}>
            <View style={mqS.rings}>
              <View style={[mqS.ring, mqS.ring3]} />
              <View style={[mqS.ring, mqS.ring2]} />
              <View style={[mqS.ring, mqS.ring1]} />
              <Animated.View
                style={[mqS.spinnerWrap, { transform: [{ rotate: spin }] }]}
              >
                <View style={mqS.spinnerDot} />
              </Animated.View>
              <Animated.View
                style={[mqS.circleWrap, { transform: [{ scale: pulseAnim }] }]}
              >
                <LinearGradient
                  colors={["#7c3aed", "#6366f1", "#0891b2"]}
                  style={mqS.circle}
                >
                  <Ionicons name="search" size={40} color="#fff" />
                </LinearGradient>
              </Animated.View>
            </View>
            <Text style={mqS.searchTitle}>Searching...</Text>
            <Text style={mqS.timer}>{fmt(secs)}</Text>
            <Text style={mqS.searchHint}>Looking for someone to chat with</Text>
          </View>
        ) : status === "matched" ? (
          <View style={mqS.idleWrap}>
            <Animated.View
              style={[mqS.circleWrap, { transform: [{ scale: pulseAnim }] }]}
            >
              <LinearGradient
                colors={[COLORS.green, "#16a34a"]}
                style={mqS.circle}
              >
                <Ionicons name="checkmark" size={44} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={mqS.idleTitle}>Match Found! 🎉</Text>
            <Text style={mqS.idleSub}>Opening chat...</Text>
          </View>
        ) : status === "error" ? (
          <View style={mqS.idleWrap}>
            <LinearGradient colors={[COLORS.red, "#b91c1c"]} style={mqS.circle}>
              <Ionicons name="alert-circle" size={44} color="#fff" />
            </LinearGradient>
            <Text style={mqS.idleTitle}>Oops!</Text>
            <Text style={[mqS.idleSub, { color: COLORS.redLight }]}>
              {errorMsg}
            </Text>
          </View>
        ) : (
          <View style={mqS.idleWrap}>
            <LinearGradient
              colors={["#7c3aed", "#6366f1", "#0891b2"]}
              style={mqS.circle}
            >
              <Ionicons name="flash" size={44} color="#fff" />
            </LinearGradient>
            <Text style={mqS.idleTitle}>Find a Stranger</Text>
            <Text style={mqS.idleSub}>
              Press the button below to be matched with a random person
            </Text>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View style={[mqS.bottom, { paddingBottom: insets.bottom + 20 }]}>
        {status === "idle" || status === "error" ? (
          <TouchableOpacity
            onPress={startSearching}
            style={{
              borderRadius: RADIUS.md,
              overflow: "hidden",
              marginBottom: SPACING.md,
            }}
          >
            <LinearGradient
              colors={["#7c3aed", "#6366f1", "#0891b2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={mqS.startBtn}
            >
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={mqS.startBtnText}>
                {status === "error" ? "Try Again" : "⚡  Start Matching"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : status === "searching" ? (
          <TouchableOpacity onPress={stopSearching} style={mqS.cancelBtn}>
            <Text style={mqS.cancelText}>✕ Cancel Search</Text>
          </TouchableOpacity>
        ) : null}

        {!user?.isPremium && status === "idle" && (
          <TouchableOpacity
            onPress={() => router.push("/premium")}
            style={mqS.premiumUpsell}
            activeOpacity={0.85}
          >
            <Ionicons name="star" size={13} color={COLORS.gold} />
            <Text style={mqS.premiumUpsellText}>
              Premium: Filter by gender, age & state
            </Text>
            <Ionicons name="chevron-forward" size={13} color={COLORS.gold} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const mqS = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  orb1: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(124,58,237,0.09)",
    top: -80,
    right: -80,
  },
  orb2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(6,182,212,0.07)",
    bottom: 80,
    left: -70,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#fff" },
  premiumTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,158,11,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.25)",
  },
  premiumTagText: { fontSize: 12, color: COLORS.gold, fontWeight: "700" },
  main: { flex: 1, alignItems: "center", justifyContent: "center" },
  idleWrap: { alignItems: "center", paddingHorizontal: SPACING.xxl },
  circleWrap: { marginBottom: SPACING.xxl },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  idleTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  idleSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  searchingWrap: { alignItems: "center" },
  rings: {
    width: 230,
    height: 230,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xxl,
  },
  ring: { position: "absolute", borderRadius: 999, borderWidth: 1 },
  ring1: { width: 155, height: 155, borderColor: "rgba(139,92,246,0.3)" },
  ring2: { width: 192, height: 192, borderColor: "rgba(139,92,246,0.18)" },
  ring3: { width: 230, height: 230, borderColor: "rgba(139,92,246,0.09)" },
  spinnerWrap: {
    position: "absolute",
    width: 192,
    height: 192,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  spinnerDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.purplePale,
    marginTop: 8,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: SPACING.sm,
  },
  timer: {
    fontSize: 34,
    fontWeight: "300",
    color: COLORS.purplePale,
    marginBottom: SPACING.sm,
    letterSpacing: 3,
  },
  searchHint: { fontSize: 13, color: COLORS.textMuted },
  bottom: { paddingHorizontal: SPACING.lg },
  startBtn: {
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  startBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  cancelText: { color: COLORS.redLight, fontSize: 15, fontWeight: "700" },
  premiumUpsell: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    justifyContent: "center",
    backgroundColor: "rgba(245,158,11,0.08)",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
  },
  premiumUpsellText: {
    fontSize: 12,
    color: COLORS.gold,
    flex: 1,
    textAlign: "center",
  },
});

// ─── Chat screen ─────────────────────────────────────────────────────────────
function ChatRoom({ user, chatRoomId, onExit }) {
  const { subscribe, send, connected } = useWebSocket();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [chatRoom, setChatRoom] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const flatRef = useRef(null);
  const token = user?.token;

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const room = res.data.find((r) => r.id === Number(chatRoomId));
      if (room) {
        setChatRoom(room);
        const partnerId =
          room.user1Id === Number(user.userId) ? room.user2Id : room.user1Id;
        try {
          const pr = await axios.get(
            `${API_BASE_URL}/user/profile/${partnerId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setPartnerInfo(pr.data);
        } catch {}
      }
      const mr = await axios.get(
        `${API_BASE_URL}/chat/messages/${chatRoomId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages([...mr.data].reverse());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chatRoomId || !connected) return;
    const myId = Number(user?.userId);
    const u1 = subscribe(`/topic/chat/${chatRoomId}`, (msg) => {
      try {
        const d = JSON.parse(msg.body);
        if (d.id)
          setMessages((prev) =>
            prev.find((m) => m.id === d.id) ? prev : [...prev, d],
          );
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      } catch {}
    });
    const u2 = subscribe(`/topic/chat/${chatRoomId}/delete`, (msg) => {
      try {
        const d = JSON.parse(msg.body);
        setMessages((prev) => prev.filter((m) => m.id !== d.messageId));
      } catch {}
    });
    const u3 = subscribe(`/topic/room/${chatRoomId}/status`, (msg) => {
      try {
        const d = JSON.parse(msg.body);
        if (d.event === "PARTNER_ONLINE") setPartnerOnline(true);
        else if (d.event === "PARTNER_OFFLINE") setPartnerOnline(false);
      } catch {}
    });
    send(`/app/chat/${chatRoomId}/online`, {
      userId: myId,
      chatRoomId: Number(chatRoomId),
    });
    return () => {
      u1();
      u2();
      u3();
      send(`/app/chat/${chatRoomId}/offline`, {
        userId: myId,
        chatRoomId: Number(chatRoomId),
      });
    };
  }, [chatRoomId, connected]);

  const sendMsg = useCallback(() => {
    if (!inputText.trim() || !connected) return;
    const myId = Number(user?.userId);
    const partnerId =
      chatRoom?.user1Id === myId ? chatRoom?.user2Id : chatRoom?.user1Id;
    send(`/app/chat/${chatRoomId}`, {
      senderId: myId,
      recipientId: partnerId,
      content: inputText.trim(),
      messageType: "TEXT",
    });
    setInputText("");
  }, [inputText, chatRoomId, connected, chatRoom]);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (r.canceled) return;
    const asset = r.assets[0];
    const fd = new FormData();
    fd.append("file", { uri: asset.uri, name: "img.jpg", type: "image/jpeg" });
    try {
      await axios.post(`${API_BASE_URL}/chat/upload-image/${chatRoomId}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    } catch {}
  };

  const handleExit = () => {
    setDialog({
      title: "Exit Chat?",
      message: "Your partner will be notified.",
      icon: "👋",
      confirmLabel: "Exit",
      onConfirm: async () => {
        setDialog(null);
        send(`/app/chat/${chatRoomId}/leave`, {
          userId: Number(user.userId),
          chatRoomId: Number(chatRoomId),
        });
        await SecureStore.deleteItemAsync("zn_chat_room_id");
        onExit();
      },
    });
  };

  const handleNext = () => {
    setDialog({
      title: "Find Next Match?",
      message: "You'll leave this chat.",
      icon: "⚡",
      confirmLabel: "Next Match",
      onConfirm: async () => {
        setDialog(null);
        send(`/app/chat/${chatRoomId}/leave`, {
          userId: Number(user.userId),
          chatRoomId: Number(chatRoomId),
        });
        await SecureStore.deleteItemAsync("zn_chat_room_id");
        onExit();
      },
    });
  };

  const renderMsg = ({ item }) => {
    const isMe = item.senderId === Number(user?.userId);
    const isImg = item.messageType === "IMAGE" || item.mediaUrl;
    return (
      <View style={[chS.msgRow, isMe && chS.msgRowMe]}>
        <View style={[chS.bubble, isMe ? chS.bubbleMe : chS.bubbleThem]}>
          {isImg ? (
            <Image
              source={{ uri: `${API_IMG}${item.mediaUrl || item.content}` }}
              style={chS.msgImg}
              resizeMode="cover"
            />
          ) : (
            <Text style={[chS.msgText, isMe && chS.msgTextMe]}>
              {item.content}
            </Text>
          )}
          <Text style={chS.msgTime}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  const isFriendChat = chatRoom?.roomType === "FRIEND_CHAT";

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.purplePale} />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ZnDialog
        visible={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        icon={dialog?.icon}
        confirmLabel={dialog?.confirmLabel}
        confirmColor={dialog?.confirmColor}
        onConfirm={dialog?.onConfirm}
        onCancel={() => setDialog(null)}
      />

      {/* Header */}
      <View style={[chS.header, { paddingTop: insets.top + 8 }]}>
        <View style={chS.headerAvatar}>
          <LinearGradient
            colors={["#7c3aed", "#6366f1"]}
            style={chS.avatarCircle}
          >
            <Text style={chS.avatarText}>
              {(partnerInfo?.username || "?").slice(0, 2).toUpperCase()}
            </Text>
          </LinearGradient>
          <View>
            <Text style={chS.partnerName}>
              {partnerInfo?.username || "Stranger"}
            </Text>
            <View style={chS.onlineRow}>
              <View
                style={[
                  chS.dot,
                  {
                    backgroundColor: partnerOnline
                      ? COLORS.green
                      : COLORS.textMuted,
                  },
                ]}
              />
              <Text style={chS.onlineStatus}>
                {partnerOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
        </View>
        <View style={chS.headerBtns}>
          {!isFriendChat && (
            <TouchableOpacity onPress={handleNext} style={chS.headerBtn}>
              <Ionicons name="arrow-forward" size={15} color={COLORS.green} />
              <Text style={[chS.headerBtnText, { color: COLORS.green }]}>
                Next
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleExit}
            style={[chS.headerBtn, chS.exitBtn]}
          >
            <Ionicons name="exit-outline" size={15} color={COLORS.redLight} />
            <Text style={[chS.headerBtnText, { color: COLORS.redLight }]}>
              Exit
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => String(item.id || Math.random())}
        renderItem={renderMsg}
        contentContainerStyle={chS.msgList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>👋</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 15 }}>
              Say hello!
            </Text>
          </View>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[chS.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity onPress={handlePickImage} style={chS.attachBtn}>
            <Ionicons
              name="image-outline"
              size={22}
              color={COLORS.purplePale}
            />
          </TouchableOpacity>
          <TextInput
            style={chS.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textDim}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={sendMsg}
            style={[
              chS.sendBtn,
              (!inputText.trim() || !connected) && chS.sendBtnOff,
            ]}
            disabled={!inputText.trim() || !connected}
          >
            <Ionicons name="send" size={17} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const chS = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "rgba(7,7,16,0.97)",
  },
  headerAvatar: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  partnerName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  onlineStatus: { fontSize: 11, color: COLORS.textMuted },
  headerBtns: { flexDirection: "row", gap: SPACING.sm },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
    backgroundColor: "rgba(74,222,128,0.08)",
  },
  exitBtn: {
    borderColor: "rgba(239,68,68,0.25)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  headerBtnText: { fontSize: 12, fontWeight: "600" },
  msgList: { padding: SPACING.md, paddingBottom: SPACING.lg },
  msgRow: { flexDirection: "row", marginBottom: SPACING.sm },
  msgRowMe: { flexDirection: "row-reverse" },
  bubble: {
    maxWidth: width * 0.72,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  bubbleMe: {
    backgroundColor: "rgba(124,58,237,0.8)",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  msgTextMe: { color: "#fff" },
  msgImg: { width: 190, height: 150, borderRadius: RADIUS.sm },
  msgTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    marginTop: 4,
    textAlign: "right",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "rgba(7,7,16,0.98)",
    gap: SPACING.sm,
  },
  attachBtn: { padding: 8 },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnOff: { backgroundColor: "rgba(124,58,237,0.3)" },
});

// ─── Root match tab ──────────────────────────────────────────────────────────
export default function MatchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync("zn_chat_room_id").then((id) => {
      if (id) setActiveRoom(id);
    });
  }, []);

  if (activeRoom)
    return (
      <ChatRoom
        user={user}
        chatRoomId={activeRoom}
        onExit={() => setActiveRoom(null)}
      />
    );
  return (
    <MatchQueue
      user={user}
      router={router}
      onMatched={async () => {
        const id = await SecureStore.getItemAsync("zn_chat_room_id");
        setActiveRoom(id);
      }}
    />
  );
}
