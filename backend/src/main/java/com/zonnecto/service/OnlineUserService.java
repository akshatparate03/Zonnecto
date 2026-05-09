package com.zonnecto.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks online users by WebSocket sessionId.
 * Count = number of active WebSocket sessions (each logged-in tab = 1 session)
 */
@Service
public class OnlineUserService {

    // sessionId -> userId (null allowed - still counts as online session)
    private final ConcurrentHashMap<String, Long> sessions = new ConcurrentHashMap<>();

    public void userConnected(String sessionId, Long userId) {
        if (sessionId != null) {
            // userId null ho toh bhi session track karo
            // -1L as placeholder for unknown userId
            sessions.put(sessionId, userId != null ? userId : -1L);
        }
    }

    public void userDisconnected(String sessionId) {
        if (sessionId != null) {
            sessions.remove(sessionId);
        }
    }

    public int getOnlineCount() {
        return sessions.size();
    }
}