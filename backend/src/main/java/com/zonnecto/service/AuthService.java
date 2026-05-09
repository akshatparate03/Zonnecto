package com.zonnecto.service;

import com.zonnecto.dto.AuthRequest;
import com.zonnecto.dto.AuthResponse;
import com.zonnecto.entity.User;
import com.zonnecto.repository.UserRepository;
import com.zonnecto.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${apps.script.url}")
    private String appsScriptUrl;

    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,20}$";
    private static final Pattern PATTERN = Pattern.compile(PASSWORD_PATTERN);
    private static final String RESET_PREFIX = "pwreset:";
    private static final String OTP_PREFIX = "otp:";

    // ─── Register ─────────────────────────────────────────────────────────────

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (!PATTERN.matcher(request.getPassword()).matches()) {
            throw new RuntimeException(
                    "Password must be 8-20 characters with uppercase, lowercase, digit, and at least one special character");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .preferenceUnlocked(0)
                .dailyMatchesUsed(0)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .userId(user.getId()).email(user.getEmail())
                .username(user.getUsername()).token(token)
                .refreshToken(refreshToken)
                .message("Registration successful.")
                .build();
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    public AuthResponse login(AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("No account found with this email. Please register first.");
        }
        if (!passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }
        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        return AuthResponse.builder()
                .userId(user.getId()).email(user.getEmail())
                .username(user.getUsername()).token(token)
                .refreshToken(refreshToken).message("Login successful")
                .build();
    }

    // ─── Refresh Token ────────────────────────────────────────────────────────

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken))
            throw new RuntimeException("Invalid refresh token");
        Long userId = jwtUtil.extractUserId(refreshToken);
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            throw new RuntimeException("User not found");
        User user = userOpt.get();
        String newToken = jwtUtil.generateToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .userId(user.getId()).email(user.getEmail())
                .username(user.getUsername()).token(newToken)
                .refreshToken(refreshToken).message("Token refreshed")
                .build();
    }

    // ─── OTP: Generate & Store (for email verification during registration) ───

    /**
     * 6-digit OTP generate karo, Redis mein store karo (10 min expiry).
     * OTP return karo — Frontend Apps Script ko dega email bhejne ke liye.
     */
    public String generateAndStoreOtp(String email, String name) {
        String normalizedEmail = email.trim().toLowerCase();

        // Check if email already registered
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("This email is already registered. Please login instead.");
        }

        // 6-digit OTP generate karo
        String otp = String.format("%06d", new Random().nextInt(1000000));

        // Redis mein store: otp:<email> → otp, 10 min expiry
        redisTemplate.opsForValue().set(
                OTP_PREFIX + normalizedEmail,
                otp,
                Duration.ofMinutes(10));

        return otp;
    }

    // ─── OTP: Verify ──────────────────────────────────────────────────────────

    /**
     * Redis se OTP verify karo.
     * Sahi hone par OTP delete karo (one-time use).
     */
    public void verifyOtp(String email, String enteredOtp) {
        String key = OTP_PREFIX + email.trim().toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            throw new RuntimeException("OTP has expired or was never sent. Please request a new OTP.");
        }
        if (!storedOtp.equals(enteredOtp.trim())) {
            throw new RuntimeException("Incorrect OTP. Please check your email and try again.");
        }

        // One-time use — delete after verification
        redisTemplate.delete(key);
    }

    // ─── Username Check ───────────────────────────────────────────────────────

    public boolean isUsernameTaken(String username) {
        return userRepository.existsByUsername(username);
    }

    // ─── Forgot Password ──────────────────────────────────────────────────────

    public String generatePasswordResetToken(String email) {
        String token = UUID.randomUUID().toString().replace("-", "");
        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isPresent()) {
            redisTemplate.opsForValue().set(
                    RESET_PREFIX + token,
                    email.trim().toLowerCase(),
                    Duration.ofMinutes(15));
        }
        return token;
    }

    public void resetPassword(String token, String newPassword) {
        if (!PATTERN.matcher(newPassword).matches()) {
            throw new RuntimeException(
                    "Password must be 8-20 characters with uppercase, lowercase, digit, and at least one special character");
        }

        String key = RESET_PREFIX + token.trim();
        String email = redisTemplate.opsForValue().get(key);

        if (email == null) {
            throw new RuntimeException("Reset link has expired or is invalid. Please request a new one.");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            throw new RuntimeException("No account found for this email");

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        redisTemplate.delete(key);
    }
}