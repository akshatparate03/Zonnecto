package com.zonnecto.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class TelegramService {

    @Value("${telegram.bot.token:}")
    private String botToken;

    @Value("${telegram.chat.id:}")
    private String chatId;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendUserCountUpdate(int newCount, int oldCount, String event) {
        if (botToken.isBlank() || chatId.isBlank())
            return;

        String arrow = newCount > oldCount ? "📈" : "📉";
        String msg = String.format(
                "%s *Zonnecto Live Update*\n\n" +
                        "👤 Event: `%s`\n" +
                        "🔢 Online Users: *%d*\n" +
                        "📊 Change: %s %d → %d",
                arrow, event, newCount, arrow, oldCount, newCount);

        String url = String.format(
                "https://api.telegram.org/bot%s/sendMessage?chat_id=%s&text=%s&parse_mode=Markdown",
                botToken, chatId,
                encodeUrl(msg));

        try {
            restTemplate.getForObject(url, String.class);
            log.info("[Telegram] Sent count update: {}", newCount);
        } catch (Exception e) {
            log.error("[Telegram] Failed to send message: {}", e.getMessage());
        }
    }

    private String encodeUrl(String text) {
        try {
            return java.net.URLEncoder.encode(text, "UTF-8");
        } catch (Exception e) {
            return text;
        }
    }
}