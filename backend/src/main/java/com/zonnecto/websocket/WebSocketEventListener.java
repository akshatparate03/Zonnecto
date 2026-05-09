package com.zonnecto.websocket;

import com.zonnecto.service.OnlineUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final OnlineUserService onlineUserService;
    private final SimpMessagingTemplate messagingTemplate;

    // sessionId → userId
    private final ConcurrentHashMap<String, Long> sessionToUser = new ConcurrentHashMap<>();

    // sessionId → chatRoomId
    private final ConcurrentHashMap<String, Long> sessionToRoom = new ConcurrentHashMap<>();

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        String userIdStr = null;
        List<String> userIdHeader = accessor.getNativeHeader("userId");
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            userIdStr = userIdHeader.get(0);
        }
        if (userIdStr == null || userIdStr.isBlank()) {
            List<String> loginHeader = accessor.getNativeHeader("login");
            if (loginHeader != null && !loginHeader.isEmpty()) {
                userIdStr = loginHeader.get(0);
            }
        }

        Long userId = null;
        if (userIdStr != null && !userIdStr.isBlank()) {
            try {
                userId = Long.parseLong(userIdStr);
            } catch (NumberFormatException ignored) {
            }
        }

        if (userId != null) {
            sessionToUser.put(sessionId, userId);
        }

        onlineUserService.userConnected(sessionId, userId);
        broadcastCount();
        log.info("WS Connected: session={}, userId={}, total={}", sessionId, userId,
                onlineUserService.getOnlineCount());
    }

    @EventListener
    public void handleSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        String sessionId = accessor.getSessionId();

        if ("/topic/online-count".equals(destination)) {
            int count = onlineUserService.getOnlineCount();
            messagingTemplate.convertAndSend("/topic/online-count", Map.of("count", count));
            log.info("Subscribe to online-count: sending current count={}", count);
        }

        if (destination != null && destination.startsWith("/topic/chat/")
                && !destination.contains("/edit")
                && !destination.contains("/delete")) {
            try {
                String roomIdStr = destination.substring("/topic/chat/".length());
                Long roomId = Long.parseLong(roomIdStr);
                sessionToRoom.put(sessionId, roomId);
                log.debug("Session {} subscribed to chat room {}", sessionId, roomId);
            } catch (NumberFormatException ignored) {
            }
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();

        // ✅ FINAL FIX: Disconnect pe PARTNER_LEFT bilkul mat bhejo
        // REASON: Page refresh, tab reload, network hiccup — sab pe WS disconnect hota
        // hai. Backend se refresh aur actual close ko distinguish karna impossible hai.
        //
        // PARTNER_LEFT ab sirf /app/chat/{id}/leave message se aata hai
        // (ChatMessageHandler.handleLeave) — jo sirf intentional Exit Chat / Next
        // button dabane pe send hota hai. beforeunload listener Chat.jsx se hata diya.
        sessionToRoom.remove(sessionId);
        sessionToUser.remove(sessionId);

        onlineUserService.userDisconnected(sessionId);
        broadcastCount();
        log.info("WS Disconnected: session={}, total={}", sessionId, onlineUserService.getOnlineCount());
    }

    public void broadcastCount() {
        int count = onlineUserService.getOnlineCount();
        messagingTemplate.convertAndSend("/topic/online-count", Map.of("count", count));
    }
}