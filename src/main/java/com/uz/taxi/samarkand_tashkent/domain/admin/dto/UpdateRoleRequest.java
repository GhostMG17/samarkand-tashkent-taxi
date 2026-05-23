package com.uz.taxi.samarkand_tashkent.domain.admin.dto;

import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateRoleRequest {

    @NotNull(message = "Role is required")
    private User.Role role;
}