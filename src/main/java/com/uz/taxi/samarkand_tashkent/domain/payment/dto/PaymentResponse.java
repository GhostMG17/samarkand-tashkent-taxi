package com.uz.taxi.samarkand_tashkent.domain.payment.dto;

import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long bookingId;
    private BigDecimal amount;
    private Booking.PaymentStatus paymentStatus;
    private String paymentId;
    private String message;
    private LocalDateTime paidAt;

    public static PaymentResponse success(Booking booking) {
        return PaymentResponse.builder()
                .bookingId(booking.getId())
                .amount(booking.getTotalPrice())
                .paymentStatus(booking.getPaymentStatus())
                .paymentId(booking.getPaymentId())
                .message("Payment successful")
                .paidAt(LocalDateTime.now())
                .build();
    }
}