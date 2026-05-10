// app/(tabs)/friends.js — Friends Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, Dimensions, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { ZnButton, ZnCard, ZnEmpty, ZnAvatar, ZnDialog } from '../../src/components/ZnComponents';
import { API_BASE_URL } from '../../src/constants/api';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const API_IMG = API_BASE_URL.replace('/api', '');

const TABS = ['Friends', 'Requests', 'Blocked', 'Search'];

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const token = user?.token;

  const [tab, setTab] = useState('Friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [dialog, setDialog] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchFriends(), fetchRequests(), fetchBlocked()]);
    setLoading(false);
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/friends`, headers);
      setFriends(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/friends/requests`, headers);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const fetchBlocked = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/friends/blocked`, headers);
      setBlocked(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAccept = async (reqId) => {
    setActionLoading(reqId);
    try {
      await axios.post(`${API_BASE_URL}/friends/accept/${reqId}`, {}, headers);
      await fetchAll();
      setTab('Friends');
      Toast.show({ type: 'success', text1: 'Friend request accepted!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to accept' });
    } finally { setActionLoading(null); }
  };

  const handleReject = async (reqId) => {
    setActionLoading(reqId);
    try {
      await axios.post(`${API_BASE_URL}/friends/reject/${reqId}`, {}, headers);
      await fetchRequests();
    } catch {} finally { setActionLoading(null); }
  };

  const handleRemoveFriend = (friendId, username) => {
    setDialog({
      title: 'Remove Friend?',
      message: `${username} will be removed from your friends list.`,
      icon: '👤', confirmLabel: 'Remove', confirmColor: '#ef4444',
      onConfirm: async () => {
        setDialog(null);
        setActionLoading(friendId);
        try {
          await axios.delete(`${API_BASE_URL}/friends/remove/${friendId}`, headers);
          await fetchFriends();
        } catch {
          Toast.show({ type: 'error', text1: 'Failed to remove' });
        } finally { setActionLoading(null); }
      },
    });
  };

  const handleBlock = (targetId, username) => {
    setDialog({
      title: `Block ${username}?`,
      message: "They won't be matched with you randomly.",
      icon: '🚫', confirmLabel: 'Block', confirmColor: '#ef4444',
      onConfirm: async () => {
        setDialog(null);
        setActionLoading(targetId);
        try {
          await axios.post(`${API_BASE_URL}/friends/block/${targetId}`, {}, headers);
          await fetchAll();
        } catch {
          Toast.show({ type: 'error', text1: 'Failed to block' });
        } finally { setActionLoading(null); }
      },
    });
  };

  const handleUnblock = async (targetId) => {
    setActionLoading(targetId);
    try {
      await axios.delete(`${API_BASE_URL}/friends/unblock/${targetId}`, headers);
      await fetchBlocked();
      Toast.show({ type: 'success', text1: 'User unblocked' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to unblock' });
    } finally { setActionLoading(null); }
  };

  const handleOpenChat = async (friendId) => {
    setActionLoading(friendId);
    try {
      const res = await axios.post(`${API_BASE_URL}/friends/chat/${friendId}`, {}, headers);
      const roomId = res.data.chatRoomId;
      await SecureStore.setItemAsync('zn_chat_room_id', String(roomId));
      router.push('/chat');
    } catch {
      Toast.show({ type: 'error', text1: 'Could not open chat' });
    } finally { setActionLoading(null); }
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    setRequestSent(false);
    try {
      const res = await axios.get(`${API_BASE_URL}/friends/search?username=${searchQuery.trim()}`, headers);
      setSearchResult(res.data);
    } catch {
      setSearchResult(false);
    } finally { setSearchLoading(false); }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    try {
      await axios.post(`${API_BASE_URL}/friends/request/${searchResult.id}`, {}, headers);
      setRequestSent(true);
      Toast.show({ type: 'success', text1: 'Friend request sent!' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed';
      if (msg.toLowerCase().includes('already')) setRequestSent(true);
      else Toast.show({ type: 'error', text1: msg });
    }
  };

  // ── Render items ───────────────────────────────────────────────────────────
  const renderFriend = ({ item }) => (
    <ZnCard style={styles.friendCard}>
      <ZnAvatar
        username={item.username}
        uri={item.dpUrl ? `${API_IMG}${item.dpUrl}` : null}
        size={44}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount} new</Text>
          </View>
        )}
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity
          onPress={() => handleOpenChat(item.id || item.friendId)}
          style={styles.chatBtn}
          disabled={actionLoading === (item.id || item.friendId)}
        >
          <Ionicons name="chatbubble" size={16} color={COLORS.purplePale} />
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRemoveFriend(item.id || item.friendId, item.username)}
          style={styles.removeBtn}
        >
          <Ionicons name="person-remove-outline" size={16} color={COLORS.redLight} />
        </TouchableOpacity>
      </View>
    </ZnCard>
  );

  const renderRequest = ({ item }) => (
    <ZnCard style={styles.friendCard}>
      <ZnAvatar username={item.senderUsername || item.username} size={44} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.senderUsername || item.username}</Text>
        <Text style={styles.friendSub}>Wants to be friends</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          onPress={() => handleAccept(item.id)}
          style={styles.acceptBtn}
          disabled={actionLoading === item.id}
        >
          <Ionicons name="checkmark" size={18} color={COLORS.green} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleReject(item.id)}
          style={styles.rejectBtn}
          disabled={actionLoading === item.id}
        >
          <Ionicons name="close" size={18} color={COLORS.redLight} />
        </TouchableOpacity>
      </View>
    </ZnCard>
  );

  const renderBlocked = ({ item }) => (
    <ZnCard style={styles.friendCard}>
      <ZnAvatar username={item.username} size={44} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username}</Text>
        <Text style={styles.friendSub}>Blocked</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleUnblock(item.id || item.blockedId)}
        style={styles.unblockBtn}
        disabled={actionLoading === (item.id || item.blockedId)}
      >
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </ZnCard>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <ZnEmpty icon="👥" title="Login Required" subtitle="Sign in to manage your friends" action="Login" onAction={() => router.push('/(auth)/login')} />
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
        <Text style={styles.headerTitle}>Friends</Text>
        {requests.length > 0 && (
          <View style={styles.requestBadge}>
            <Text style={styles.requestBadgeText}>{requests.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t} onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            {t === 'Requests' && requests.length > 0 && (
              <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{requests.length}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {tab === 'Friends' && (
        <FlatList
          data={friends}
          keyExtractor={(item, i) => String(item.id || i)}
          renderItem={renderFriend}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purplePale} />}
          ListEmptyComponent={<ZnEmpty icon="👥" title="No friends yet" subtitle="Start matching to meet people!" />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {tab === 'Requests' && (
        <FlatList
          data={requests}
          keyExtractor={(item, i) => String(item.id || i)}
          renderItem={renderRequest}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purplePale} />}
          ListEmptyComponent={<ZnEmpty icon="📭" title="No pending requests" subtitle="No one has sent you a request yet" />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {tab === 'Blocked' && (
        <FlatList
          data={blocked}
          keyExtractor={(item, i) => String(item.id || i)}
          renderItem={renderBlocked}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purplePale} />}
          ListEmptyComponent={<ZnEmpty icon="✅" title="No blocked users" />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {tab === 'Search' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username..."
              placeholderTextColor={COLORS.textDim}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchBtn} disabled={searchLoading}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {searchResult === false && (
            <ZnEmpty icon="🔍" title="User not found" subtitle="Try a different username" />
          )}

          {searchResult && (
            <ZnCard style={styles.searchResultCard}>
              <ZnAvatar username={searchResult.username} uri={searchResult.dpUrl ? `${API_IMG}${searchResult.dpUrl}` : null} size={56} />
              <Text style={styles.searchResultName}>{searchResult.username}</Text>
              {searchResult.fullName && <Text style={styles.searchResultSub}>{searchResult.fullName}</Text>}
              {searchResult.bio && <Text style={styles.searchResultBio} numberOfLines={2}>{searchResult.bio}</Text>}
              <ZnButton
                title={requestSent ? '✓ Request Sent' : 'Send Friend Request'}
                onPress={handleSendRequest}
                disabled={requestSent}
                style={{ marginTop: SPACING.md }}
              />
            </ZnCard>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.md, gap: SPACING.sm },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  requestBadge: { backgroundColor: COLORS.red, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  requestBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Tabs
  tabsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, marginBottom: SPACING.md, gap: SPACING.sm },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tabBtnActive: { backgroundColor: COLORS.purpleBg, borderWidth: 1, borderColor: COLORS.purpleBorder },
  tabText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.purplePale },
  tabBadge: { backgroundColor: COLORS.red, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // List
  list: { padding: SPACING.md, gap: SPACING.sm, flexGrow: 1 },

  // Friend card
  friendCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  friendSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  unreadBadge: { backgroundColor: 'rgba(124,58,237,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  unreadText: { fontSize: 11, color: COLORS.purplePale, fontWeight: '600' },
  friendActions: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.purpleBg, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.purpleBorder },
  chatBtnText: { fontSize: 13, color: COLORS.purplePale, fontWeight: '600' },
  removeBtn: { padding: 6, backgroundColor: COLORS.redBg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.redBorder },

  // Request
  requestActions: { flexDirection: 'row', gap: SPACING.sm },
  acceptBtn: { padding: 8, backgroundColor: COLORS.greenBg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.greenBorder },
  rejectBtn: { padding: 8, backgroundColor: COLORS.redBg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.redBorder },

  // Blocked
  unblockBtn: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.border },
  unblockText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },

  // Search
  searchContainer: { flex: 1, padding: SPACING.lg },
  searchRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  searchInput: { flex: 1, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: 12, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  searchBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', justifyContent: 'center' },
  searchResultCard: { alignItems: 'center', gap: SPACING.sm, padding: SPACING.xl },
  searchResultName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  searchResultSub: { fontSize: 14, color: COLORS.textMuted },
  searchResultBio: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
});
