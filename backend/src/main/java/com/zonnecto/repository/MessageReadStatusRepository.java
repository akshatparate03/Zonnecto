package com.zonnecto.repository;

import com.zonnecto.entity.MessageReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, Long> {
    Optional<MessageReadStatus> findByChatRoomIdAndUserId(Long chatRoomId, Long userId);
}