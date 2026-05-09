package com.zonnecto.controller;

import com.zonnecto.entity.ChatRoom;
import com.zonnecto.service.BanService;
import com.zonnecto.service.MatchingService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/match")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;
    private final BanService banService;

    /**
     * User match queue mein join karta hai.
     * Response:
     * - matched: true, chatRoomId: X → Match mil gaya, is room mein jao
     * - matched: false, queued: true → Queue mein ho, polling karo
     * - matched: false, queued: false → Error (banned/limit etc)
     */
    @PostMapping("/join")
    public ResponseEntity<?> joinQueue(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(new QueueResponse(false, false, null, "Not authenticated"));
        }

        Long userId = (Long) auth.getPrincipal();

        if (banService.isUserBanned(userId)) {
            return ResponseEntity.status(403).body(new QueueResponse(false, false, null, "User is banned"));
        }

        try {
            Optional<ChatRoom> room = matchingService.joinQueue(userId);
            if (room.isPresent()) {
                return ResponseEntity.ok(new QueueResponse(true, false, room.get().getId(), null));
            } else {
                return ResponseEntity.ok(new QueueResponse(false, true, null, "Searching for a match..."));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.ok(new QueueResponse(false, false, null, e.getMessage()));
        }
    }

    /**
     * Polling endpoint - check karo match ho gaya kya
     */
    @GetMapping("/poll")
    public ResponseEntity<?> pollMatch(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(new QueueResponse(false, false, null, "Not authenticated"));
        }

        Long userId = (Long) auth.getPrincipal();

        Optional<ChatRoom> room = matchingService.checkForMatch(userId);
        if (room.isPresent()) {
            return ResponseEntity.ok(new QueueResponse(true, false, room.get().getId(), null));
        }
        return ResponseEntity.ok(new QueueResponse(false, true, null, "Still searching..."));
    }

    /**
     * User ne cancel kiya (timeout ya manual)
     */
    @PostMapping("/leave")
    public ResponseEntity<?> leaveQueue(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(new QueueResponse(false, false, null, "Not authenticated"));
        }
        Long userId = (Long) auth.getPrincipal();
        matchingService.leaveQueue(userId);
        return ResponseEntity.ok(new QueueResponse(false, false, null, "Left queue"));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueueResponse {
        private boolean matched;
        private boolean queued;
        private Long chatRoomId;
        private String message;
    }
}