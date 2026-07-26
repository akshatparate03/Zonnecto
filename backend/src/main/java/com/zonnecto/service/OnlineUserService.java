package com.zonnecto.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class OnlineUserService {

    private final EmailNotificationService emailNotificationService;
    private final ConcurrentHashMap<String, Long> sessions = new ConcurrentHashMap<>();

    // ─── Debounce state ──────────────────────────────────────────────────────
    // Telegram wale instant-ping ki jagah ab count change note hota hai,
    // aur har 5 min mein ek hi batch email jaata hai (Gmail quota + spam bachane ke
    // liye)
    private final AtomicInteger lastEmailedCount = new AtomicInteger(-1);
    private final AtomicBoolean changePending = new AtomicBoolean(false);

    public void userConnected(String sessionId, Long userId) {
        if (sessionId != null) {
            sessions.put(sessionId, userId != null ? userId : -1L);
            changePending.set(true);
        }
    }

    public void userDisconnected(String sessionId) {
        if (sessionId != null) {
            sessions.remove(sessionId);
            changePending.set(true);
        }
    }

    public int getOnlineCount() {
        return sessions.size();
    }

    /**
     * Har 5 minute mein check karo — agar last email ke baad se count change
     * hua hai, tabhi sabhi registered users ko naya batch email bhejo.
     */
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void flushCountUpdateIfChanged() {
        if (!changePending.get())
            return;

        int currentCount = getOnlineCount();
        int previous = lastEmailedCount.get();

        changePending.set(false);

        if (currentCount == previous)
            return;

        lastEmailedCount.set(currentCount);
        emailNotificationService.sendOnlineCountUpdate(currentCount, previous < 0 ? currentCount : previous);
    }
}