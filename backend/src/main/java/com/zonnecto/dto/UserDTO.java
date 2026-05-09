package com.zonnecto.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String gender;
    private String age;
    private String city;
    private String state;
    private String bio;
    private String interests;
    private String preferredGender;
    private String preferredAge;
    private String preferredState;
    private Integer preferenceUnlocked;
    private String dpUrl;
    // Premium fields
    private Boolean isPremium;
    private String premiumPlan;
    private String premiumExpiresAt; // ISO string for frontend
}