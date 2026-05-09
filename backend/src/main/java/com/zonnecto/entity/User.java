package com.zonnecto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String username;

    @Column
    private String fullName;

    @Column(nullable = false)
    private Boolean emailVerified;

    @Column
    private String gender;

    @Column
    private String age;

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String bio;

    @Column(length = 1000)
    private String interests;

    @Column
    private String preferredGender;

    @Column(length = 20)
    private String preferredAge; // e.g. "18-22", "22-25" etc.

    @Column(length = 100)
    private String preferredState; // e.g. "Madhya Pradesh"

    @Column
    private Integer preferenceUnlocked;

    @Column
    private Integer dailyMatchesUsed;

    @Column
    private LocalDateTime lastMatchResetTime;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @Column
    private Integer referralCount;

    @Column
    private String dpUrl;

    // ─── Premium fields ───────────────────────────────────────────────────────
    @Column
    private Boolean isPremium; // true = premium active

    @Column(length = 50)
    private String premiumPlan; // WEEKLY / MONTHLY / QUARTERLY / YEARLY

    @Column
    private LocalDateTime premiumExpiresAt; // null = lifetime / not applicable

    @Column(length = 100)
    private String razorpayOrderId; // last Razorpay order id (for verify)

    @Column(length = 100)
    private String razorpayPaymentId; // last successful payment id

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        emailVerified = false;
        preferenceUnlocked = 0;
        dailyMatchesUsed = 0;
        referralCount = 0;
        isPremium = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}