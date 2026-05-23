package com.uz.taxi.samarkand_tashkent.domain.booking.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingCreateRequest {

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotNull(message = "Seats count is required")
    @Min(value = 1, message = "Seats count must be at least 1")
    @Max(value = 8, message = "Seats count cannot exceed 8")
    private Integer seatsCount;
}