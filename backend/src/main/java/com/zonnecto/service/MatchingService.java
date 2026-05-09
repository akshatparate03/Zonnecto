package com.zonnecto.service;

import com.zonnecto.entity.ChatRoom;
import com.zonnecto.entity.User;
import com.zonnecto.repository.ChatRoomRepository;
import com.zonnecto.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final BanService banService;

    // In-memory queue — thread-safe
    // userId → timestamp jab queue mein join kiya
    private final Map<Long, LocalDateTime> waitingQueue = new ConcurrentHashMap<>();

    // userId → matched chatRoomId (poll karne ke liye store)
    private final Map<Long, Long> pendingMatches = new ConcurrentHashMap<>();

    /**
     * User queue mein join karta hai.
     * - Agar koi aur already queue mein hai → turant match banao
     * - Nahi toh queue mein daal do, client polling karega
     */
    public Optional<ChatRoom> joinQueue(Long userId) {
        if (banService.isUserBanned(userId)) {
            throw new RuntimeException("User is banned");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOpt.get();

        // ─── Match limit check — premium users get unlimited matches ─────────
        boolean isPremiumActive = Boolean.TRUE.equals(user.getIsPremium()) &&
                (user.getPremiumExpiresAt() == null ||
                        user.getPremiumExpiresAt().isAfter(LocalDateTime.now()));

        if (!isPremiumActive) {
            // Reset daily count agar new day hai
            if (user.getLastMatchResetTime() == null ||
                    user.getLastMatchResetTime().toLocalDate().isBefore(LocalDateTime.now().toLocalDate())) {
                user.setDailyMatchesUsed(0);
                user.setLastMatchResetTime(LocalDateTime.now());
                userRepository.save(user);
            }
            int used = user.getDailyMatchesUsed() != null ? user.getDailyMatchesUsed() : 0;
            if (used >= 100) {
                throw new RuntimeException(
                        "Daily match limit reached (100/day). Upgrade to Premium for unlimited matches!");
            }
        }

        // Agar already matched hai (edge case) toh return
        if (pendingMatches.containsKey(userId)) {
            Long roomId = pendingMatches.remove(userId);
            return chatRoomRepository.findById(roomId);
        }

        // Queue mein already waiting users mein se suitable match dhundo
        Long matchedUserId = null;

        for (Map.Entry<Long, LocalDateTime> entry : waitingQueue.entrySet()) {
            Long candidateId = entry.getKey();

            // Apne aap se match nahi
            if (candidateId.equals(userId))
                continue;

            // Banned user skip
            if (banService.isUserBanned(candidateId)) {
                waitingQueue.remove(candidateId);
                continue;
            }

            // ─── Premium preference filtering ────────────────────────────────
            // Sirf premium user ke preferences check karo
            // Candidate ki info fetch karo for matching
            Optional<User> candidateOpt = userRepository.findById(candidateId);
            if (candidateOpt.isEmpty()) {
                waitingQueue.remove(candidateId);
                continue;
            }
            User candidate = candidateOpt.get();

            // Check: kya current user (premium) ke preferences candidate se match karte
            // hain?
            if (isPremiumActive && !preferencesMatch(user, candidate)) {
                continue; // Skip this candidate, preference match nahi hua
            }

            // Check: kya candidate (agar premium hai) ke preferences current user se match
            // karte hain?
            boolean candidatePremium = Boolean.TRUE.equals(candidate.getIsPremium()) &&
                    (candidate.getPremiumExpiresAt() == null ||
                            candidate.getPremiumExpiresAt().isAfter(LocalDateTime.now()));
            if (candidatePremium && !preferencesMatch(candidate, user)) {
                continue; // Skip, candidate ke preferences current user se match nahi
            }

            // Match mil gaya!
            matchedUserId = candidateId;
            break;
        }

        if (matchedUserId != null) {
            // Queue se remove karo matched user ko
            waitingQueue.remove(matchedUserId);

            // ─── Increment daily match counter (only for non-premium) ───────
            if (!isPremiumActive) {
                int current = user.getDailyMatchesUsed() != null ? user.getDailyMatchesUsed() : 0;
                user.setDailyMatchesUsed(current + 1);
                userRepository.save(user);
            }

            // Chat room banao
            ChatRoom room = ChatRoom.builder()
                    .user1Id(userId)
                    .user2Id(matchedUserId)
                    .roomType("RANDOM_MATCH")
                    .build();
            room = chatRoomRepository.save(room);

            // Matched user ke liye pending match store karo (wo poll karega)
            pendingMatches.put(matchedUserId, room.getId());

            return Optional.of(room);
        }

        // Koi match nahi mila — queue mein daal do
        waitingQueue.put(userId, LocalDateTime.now());
        return Optional.empty();
    }

    /**
     * Polling — check karo koi match pending hai kya
     */
    public Optional<ChatRoom> checkForMatch(Long userId) {
        Long roomId = pendingMatches.remove(userId);
        if (roomId != null) {
            return chatRoomRepository.findById(roomId);
        }
        return Optional.empty();
    }

    /**
     * User ne cancel kiya ya timeout hua — queue se hata do
     */
    public void leaveQueue(Long userId) {
        waitingQueue.remove(userId);
        pendingMatches.remove(userId);
    }

    /**
     * Legacy method — ab bhi kaam karega agar koi aur use kar raha ho
     */
    public Optional<ChatRoom> findOrCreateMatch(Long userId) {
        return joinQueue(userId);
    }

    public void resetDailyMatches() {
        List<User> allUsers = userRepository.findAll();
        allUsers.forEach(user -> user.setDailyMatchesUsed(0));
        userRepository.saveAll(allUsers);
    }

    /**
     * Check karo kya premiumUser ke preferences candidate se match karte hain.
     * Sirf set preferences check hote hain — null/empty = no filter (any match).
     */
    private boolean preferencesMatch(User premiumUser, User candidate) {
        // Gender preference check
        String prefGender = premiumUser.getPreferredGender();
        if (prefGender != null && !prefGender.isBlank() && !prefGender.equalsIgnoreCase("ANY")) {
            String candidateGender = candidate.getGender();
            if (candidateGender == null || !candidateGender.equalsIgnoreCase(prefGender)) {
                return false;
            }
        }

        // State preference check
        String prefState = premiumUser.getPreferredState();
        if (prefState != null && !prefState.isBlank()) {
            String candidateState = candidate.getState();
            if (candidateState == null || !candidateState.equalsIgnoreCase(prefState)) {
                return false;
            }
        }

        // Age range preference check — e.g. "18-22", "45+"
        String prefAge = premiumUser.getPreferredAge();
        if (prefAge != null && !prefAge.isBlank()) {
            String candidateAge = candidate.getAge();
            if (candidateAge != null && !candidateAge.isBlank()) {
                try {
                    int age = Integer.parseInt(candidateAge.trim());
                    if (!ageInRange(age, prefAge)) {
                        return false;
                    }
                } catch (NumberFormatException ignored) {
                    // age parse nahi hua — filter skip karo
                }
            }
            // agar candidate ki age set nahi — preference set hai to skip karo
            else {
                return false;
            }
        }

        return true;
    }

    private boolean ageInRange(int age, String range) {
        if (range.endsWith("+")) {
            int min = Integer.parseInt(range.replace("+", "").trim());
            return age >= min;
        }
        String[] parts = range.split("-");
        if (parts.length == 2) {
            int min = Integer.parseInt(parts[0].trim());
            int max = Integer.parseInt(parts[1].trim());
            return age >= min && age <= max;
        }
        return true;
    }
}