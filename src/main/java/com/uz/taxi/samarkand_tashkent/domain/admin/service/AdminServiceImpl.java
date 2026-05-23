package com.uz.taxi.samarkand_tashkent.domain.admin.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.admin.dto.StatsResponse;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.repository.BookingRepository;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final BookingRepository bookingRepository;

    // ============ USERS ============

    @Override
    public Page<User> searchUsers(User.Role role, Boolean active, Pageable pageable) {
        return userRepository.searchUsers(role, active, pageable);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional
    public User setUserActive(Long userId, boolean active) {
        User user = getUserById(userId);

        // Защита: нельзя деактивировать админа (чтобы не остаться без админов)
        if (!active && user.getRole() == User.Role.ADMIN) {
            throw new ApiException("Cannot deactivate an admin", HttpStatus.BAD_REQUEST);
        }

        user.setActive(active);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUserRole(Long userId, User.Role newRole) {
        User user = getUserById(userId);

        // Защита: нельзя понизить последнего админа
        if (user.getRole() == User.Role.ADMIN && newRole != User.Role.ADMIN) {
            long adminCount = userRepository.countByRole(User.Role.ADMIN);
            if (adminCount <= 1) {
                throw new ApiException("Cannot demote the last admin", HttpStatus.BAD_REQUEST);
            }
        }

        user.setRole(newRole);
        return userRepository.save(user);
    }

    // ============ TRIPS ============

    @Override
    public Page<Trip> searchAllTrips(Trip.Status status, Trip.Direction direction, Pageable pageable) {
        return tripRepository.searchAllTrips(status, direction, pageable);
    }

    // ============ BOOKINGS ============

    @Override
    public Page<Booking> searchAllBookings(Booking.Status status, Booking.PaymentStatus paymentStatus, Pageable pageable) {
        return bookingRepository.searchAllBookings(status, paymentStatus, pageable);
    }

    // ============ STATS ============

    @Override
    public StatsResponse getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        // Топ-5 водителей
        List<Object[]> topDriversRaw = tripRepository.findTopDriversByTripCount(PageRequest.of(0, 5));
        List<StatsResponse.TopDriver> topDrivers = new ArrayList<>();
        for (Object[] row : topDriversRaw) {
            String firstName = (String) row[1];
            String lastName = (String) row[2];
            String fullName = firstName + (lastName != null ? " " + lastName : "");
            topDrivers.add(StatsResponse.TopDriver.builder()
                    .driverId((Long) row[0])
                    .driverName(fullName)
                    .driverPhone((String) row[3])
                    .tripsCount((Long) row[4])
                    .build());
        }

        return StatsResponse.builder()
                // Users
                .totalUsers(userRepository.count())
                .totalPassengers(userRepository.countByRole(User.Role.PASSENGER))
                .totalDrivers(userRepository.countByRole(User.Role.DRIVER))
                .totalAdmins(userRepository.countByRole(User.Role.ADMIN))
                .activeUsers(userRepository.countByActive(true))
                .inactiveUsers(userRepository.countByActive(false))

                // Trips
                .totalTrips(tripRepository.count())
                .scheduledTrips(tripRepository.countByStatus(Trip.Status.SCHEDULED))
                .completedTrips(tripRepository.countByStatus(Trip.Status.COMPLETED))
                .cancelledTrips(tripRepository.countByStatus(Trip.Status.CANCELLED))

                // Bookings
                .totalBookings(bookingRepository.count())
                .confirmedBookings(bookingRepository.countByStatus(Booking.Status.CONFIRMED))
                .cancelledBookings(bookingRepository.countByStatus(Booking.Status.CANCELLED))
                .bookingsToday(bookingRepository.countBookingsCreatedAfter(startOfToday))
                .bookingsThisWeek(bookingRepository.countBookingsCreatedAfter(startOfWeek))
                .bookingsThisMonth(bookingRepository.countBookingsCreatedAfter(startOfMonth))

                // Finance
                .paidBookings(bookingRepository.countByPaymentStatus(Booking.PaymentStatus.PAID))
                .unpaidBookings(bookingRepository.countByPaymentStatus(Booking.PaymentStatus.UNPAID))
                .totalRevenue(bookingRepository.calculateTotalRevenue())
                .revenueToday(bookingRepository.calculateRevenueAfter(startOfToday))
                .revenueThisMonth(bookingRepository.calculateRevenueAfter(startOfMonth))

                // Top drivers
                .topDrivers(topDrivers)
                .build();
    }
}