package com.zonnecto.controller;

import com.zonnecto.dto.UserDTO;
import com.zonnecto.entity.*;
import com.zonnecto.repository.*;
import com.zonnecto.service.BanService;
import jakarta.transaction.Transactional;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendsController {

    private final FriendRepository friendRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final MessageReadStatusRepository messageReadStatusRepository;
    private final BlockedUserRepository blockedUserRepository;
    private final BanService banService;

    // ─── GET FRIENDS (with unread count + last message, sorted by last msg time)
    // ───
    @GetMapping
    public ResponseEntity<?> getFriends(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        if (banService.isUserBanned(userId))
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));

        List<Friend> friends = friendRepository.findByUserId(userId);

        List<FriendWithChatDTO> result = friends.stream().map(f -> {
            Optional<User> uOpt = userRepository.findById(f.getFriendId());
            if (uOpt.isEmpty())
                return null;
            User u = uOpt.get();

            // Find FRIEND_CHAT room
            List<ChatRoom> rooms = chatRoomRepository.findAllBetweenUsers(userId, f.getFriendId());
            Optional<ChatRoom> roomOpt = rooms.stream()
                    .filter(r -> "FRIEND_CHAT".equals(r.getRoomType()))
                    .findFirst();

            String lastMessage = null;
            LocalDateTime lastMessageAt = null;
            int unreadCount = 0;

            if (roomOpt.isPresent()) {
                ChatRoom room = roomOpt.get();
                lastMessageAt = room.getLastMessageAt();

                // Get last message preview
                List<Message> msgs = messageRepository.findByChatRoomIdOrderByTimestampDesc(room.getId());
                if (!msgs.isEmpty()) {
                    Message lastMsg = msgs.get(0);
                    String content = lastMsg.getContent();
                    // IMAGE messages: show emoji instead of raw file path
                    if ("IMAGE".equalsIgnoreCase(lastMsg.getMessageType())
                            || (content != null && content.startsWith("/uploads/chat/"))) {
                        lastMessage = "📷 Photo";
                    } else {
                        lastMessage = content != null && content.length() > 40
                                ? content.substring(0, 40) + "..."
                                : content;
                    }

                    // Count unread (messages after last read time, sent by friend)
                    Optional<MessageReadStatus> readStatus = messageReadStatusRepository
                            .findByChatRoomIdAndUserId(room.getId(), userId);
                    LocalDateTime lastReadAt = readStatus.map(MessageReadStatus::getLastReadAt)
                            .orElse(LocalDateTime.MIN);

                    unreadCount = (int) msgs.stream()
                            .filter(m -> m.getSenderId().equals(f.getFriendId()))
                            .filter(m -> m.getTimestamp() != null && m.getTimestamp().isAfter(lastReadAt))
                            .count();
                }
            }

            boolean friendIsPremium = Boolean.TRUE.equals(u.getIsPremium()) &&
                    (u.getPremiumExpiresAt() == null || u.getPremiumExpiresAt().isAfter(java.time.LocalDateTime.now()));
            return new FriendWithChatDTO(
                    u.getId(), u.getUsername(), u.getEmail(),
                    lastMessage, lastMessageAt, unreadCount,
                    roomOpt.map(ChatRoom::getId).orElse(null), u.getDpUrl(), friendIsPremium);
        }).filter(Objects::nonNull).collect(Collectors.toList());

        // Sort: friends with recent messages first, then by last msg time desc
        result.sort((a, b) -> {
            if (a.getLastMessageAt() == null && b.getLastMessageAt() == null)
                return 0;
            if (a.getLastMessageAt() == null)
                return 1;
            if (b.getLastMessageAt() == null)
                return -1;
            return b.getLastMessageAt().compareTo(a.getLastMessageAt());
        });

        return ResponseEntity.ok(result);
    }

    // ─── SEND FRIEND REQUEST ───
    @PostMapping("/request/{friendId}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable Long friendId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        if (banService.isUserBanned(userId))
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));
        if (!userRepository.existsById(friendId))
            return ResponseEntity.badRequest().body(new ErrorResponse("User not found"));
        if (friendRepository.existsByUserIdAndFriendId(userId, friendId))
            return ResponseEntity.badRequest().body(new ErrorResponse("Already friends"));
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(userId, friendId))
            return ResponseEntity.badRequest().body(new ErrorResponse("You have blocked this user"));
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(friendId, userId))
            return ResponseEntity.badRequest().body(new ErrorResponse("Cannot send request"));

        Optional<FriendRequest> existing = friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(userId,
                friendId, "PENDING");
        if (existing.isPresent())
            return ResponseEntity.badRequest().body(new ErrorResponse("Request already sent"));

        friendRequestRepository
                .save(FriendRequest.builder().senderId(userId).receiverId(friendId).status("PENDING").build());
        return ResponseEntity.ok(new SuccessResponse("Friend request sent"));
    }

    // ─── GET PENDING REQUESTS (with sender username) ───
    @GetMapping("/requests")
    public ResponseEntity<?> getPendingRequests(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        if (banService.isUserBanned(userId))
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));

        List<FriendRequest> requests = friendRequestRepository.findByReceiverIdAndStatus(userId, "PENDING");
        List<FriendRequestDTO> dtos = requests.stream().map(req -> {
            User sender = userRepository.findById(req.getSenderId()).orElse(null);
            boolean senderPremium = sender != null && Boolean.TRUE.equals(sender.getIsPremium()) &&
                    (sender.getPremiumExpiresAt() == null
                            || sender.getPremiumExpiresAt().isAfter(java.time.LocalDateTime.now()));
            return new FriendRequestDTO(req.getId(), req.getSenderId(), req.getReceiverId(),
                    req.getStatus(), req.getCreatedAt(),
                    sender != null ? sender.getUsername() : "Unknown",
                    sender != null ? sender.getEmail() : "",
                    sender != null ? sender.getDpUrl() : null,
                    senderPremium);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // ─── ACCEPT REQUEST ───
    @PostMapping("/accept/{requestId}")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long requestId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        if (banService.isUserBanned(userId))
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));

        Optional<FriendRequest> reqOpt = friendRequestRepository.findById(requestId);
        if (reqOpt.isEmpty() || !reqOpt.get().getReceiverId().equals(userId))
            return ResponseEntity.status(403).body(new ErrorResponse("Unauthorized"));

        FriendRequest req = reqOpt.get();
        req.setStatus("ACCEPTED");
        req.setRespondedAt(LocalDateTime.now());
        friendRequestRepository.save(req);

        friendRepository.save(Friend.builder().userId(req.getSenderId()).friendId(req.getReceiverId()).build());
        friendRepository.save(Friend.builder().userId(req.getReceiverId()).friendId(req.getSenderId()).build());

        return ResponseEntity.ok(new SuccessResponse("Friend request accepted"));
    }

    // ─── REJECT REQUEST ───
    @PostMapping("/reject/{requestId}")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable Long requestId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        Optional<FriendRequest> reqOpt = friendRequestRepository.findById(requestId);
        if (reqOpt.isEmpty() || !reqOpt.get().getReceiverId().equals(userId))
            return ResponseEntity.status(403).body(new ErrorResponse("Unauthorized"));

        FriendRequest req = reqOpt.get();
        req.setStatus("REJECTED");
        req.setRespondedAt(LocalDateTime.now());
        friendRequestRepository.save(req);
        return ResponseEntity.ok(new SuccessResponse("Friend request rejected"));
    }

    // ─── REMOVE FRIEND ───
    @DeleteMapping("/remove/{friendId}")
    @Transactional
    public ResponseEntity<?> removeFriend(@PathVariable Long friendId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        friendRepository.findByUserIdAndFriendId(userId, friendId).ifPresent(friendRepository::delete);
        friendRepository.findByUserIdAndFriendId(friendId, userId).ifPresent(friendRepository::delete);

        return ResponseEntity.ok(new SuccessResponse("Friend removed"));
    }

    // ─── BLOCK USER ───
    @PostMapping("/block/{targetId}")
    @Transactional
    public ResponseEntity<?> blockUser(@PathVariable Long targetId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        // Block karo
        if (!blockedUserRepository.existsByBlockerIdAndBlockedId(userId, targetId)) {
            blockedUserRepository.save(BlockedUser.builder().blockerId(userId).blockedId(targetId).build());
        }

        // Friend se bhi remove karo (both directions)
        friendRepository.findByUserIdAndFriendId(userId, targetId).ifPresent(friendRepository::delete);
        friendRepository.findByUserIdAndFriendId(targetId, userId).ifPresent(friendRepository::delete);

        // Pending friend requests bhi cancel karo
        friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(userId, targetId, "PENDING")
                .ifPresent(r -> {
                    r.setStatus("REJECTED");
                    friendRequestRepository.save(r);
                });
        friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(targetId, userId, "PENDING")
                .ifPresent(r -> {
                    r.setStatus("REJECTED");
                    friendRequestRepository.save(r);
                });

        return ResponseEntity.ok(new SuccessResponse("User blocked"));
    }

    // ─── UNBLOCK USER ───
    @DeleteMapping("/unblock/{targetId}")
    @Transactional
    public ResponseEntity<?> unblockUser(@PathVariable Long targetId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        blockedUserRepository.findByBlockerIdAndBlockedId(userId, targetId)
                .ifPresent(blockedUserRepository::delete);
        return ResponseEntity.ok(new SuccessResponse("User unblocked"));
    }

    // ─── GET BLOCKED USERS ───
    @GetMapping("/blocked")
    public ResponseEntity<?> getBlockedUsers(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<BlockedUser> blocked = blockedUserRepository.findByBlockerId(userId);
        List<UserDTO> dtos = blocked.stream()
                .map(b -> userRepository.findById(b.getBlockedId()).map(u -> {
                    boolean blockedPremium = Boolean.TRUE.equals(u.getIsPremium()) &&
                            (u.getPremiumExpiresAt() == null
                                    || u.getPremiumExpiresAt().isAfter(java.time.LocalDateTime.now()));
                    return UserDTO.builder()
                            .id(u.getId())
                            .username(u.getUsername())
                            .email(u.getEmail())
                            .dpUrl(u.getDpUrl())
                            .isPremium(blockedPremium)
                            .build();
                }).orElse(null))
                .filter(Objects::nonNull).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ─── CHECK RELATIONSHIP STATUS (for Chat.jsx header buttons) ───
    @GetMapping("/status/{targetId}")
    public ResponseEntity<?> getRelationshipStatus(@PathVariable Long targetId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        boolean isFriend = friendRepository.existsByUserIdAndFriendId(userId, targetId);
        boolean isBlocked = blockedUserRepository.existsByBlockerIdAndBlockedId(userId, targetId);
        boolean blockedByThem = blockedUserRepository.existsByBlockerIdAndBlockedId(targetId, userId);
        boolean requestSent = friendRequestRepository
                .findBySenderIdAndReceiverIdAndStatus(userId, targetId, "PENDING").isPresent();

        return ResponseEntity.ok(new RelationshipStatusDTO(isFriend, isBlocked, blockedByThem, requestSent));
    }

    // ─── GET/CREATE FRIEND CHAT ───
    @PostMapping("/chat/{friendId}")
    public ResponseEntity<?> getOrCreateFriendChat(@PathVariable Long friendId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        if (banService.isUserBanned(userId))
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(userId, friendId))
            return ResponseEntity.status(403).body(new ErrorResponse("You have blocked this user"));
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(friendId, userId))
            return ResponseEntity.status(403).body(new ErrorResponse("This user has blocked you"));
        if (!friendRepository.existsByUserIdAndFriendId(userId, friendId))
            return ResponseEntity.status(403).body(new ErrorResponse("Not friends"));

        List<ChatRoom> rooms = chatRoomRepository.findAllBetweenUsers(userId, friendId);
        Optional<ChatRoom> friendRoom = rooms.stream()
                .filter(r -> "FRIEND_CHAT".equals(r.getRoomType())).findFirst();

        ChatRoom room = friendRoom.orElseGet(() -> chatRoomRepository.save(ChatRoom.builder()
                .user1Id(userId).user2Id(friendId).roomType("FRIEND_CHAT").build()));

        return ResponseEntity.ok(new ChatRoomResponse(room.getId()));
    }

    // ─── MARK MESSAGES AS READ ───
    @PostMapping("/chat/{chatRoomId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long chatRoomId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        MessageReadStatus status = messageReadStatusRepository
                .findByChatRoomIdAndUserId(chatRoomId, userId)
                .orElse(MessageReadStatus.builder().chatRoomId(chatRoomId).userId(userId).build());
        status.setLastReadAt(LocalDateTime.now());
        messageReadStatusRepository.save(status);
        return ResponseEntity.ok(new SuccessResponse("Marked as read"));
    }

    // ─── HOME STATS (friends count, pending, unread friends count) ───
    @GetMapping("/home-stats")
    public ResponseEntity<?> getHomeStats(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        int friendsCount = friendRepository.findByUserId(userId).size();
        int pendingCount = friendRequestRepository.findByReceiverIdAndStatus(userId, "PENDING").size();

        // Count how many friends have sent unread messages
        List<Friend> friends = friendRepository.findByUserId(userId);
        long friendsWithUnread = friends.stream().filter(f -> {
            List<ChatRoom> rooms = chatRoomRepository.findAllBetweenUsers(userId, f.getFriendId());
            return rooms.stream().filter(r -> "FRIEND_CHAT".equals(r.getRoomType())).anyMatch(room -> {
                List<Message> msgs = messageRepository.findByChatRoomIdOrderByTimestampDesc(room.getId());
                if (msgs.isEmpty())
                    return false;
                Optional<MessageReadStatus> readStatus = messageReadStatusRepository
                        .findByChatRoomIdAndUserId(room.getId(), userId);
                LocalDateTime lastReadAt = readStatus.map(MessageReadStatus::getLastReadAt).orElse(LocalDateTime.MIN);
                return msgs.stream().anyMatch(m -> m.getSenderId().equals(f.getFriendId()) &&
                        m.getTimestamp() != null &&
                        m.getTimestamp().isAfter(lastReadAt));
            });
        }).count();

        return ResponseEntity.ok(new HomeStatsDTO(friendsCount, pendingCount, (int) friendsWithUnread));
    }

    // ─── DTOs ───
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendWithChatDTO {
        private Long id;
        private String username;
        private String email;
        private String lastMessage;
        private LocalDateTime lastMessageAt;
        private int unreadCount;
        private Long chatRoomId;
        private String dpUrl;
        private Boolean isPremium;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendRequestDTO {
        private Long id;
        private Long senderId;
        private Long receiverId;
        private String status;
        private LocalDateTime createdAt;
        private String senderUsername;
        private String senderEmail;
        private String senderDpUrl;
        private Boolean senderIsPremium;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationshipStatusDTO {
        private boolean friend;
        private boolean blocked;
        private boolean blockedByThem;
        private boolean requestSent;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HomeStatsDTO {
        private int friendsCount;
        private int pendingCount;
        private int friendsWithUnread;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRoomResponse {
        private Long chatRoomId;
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

    // ─── SEARCH USER BY USERNAME ──────────────────────────────────────────────
    // GET /friends/search?username=akshat03
    @GetMapping("/search")
    public ResponseEntity<?> searchUserByUsername(@RequestParam String username, Authentication auth) {
        Long myId = (Long) auth.getPrincipal();

        Optional<User> userOpt = userRepository.findByUsername(username.trim());
        if (userOpt.isEmpty())
            return ResponseEntity.ok(new SearchResultDTO(null, null, null, false, null, null));

        User u = userOpt.get();
        if (u.getId().equals(myId))
            return ResponseEntity.badRequest().body(new ErrorResponse("You cannot search yourself"));

        boolean alreadyFriend = friendRepository.existsByUserIdAndFriendId(myId, u.getId());
        boolean requestSent = friendRequestRepository
                .findBySenderIdAndReceiverIdAndStatus(myId, u.getId(), "PENDING").isPresent();
        boolean searchUserPremium = Boolean.TRUE.equals(u.getIsPremium()) &&
                (u.getPremiumExpiresAt() == null || u.getPremiumExpiresAt().isAfter(java.time.LocalDateTime.now()));
        return ResponseEntity.ok(new SearchResultDTO(
                u.getId(), u.getUsername(), u.getDpUrl(),
                alreadyFriend, requestSent ? "PENDING" : null, searchUserPremium));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResultDTO {
        private Long id;
        private String username;
        private String dpUrl;
        private boolean alreadyFriend;
        private String requestStatus; // null=not sent, PENDING=sent
        private Boolean isPremium;
    }

}