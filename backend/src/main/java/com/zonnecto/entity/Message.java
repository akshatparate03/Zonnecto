package com.zonnecto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private Long recipientId;

    @Column(nullable = false)
    private String content;

    @Column
    private String mediaUrl; // URL to image/file

    @Column(nullable = false)
    private String messageType; // TEXT, IMAGE, FILE

    @Column(nullable = false)
    private Long chatRoomId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column
    private Boolean isReported;

    @Column
    private Long reportedByUserId;

    @Column
    private Boolean edited;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
        isReported = false;
        messageType = "TEXT";
        edited = false;
    }
}