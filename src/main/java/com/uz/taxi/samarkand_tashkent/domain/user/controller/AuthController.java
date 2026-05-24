package com.uz.taxi.samarkand_tashkent.domain.user.controller;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.AuthResponse;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.LoginRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.RegisterRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.UserResponse;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import com.uz.taxi.samarkand_tashkent.domain.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.UpdateProfileRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.ChangePasswordRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }
}