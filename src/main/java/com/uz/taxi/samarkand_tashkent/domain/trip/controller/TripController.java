package com.uz.taxi.samarkand_tashkent.domain.trip.controller;

import com.uz.taxi.samarkand_tashkent.domain.trip.dto.TripCreateRequest;
import com.uz.taxi.samarkand_tashkent.domain.trip.dto.TripResponse;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.service.TripService;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TripResponse>> getAvailable(
            @RequestParam Trip.Direction direction,
            @RequestParam(defaultValue = "1") int seats
    ) {
        List<TripResponse> trips = tripService
                .findAvailable(direction, seats, LocalDateTime.now())
                .stream()
                .map(TripResponse::from)
                .toList();
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    @Transactional
    public ResponseEntity<TripResponse> getById(@PathVariable Long id) {
        return tripService.findById(id)
                .map(TripResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<TripResponse> create(
            @Valid @RequestBody TripCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User driver = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip trip = Trip.builder()
                .driver(driver)
                .direction(request.getDirection())
                .departureTime(request.getDepartureTime())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .price(request.getPrice())
                .status(Trip.Status.SCHEDULED)
                .notes(request.getNotes())
                .build();

        return ResponseEntity.ok(TripResponse.from(tripService.create(trip)));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        tripService.cancel(id);
        return ResponseEntity.ok().build();
    }
}