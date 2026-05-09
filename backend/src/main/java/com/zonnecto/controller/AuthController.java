package com.zonnecto.controller;

import com.zonnecto.dto.AuthRequest;
import com.zonnecto.repository.UserRepository;
import com.zonnecto.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/verify-email/{token}")
    public ResponseEntity<?> verifyEmail(@PathVariable String token) {
        return ResponseEntity.ok(new SuccessResponse("Email verification endpoint"));
    }

    // ─── OTP: Send (for Registration email verification) ──────────────────────
    /**
     * POST /api/auth/send-otp
     * Body: { "email": "user@gmail.com", "name": "Akshat" }
     * Response: { "otp": "123456", "message": "OTP generated" }
     *
     * Flow:
     * 1. Backend OTP generate karta hai, Redis mein store karta hai (10 min)
     * 2. Frontend yeh OTP Apps Script ko deta hai jo email bhejta hai
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody SendOtpRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Email is required"));
            }
            String otp = authService.generateAndStoreOtp(
                    request.getEmail().trim(),
                    request.getName() != null ? request.getName() : "");
            return ResponseEntity.ok(new OtpResponse(otp, "OTP generated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ─── OTP: Verify (before completing registration) ─────────────────────────
    /**
     * POST /api/auth/verify-otp
     * Body: { "email": "user@gmail.com", "otp": "123456" }
     * Response: { "message": "Email verified successfully" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        try {
            if (request.getEmail() == null || request.getOtp() == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Email and OTP are required"));
            }
            authService.verifyOtp(request.getEmail().trim(), request.getOtp().trim());
            return ResponseEntity.ok(new SuccessResponse("Email verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ─── Forgot Password ──────────────────────────────────────────────────────
    /**
     * POST /api/auth/forgot-password
     * Body: { "email": "user@gmail.com" }
     * Response: { "token": "abc123...", "message": "Token generated" }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Email is required"));
            }
            String token = authService.generatePasswordResetToken(request.getEmail().trim());
            return ResponseEntity.ok(new TokenResponse(token, "Reset token generated"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/reset-password
     * Body: { "token": "abc123...", "newPassword": "NewPass@123" }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(new SuccessResponse("Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ─── Check Username Availability ─────────────────────────────────────────
    /**
     * GET /api/auth/check-username?username=akshat123
     * Response: { "available": true/false }
     */
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Username is required"));
        }
        boolean exists = authService.isUsernameTaken(username.trim());
        return ResponseEntity.ok(new UsernameCheckResponse(!exists));
    }

    /**
     * GET /api/auth/check-email?email=user@gmail.com
     * Response: { "registered": true/false }
     * Used by Login page for real-time email validation
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(new ErrorResponse("Email is required"));
        boolean exists = userRepository.existsByEmail(email.trim().toLowerCase());
        return ResponseEntity.ok(java.util.Map.of("registered", exists));
    }

    // ─── Inner DTOs ───────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshTokenRequest {
        private String refreshToken;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendOtpRequest {
        private String email;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpResponse {
        private String otp;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenResponse {
        private String token;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private String error;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuccessResponse {
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsernameCheckResponse {
        private boolean available;
    }
}