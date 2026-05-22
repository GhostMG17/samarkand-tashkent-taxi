package com.uz.taxi.samarkand_tashkent.domain.user.dto;

import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String phone;
    private String firstName;
    private User.Role role;
}