package com.uz.taxi.samarkand_tashkent.domain.user.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.config.JwtService;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.AuthResponse;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.LoginRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.dto.RegisterRequest;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ApiException("Phone already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .active(true)
                .build();

        userRepository.save(user);

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getPhone())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhone(), request.getPassword())
        );

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getPhone())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .role(user.getRole())
                .build();
    }
}