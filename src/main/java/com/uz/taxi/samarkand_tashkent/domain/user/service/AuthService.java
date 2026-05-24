package com.uz.taxi.samarkand_tashkent.domain.user.service;

import com.uz.taxi.samarkand_tashkent.domain.user.dto.AuthResponse;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.LoginRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.RegisterRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.UpdateProfileRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.ChangePasswordRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse updateProfile(String phone, UpdateProfileRequest request);
    void changePassword(String phone, ChangePasswordRequest request);
}