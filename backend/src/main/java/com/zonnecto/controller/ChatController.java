package com.zonnecto.controller;

import com.zonnecto.dto.MessageDTO;
import com.zonnecto.entity.ChatRoom;
import com.zonnecto.entity.Message;
import com.zonnecto.repository.ChatRoomRepository;
import com.zonnecto.repository.MessageRepository;
import com.zonnecto.repository.UserRepository;
import com.zonnecto.service.AdminService;
import com.zonnecto.service.BanService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    @SuppressWarnings("unused")
    private final UserRepository userRepository;
    private final BanService banService;
    private final AdminService adminService;
    private final JdbcTemplate jdbcTemplate; // ✅ FIX: reports table INSERT ke liye
    private final SimpMessagingTemplate messagingTemplate; // ✅ Image upload WS broadcast

    @GetMapping("/rooms")
    public ResponseEntity<?> getUserChatRooms(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        if (banService.isUserBanned(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));
        }

        List<ChatRoom> rooms = chatRoomRepository.findAllForUser(userId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/messages/{chatRoomId}")
    public ResponseEntity<?> getMessages(@PathVariable Long chatRoomId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        if (banService.isUserBanned(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));
        }

        Optional<ChatRoom> room = chatRoomRepository.findById(chatRoomId);
        if (room.isEmpty() || (!room.get().getUser1Id().equals(userId) && !room.get().getUser2Id().equals(userId))) {
            return ResponseEntity.status(403).body(new ErrorResponse("Unauthorized"));
        }

        List<Message> messages = messageRepository.findByChatRoomIdOrderByTimestampDesc(chatRoomId);
        List<MessageDTO> dtos = messages.stream()
                .map(m -> MessageDTO.builder()
                        .id(m.getId())
                        .senderId(m.getSenderId())
                        .recipientId(m.getRecipientId())
                        .content(m.getContent())
                        .mediaUrl(m.getMediaUrl())
                        .messageType(m.getMessageType())
                        .chatRoomId(m.getChatRoomId())
                        .timestamp(m.getTimestamp())
                        .edited(m.getEdited())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/report/{messageId}")
    public ResponseEntity<?> reportMessage(@PathVariable Long messageId,
            @RequestBody ReportRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Message not found"));
        }

        Message message = messageOpt.get();

        // Mark message as reported
        message.setIsReported(true);
        message.setReportedByUserId(userId);
        messageRepository.save(message);

        // ✅ INSERT into reports table with chat_room_id (Report entity mein nullable
        // field hai)
        jdbcTemplate.update(
                "INSERT INTO reports (reported_user_id, reported_by_user_id, message_id, chat_room_id, reason, status, created_at) "
                        + "VALUES (?, ?, ?, ?, ?, 'PENDING', NOW())",
                message.getSenderId(),
                userId,
                messageId,
                message.getChatRoomId(), // nullable — Report entity mein @Column (no nullable=false)
                request.getReason() != null && !request.getReason().isBlank()
                        ? request.getReason()
                        : "No reason provided");

        return ResponseEntity.ok(new SuccessResponse("Report submitted successfully"));
    }

    // ─── PUT /chat/message/{messageId} — Edit message (sender only) ──────────
    @PutMapping("/message/{messageId}")
    public ResponseEntity<?> editMessage(@PathVariable Long messageId,
            @RequestBody EditMessageRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        Optional<Message> msgOpt = messageRepository.findById(messageId);
        if (msgOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Message not found"));
        }
        Message message = msgOpt.get();

        // Sirf sender hi edit kar sakta hai
        if (!message.getSenderId().equals(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("You can only edit your own messages"));
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Content cannot be empty"));
        }

        message.setContent(request.getContent().trim());
        message.setEdited(true);
        messageRepository.save(message);

        return ResponseEntity.ok(new SuccessResponse("Message edited"));
    }

    // ─── DELETE /chat/message/{messageId} — Delete for both sides (sender only) ─
    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        Optional<Message> msgOpt = messageRepository.findById(messageId);
        if (msgOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Message not found"));
        }
        Message message = msgOpt.get();

        // Sirf sender hi delete kar sakta hai
        if (!message.getSenderId().equals(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("You can only delete your own messages"));
        }

        messageRepository.deleteById(messageId);
        return ResponseEntity.ok(new SuccessResponse("Message deleted"));
    }

    // ─── POST /chat/upload-image/{chatRoomId} — Upload photo & broadcast via WS
    // ──────
    @PostMapping("/upload-image/{chatRoomId}")
    public ResponseEntity<?> uploadImage(@PathVariable Long chatRoomId,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        if (banService.isUserBanned(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));
        }

        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(chatRoomId);
        if (roomOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Chat room not found"));
        }
        ChatRoom room = roomOpt.get();

        if (!room.getUser1Id().equals(userId) && !room.getUser2Id().equals(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("Unauthorized"));
        }

        // 2-min restriction sirf anonymous chats ke liye — friend chats exempt
        if (!"FRIEND_CHAT".equals(room.getRoomType())) {
            long minutes = java.time.temporal.ChronoUnit.MINUTES.between(room.getCreatedAt(), LocalDateTime.now());
            if (minutes < 2) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Media sharing available after 2 minutes"));
            }
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Image must be under 5MB"));
        }

        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "chat");
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String ext = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
                    : ".jpg";
            String filename = chatRoomId + "_" + userId + "_" + UUID.randomUUID() + ext;
            Path filepath = uploadDir.resolve(filename);
            Files.write(filepath, file.getBytes());

            String imageUrl = "/uploads/chat/" + filename;
            Long recipientId = room.getUser1Id().equals(userId) ? room.getUser2Id() : room.getUser1Id();

            Message msg = Message.builder()
                    .senderId(userId)
                    .recipientId(recipientId)
                    .content(imageUrl)
                    .mediaUrl(imageUrl)
                    .messageType("IMAGE")
                    .chatRoomId(chatRoomId)
                    .timestamp(LocalDateTime.now())
                    .isReported(false)
                    .edited(false)
                    .build();
            messageRepository.save(msg);

            room.setLastMessageAt(LocalDateTime.now());
            chatRoomRepository.save(room);

            MessageDTO dto = MessageDTO.builder()
                    .id(msg.getId())
                    .senderId(msg.getSenderId())
                    .recipientId(msg.getRecipientId())
                    .content(msg.getContent())
                    .mediaUrl(msg.getMediaUrl())
                    .messageType("IMAGE")
                    .chatRoomId(chatRoomId)
                    .timestamp(msg.getTimestamp())
                    .edited(false)
                    .build();
            messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, dto);

            return ResponseEntity.ok(dto);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Image upload failed: " + e.getMessage()));
        }
    }

    // ─── POST /chat/link-ban — Track link violation, auto-ban if needed ──────────
    @PostMapping("/link-ban")
    public ResponseEntity<?> reportLinkViolation(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        try {
            int violationCount = adminService.trackLinkViolation(userId);
            String banType;
            if (violationCount == 1)
                banType = "WARNING";
            else if (violationCount == 2)
                banType = "BAN_15";
            else
                banType = "BAN_PERM";
            return ResponseEntity.ok(new LinkViolationResponse(violationCount, banType));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportRequest {
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EditMessageRequest {
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private String error;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuccessResponse {
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkViolationResponse {
        private int violationCount;
        private String banType; // WARNING | BAN_15 | BAN_PERM
    }
}