package com.uz.taxi.samarkand_tashkent.domain.booking.controller;

import com.uz.taxi.samarkand_tashkent.domain.booking.dto.BookingResponse;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.service.BookingService;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<BookingResponse> create(
            @RequestParam Long tripId,
            @RequestParam(defaultValue = "1") int seats,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User passenger = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingService.create(passenger.getId(), tripId, seats);
        return ResponseEntity.ok(BookingResponse.from(booking));
    }

    @GetMapping("/my")
    @Transactional
    public ResponseEntity<List<BookingResponse>> myBookings(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User passenger = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<BookingResponse> bookings = bookingService.findByPassenger(passenger.getId())
                .stream()
                .map(BookingResponse::from)
                .toList();

        return ResponseEntity.ok(bookings);
    }

    @PatchMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<Void> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User passenger = userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        bookingService.cancel(id, passenger.getId());
        return ResponseEntity.ok().build();
    }
}