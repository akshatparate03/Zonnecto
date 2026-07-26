package com.zonnecto.service;

import com.zonnecto.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailNotificationService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${apps.script.notify-url:}")
    private String notifyScriptUrl;

    public EmailNotificationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void sendOnlineCountUpdate(int newCount, int oldCount) {
        if (notifyScriptUrl == null || notifyScriptUrl.isBlank()) {
            log.warn("[EmailNotify] apps.script.notify-url was not configured, skipping...");
            return;
        }

        List<String> emails = userRepository.findAll().stream()
                .map(u -> u.getEmail())
                .filter(e -> e != null && !e.isBlank())
                .toList();

        if (emails.isEmpty())
            return;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "action", "sendCountUpdate",
                    "emails", emails,
                    "newCount", newCount,
                    "oldCount", oldCount,
                    "event", newCount > oldCount ? "USER_JOINED" : "USER_LEFT");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForObject(notifyScriptUrl, request, String.class);
            log.info("[EmailNotify] Count update ({} -> {}) bheja {} users ko", oldCount, newCount, emails.size());
        } catch (Exception e) {
            log.error("[EmailNotify] Unable to send email: {}", e.getMessage());
        }
    }
}