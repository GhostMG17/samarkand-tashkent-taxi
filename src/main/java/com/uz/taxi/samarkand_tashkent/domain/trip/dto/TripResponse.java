package com.uz.taxi.samarkand_tashkent.domain.trip.dto;

import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TripResponse {
    private Long id;
    private String driverName;
    private String driverPhone;
    private Trip.Direction direction;
    private LocalDateTime departureTime;
    private Integer totalSeats;
    private Integer availableSeats;
    private BigDecimal price;
    private Trip.Status status;
    private String notes;
    private LocalDateTime createdAt;

    public static TripResponse from(Trip trip) {
        return TripResponse.builder()
                .id(trip.getId())
                .driverName(trip.getDriver().getFirstName() + " " +
                        (trip.getDriver().getLastName() != null ? trip.getDriver().getLastName() : ""))
                .driverPhone(trip.getDriver().getPhone())
                .direction(trip.getDirection())
                .departureTime(trip.getDepartureTime())
                .totalSeats(trip.getTotalSeats())
                .availableSeats(trip.getAvailableSeats())
                .price(trip.getPrice())
                .status(trip.getStatus())
                .notes(trip.getNotes())
                .createdAt(trip.getCreatedAt())
                .build();
    }
}