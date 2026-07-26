package com.zonnecto.controller;

import com.zonnecto.service.ChatbotService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        try {
            String reply = chatbotService.getReply(request.getMessage(), request.getHistory());
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Chatbot currently unavailable. Try again later."));
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRequest {
        private String message;
        private List<ChatTurn> history; // optional — pichli baaton ka context
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatTurn {
        private String role;    // "user" ya "assistant"
        private String content;
    }
}