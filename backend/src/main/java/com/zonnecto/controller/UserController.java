package com.zonnecto.controller;

import com.zonnecto.dto.UserDTO;
import com.zonnecto.entity.User;
import com.zonnecto.repository.UserRepository;
import com.zonnecto.service.BanService;
import com.zonnecto.service.OnlineUserService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final BanService banService;
    private final OnlineUserService onlineUserService;

    // ─── Helper: User → UserDTO ───────────────────────────────────────────────
    private UserDTO toDTO(User user) {
        // Check expiry — agar expire ho gayi to isPremium false karo on-the-fly
        boolean premiumActive = Boolean.TRUE.equals(user.getIsPremium()) &&
                (user.getPremiumExpiresAt() == null ||
                        user.getPremiumExpiresAt().isAfter(java.time.LocalDateTime.now()));

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .gender(user.getGender())
                .age(user.getAge())
                .city(user.getCity())
                .state(user.getState())
                .bio(user.getBio())
                .interests(user.getInterests())
                .preferredGender(user.getPreferredGender())
                .preferredAge(user.getPreferredAge())
                .preferredState(user.getPreferredState())
                .preferenceUnlocked(user.getPreferenceUnlocked())
                .dpUrl(user.getDpUrl())
                .isPremium(premiumActive)
                .premiumPlan(user.getPremiumPlan())
                .premiumExpiresAt(user.getPremiumExpiresAt() != null
                        ? user.getPremiumExpiresAt().toString()
                        : null)
                .build();
    }

    // ─── GET /user/profile ────────────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        if (banService.isUserBanned(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));
        }
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User not found"));
        }
        return ResponseEntity.ok(toDTO(userOpt.get()));
    }

    // ─── GET /user/profile/{userId} — Public profile (for viewing other users) ─
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getPublicProfile(@PathVariable Long userId, Authentication auth) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User not found"));
        }
        User u = userOpt.get();
        // Only return safe public fields — no email
        UserDTO dto = UserDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .gender(u.getGender())
                .age(u.getAge())
                .city(u.getCity())
                .state(u.getState())
                .bio(u.getBio())
                .interests(u.getInterests())
                .dpUrl(u.getDpUrl())
                .build();
        return ResponseEntity.ok(dto);
    }

    // ─── PUT /user/profile ────────────────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        if (banService.isUserBanned(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("User is banned"));
        }
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User not found"));
        }
        User user = userOpt.get();

        // Update all editable fields
        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getGender() != null)
            user.setGender(request.getGender());
        if (request.getAge() != null)
            user.setAge(request.getAge());
        if (request.getCity() != null)
            user.setCity(request.getCity());
        if (request.getState() != null)
            user.setState(request.getState());
        if (request.getBio() != null)
            user.setBio(request.getBio());
        if (request.getInterests() != null)
            user.setInterests(request.getInterests());
        if (request.getPreferredGender() != null)
            user.setPreferredGender(request.getPreferredGender());
        if (request.getPreferredAge() != null)
            user.setPreferredAge(request.getPreferredAge());
        if (request.getPreferredState() != null)
            user.setPreferredState(request.getPreferredState());

        userRepository.save(user);
        return ResponseEntity.ok(toDTO(user));
    }

    // ─── POST /user/update-profile-at-registration ────────────────────────────
    // Registration ke baad fullName, age, gender, city, state save karne ke liye
    @PostMapping("/update-profile-at-registration")
    public ResponseEntity<?> updateProfileAtRegistration(@RequestBody RegistrationProfileRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User not found"));
        }
        User user = userOpt.get();
        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getAge() != null)
            user.setAge(request.getAge());
        if (request.getGender() != null)
            user.setGender(request.getGender());
        if (request.getCity() != null)
            user.setCity(request.getCity());
        if (request.getState() != null)
            user.setState(request.getState());
        userRepository.save(user);
        return ResponseEntity.ok(toDTO(user));
    }

    // ─── POST /user/upload-dp ─────────────────────────────────────────────────
    @PostMapping("/upload-dp")
    public ResponseEntity<?> uploadDp(@RequestParam("file") MultipartFile file, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("User not found"));
        }
        try {
            // Paths.get() — Windows aur Linux dono pe sahi path banata hai
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "dp");
            Files.createDirectories(uploadDir);

            // Safe filename — userId + UUID + original extension only
            String originalName = file.getOriginalFilename();
            String ext = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
                    : ".jpg";
            String filename = userId + "_" + UUID.randomUUID() + ext;

            Path filepath = uploadDir.resolve(filename);
            Files.write(filepath, file.getBytes());

            // DB mein sirf relative path save karo — frontend API_BASE_URL + dpUrl se full
            // URL banata hai
            String dpUrl = "/uploads/dp/" + filename;
            User user = userOpt.get();
            user.setDpUrl(dpUrl);
            userRepository.save(user);

            return ResponseEntity.ok(new DpResponse(dpUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new ErrorResponse("File upload failed: " + e.getMessage()));
        }
    }

    // ─── GET /user/active-count ───────────────────────────────────────────────
    @GetMapping("/active-count")
    public ResponseEntity<?> getActiveUserCount() {
        return ResponseEntity.ok(new CountResponse(onlineUserService.getOnlineCount()));
    }

    // ─── Inner DTOs ───────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String fullName;
        private String gender;
        private String age;
        private String city;
        private String state;
        private String bio;
        private String interests;
        private String preferredGender;
        private String preferredAge;
        private String preferredState;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegistrationProfileRequest {
        private String fullName;
        private String age;
        private String gender;
        private String city;
        private String state;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DpResponse {
        private String dpUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountResponse {
        private Integer count;
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
}