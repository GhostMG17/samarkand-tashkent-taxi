package com.uz.taxi.samarkand_tashkent.domain.booking.dto;

import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
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
    private String driverPhone;
    private String passengerName;
    private String passengerPhone;
    private Integer seatsCount;
    private BigDecimal totalPrice;
    private Booking.Status status;
    private Booking.PaymentStatus paymentStatus;
    private Trip.Status tripStatus;
    private LocalDateTime createdAt;

    public static BookingResponse from(Booking booking) {
        var trip = booking.getTrip();
        var driver = trip.getDriver();
        var passenger = booking.getPassenger();

        String driverFullName = driver.getFirstName() +
                (driver.getLastName() != null ? " " + driver.getLastName() : "");
        String passengerFullName = passenger.getFirstName() +
                (passenger.getLastName() != null ? " " + passenger.getLastName() : "");

        return BookingResponse.builder()
                .id(booking.getId())
                .tripId(trip.getId())
                .direction(trip.getDirection().name())
                .departureTime(trip.getDepartureTime())
                .driverName(driverFullName)
                .driverPhone(driver.getPhone())
                .passengerName(passengerFullName)
                .passengerPhone(passenger.getPhone())
                .seatsCount(booking.getSeatsCount())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .tripStatus(trip.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}