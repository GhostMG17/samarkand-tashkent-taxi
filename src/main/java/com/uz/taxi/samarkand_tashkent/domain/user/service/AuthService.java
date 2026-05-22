package com.uz.taxi.samarkand_tashkent.domain.user.service;

import com.uz.taxi.samarkand_tashkent.domain.user.dto.AuthResponse;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.LoginRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}