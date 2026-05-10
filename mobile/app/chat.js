// app/chat.js — Real-time Chat Screen
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Dimensions, Image, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../src/context/AuthContext';
import { useWebSocket } from '../src/context/WebSocketContext';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { ZnDialog, ZnAvatar } from '../src/components/ZnComponents';
import { API_BASE_URL } from '../src/constants/api';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const API_IMG = API_BASE_URL.replace('/api', '');

export default function ChatScreen() {
  const { user } = useAuth();
  const { subscribe, send, connected } = useWebSocket();
  const router = useRouter();

  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isFriendChat, setIsFriendChat] = useState(false);

  // Dialog
  const [dialog, setDialog] = useState(null);
  // Edit
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  // Report
  const [reportingMsgId, setReportingMsgId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const flatListRef = useRef(null);
  const token = user?.token;

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    const roomId = await SecureStore.getItemAsync('zn_chat_room_id');
    if (!roomId) { router.replace('/(tabs)/match'); return; }
    const rid = Number(roomId);
    setChatRoomId(rid);
    await loadRoom(rid);
    await loadMessages(rid);
    setLoading(false);
  };

  const loadRoom = async (roomId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/rooms`, { headers: { Authorization: `Bearer ${token}` } });
      const room = res.data.find(r => r.id === roomId);
      if (room) {
        setChatRoom(room);
        setIsFriendChat(room.roomType === 'FRIEND_CHAT');
        // Load partner info
        const partnerId = room.user1Id === Number(user.userId) ? room.user2Id : room.user1Id;
        const partnerRes = await axios.get(`${API_BASE_URL}/user/profile/${partnerId}`, { headers: { Authorization: `Bearer ${token}` } });
        setPartnerInfo(partnerRes.data);
      }
    } catch {}
  };

  const loadMessages = async (roomId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/messages/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages([...res.data].reverse());
    } catch {}
  };

  // WebSocket subscriptions
  useEffect(() => {
    if (!chatRoomId || !connected) return;
    const myUserId = Number(user?.userId);

    const unsubMsg = subscribe(`/topic/chat/${chatRoomId}`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        if (data.edited) {
          setMessages(prev => prev.map(m => m.id === data.id ? { ...m, content: data.content, edited: true } : m));
        } else if (data.id) {
          setMessages(prev => {
            if (prev.find(m => m.id === data.id)) return prev;
            return [...prev, data];
          });
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      } catch {}
    });

    const unsubEdit = subscribe(`/topic/chat/${chatRoomId}/edit`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, content: data.content, edited: true } : m));
      } catch {}
    });

    const unsubDelete = subscribe(`/topic/chat/${chatRoomId}/delete`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
      } catch {}
    });

    const unsubStatus = subscribe(`/topic/room/${chatRoomId}/status`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        if (data.event === 'PARTNER_LEFT') {
          Toast.show({ type: 'info', text1: 'Partner left the chat' });
        } else if (data.event === 'PARTNER_ONLINE') {
          setPartnerOnline(true);
        } else if (data.event === 'PARTNER_OFFLINE') {
          setPartnerOnline(false);
        }
      } catch {}
    });

    // Notify partner we are online
    send(`/app/chat/${chatRoomId}/online`, { userId: myUserId, chatRoomId });

    return () => {
      unsubMsg(); unsubEdit(); unsubDelete(); unsubStatus();
      send(`/app/chat/${chatRoomId}/offline`, { userId: myUserId, chatRoomId });
    };
  }, [chatRoomId, connected]);

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !chatRoomId || !connected) return;
    const myId = Number(user?.userId);
    const partnerId = chatRoom?.user1Id === myId ? chatRoom?.user2Id : chatRoom?.user1Id;

    send(`/app/chat/${chatRoomId}`, {
      senderId: myId,
      recipientId: partnerId,
      content: inputText.trim(),
      messageType: 'TEXT',
    });
    setInputText('');
  }, [inputText, chatRoomId, connected, chatRoom, user]);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Toast.show({ type: 'error', text1: 'Permission needed' }); return; }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (asset.fileSize > 5 * 1024 * 1024) { Toast.show({ type: 'error', text1: 'Image must be under 5MB' }); return; }

    const fd = new FormData();
    fd.append('file', { uri: asset.uri, name: 'image.jpg', type: 'image/jpeg' });
    try {
      await axios.post(`${API_BASE_URL}/chat/upload-image/${chatRoomId}`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Image upload failed';
      Toast.show({ type: 'error', text1: msg });
    }
  };

  const handleDeleteMsg = (msgId) => {
    setDialog({
      title: 'Delete Message?', message: 'This will be deleted for both sides.', icon: '🗑️',
      confirmLabel: 'Delete', confirmColor: '#ef4444',
      onConfirm: async () => {
        setDialog(null);
        try {
          await axios.delete(`${API_BASE_URL}/chat/message/${msgId}`, { headers: { Authorization: `Bearer ${token}` } });
          setMessages(prev => prev.filter(m => m.id !== msgId));
          send(`/app/chat/${chatRoomId}/delete`, { messageId: msgId });
        } catch {}
      },
    });
  };

  const handleExitChat = () => {
    setDialog({
      title: 'Exit Chat?', message: 'Your partner will be notified.', icon: '👋',
      confirmLabel: 'Exit',
      onConfirm: async () => {
        setDialog(null);
        send(`/app/chat/${chatRoomId}/leave`, { userId: Number(user.userId), chatRoomId });
        await SecureStore.deleteItemAsync('zn_chat_room_id');
        router.replace('/(tabs)/match');
      },
    });
  };

  const handleFindNext = () => {
    setDialog({
      title: 'Find Next Match?', message: 'You\'ll leave this chat and find a new partner.', icon: '⚡',
      confirmLabel: 'Next Match',
      onConfirm: async () => {
        setDialog(null);
        send(`/app/chat/${chatRoomId}/leave`, { userId: Number(user.userId), chatRoomId });
        await SecureStore.deleteItemAsync('zn_chat_room_id');
        router.replace('/(tabs)/match');
      },
    });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === Number(user?.userId);
    const isImage = item.messageType === 'IMAGE' || (item.mediaUrl && item.content?.startsWith('/uploads'));

    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && <ZnAvatar username={partnerInfo?.username} uri={partnerInfo?.dpUrl ? `${API_IMG}${partnerInfo.dpUrl}` : null} size={28} style={styles.msgAvatar} />}
        <TouchableOpacity
          activeOpacity={0.85}
          onLongPress={() => {
            if (isMe) Alert.alert('Message Options', '', [
              { text: 'Delete', style: 'destructive', onPress: () => handleDeleteMsg(item.id) },
              { text: 'Report', onPress: () => { setReportingMsgId(item.id); setShowReportModal(true); } },
              { text: 'Cancel', style: 'cancel' },
            ]);
            else Alert.alert('Message Options', '', [
              { text: 'Report', onPress: () => { setReportingMsgId(item.id); setShowReportModal(true); } },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
          style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}
        >
          {isImage ? (
            <Image
              source={{ uri: `${API_IMG}${item.mediaUrl || item.content}` }}
              style={styles.msgImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.content}</Text>
          )}
          <View style={styles.msgMeta}>
            {item.edited && <Text style={styles.editedText}>edited</Text>}
            <Text style={styles.msgTime}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.purplePale} />
        <Text style={{ color: COLORS.textMuted, marginTop: SPACING.md }}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ZnDialog
        visible={!!dialog}
        title={dialog?.title} message={dialog?.message} icon={dialog?.icon}
        confirmLabel={dialog?.confirmLabel} confirmColor={dialog?.confirmColor}
        onConfirm={dialog?.onConfirm} onCancel={() => setDialog(null)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <ZnAvatar
            username={partnerInfo?.username || '?'}
            uri={partnerInfo?.dpUrl ? `${API_IMG}${partnerInfo.dpUrl}` : null}
            size={36}
          />
          <View style={styles.headerText}>
            <Text style={styles.partnerName}>{partnerInfo?.username || 'Stranger'}</Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: partnerOnline ? COLORS.green : COLORS.textMuted }]} />
              <Text style={styles.onlineStatus}>{partnerOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          {!isFriendChat && (
            <TouchableOpacity onPress={handleFindNext} style={styles.headerBtn}>
              <Ionicons name="arrow-forward" size={18} color={COLORS.green} />
              <Text style={styles.headerBtnText}>Next</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleExitChat} style={[styles.headerBtn, { borderColor: 'rgba(239,68,68,0.3)' }]}>
            <Ionicons name="exit-outline" size={18} color={COLORS.redLight} />
            <Text style={[styles.headerBtnText, { color: COLORS.redLight }]}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => String(item.id || Math.random())}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatIcon}>👋</Text>
            <Text style={styles.emptyChatText}>Say hello!</Text>
          </View>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={handlePickImage} style={styles.attachBtn}>
            <Ionicons name="image-outline" size={22} color={COLORS.purplePale} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textDim}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendBtn, (!inputText.trim() || !connected) && styles.sendBtnDisabled]}
            disabled={!inputText.trim() || !connected}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 55, paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: 'rgba(7,7,16,0.95)', gap: SPACING.sm,
  },
  backBtn: { padding: 6 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerText: { flex: 1 },
  partnerName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineStatus: { fontSize: 11, color: COLORS.textMuted },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  headerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)',
    backgroundColor: 'rgba(74,222,128,0.08)',
  },
  headerBtnText: { fontSize: 12, color: COLORS.green, fontWeight: '600' },

  // Messages
  messagesList: { padding: SPACING.md, paddingBottom: SPACING.lg },
  msgRow: { flexDirection: 'row', marginBottom: SPACING.sm, alignItems: 'flex-end', gap: SPACING.sm },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { marginBottom: 2 },
  msgBubble: { maxWidth: width * 0.72, borderRadius: RADIUS.lg, padding: SPACING.sm + 2, paddingHorizontal: SPACING.md },
  msgBubbleMe: { backgroundColor: 'rgba(124,58,237,0.8)', borderBottomRightRadius: 4 },
  msgBubbleThem: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  msgTextMe: { color: '#fff' },
  msgImage: { width: 200, height: 160, borderRadius: RADIUS.sm },
  msgMeta: { flexDirection: 'row', gap: 6, marginTop: 4, justifyContent: 'flex-end' },
  editedText: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' },
  msgTime: { fontSize: 10, color: 'rgba(255,255,255,0.35)' },

  // Empty
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyChatIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyChatText: { fontSize: 16, color: COLORS.textMuted },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.sm,
    paddingHorizontal: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: 'rgba(7,7,16,0.98)', gap: SPACING.sm, paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.sm,
  },
  attachBtn: { padding: 8 },
  textInput: {
    flex: 1, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: 10, color: '#fff', fontSize: 15,
    maxHeight: 120, borderWidth: 1, borderColor: COLORS.border,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(124,58,237,0.3)' },
});
