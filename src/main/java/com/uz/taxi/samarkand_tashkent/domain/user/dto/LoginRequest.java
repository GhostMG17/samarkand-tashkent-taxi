package com.uz.taxi.samarkand_tashkent.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;
}