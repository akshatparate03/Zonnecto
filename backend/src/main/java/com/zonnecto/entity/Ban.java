package com.zonnecto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ban {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private Integer violationCount;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean isPermanent;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isPermanent = false;
    }
}
