package com.uz.taxi.samarkand_tashkent.domain.user.dto;

import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+998[0-9]{9}$", message = "Phone must be in format +998XXXXXXXXX")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private User.Role role = User.Role.PASSENGER;
}