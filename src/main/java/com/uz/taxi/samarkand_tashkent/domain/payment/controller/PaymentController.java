package com.uz.taxi.samarkand_tashkent.domain.payment.controller;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.payment.dto.PaymentResponse;
import com.uz.taxi.samarkand_tashkent.domain.payment.service.PaymentService;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    /**
     * Оплатить бронирование (MOCK).
     */
    @PostMapping("/booking/{bookingId}/pay")
    public ResponseEntity<PaymentResponse> pay(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User passenger = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        return ResponseEntity.ok(paymentService.payForBooking(bookingId, passenger.getId()));
    }

    /**
     * Возврат средств (только админ).
     */
    @PostMapping("/booking/{bookingId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> refund(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.refundBooking(bookingId));
    }
}