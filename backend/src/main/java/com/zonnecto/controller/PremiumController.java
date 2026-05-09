package com.zonnecto.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.zonnecto.entity.User;
import com.zonnecto.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PremiumController {

    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ─── POST /api/payment/create-order ───────────────────────────────────────
    /**
     * Frontend Razorpay checkout kholne se pehle yahan se order_id leta hai.
     * Body: { "planId": "STARTER", "durationDays": 90, "amount": 8000 }
     * amount paisa mein hota hai (rupees * 100)
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequest req,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderReq = new JSONObject();
            orderReq.put("amount", req.getAmount()); // paisa mein (e.g. 3000 = ₹30)
            orderReq.put("currency", "INR");
            orderReq.put("receipt", "zonnecto_" + userId + "_" + System.currentTimeMillis());
            orderReq.put("notes", new JSONObject()
                    .put("planId", req.getPlanId())
                    .put("userId", userId.toString())
                    .put("durationDays", req.getDurationDays()));

            Order order = client.orders.create(orderReq);

            // Save razorpay order id on user for verification later
            User user = userOpt.get();
            user.setRazorpayOrderId(order.get("id"));
            userRepository.save(user);

            Map<String, Object> res = new HashMap<>();
            res.put("orderId", order.get("id"));
            res.put("amount", req.getAmount());
            res.put("currency", "INR");
            res.put("keyId", razorpayKeyId);
            res.put("planId", req.getPlanId());
            res.put("durationDays", req.getDurationDays());
            return ResponseEntity.ok(res);

        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Order creation failed: " + e.getMessage()));
        }
    }

    // ─── POST /api/payment/verify ──────────────────────────────────────────────
    /**
     * Razorpay payment ke baad frontend yahan signature verify karata hai.
     * Verify hone ke baad premium activate hota hai.
     * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId,
     * durationDays }
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody VerifyRequest req,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        // HMAC-SHA256 signature verification
        try {
            String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSig = HexFormat.of().formatHex(hash);

            if (!generatedSig.equals(req.getRazorpaySignature())) {
                return ResponseEntity.status(400)
                        .body(Map.of("error", "Payment verification failed: invalid signature"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Signature verification error: " + e.getMessage()));
        }

        // Signature valid — activate premium
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));

        User user = userOpt.get();
        int days = req.getDurationDays() > 0 ? req.getDurationDays() : 30;

        // Extend if already premium, else start fresh
        LocalDateTime base = (Boolean.TRUE.equals(user.getIsPremium())
                && user.getPremiumExpiresAt() != null
                && user.getPremiumExpiresAt().isAfter(LocalDateTime.now()))
                        ? user.getPremiumExpiresAt()
                        : LocalDateTime.now();

        LocalDateTime newExpiry = base.plusDays(days);

        user.setIsPremium(true);
        user.setPremiumPlan(req.getPlanId());
        user.setPremiumExpiresAt(newExpiry);
        user.setPreferenceUnlocked(1);
        user.setRazorpayPaymentId(req.getRazorpayPaymentId());
        userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Premium activated!");
        result.put("premiumPlan", req.getPlanId());
        result.put("premiumExpiresAt", newExpiry.toString());
        return ResponseEntity.ok(result);
    }

    // ─── DTOs ─────────────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        private String planId;
        private int durationDays;
        private int amount; // in paise (₹30 = 3000)
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private String planId;
        private int durationDays;
    }

    // ─── POST /api/payment/activate — Direct activation (dev/fallback mode) ───
    /**
     * Jab Razorpay keys placeholder hain ya create-order fail hota hai,
     * frontend seedha yahan activate karta hai.
     * Body: { "planId": "BASIC", "durationDays": 30 }
     */
    @PostMapping("/activate")
    public ResponseEntity<?> activateDirect(
            @RequestBody ActivateRequest req,
            Authentication auth) {

        Long userId = (Long) auth.getPrincipal();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        int days = req.getDurationDays() > 0 ? req.getDurationDays() : 30;

        LocalDateTime base = (Boolean.TRUE.equals(user.getIsPremium())
                && user.getPremiumExpiresAt() != null
                && user.getPremiumExpiresAt().isAfter(LocalDateTime.now()))
                        ? user.getPremiumExpiresAt()
                        : LocalDateTime.now();

        LocalDateTime newExpiry = base.plusDays(days);

        user.setIsPremium(true);
        user.setPremiumPlan(req.getPlanId());
        user.setPremiumExpiresAt(newExpiry);
        user.setPreferenceUnlocked(1);
        userRepository.save(user);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("success", true);
        result.put("message", "Premium activated!");
        result.put("premiumPlan", req.getPlanId());
        result.put("premiumExpiresAt", newExpiry.toString());
        return ResponseEntity.ok(result);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivateRequest {
        private String planId;
        private int durationDays;
    }
}