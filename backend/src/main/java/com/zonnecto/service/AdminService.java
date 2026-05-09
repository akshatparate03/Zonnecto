package com.zonnecto.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

        private static final String ADMIN_EMAIL = "zonnecto@gmail.com";

        private final JdbcTemplate jdbcTemplate;
        private final OnlineUserService onlineUserService; // ✅ for live online count

        @Value("${apps.script.url}")
        private String appsScriptUrl;

        // ─── Auth Check ────────────────────────────────────────────────────────────

        public boolean isAdmin(String email) {
                return ADMIN_EMAIL.equalsIgnoreCase(email);
        }

        // ─── Null-safe Long unboxing ─────────────────────────────────────────────────
        // ✅ FIX 2: Wraps queryForObject(Long.class) results to prevent
        // NullPointerException
        private long safe(Long val) {
                return val != null ? val : 0L;
        }

        // ─── Dashboard Overview Stats ───────────────────────────────────────────────

        public Map<String, Object> getDashboardStats() {
                Map<String, Object> stats = new LinkedHashMap<>();

                // User counts
                stats.put("totalUsers", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM users", Long.class)));

                // ✅ FIX: Live online count from OnlineUserService (WebSocket sessions)
                stats.put("activeUsersOnline", (long) onlineUserService.getOnlineCount());

                stats.put("todayNewRegistrations", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'",
                                Long.class)));

                // PostgreSQL: email_verified is boolean — use = true
                try {
                        stats.put("emailVerifiedUsers", safe(jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM users WHERE email_verified = true", Long.class)));
                } catch (Exception e) {
                        stats.put("emailVerifiedUsers", safe(jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM users", Long.class)));
                }

                // ✅ FIX: premium/gender columns may not exist in older DBs — try-catch
                try {
                        stats.put("premiumUsers", safe(jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM users WHERE COALESCE(is_premium, false) = true",
                                        Long.class)));
                } catch (Exception e) {
                        stats.put("premiumUsers", 0L);
                }
                try {
                        stats.put("maleUsers", safe(jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM users WHERE LOWER(gender) = 'male'", Long.class)));
                        stats.put("femaleUsers", safe(jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM users WHERE LOWER(gender) = 'female'", Long.class)));
                } catch (Exception e) {
                        stats.put("maleUsers", 0L);
                        stats.put("femaleUsers", 0L);
                }

                // Chat counts
                stats.put("totalChatRooms", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM chat_rooms", Long.class)));
                stats.put("totalMessages", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM messages", Long.class)));
                stats.put("todayMessages", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM messages WHERE timestamp >= CURRENT_DATE AND timestamp < CURRENT_DATE + INTERVAL '1 day'",
                                Long.class)));

                // Reports
                stats.put("pendingReports", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM reports WHERE status = 'PENDING'", Long.class)));
                stats.put("totalReports", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM reports", Long.class)));
                stats.put("todayReports", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM reports WHERE DATE(created_at) = CURRENT_DATE", Long.class)));

                // Bans
                stats.put("activeBans", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM bans WHERE (expires_at > NOW() OR is_permanent = true)",
                                Long.class)));
                stats.put("permanentBans", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM bans WHERE is_permanent = true", Long.class)));

                // Friends
                stats.put("totalFriendships", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM friends", Long.class)));
                stats.put("pendingFriendRequests", safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM friend_requests WHERE status = 'PENDING'", Long.class)));

                // Invites — table may not exist in all deployments
                try {
                        stats.put("totalInvites", safe(jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM invites", Long.class)));
                        stats.put("usedInvites", safe(jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM invites WHERE is_used = true", Long.class)));
                } catch (Exception e) {
                        stats.put("totalInvites", 0L);
                        stats.put("usedInvites", 0L);
                }

                return stats;
        }

        // ─── User Management ────────────────────────────────────────────────────────

        public List<Map<String, Object>> getAllUsers(int page, int size, String search) {
                String searchWhere = (search != null && !search.isBlank())
                                ? " WHERE u.username LIKE '%" + search.replace("'", "''") + "%'"
                                                + " OR u.email LIKE '%" + search.replace("'", "''") + "%'"
                                : "";
                int offset = page * size;

                return jdbcTemplate.queryForList(
                                "SELECT u.id, u.email, u.username, "
                                                + "COALESCE(u.gender, '') as gender, "
                                                + "COALESCE(u.preferred_gender, '') as preferred_gender, "
                                                + "COALESCE(u.age, '') as age, "
                                                + "COALESCE(u.interests, '') as interests, "
                                                + "COALESCE(u.email_verified, false) as email_verified, "
                                                + "COALESCE(u.preference_unlocked, 0) as preference_unlocked, "
                                                + "COALESCE(u.daily_matches_used, 0) as daily_matches_used, "
                                                + "COALESCE(u.referral_count, 0) as referral_count, "
                                                + "u.created_at, u.updated_at, "
                                                + "COALESCE(u.is_premium, false) as is_premium, "
                                                + "COALESCE(u.premium_plan, '') as premium_plan, "
                                                + "u.premium_expires_at, "
                                                + "(SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id) as messages_sent, "
                                                + "(SELECT COUNT(*) FROM chat_rooms cr WHERE cr.user1id = u.id OR cr.user2id = u.id) as total_chats, "
                                                + "(SELECT COUNT(*) FROM friends f WHERE f.user_id = u.id) as friend_count, "
                                                + "(SELECT b.id FROM bans b WHERE b.user_id = u.id "
                                                + "  AND (b.is_permanent = true OR b.expires_at > NOW()) LIMIT 1) as active_ban_id "
                                                + "FROM users u" + searchWhere
                                                + " ORDER BY u.created_at DESC LIMIT ? OFFSET ?",
                                size, offset);
        }

        public long getTotalUsersCount(String search) {
                // ✅ FIX 2: safe() used to prevent potential null auto-unboxing
                if (search != null && !search.isBlank()) {
                        return safe(jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM users WHERE username LIKE ? OR email LIKE ?",
                                        Long.class, "%" + search + "%", "%" + search + "%"));
                }
                return safe(jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM users", Long.class));
        }

        public Map<String, Object> getUserDetail(Long userId) {
                Map<String, Object> user = new LinkedHashMap<>(
                                jdbcTemplate.queryForMap("SELECT * FROM users WHERE id = ?", userId));

                user.put("banHistory", jdbcTemplate.queryForList(
                                "SELECT * FROM bans WHERE user_id = ? ORDER BY created_at DESC", userId));

                user.put("reportsMade", jdbcTemplate.queryForList(
                                "SELECT r.*, u.username as reported_username FROM reports r "
                                                + "JOIN users u ON u.id = r.reported_user_id "
                                                + "WHERE r.reported_by_user_id = ? ORDER BY r.created_at DESC LIMIT 20",
                                userId));

                user.put("reportsReceived", jdbcTemplate.queryForList(
                                "SELECT r.*, u.username as reporter_username FROM reports r "
                                                + "JOIN users u ON u.id = r.reported_by_user_id "
                                                + "WHERE r.reported_user_id = ? ORDER BY r.created_at DESC LIMIT 20",
                                userId));

                user.put("recentChats", jdbcTemplate.queryForList(
                                "SELECT cr.id, cr.created_at, cr.room_type, "
                                                + "CASE WHEN cr.user1id = ? THEN cr.user2id ELSE cr.user1id END as partner_id, "
                                                + "u.username as partner_username "
                                                + "FROM chat_rooms cr "
                                                + "JOIN users u ON u.id = (CASE WHEN cr.user1id = ? THEN cr.user2id ELSE cr.user1id END) "
                                                + "WHERE cr.user1id = ? OR cr.user2id = ? "
                                                + "ORDER BY cr.created_at DESC LIMIT 10",
                                userId, userId, userId, userId));

                return user;
        }

        // ─── Analytics ───────────────────────────────────────────────────────────────

        public List<Map<String, Object>> getUsersByGender() {
                return jdbcTemplate.queryForList(
                                "SELECT COALESCE(preferred_gender, 'Not Set') as gender, COUNT(*) as count "
                                                + "FROM users GROUP BY preferred_gender ORDER BY count DESC");
        }

        public List<Map<String, Object>> getUsersByAge() {
                return jdbcTemplate.queryForList(
                                "SELECT COALESCE(age, 'Not Set') as age_group, COUNT(*) as count "
                                                + "FROM users GROUP BY age ORDER BY count DESC LIMIT 20");
        }

        public List<Map<String, Object>> getRegistrationTrend() {
                return jdbcTemplate.queryForList(
                                "SELECT DATE(created_at) as date, COUNT(*) as count "
                                                + "FROM users WHERE created_at >= NOW() - INTERVAL '30 days' "
                                                + "GROUP BY DATE(created_at) ORDER BY date ASC");
        }

        public List<Map<String, Object>> getMessageTrend() {
                return jdbcTemplate.queryForList(
                                "SELECT DATE(timestamp) as date, COUNT(*) as count "
                                                + "FROM messages WHERE timestamp >= NOW() - INTERVAL '30 days' "
                                                + "GROUP BY DATE(timestamp) ORDER BY date ASC");
        }

        // ─── Chat Monitoring ────────────────────────────────────────────────────────

        public List<Map<String, Object>> getChatRooms(int page, int size) {
                int offset = page * size;
                return jdbcTemplate.queryForList(
                                "SELECT cr.id, cr.room_type, cr.created_at, cr.last_message_at, "
                                                + "u1.username as user1_name, u1.email as user1_email, "
                                                + "u2.username as user2_name, u2.email as user2_email, "
                                                + "(SELECT COUNT(*) FROM messages m WHERE m.chat_room_id = cr.id) as message_count, "
                                                + "(SELECT COUNT(*) FROM messages m WHERE m.chat_room_id = cr.id AND m.is_reported = true) as reported_messages "
                                                + "FROM chat_rooms cr "
                                                + "JOIN users u1 ON u1.id = cr.user1id "
                                                + "JOIN users u2 ON u2.id = cr.user2id "
                                                + "ORDER BY cr.created_at DESC LIMIT ? OFFSET ?",
                                size, offset);
        }

        public List<Map<String, Object>> getChatMessages(Long chatRoomId) {
                return jdbcTemplate.queryForList(
                                "SELECT m.id, m.content, m.message_type, m.timestamp, m.is_reported, "
                                                + "u.username as sender_name, u.email as sender_email "
                                                + "FROM messages m JOIN users u ON u.id = m.sender_id "
                                                + "WHERE m.chat_room_id = ? ORDER BY m.timestamp ASC",
                                chatRoomId);
        }

        @Transactional
        public void deleteChatRoom(Long chatRoomId) {
                jdbcTemplate.update(
                                "DELETE FROM reports WHERE message_id IN "
                                                + "(SELECT id FROM messages WHERE chat_room_id = ?)",
                                chatRoomId);
                jdbcTemplate.update("DELETE FROM messages WHERE chat_room_id = ?", chatRoomId);
                jdbcTemplate.update("DELETE FROM chat_rooms WHERE id = ?", chatRoomId);
        }

        // ─── Reports System ─────────────────────────────────────────────────────────

        public List<Map<String, Object>> getReports(String status, int page, int size) {
                int offset = page * size;
                String where = (status != null && !status.equals("ALL"))
                                ? " WHERE r.status = '" + status + "'"
                                : "";
                return jdbcTemplate.queryForList(
                                "SELECT r.id, r.reason, r.status, r.created_at, r.reviewed_at, r.admin_notes, "
                                                + "ru.username as reported_username, ru.email as reported_email, ru.id as reported_user_id, "
                                                + "rb.username as reporter_username, rb.email as reporter_email, "
                                                + "m.content as message_content, m.message_type, m.chat_room_id "
                                                + "FROM reports r "
                                                + "JOIN users ru ON ru.id = r.reported_user_id "
                                                + "JOIN users rb ON rb.id = r.reported_by_user_id "
                                                + "LEFT JOIN messages m ON m.id = r.message_id"
                                                + where
                                                + " ORDER BY r.created_at DESC LIMIT ? OFFSET ?",
                                size, offset);
        }

        public void updateReportStatus(Long reportId, String status, String adminNotes) {
                jdbcTemplate.update(
                                "UPDATE reports SET status = ?, admin_notes = ?, reviewed_at = NOW() WHERE id = ?",
                                status, adminNotes, reportId);
        }

        // ─── Ban System ─────────────────────────────────────────────────────────────

        public List<Map<String, Object>> getBannedUsers() {
                return jdbcTemplate.queryForList(
                                "SELECT b.id as ban_id, b.reason, b.violation_count, b.created_at, "
                                                + "b.expires_at, b.is_permanent, "
                                                + "u.id as user_id, u.username, u.email "
                                                + "FROM bans b JOIN users u ON u.id = b.user_id "
                                                + "WHERE b.is_permanent = true OR b.expires_at > NOW() "
                                                + "ORDER BY b.created_at DESC");
        }

        @Transactional
        public void banUser(Long userId, String reason, boolean isPermanent, int durationHours) {
                LocalDateTime expiresAt = isPermanent
                                ? LocalDateTime.now().plusYears(100)
                                : LocalDateTime.now().plusHours(durationHours);
                // Clear previous bans for this user first (replace with new one)
                jdbcTemplate.update("DELETE FROM bans WHERE user_id = ?", userId);
                jdbcTemplate.update(
                                "INSERT INTO bans (user_id, reason, violation_count, is_permanent, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                                userId, reason, isPermanent ? 3 : 1, isPermanent, expiresAt, LocalDateTime.now());
        }

        @Transactional
        public void unbanUser(Long userId) {
                jdbcTemplate.update(
                                "DELETE FROM bans WHERE user_id = ? AND (is_permanent = true OR expires_at > NOW())",
                                userId);
        }

        // ─── User Controls ──────────────────────────────────────────────────────────

        @Transactional
        public void deleteUser(Long userId) {
                jdbcTemplate.update(
                                "DELETE FROM reports WHERE reported_user_id = ? OR reported_by_user_id = ?",
                                userId, userId);
                jdbcTemplate.update(
                                "UPDATE messages SET reported_by_user_id = NULL WHERE reported_by_user_id = ?",
                                userId);
                jdbcTemplate.update(
                                "DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?",
                                userId, userId);
                jdbcTemplate.update(
                                "DELETE FROM chat_rooms WHERE user1id = ? OR user2id = ?",
                                userId, userId);
                jdbcTemplate.update(
                                "DELETE FROM friend_requests WHERE sender_id = ? OR receiver_id = ?",
                                userId, userId);
                jdbcTemplate.update(
                                "DELETE FROM friends WHERE user_id = ? OR friend_id = ?",
                                userId, userId);
                jdbcTemplate.update("DELETE FROM bans WHERE user_id = ?", userId);
                jdbcTemplate.update(
                                "UPDATE invites SET used_by_user_id = NULL WHERE used_by_user_id = ?",
                                userId);
                jdbcTemplate.update("DELETE FROM invites WHERE created_by_user_id = ?", userId);
                jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId);
        }

        public void promoteUser(Long userId) {
                jdbcTemplate.update(
                                "UPDATE users SET preference_unlocked = 1, is_premium = true, premium_plan = 'ADMIN_GIFT', premium_expires_at = NULL WHERE id = ?",
                                userId);
        }

        public void demoteUser(Long userId) {
                jdbcTemplate.update(
                                "UPDATE users SET preference_unlocked = 0, is_premium = false, premium_plan = NULL, premium_expires_at = NULL WHERE id = ?",
                                userId);
        }

        public void updateUserInfo(Long userId, String username, String email) {
                if (username != null && !username.isBlank()) {
                        jdbcTemplate.update("UPDATE users SET username = ? WHERE id = ?", username, userId);
                }
                if (email != null && !email.isBlank()) {
                        jdbcTemplate.update("UPDATE users SET email = ? WHERE id = ?", email, userId);
                }
        }

        // ─── Top Stats ───────────────────────────────────────────────────────────────

        public List<Map<String, Object>> getTopChatters() {
                return jdbcTemplate.queryForList(
                                "SELECT u.id, u.username, u.email, COUNT(m.id) as message_count "
                                                + "FROM users u LEFT JOIN messages m ON m.sender_id = u.id "
                                                + "GROUP BY u.id, u.username, u.email "
                                                + "ORDER BY message_count DESC LIMIT 10");
        }

        public List<Map<String, Object>> getMostReportedUsers() {
                return jdbcTemplate.queryForList(
                                "SELECT u.id, u.username, u.email, COUNT(r.id) as report_count "
                                                + "FROM users u LEFT JOIN reports r ON r.reported_user_id = u.id "
                                                + "GROUP BY u.id, u.username, u.email "
                                                + "HAVING report_count > 0 "
                                                + "ORDER BY report_count DESC LIMIT 10");
        }

        public List<Map<String, Object>> getRecentActivity() {
                return jdbcTemplate.queryForList(
                                "SELECT 'NEW_USER' as type, u.username as detail, u.created_at as time "
                                                + "FROM users u WHERE u.created_at >= NOW() - INTERVAL '24 hours' "
                                                + "UNION ALL "
                                                + "SELECT 'NEW_REPORT' as type, CONCAT('Report on ', u.username) as detail, r.created_at as time "
                                                + "FROM reports r JOIN users u ON u.id = r.reported_user_id "
                                                + "WHERE r.created_at >= NOW() - INTERVAL '24 hours' "
                                                + "UNION ALL "
                                                + "SELECT 'NEW_BAN' as type, CONCAT('Banned: ', u.username) as detail, b.created_at as time "
                                                + "FROM bans b JOIN users u ON u.id = b.user_id "
                                                + "WHERE b.created_at >= NOW() - INTERVAL '24 hours' "
                                                + "ORDER BY time DESC LIMIT 20");
        }

        // ─── Admin Ban Action (from report review) ─────────────────────────────────

        /**
         * Admin report se action leta hai:
         * action = "WARNING" → sirf email warning, koi ban nahi
         * action = "BAN_15" → 15 din ka ban + permanent ban warning email
         * action = "BAN_PERM" → permanent ban + email
         */
        @Transactional
        public Map<String, Object> adminBanAction(Long reportId, Long reportedUserId, String action, String reason) {
                String userEmail = "";
                String username = "";
                try {
                        Map<String, Object> user = jdbcTemplate.queryForMap(
                                        "SELECT email, username FROM users WHERE id = ?", reportedUserId);
                        userEmail = (String) user.get("email");
                        username = (String) user.get("username");
                } catch (Exception e) {
                        throw new RuntimeException("User not found");
                }

                // Apply ban based on action
                if ("BAN_15".equals(action)) {
                        jdbcTemplate.update("DELETE FROM bans WHERE user_id = ?", reportedUserId);
                        jdbcTemplate.update(
                                        "INSERT INTO bans (user_id, reason, violation_count, is_permanent, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                                        reportedUserId, reason, 2, false,
                                        LocalDateTime.now().plusDays(15), LocalDateTime.now());
                } else if ("BAN_PERM".equals(action)) {
                        jdbcTemplate.update("DELETE FROM bans WHERE user_id = ?", reportedUserId);
                        jdbcTemplate.update(
                                        "INSERT INTO bans (user_id, reason, violation_count, is_permanent, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                                        reportedUserId, reason, 3, true,
                                        LocalDateTime.now().plusYears(100), LocalDateTime.now());
                }
                // WARNING — no ban, just email

                // Mark report as REVIEWED
                jdbcTemplate.update("UPDATE reports SET status = 'REVIEWED', reviewed_at = ? WHERE id = ?",
                                LocalDateTime.now(), reportId);

                // Send email via Apps Script (fire-and-forget)
                sendBanEmailViaScript(userEmail, username, action, reason);

                Map<String, Object> result = new HashMap<>();
                result.put("action", action);
                result.put("email", userEmail);
                result.put("username", username);
                return result;
        }

        /**
         * Calls Apps Script to send ban/warning email to user
         */
        private void sendBanEmailViaScript(String email, String username, String banType, String reason) {
                try {
                        String url = appsScriptUrl
                                        + "?action=sendBanEmail"
                                        + "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                                        + "&username=" + URLEncoder.encode(username, StandardCharsets.UTF_8)
                                        + "&banType=" + URLEncoder.encode(banType, StandardCharsets.UTF_8)
                                        + "&reason=" + URLEncoder.encode(reason, StandardCharsets.UTF_8);
                        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                        conn.setRequestMethod("GET");
                        conn.setConnectTimeout(5000);
                        conn.setReadTimeout(5000);
                        conn.getResponseCode(); // fire & check
                        conn.disconnect();
                } catch (Exception e) {
                        // Non-critical — log but don't fail
                        System.err.println("Ban email failed: " + e.getMessage());
                }
        }

        // ─── Get chat messages between two users in a room ──────────────────────────

        public List<Map<String, Object>> getChatMessagesByRoom(Long chatRoomId) {
                return jdbcTemplate.queryForList(
                                "SELECT m.id, m.sender_id, u.username as sender_username, "
                                                + "m.content, m.message_type, m.timestamp, m.is_reported "
                                                + "FROM messages m "
                                                + "JOIN users u ON u.id = m.sender_id "
                                                + "WHERE m.chat_room_id = ? "
                                                + "ORDER BY m.timestamp ASC",
                                chatRoomId);
        }

        // ─── Link violation tracking (called from ChatController) ──────────────────
        /**
         * users table mein link_violation_count column use karta hai (permanent
         * counter).
         * Schema: ALTER TABLE users ADD COLUMN IF NOT EXISTS link_violation_count INT
         * DEFAULT 0;
         *
         * Returns new count: 1=warning, 2=15d ban, 3+=perm ban
         */
        @Transactional
        public int trackLinkViolation(Long userId) {
                // Step 1: Increment counter directly in DB (atomic, concurrent-safe)
                jdbcTemplate.update(
                                "UPDATE users SET link_violation_count = COALESCE(link_violation_count, 0) + 1 WHERE id = ?",
                                userId);

                // Step 2: Read new count
                // COALESCE in SQL ensures result is never null → use int directly
                int newCount = jdbcTemplate.queryForObject(
                                "SELECT COALESCE(link_violation_count, 0) FROM users WHERE id = ?",
                                Integer.class, userId);

                // Step 3: Get user info for email
                Map<String, Object> user = jdbcTemplate.queryForMap(
                                "SELECT email, username FROM users WHERE id = ?", userId);
                String email = (String) user.get("email");
                String username = (String) user.get("username");
                String reason = "Attempted to share a link in anonymous chat (violation #" + newCount + ")";

                if (newCount == 1) {
                        // First offence: warning only, NO ban yet
                        sendBanEmailViaScript(email, username, "WARNING", reason);

                } else if (newCount == 2) {
                        // Second offence: 15-day ban
                        jdbcTemplate.update("DELETE FROM bans WHERE user_id = ?", userId);
                        jdbcTemplate.update(
                                        "INSERT INTO bans (user_id, reason, violation_count, is_permanent, expires_at, created_at) "
                                                        + "VALUES (?, ?, ?, ?, ?, ?)",
                                        userId, reason, 2, false,
                                        LocalDateTime.now().plusDays(15), LocalDateTime.now());
                        sendBanEmailViaScript(email, username, "BAN_15", reason);

                } else {
                        // Third offence onwards: permanent ban
                        jdbcTemplate.update("DELETE FROM bans WHERE user_id = ?", userId);
                        jdbcTemplate.update(
                                        "INSERT INTO bans (user_id, reason, violation_count, is_permanent, expires_at, created_at) "
                                                        + "VALUES (?, ?, ?, ?, ?, ?)",
                                        userId, reason, newCount, true,
                                        LocalDateTime.now().plusYears(100), LocalDateTime.now());
                        sendBanEmailViaScript(email, username, "BAN_PERM", reason);
                }

                return newCount;
        }

}