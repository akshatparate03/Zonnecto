import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ActionSheetIOS,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useWebSocket } from "../src/context/WebSocketContext";
import { ZnAvatar } from "../src/components/ZnComponents";
import { COLORS, SPACING, RADIUS } from "../src/constants/theme";
import axios from "axios";
import { API_BASE_URL } from "../src/constants/api";

export default function Chat() {
  const router = useRouter();
  const { roomId, type } = useLocalSearchParams();
  const { user } = useAuth();
  const { subscribe, send, connected } = useWebSocket();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [partnerStatus, setPartnerStatus] = useState("online"); // online | offline
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const unsubRef = useRef([]);

  const headers = { Authorization: `Bearer ${user?.token}` };

  // ─── Fetch existing messages ─────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    fetchMessages();
    notifyOnline();
    return () => {
      unsubRef.current.forEach((fn) => fn?.());
      notifyOffline();
    };
  }, [roomId]);

  // ─── Subscribe to WebSocket topics ──────────────────────────────────────
  useEffect(() => {
    if (!connected || !roomId) return;

    // New messages
    const unsubMsg = subscribe(`/topic/chat/${roomId}`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        if (!data || !data.id) return;
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === data.id);
          if (exists) return prev;
          return [...prev, data];
        });
        scrollToBottom();
      } catch {}
    });

    // Partner presence
    const unsubStatus = subscribe(`/topic/room/${roomId}/status`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        if (data.event === "PARTNER_ONLINE") setPartnerStatus("online");
        if (data.event === "PARTNER_OFFLINE") setPartnerStatus("offline");
        if (data.event === "PARTNER_LEFT") {
          Alert.alert(
            "Partner Left",
            "Your chat partner has left the conversation.",
            [{ text: "OK", onPress: () => router.back() }],
          );
        }
      } catch {}
    });

    // Edit messages
    const unsubEdit = subscribe(`/topic/chat/${roomId}/edit`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? { ...m, content: data.content, edited: true }
              : m,
          ),
        );
      } catch {}
    });

    // Delete messages
    const unsubDelete = subscribe(`/topic/chat/${roomId}/delete`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      } catch {}
    });

    unsubRef.current = [unsubMsg, unsubStatus, unsubEdit, unsubDelete];

    return () => {
      unsubRef.current.forEach((fn) => fn?.());
    };
  }, [connected, roomId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/messages/${roomId}`, {
        headers,
      });
      setMessages((res.data || []).reverse());
    } catch {}
    setLoading(false);
  };

  const notifyOnline = () => {
    if (connected && user) {
      send(`/app/chat/${roomId}/online`, { userId: Number(user.userId) });
    }
  };

  const notifyOffline = () => {
    if (connected && user) {
      send(`/app/chat/${roomId}/offline`, { userId: Number(user.userId) });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // ─── Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !connected || !user) return;

    // Link detection — basic
    const hasLink = /(https?:\/\/|www\.)/i.test(text);
    if (hasLink) {
      Alert.alert("Link Blocked", "Sharing links is not allowed.");
      return;
    }

    send(`/app/chat/${roomId}`, {
      senderId: Number(user.userId),
      recipientId: 0,
      content: text,
      messageType: "TEXT",
    });
    setInput("");
  }, [input, connected, user, roomId]);

  // ─── Long press on message ───────────────────────────────────────────────
  const handleMsgLongPress = (msg) => {
    if (msg.senderId !== Number(user?.userId)) return;

    const options = ["Edit", "Delete", "Cancel"];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex: 1, cancelButtonIndex: 2 },
        (idx) => {
          if (idx === 0) promptEdit(msg);
          if (idx === 1) deleteMsg(msg.id);
        },
      );
    } else {
      Alert.alert("Message", "What do you want to do?", [
        { text: "Edit", onPress: () => promptEdit(msg) },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMsg(msg.id),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const promptEdit = (msg) => {
    Alert.prompt(
      "Edit Message",
      "",
      async (newText) => {
        if (!newText?.trim()) return;
        try {
          await axios.put(
            `${API_BASE_URL}/chat/message/${msg.id}`,
            { content: newText.trim() },
            { headers },
          );
          send(`/app/chat/${roomId}/edit`, {
            messageId: msg.id,
            content: newText.trim(),
          });
        } catch {}
      },
      "plain-text",
      msg.content,
    );
  };

  const deleteMsg = async (msgId) => {
    try {
      await axios.delete(`${API_BASE_URL}/chat/message/${msgId}`, { headers });
      send(`/app/chat/${roomId}/delete`, { messageId: msgId });
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch {}
  };

  const reportMsg = async (msgId) => {
    Alert.prompt("Report Message", "Reason (optional):", async (reason) => {
      try {
        await axios.post(
          `${API_BASE_URL}/chat/report/${msgId}`,
          { reason: reason || "No reason" },
          { headers },
        );
        Alert.alert("Reported", "Message has been reported.");
      } catch {}
    });
  };

  const handleLeave = () => {
    Alert.alert("Leave Chat", "Are you sure you want to leave?", [
      { text: "Stay", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          send(`/app/chat/${roomId}/leave`, {
            userId: Number(user?.userId),
            chatRoomId: Number(roomId),
          });
          router.back();
        },
      },
    ]);
  };

  // ─── Render message bubble ───────────────────────────────────────────────
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === Number(user?.userId);
    const isImage = item.messageType === "IMAGE";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => handleMsgLongPress(item)}
        style={[s.msgRow, isMe ? s.msgRowMe : s.msgRowThem]}
      >
        {!isMe && (
          <ZnAvatar
            username="?"
            size={28}
            style={{ marginRight: 6, alignSelf: "flex-end" }}
          />
        )}

        <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
          {isImage ? (
            <Image
              source={{
                uri: `${API_BASE_URL.replace("/api", "")}${item.content}`,
              }}
              style={s.msgImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>
              {item.content}
            </Text>
          )}

          <View style={s.msgMeta}>
            {item.edited && <Text style={s.editedTag}>edited</Text>}
            <Text style={s.msgTime}>
              {item.timestamp
                ? new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={s.centerWrap}>
        <Text style={s.centerText}>Please login to chat</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={handleLeave}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={s.headerInfo}>
          <ZnAvatar username="?" size={36} />
          <View>
            <Text style={s.headerTitle}>
              {type === "FRIEND_CHAT" ? "Friend Chat" : "Anonymous Chat"}
            </Text>
            <View style={s.statusRow}>
              <View
                style={[
                  s.statusDot,
                  partnerStatus === "online" ? s.statusOnline : s.statusOffline,
                ]}
              />
              <Text style={s.statusText}>{partnerStatus}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={s.leaveBtn}
          onPress={handleLeave}
          activeOpacity={0.8}
        >
          <Ionicons name="exit-outline" size={20} color={COLORS.redLight} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={s.centerWrap}>
            <ActivityIndicator color={COLORS.purplePale} size="large" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMessage}
            contentContainerStyle={s.msgList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            ListEmptyComponent={
              <View style={s.emptyWrap}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={COLORS.textMuted}
                />
                <Text style={s.emptyText}>Say hello! 👋</Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View style={s.inputBar}>
          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textDim}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
              onSubmitEditing={sendMessage}
            />
          </View>

          <TouchableOpacity
            style={[
              s.sendBtn,
              (!input.trim() || !connected) && s.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || !connected}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Not connected warning */}
        {!connected && (
          <View style={s.disconnectedBar}>
            <Ionicons name="wifi-outline" size={14} color={COLORS.redLight} />
            <Text style={s.disconnectedText}>Reconnecting...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  centerText: { fontSize: 16, color: COLORS.textMuted },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === "ios" ? 52 : SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(7,7,16,0.95)",
    gap: SPACING.md,
  },
  backBtn: { padding: 4 },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusOnline: { backgroundColor: "#4ade80" },
  statusOffline: { backgroundColor: COLORS.textMuted },
  statusText: { fontSize: 11, color: COLORS.textMuted },
  leaveBtn: { padding: 4 },
  msgList: { padding: SPACING.md, paddingBottom: SPACING.xl, gap: SPACING.sm },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: SPACING.xs,
  },
  msgRowMe: { justifyContent: "flex-end" },
  msgRowThem: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "75%",
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bubbleMe: {
    backgroundColor: "rgba(124,58,237,0.5)",
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
  },
  bubbleThem: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  bubbleText: { fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  bubbleTextMe: { color: "#fff" },
  msgImage: { width: 200, height: 150, borderRadius: RADIUS.md },
  msgMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    justifyContent: "flex-end",
  },
  editedTag: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    fontStyle: "italic",
  },
  msgTime: { fontSize: 10, color: "rgba(255,255,255,0.35)" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: SPACING.md,
  },
  emptyText: { fontSize: 16, color: COLORS.textMuted, fontWeight: "600" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(7,7,16,0.95)",
  },
  inputWrap: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === "ios" ? SPACING.sm : 0,
    maxHeight: 120,
  },
  input: {
    color: "#fff",
    fontSize: 15,
    paddingVertical: Platform.OS === "android" ? 10 : 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "rgba(124,58,237,0.3)" },
  disconnectedBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingVertical: 6,
  },
  disconnectedText: { fontSize: 12, color: COLORS.redLight },
});
