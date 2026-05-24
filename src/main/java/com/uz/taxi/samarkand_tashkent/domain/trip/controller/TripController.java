package com.uz.taxi.samarkand_tashkent.domain.trip.controller;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.trip.dto.TripCreateRequest;
import com.uz.taxi.samarkand_tashkent.domain.trip.dto.TripResponse;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.service.TripService;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final UserRepository userRepository;

    /**
     * Поиск рейсов с пагинацией и фильтрами.
     * Примеры:
     *   GET /api/trips?direction=SAMARKAND_TO_TASHKENT&minSeats=2&page=0&size=10
     *   GET /api/trips?dateFrom=2026-05-23T00:00:00&dateTo=2026-05-23T23:59:59
     *   GET /api/trips?sort=departureTime,asc&sort=price,asc
     */
    @GetMapping
    public ResponseEntity<Page<TripResponse>> search(
            @RequestParam(required = false) Trip.Direction direction,
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @PageableDefault(size = 20, sort = "departureTime", direction = Sort.Direction.ASC)
            Pageable pageable
    ) {
        Page<TripResponse> result = tripService
                .searchTrips(direction, minSeats, dateFrom, dateTo, pageable)
                .map(TripResponse::from);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Transactional
    public ResponseEntity<TripResponse> getById(@PathVariable Long id) {
        Trip trip = tripService.findById(id)
                .orElseThrow(() -> new ApiException("Trip not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(TripResponse.from(trip));
    }

    /**
     * Рейсы текущего водителя (свои).
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<Page<TripResponse>> getMyTrips(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "departureTime", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        User driver = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Page<TripResponse> result = tripService
                .findMyTrips(driver.getId(), pageable)
                .map(TripResponse::from);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<TripResponse> create(
            @Valid @RequestBody TripCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User driver = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

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
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TripResponse> completeTrip(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(tripService.completeTrip(id, userDetails.getUsername()));
    }

}