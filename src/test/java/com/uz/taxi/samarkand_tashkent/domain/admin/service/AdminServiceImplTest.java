package com.uz.taxi.samarkand_tashkent.domain.admin.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.admin.dto.StatsResponse;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.repository.BookingRepository;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminServiceImpl Tests")
class AdminServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private TripRepository tripRepository;
    @Mock private BookingRepository bookingRepository;

    @InjectMocks private AdminServiceImpl adminService;

    private User passenger;
    private User driver;
    private User admin;

    @BeforeEach
    void setUp() {
        passenger = User.builder()
                .id(1L)
                .phone("+998901111111")
                .firstName("Ali")
                .role(User.Role.PASSENGER)
                .active(true)
                .build();

        driver = User.builder()
                .id(2L)
                .phone("+998902222222")
                .firstName("Sardor")
                .role(User.Role.DRIVER)
                .active(true)
                .build();

        admin = User.builder()
                .id(3L)
                .phone("+998903333333")
                .firstName("Admin")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
    }

    // ============================================================
    // GET USER
    // ============================================================

    @Nested
    @DisplayName("getUserById()")
    class GetUser {

        @Test
        @DisplayName("✅ Возвращает пользователя по ID")
        void shouldReturnUserById() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(passenger));

            User result = adminService.getUserById(1L);

            assertThat(result).isEqualTo(passenger);
        }

        @Test
        @DisplayName("❌ Несуществующий пользователь → 404")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> adminService.getUserById(999L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("User not found")
                    .extracting("status")
                    .isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    // ============================================================
    // SET USER ACTIVE
    // ============================================================

    @Nested
    @DisplayName("setUserActive()")
    class SetUserActive {

        @Test
        @DisplayName("✅ Деактивация пассажира")
        void shouldDeactivatePassenger() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(passenger));
            when(userRepository.save(any(User.class))).thenReturn(passenger);

            User result = adminService.setUserActive(1L, false);

            assertThat(result.getActive()).isFalse();
            verify(userRepository).save(passenger);
        }

        @Test
        @DisplayName("✅ Активация деактивированного водителя")
        void shouldActivateDriver() {
            driver.setActive(false);
            when(userRepository.findById(2L)).thenReturn(Optional.of(driver));
            when(userRepository.save(any(User.class))).thenReturn(driver);

            User result = adminService.setUserActive(2L, true);

            assertThat(result.getActive()).isTrue();
        }

        @Test
        @DisplayName("❌ Нельзя деактивировать админа → 400")
        void shouldNotAllowDeactivatingAdmin() {
            when(userRepository.findById(3L)).thenReturn(Optional.of(admin));

            assertThatThrownBy(() -> adminService.setUserActive(3L, false))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Cannot deactivate an admin")
                    .extracting("status")
                    .isEqualTo(HttpStatus.BAD_REQUEST);

            verify(userRepository, never()).save(any());
        }
    }

    // ============================================================
    // UPDATE USER ROLE
    // ============================================================

    @Nested
    @DisplayName("updateUserRole()")
    class UpdateUserRole {

        @Test
        @DisplayName("✅ Повышение пассажира до водителя")
        void shouldPromotePassengerToDriver() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(passenger));
            when(userRepository.save(any(User.class))).thenReturn(passenger);

            User result = adminService.updateUserRole(1L, User.Role.DRIVER);

            assertThat(result.getRole()).isEqualTo(User.Role.DRIVER);
        }

        @Test
        @DisplayName("✅ Повышение водителя до админа")
        void shouldPromoteDriverToAdmin() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(driver));
            when(userRepository.save(any(User.class))).thenReturn(driver);

            User result = adminService.updateUserRole(2L, User.Role.ADMIN);

            assertThat(result.getRole()).isEqualTo(User.Role.ADMIN);
        }

        @Test
        @DisplayName("✅ Понижение админа когда есть другие админы — можно")
        void shouldDemoteAdminWhenOtherAdminsExist() {
            when(userRepository.findById(3L)).thenReturn(Optional.of(admin));
            when(userRepository.countByRole(User.Role.ADMIN)).thenReturn(2L); // есть ещё один
            when(userRepository.save(any(User.class))).thenReturn(admin);

            User result = adminService.updateUserRole(3L, User.Role.DRIVER);

            assertThat(result.getRole()).isEqualTo(User.Role.DRIVER);
        }

        @Test
        @DisplayName("❌ Нельзя понизить ПОСЛЕДНЕГО админа → 400")
        void shouldNotAllowDemotingLastAdmin() {
            when(userRepository.findById(3L)).thenReturn(Optional.of(admin));
            when(userRepository.countByRole(User.Role.ADMIN)).thenReturn(1L); // только один админ

            assertThatThrownBy(() -> adminService.updateUserRole(3L, User.Role.DRIVER))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("last admin")
                    .extracting("status")
                    .isEqualTo(HttpStatus.BAD_REQUEST);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("✅ Назначить роль ADMIN другому пользователю (когда сам не админ)")
        void shouldAllowAssigningAdminRole() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(passenger));
            when(userRepository.save(any(User.class))).thenReturn(passenger);

            User result = adminService.updateUserRole(1L, User.Role.ADMIN);

            assertThat(result.getRole()).isEqualTo(User.Role.ADMIN);
            // countByRole не должен вызываться, потому что юзер не админ
            verify(userRepository, never()).countByRole(any());
        }
    }

    // ============================================================
    // STATS
    // ============================================================

    @Nested
    @DisplayName("getStats()")
    class GetStats {

        @Test
        @DisplayName("✅ Возвращает статистику с правильными подсчётами")
        void shouldReturnStats() {
            // Users
            when(userRepository.count()).thenReturn(10L);
            when(userRepository.countByRole(User.Role.PASSENGER)).thenReturn(5L);
            when(userRepository.countByRole(User.Role.DRIVER)).thenReturn(4L);
            when(userRepository.countByRole(User.Role.ADMIN)).thenReturn(1L);
            when(userRepository.countByActive(true)).thenReturn(9L);
            when(userRepository.countByActive(false)).thenReturn(1L);

            // Trips
            when(tripRepository.count()).thenReturn(20L);
            when(tripRepository.countByStatus(Trip.Status.SCHEDULED)).thenReturn(15L);
            when(tripRepository.countByStatus(Trip.Status.COMPLETED)).thenReturn(3L);
            when(tripRepository.countByStatus(Trip.Status.CANCELLED)).thenReturn(2L);

            // Bookings
            when(bookingRepository.count()).thenReturn(30L);
            when(bookingRepository.countByStatus(Booking.Status.CONFIRMED)).thenReturn(25L);
            when(bookingRepository.countByStatus(Booking.Status.CANCELLED)).thenReturn(5L);
            when(bookingRepository.countBookingsCreatedAfter(any())).thenReturn(10L);

            // Finance
            when(bookingRepository.countByPaymentStatus(Booking.PaymentStatus.PAID)).thenReturn(20L);
            when(bookingRepository.countByPaymentStatus(Booking.PaymentStatus.UNPAID)).thenReturn(10L);
            when(bookingRepository.calculateTotalRevenue()).thenReturn(new BigDecimal("6000000.00"));
            when(bookingRepository.calculateRevenueAfter(any())).thenReturn(new BigDecimal("1500000.00"));

            // Top drivers — пустой
            when(tripRepository.findTopDriversByTripCount(any())).thenReturn(List.of());

            StatsResponse stats = adminService.getStats();

            assertThat(stats).isNotNull();
            assertThat(stats.getTotalUsers()).isEqualTo(10L);
            assertThat(stats.getTotalPassengers()).isEqualTo(5L);
            assertThat(stats.getTotalDrivers()).isEqualTo(4L);
            assertThat(stats.getTotalAdmins()).isEqualTo(1L);
            assertThat(stats.getTotalTrips()).isEqualTo(20L);
            assertThat(stats.getScheduledTrips()).isEqualTo(15L);
            assertThat(stats.getTotalBookings()).isEqualTo(30L);
            assertThat(stats.getPaidBookings()).isEqualTo(20L);
            assertThat(stats.getTotalRevenue()).isEqualByComparingTo("6000000.00");
            assertThat(stats.getTopDrivers()).isEmpty();
        }

        @Test
        @DisplayName("✅ Топ-водители корректно мапятся из Object[]")
        void shouldMapTopDriversCorrectly() {
            // Все count методы возвращают 0/null безопасно
            when(userRepository.count()).thenReturn(0L);
            when(userRepository.countByRole(any())).thenReturn(0L);
            when(userRepository.countByActive(any())).thenReturn(0L);
            when(tripRepository.count()).thenReturn(0L);
            when(tripRepository.countByStatus(any())).thenReturn(0L);
            when(bookingRepository.count()).thenReturn(0L);
            when(bookingRepository.countByStatus(any())).thenReturn(0L);
            when(bookingRepository.countByPaymentStatus(any())).thenReturn(0L);
            when(bookingRepository.countBookingsCreatedAfter(any())).thenReturn(0L);
            when(bookingRepository.calculateTotalRevenue()).thenReturn(BigDecimal.ZERO);
            when(bookingRepository.calculateRevenueAfter(any())).thenReturn(BigDecimal.ZERO);

            // Mock топ-водителей: 2 строки данных
            Object[] row1 = {2L, "Sardor", "Driver", "+998902222222", 15L};
            Object[] row2 = {5L, "Ali", null, "+998905555555", 10L};
            when(tripRepository.findTopDriversByTripCount(any())).thenReturn(List.of(row1, row2));

            StatsResponse stats = adminService.getStats();

            assertThat(stats.getTopDrivers()).hasSize(2);

            StatsResponse.TopDriver first = stats.getTopDrivers().get(0);
            assertThat(first.getDriverId()).isEqualTo(2L);
            assertThat(first.getDriverName()).isEqualTo("Sardor Driver");
            assertThat(first.getDriverPhone()).isEqualTo("+998902222222");
            assertThat(first.getTripsCount()).isEqualTo(15L);

            StatsResponse.TopDriver second = stats.getTopDrivers().get(1);
            assertThat(second.getDriverName()).isEqualTo("Ali"); // без lastName
            assertThat(second.getTripsCount()).isEqualTo(10L);
        }
    }
}