package com.zonnecto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reportedUserId;

    @Column(nullable = false)
    private Long reportedByUserId;

    @Column(nullable = false)
    private Long messageId;

    @Column // nullable — chat_room_id optional reference
    private Long chatRoomId;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String status; // PENDING, REVIEWED, RESOLVED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime reviewedAt;

    @Column
    private String adminNotes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = "PENDING";
    }
}