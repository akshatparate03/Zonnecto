package com.zonnecto.repository;

import com.zonnecto.entity.Ban;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BanRepository extends JpaRepository<Ban, Long> {
    Optional<Ban> findByUserIdAndExpiresAtAfter(Long userId, LocalDateTime now);
    List<Ban> findByUserId(Long userId);
    boolean existsByUserIdAndExpiresAtAfter(Long userId, LocalDateTime now);
}
