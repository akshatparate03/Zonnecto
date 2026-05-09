package com.zonnecto.websocket;

import com.zonnecto.dto.MessageDTO;
import com.zonnecto.entity.ChatRoom;
import com.zonnecto.entity.Message;
import com.zonnecto.repository.ChatRoomRepository;
import com.zonnecto.repository.MessageRepository;
import com.zonnecto.service.BanService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class ChatMessageHandler {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BanService banService;

    @MessageMapping("/chat/{chatRoomId}")
    @SendTo("/topic/chat/{chatRoomId}")
    public MessageDTO handleMessage(@DestinationVariable Long chatRoomId, ChatMessage message) {
        if (banService.isUserBanned(message.getSenderId()))
            return null;

        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(chatRoomId);
        if (roomOpt.isEmpty())
            return null;

        ChatRoom room = roomOpt.get();

        // 2-min media restriction sirf anonymous chats ke liye — friend chats exempt
        // hain
        if (("IMAGE".equals(message.getMessageType()) || "FILE".equals(message.getMessageType()))
                && !"FRIEND_CHAT".equals(room.getRoomType())) {
            long minutes = java.time.temporal.ChronoUnit.MINUTES.between(room.getCreatedAt(), LocalDateTime.now());
            if (minutes < 2) {
                messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId,
                        new MessageDTO(null, message.getSenderId(), message.getRecipientId(),
                                "Media sharing available after 2 minutes", null, "TEXT", chatRoomId,
                                LocalDateTime.now(), false));
                return null;
            }
        }

        Message msg = Message.builder()
                .senderId(message.getSenderId())
                .recipientId(message.getRecipientId())
                .content(message.getContent())
                .mediaUrl(message.getMediaUrl())
                .messageType(message.getMessageType() != null ? message.getMessageType() : "TEXT")
                .chatRoomId(chatRoomId)
                .timestamp(LocalDateTime.now())
                .isReported(false)
                .build();

        messageRepository.save(msg);
        room.setLastMessageAt(LocalDateTime.now());
        chatRoomRepository.save(room);

        return MessageDTO.builder()
                .id(msg.getId())
                .senderId(msg.getSenderId())
                .recipientId(msg.getRecipientId())
                .content(msg.getContent())
                .mediaUrl(msg.getMediaUrl())
                .messageType(msg.getMessageType())
                .chatRoomId(msg.getChatRoomId())
                .timestamp(msg.getTimestamp())
                .edited(msg.getEdited())
                .build();
    }

    // ─── WS: Edit message — broadcast to both users ───────────────────────────
    @MessageMapping("/chat/{chatRoomId}/edit")
    @SendTo("/topic/chat/{chatRoomId}/edit")
    public EditEvent handleEdit(@DestinationVariable Long chatRoomId, EditEvent event) {
        // REST API already saved to DB; yeh sirf real-time broadcast ke liye
        return event;
    }

    // ─── WS: Delete message — broadcast to both users ────────────────────────
    @MessageMapping("/chat/{chatRoomId}/delete")
    @SendTo("/topic/chat/{chatRoomId}/delete")
    public DeleteEvent handleDelete(@DestinationVariable Long chatRoomId, DeleteEvent event) {
        // REST API already deleted from DB; yeh sirf real-time broadcast ke liye
        return event;
    }

    /**
     * User ne chat chod di - partner ko notify karo
     */
    @MessageMapping("/chat/{chatRoomId}/leave")
    public void handleLeave(@DestinationVariable Long chatRoomId, LeaveMessage message) {
        // Partner ko notify karo via room status topic
        messagingTemplate.convertAndSend(
                "/topic/room/" + chatRoomId + "/status",
                Map.of("event", "PARTNER_LEFT", "userId", message.getUserId()));
    }

    /**
     * User chat page open kiya - partner ko ONLINE notify karo
     */
    @MessageMapping("/chat/{chatRoomId}/online")
    public void handleOnline(@DestinationVariable Long chatRoomId, PresenceMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/room/" + chatRoomId + "/status",
                Map.of("event", "PARTNER_ONLINE", "userId", message.getUserId()));
    }

    /**
     * User chat page se gaya (tab closed / navigated away) - partner ko OFFLINE
     * notify karo
     */
    @MessageMapping("/chat/{chatRoomId}/offline")
    public void handleOffline(@DestinationVariable Long chatRoomId, PresenceMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/room/" + chatRoomId + "/status",
                Map.of("event", "PARTNER_OFFLINE", "userId", message.getUserId()));
    }

    /**
     * Premium user ne reconnect request bheji — partner ko DIRECTLY notify karo
     * Partner chat page pe ho ya home page pe — uske personal topic pe bhejo
     */
    @MessageMapping("/chat/{chatRoomId}/reconnect-request")
    public void handleReconnectRequest(@DestinationVariable Long chatRoomId, LeaveMessage message) {
        // Room fetch karo taaki partner ka userId nikaal sakein
        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(chatRoomId);
        if (roomOpt.isEmpty())
            return;

        ChatRoom room = roomOpt.get();
        Long senderId = message.getUserId();

        // Partner = jo sender nahi hai
        Long partnerId = room.getUser1Id().equals(senderId) ? room.getUser2Id() : room.getUser1Id();

        // Partner ke personal topic pe bhejo — woh kahi bhi ho (home/chat) sun sakta
        // hai
        messagingTemplate.convertAndSend(
                "/topic/user/" + partnerId + "/reconnect",
                Map.of("event", "RECONNECT_REQUEST", "userId", senderId, "chatRoomId", chatRoomId));
    }

    /**
     * Partner ne reconnect accept/reject kiya — requester ko notify karo
     */
    @MessageMapping("/chat/{chatRoomId}/reconnect-response")
    public void handleReconnectResponse(@DestinationVariable Long chatRoomId, ReconnectResponse response) {
        String event = response.isAccepted() ? "RECONNECT_ACCEPTED" : "RECONNECT_REJECTED";
        messagingTemplate.convertAndSend(
                "/topic/room/" + chatRoomId + "/status",
                Map.of("event", event));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconnectResponse {
        private boolean accepted;
        private Long chatRoomId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private Long senderId;
        private Long recipientId;
        private String content;
        private String mediaUrl;
        private String messageType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveMessage {
        private Long userId;
        private Long chatRoomId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PresenceMessage {
        private Long userId;
        private Long chatRoomId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EditEvent {
        private Long messageId;
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeleteEvent {
        private Long messageId;
    }
}