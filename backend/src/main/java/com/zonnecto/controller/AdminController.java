package com.zonnecto.controller;

import com.zonnecto.repository.UserRepository;
import com.zonnecto.service.AdminService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Admin Auth Guard ───────────────────────────────────────────────────────
    // ✅ FINAL FIX: JwtAuthenticationFilter already validates token and sets
    // Authentication with userId as principal and email as details.
    // No manual JWT parsing needed — use Spring Security Authentication directly.

    private boolean isAdmin(Authentication auth) {
        if (auth == null || !auth.isAuthenticated())
            return false;
        try {
            // JwtAuthenticationFilter sets email in authentication.setDetails(email)
            Object details = auth.getDetails();
            String email = (details instanceof String s) ? s : null;
            if (email != null && !email.isBlank() && adminService.isAdmin(email))
                return true;

            // Fallback: get email from DB using userId (principal)
            Long userId = (Long) auth.getPrincipal();
            String dbEmail = userRepository.findById(userId)
                    .map(u -> u.getEmail()).orElse(null);
            return adminService.isAdmin(dbEmail);
        } catch (Exception e) {
            return false;
        }
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
    }

    // ─── Dashboard Stats ────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/stats/gender")
    public ResponseEntity<?> getUsersByGender(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getUsersByGender());
    }

    @GetMapping("/stats/age")
    public ResponseEntity<?> getUsersByAge(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getUsersByAge());
    }

    @GetMapping("/stats/registration-trend")
    public ResponseEntity<?> getRegistrationTrend(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getRegistrationTrend());
    }

    @GetMapping("/stats/message-trend")
    public ResponseEntity<?> getMessageTrend(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getMessageTrend());
    }

    @GetMapping("/stats/top-chatters")
    public ResponseEntity<?> getTopChatters(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getTopChatters());
    }

    @GetMapping("/stats/most-reported")
    public ResponseEntity<?> getMostReportedUsers(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getMostReportedUsers());
    }

    @GetMapping("/stats/recent-activity")
    public ResponseEntity<?> getRecentActivity(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getRecentActivity());
    }

    // ─── User Management ────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        if (!isAdmin(auth))
            return unauthorized();
        List<Map<String, Object>> users = adminService.getAllUsers(page, size, search);
        long total = adminService.getTotalUsersCount(search);
        return ResponseEntity.ok(Map.of("users", users, "total", total, "page", page, "size", size));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetail(Authentication auth, @PathVariable Long userId) {
        if (!isAdmin(auth))
            return unauthorized();
        try {
            return ResponseEntity.ok(adminService.getUserDetail(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(
            Authentication auth,
            @PathVariable Long userId,
            @RequestBody UpdateUserRequest request) {
        if (!isAdmin(auth))
            return unauthorized();
        adminService.updateUserInfo(userId, request.getUsername(), request.getEmail());
        return ResponseEntity.ok(Map.of("message", "User updated successfully"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(Authentication auth, @PathVariable Long userId) {
        if (!isAdmin(auth))
            return unauthorized();
        adminService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PostMapping("/users/{userId}/promote")
    public ResponseEntity<?> promoteUser(Authentication auth, @PathVariable Long userId) {
        if (!isAdmin(auth))
            return unauthorized();
        adminService.promoteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User promoted to premium"));
    }

    @PostMapping("/users/{userId}/demote")
    public ResponseEntity<?> demoteUser(Authentication auth, @PathVariable Long userId) {
        if (!isAdmin(auth))
            return unauthorized();
        adminService.demoteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User demoted to normal"));
    }

    // ─── Ban System ─────────────────────────────────────────────────────────────

    @GetMapping("/bans")
    public ResponseEntity<?> getBannedUsers(Authentication auth) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getBannedUsers());
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(
            Authentication auth,
            @PathVariable Long userId,
            @RequestBody BanRequest request) {
        if (!isAdmin(auth))
            return unauthorized();
        adminService.banUser(userId, request.getReason(), request.isPermanent(), request.getDurationHours());
        return ResponseEntity.ok(Map.of("message", "User banned successfully"));
    }

    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(Authentication auth, @PathVariable Long userId) {
        if (!isAdmin(auth))
            return unauthorized();
        adminService.unbanUser(userId);
        return ResponseEntity.ok(Map.of("message", "User unbanned successfully"));
    }

    // ─── Chat Monitoring ────────────────────────────────────────────────────────

    @GetMapping("/chats")
    public ResponseEntity<?> getChatRooms(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getChatRooms(page, size));
    }

    @GetMapping("/chats/{chatRoomId}/messages")
    public ResponseEntity<?> getChatMessages(Authentication auth, @PathVariable Long chatRoomId) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getChatMessagesByRoom(chatRoomId));
    }

    @DeleteMapping("/chats/{chatRoomId}")
    public ResponseEntity<?> deleteChatRoom(Authentication auth, @PathVariable Long chatRoomId) {
        if (!isAdmin(auth))
            return unauthorized();
        adminService.deleteChatRoom(chatRoomId);
        return ResponseEntity.ok(Map.of("message", "Chat deleted successfully"));
    }

    // ─── Reports ────────────────────────────────────────────────────────────────

    @GetMapping("/reports")
    public ResponseEntity<?> getReports(
            Authentication auth,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (!isAdmin(auth))
            return unauthorized();
        return ResponseEntity.ok(adminService.getReports(status, page, size));
    }

    @PutMapping("/reports/{reportId}")
    public ResponseEntity<?> updateReport(
            Authentication auth,
            @PathVariable Long reportId,
            @RequestBody UpdateReportRequest request) {
        if (!isAdmin(auth))
            return unauthorized();
        adminService.updateReportStatus(reportId, request.getStatus(), request.getAdminNotes());
        return ResponseEntity.ok(Map.of("message", "Report updated"));
    }

    @PostMapping("/reports/{reportId}/action")
    public ResponseEntity<?> reportBanAction(
            Authentication auth,
            @PathVariable Long reportId,
            @RequestBody BanActionRequest request) {
        if (!isAdmin(auth))
            return unauthorized();
        try {
            Map<String, Object> result = adminService.adminBanAction(
                    reportId, request.getReportedUserId(), request.getAction(), request.getReason());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Broadcast ──────────────────────────────────────────────────────────────

    @PostMapping("/broadcast")
    public ResponseEntity<?> sendBroadcast(
            Authentication auth,
            @RequestBody BroadcastRequest request) {
        if (!isAdmin(auth))
            return unauthorized();
        if (request.getMessage() == null || request.getMessage().isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));

        // Broadcast to ALL connected users via WebSocket
        messagingTemplate.convertAndSend("/topic/broadcast", Map.of(
                "message", request.getMessage(),
                "sentAt", LocalDateTime.now().toString(),
                "sentBy", "Admin"));

        return ResponseEntity.ok(Map.of("message", "Broadcast sent successfully"));
    }

    // ─── Inner DTOs ─────────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BanRequest {
        private String reason;
        private boolean permanent;
        private int durationHours = 24;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        private String username;
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateReportRequest {
        private String status;
        private String adminNotes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BanActionRequest {
        private Long reportedUserId;
        private String action;
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BroadcastRequest {
        private String message;
    }
}