package com.zonnecto.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OnlineUserService {

    private final TelegramService telegramService;
    private final ConcurrentHashMap<String, Long> sessions = new ConcurrentHashMap<>();

    public void userConnected(String sessionId, Long userId) {
        if (sessionId != null) {
            int oldCount = sessions.size();
            sessions.put(sessionId, userId != null ? userId : -1L);
            int newCount = sessions.size();

            if (newCount != oldCount) {
                telegramService.sendUserCountUpdate(newCount, oldCount, "USER_JOINED");
            }
        }
    }

    public void userDisconnected(String sessionId) {
        if (sessionId != null) {
            int oldCount = sessions.size();
            sessions.remove(sessionId);
            int newCount = sessions.size();

            if (newCount != oldCount) {
                telegramService.sendUserCountUpdate(newCount, oldCount, "USER_LEFT");
            }
        }
    }

    public int getOnlineCount() {
        return sessions.size();
    }
}