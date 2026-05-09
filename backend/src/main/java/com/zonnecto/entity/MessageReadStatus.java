package com.zonnecto.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_read_status", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "chat_room_id", "user_id" }) })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReadStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long chatRoomId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDateTime lastReadAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        if (lastReadAt == null)
            lastReadAt = LocalDateTime.now();
    }
}