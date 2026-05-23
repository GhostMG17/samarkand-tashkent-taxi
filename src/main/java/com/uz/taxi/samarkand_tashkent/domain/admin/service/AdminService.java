package com.uz.taxi.samarkand_tashkent.domain.admin.service;

import com.uz.taxi.samarkand_tashkent.domain.admin.dto.StatsResponse;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    // Users
    Page<User> searchUsers(User.Role role, Boolean active, Pageable pageable);
    User getUserById(Long id);
    User setUserActive(Long userId, boolean active);
    User updateUserRole(Long userId, User.Role newRole);

    // Trips
    Page<Trip> searchAllTrips(Trip.Status status, Trip.Direction direction, Pageable pageable);

    // Bookings
    Page<Booking> searchAllBookings(Booking.Status status, Booking.PaymentStatus paymentStatus, Pageable pageable);

    // Stats
    StatsResponse getStats();
}