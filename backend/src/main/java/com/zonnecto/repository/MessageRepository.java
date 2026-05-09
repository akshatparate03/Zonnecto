package com.zonnecto.repository;

import com.zonnecto.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatRoomIdOrderByTimestampDesc(Long chatRoomId);
    List<Message> findByRecipientIdAndTimestampAfter(Long recipientId, LocalDateTime timestamp);
    List<Message> findByReportedByUserIdIsNotNull();

    @Query("SELECT m FROM Message m WHERE (m.senderId = ?1 OR m.recipientId = ?1) AND m.isReported = false")
    List<Message> findAllValidMessagesForUser(Long userId);
}
