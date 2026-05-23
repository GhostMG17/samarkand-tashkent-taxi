package com.uz.taxi.samarkand_tashkent.domain.admin.controller;

import com.uz.taxi.samarkand_tashkent.domain.admin.dto.StatsResponse;
import com.uz.taxi.samarkand_tashkent.domain.admin.dto.UpdateRoleRequest;
import com.uz.taxi.samarkand_tashkent.domain.admin.dto.UserResponse;
import com.uz.taxi.samarkand_tashkent.domain.admin.service.AdminService;
import com.uz.taxi.samarkand_tashkent.domain.booking.dto.BookingResponse;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.trip.dto.TripResponse;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ============ USERS ============

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) User.Role role,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<UserResponse> users = adminService
                .searchUsers(role, active, pageable)
                .map(UserResponse::from);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(UserResponse.from(adminService.getUserById(id)));
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(UserResponse.from(adminService.setUserActive(id, false)));
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(UserResponse.from(adminService.setUserActive(id, true)));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        return ResponseEntity.ok(UserResponse.from(
                adminService.updateUserRole(id, request.getRole())
        ));
    }

    // ============ TRIPS ============

    @GetMapping("/trips")
    public ResponseEntity<Page<TripResponse>> getTrips(
            @RequestParam(required = false) Trip.Status status,
            @RequestParam(required = false) Trip.Direction direction,
            @PageableDefault(size = 20, sort = "departureTime", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<TripResponse> trips = adminService
                .searchAllTrips(status, direction, pageable)
                .map(TripResponse::from);
        return ResponseEntity.ok(trips);
    }

    // ============ BOOKINGS ============

    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingResponse>> getBookings(
            @RequestParam(required = false) Booking.Status status,
            @RequestParam(required = false) Booking.PaymentStatus paymentStatus,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<BookingResponse> bookings = adminService
                .searchAllBookings(status, paymentStatus, pageable)
                .map(BookingResponse::from);
        return ResponseEntity.ok(bookings);
    }

    // ============ STATS ============

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}