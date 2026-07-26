package com.zonnecto.service;

import com.zonnecto.controller.ChatbotController.ChatTurn;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChatbotService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.model}")
    private String model;

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT = """
            Tum "Zonnecto Assistant" ho — Zonnecto anonymous random-chat platform ka
            official support chatbot. Sirf platform se related sawaalon ka jawaab do — jaise:
            account/login/signup, profile edit, random matching kaise kaam karta hai, friend
            system, chat/messaging features, premium plans & pricing, payments (Razorpay),
            privacy/safety, community guidelines, aur general technical help.

            Zonnecto ke key facts:
            - Free anonymous random chat platform, random strangers se instantly match karta hai.
            - Matching gender/age/state preference ke basis par hota hai — preferences sirf
              Premium users hi set/unlock kar sakte hain.
            - Free users ko daily 100 matches milte hain; Premium users unlimited matches paate hain.
            - Chat ke andar friend request bhej sakte ho; accept hone par permanent "Friend Chat" khulta hai.
            - Image/media sharing random chats mein sirf 2 minute baad allow hoti hai (spam rokne ke liye);
              friend chats mein yeh restriction nahi hai.
            - Kisi bhi message ko report kar sakte ho; violations par pehle warning, phir 15-din ka
              ban, phir permanent ban hota hai.
            - Premium Razorpay se purchase hota hai — weekly/monthly/quarterly/yearly plans available hain.
            - Profile settings mein name, gender, age, bio, interests, dp, aur preferences edit ho sakte hain.
            - Support email: zonnecto@gmail.com

            Rules:
            - Hamesha friendly, seedha aur short jawaab do (2-4 sentences), zyada lamba mat likho.
            - User jis language mein pooche (Hindi/Hinglish/English), usi mein jawaab do.
            - Agar koi specific account data maange (email, balance, exact ban status) jo tumhe
              nahi pata, to bolo profile page check karein ya zonnecto@gmail.com par contact karein.
            - Kabhi bhi fake/made-up feature ya policy mat batao jo upar likhi nahi hai.
            - Platform se bahar ke topics (coding help, homework, trivia) discuss mat karo —
              politely bolo tum sirf Zonnecto se related help kar sakte ho.
            - Users ko kabhi real identity reveal karne, personal info ya paisa/UPI details
              strangers ko dene ki salah mat do — hamesha safety encourage karo.
            """;

    @SuppressWarnings("unchecked")
    public String getReply(String userMessage, List<ChatTurn> history) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        if (history != null) {
            int start = Math.max(0, history.size() - 8); // sirf last 8 turns — context chhota rakho
            for (ChatTurn turn : history.subList(start, history.size())) {
                if (turn.getRole() != null && turn.getContent() != null) {
                    messages.add(Map.of("role", turn.getRole(), "content", turn.getContent()));
                }
            }
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "https://zonnecto.netlify.app");
        headers.set("X-Title", "Zonnecto");

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.6,
                "max_tokens", 300);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        Map<String, Object> response = restTemplate.postForObject(OPENROUTER_URL, request, Map.class);

        try {
            List<Object> choices = (List<Object>) response.get("choices");
            Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("[Chatbot] Unexpected OpenRouter response: {}", response);
            throw new RuntimeException("Invalid response from AI provider");
        }
    }
}