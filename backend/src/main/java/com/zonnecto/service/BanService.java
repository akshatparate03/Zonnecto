package com.zonnecto.service;

import com.zonnecto.entity.Ban;
import com.zonnecto.repository.BanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BanService {

    private final BanRepository banRepository;

    public boolean isUserBanned(Long userId) {
        return banRepository.existsByUserIdAndExpiresAtAfter(userId, LocalDateTime.now());
    }

    public Optional<Ban> getUserActiveBan(Long userId) {
        return banRepository.findByUserIdAndExpiresAtAfter(userId, LocalDateTime.now());
    }

    public void banUser(Long userId, String reason, Integer violationCount) {
        Optional<Ban> existingBan = getUserActiveBan(userId);

        if (existingBan.isPresent()) {
            Ban ban = existingBan.get();
            ban.setViolationCount(violationCount);
            ban.setReason(reason);
            
            if (violationCount >= 2) {
                ban.setIsPermanent(true);
                ban.setExpiresAt(LocalDateTime.now().plusYears(100));
            } else {
                ban.setExpiresAt(LocalDateTime.now().plusDays(15));
            }
            banRepository.save(ban);
        } else {
            Ban ban = Ban.builder()
                    .userId(userId)
                    .reason(reason)
                    .violationCount(violationCount)
                    .expiresAt(violationCount >= 2 ? 
                        LocalDateTime.now().plusYears(100) : 
                        LocalDateTime.now().plusDays(15))
                    .isPermanent(violationCount >= 2)
                    .build();
            banRepository.save(ban);
        }
    }
}
