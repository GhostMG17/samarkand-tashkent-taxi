package com.uz.taxi.samarkand_tashkent.domain.trip.dto;

import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TripCreateRequest {

    @NotNull(message = "Direction is required")
    private Trip.Direction direction;

    @NotNull(message = "Departure time is required")
    @Future(message = "Departure time must be in the future")
    private LocalDateTime departureTime;

    @NotNull @Min(1) @Max(8)
    private Integer totalSeats;

    @NotNull @DecimalMin("0.0")
    private BigDecimal price;

    private String notes;
}