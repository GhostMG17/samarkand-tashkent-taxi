package com.uz.taxi.samarkand_tashkent.domain.booking.controller;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.booking.dto.BookingCreateRequest;
import com.uz.taxi.samarkand_tashkent.domain.booking.dto.BookingResponse;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.service.BookingService;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    /**
     * Создание бронирования.
     * Body: { "tripId": 1, "seatsCount": 2 }
     */
    @PostMapping
    public ResponseEntity<BookingResponse> create(
            @Valid @RequestBody BookingCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User passenger = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Booking booking = bookingService.create(
                passenger.getId(),
                request.getTripId(),
                request.getSeatsCount()
        );
        return ResponseEntity.ok(BookingResponse.from(booking));
    }

    /**
     * Мои бронирования (для пассажира) с пагинацией.
     */
    @GetMapping("/my")
    public ResponseEntity<Page<BookingResponse>> myBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        User passenger = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Page<BookingResponse> bookings = bookingService
                .findByPassenger(passenger.getId(), pageable)
                .map(BookingResponse::from);

        return ResponseEntity.ok(bookings);
    }

    /**
     * Пассажиры конкретного рейса (для водителя этого рейса).
     */
    @GetMapping("/trip/{tripId}/passengers")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getTripPassengers(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ApiException("Trip not found", HttpStatus.NOT_FOUND));

        // Водитель может смотреть только свои рейсы. Админ — любые.
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        if (!isAdmin && !trip.getDriver().getId().equals(currentUser.getId())) {
            throw new ApiException("You can only view passengers of your own trips", HttpStatus.FORBIDDEN);
        }

        List<BookingResponse> passengers = bookingService.findByTrip(tripId).stream()
                .map(BookingResponse::from)
                .toList();
        return ResponseEntity.ok(passengers);
    }

    /**
     * Отмена бронирования.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        bookingService.cancel(id, currentUser.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}