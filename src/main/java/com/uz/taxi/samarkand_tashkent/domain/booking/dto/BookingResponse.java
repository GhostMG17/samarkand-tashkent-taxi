package com.uz.taxi.samarkand_tashkent.domain.booking.dto;

import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private Long tripId;
    private String direction;
    private LocalDateTime departureTime;
    private String driverName;
    private Integer seatsCount;
    private BigDecimal totalPrice;
    private Booking.Status status;
    private Booking.PaymentStatus paymentStatus;
    private LocalDateTime createdAt;

    public static BookingResponse from(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .tripId(booking.getTrip().getId())
                .direction(booking.getTrip().getDirection().name())
                .departureTime(booking.getTrip().getDepartureTime())
                .driverName(booking.getTrip().getDriver().getFirstName())
                .seatsCount(booking.getSeatsCount())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}