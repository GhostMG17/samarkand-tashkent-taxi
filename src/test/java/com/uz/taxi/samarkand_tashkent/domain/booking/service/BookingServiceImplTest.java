package com.uz.taxi.samarkand_tashkent.domain.booking.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.repository.BookingRepository;
import com.uz.taxi.samarkand_tashkent.domain.notification.service.NotificationService;
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
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingServiceImpl Tests")
class BookingServiceImplTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private TripRepository tripRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private BookingServiceImpl bookingService;

    private User passenger;
    private User driver;
    private Trip trip;

    @BeforeEach
    void setUp() {
        passenger = User.builder()
                .id(1L)
                .phone("+998901111111")
                .firstName("Ali")
                .lastName("Karimov")
                .role(User.Role.PASSENGER)
                .active(true)
                .build();

        driver = User.builder()
                .id(2L)
                .phone("+998902222222")
                .firstName("Sardor")
                .lastName("Driver")
                .role(User.Role.DRIVER)
                .active(true)
                .build();

        trip = Trip.builder()
                .id(10L)
                .driver(driver)
                .direction(Trip.Direction.SAMARKAND_TO_TASHKENT)
                .departureTime(LocalDateTime.now().plusDays(2))
                .totalSeats(4)
                .availableSeats(4)
                .price(new BigDecimal("150000.00"))
                .status(Trip.Status.SCHEDULED)
                .build();
    }

    // ============================================================
    // CREATE BOOKING
    // ============================================================

    @Nested
    @DisplayName("create()")
    class CreateBooking {

        @Test
        @DisplayName("✅ Успешно создаёт бронирование")
        void shouldCreateBookingSuccessfully() {
            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));
            when(bookingRepository.findActiveBookingByPassengerAndTrip(1L, 10L)).thenReturn(Optional.empty());
            when(userRepository.findById(1L)).thenReturn(Optional.of(passenger));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
                Booking b = invocation.getArgument(0);
                b.setId(100L);
                return b;
            });

            Booking result = bookingService.create(1L, 10L, 2);

            assertThat(result).isNotNull();
            assertThat(result.getSeatsCount()).isEqualTo(2);
            assertThat(result.getTotalPrice()).isEqualByComparingTo("300000.00");
            assertThat(result.getStatus()).isEqualTo(Booking.Status.CONFIRMED);
            assertThat(result.getPaymentStatus()).isEqualTo(Booking.PaymentStatus.UNPAID);
            assertThat(trip.getAvailableSeats()).isEqualTo(2); // было 4, забрали 2
        }

        @Test
        @DisplayName("✅ Уведомления отправляются после создания")
        void shouldSendNotificationsAfterCreate() {
            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));
            when(bookingRepository.findActiveBookingByPassengerAndTrip(1L, 10L)).thenReturn(Optional.empty());
            when(userRepository.findById(1L)).thenReturn(Optional.of(passenger));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
                Booking b = invocation.getArgument(0);
                b.setId(100L);
                return b;
            });

            bookingService.create(1L, 10L, 1);

            verify(notificationService).notifyBookingCreated(eq("+998901111111"), eq(100L), anyString(), anyString());
            verify(notificationService).notifyDriverNewBooking(eq("+998902222222"), anyString(), anyString(), eq(1));
        }

        @Test
        @DisplayName("❌ Бронь несуществующего рейса → 404")
        void shouldThrowWhenTripNotFound() {
            when(tripRepository.findByIdWithLock(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.create(1L, 999L, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Trip not found")
                    .extracting("status")
                    .isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("❌ seatsCount < 1 → 400")
        void shouldThrowWhenSeatsCountIsZero() {
            assertThatThrownBy(() -> bookingService.create(1L, 10L, 0))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("at least 1")
                    .extracting("status")
                    .isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("❌ Отменённый рейс → 400")
        void shouldThrowWhenTripCancelled() {
            trip.setStatus(Trip.Status.CANCELLED);
            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));

            assertThatThrownBy(() -> bookingService.create(1L, 10L, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("cancelled");
        }

        @Test
        @DisplayName("❌ Прошедший рейс → 400")
        void shouldThrowWhenTripInPast() {
            trip.setDepartureTime(LocalDateTime.now().minusDays(1));
            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));

            assertThatThrownBy(() -> bookingService.create(1L, 10L, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("already departed");
        }

        @Test
        @DisplayName("❌ Водитель не может забронировать свой же рейс → 400")
        void shouldThrowWhenBookingOwnTrip() {
            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));

            // passengerId = 2L = driverId → пытается забронировать СВОЙ рейс
            assertThatThrownBy(() -> bookingService.create(2L, 10L, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("own trip");
        }

        @Test
        @DisplayName("❌ Дубликат активной брони → 409")
        void shouldThrowWhenDuplicateBooking() {
            Booking existing = Booking.builder()
                    .id(50L)
                    .passenger(passenger)
                    .trip(trip)
                    .status(Booking.Status.CONFIRMED)
                    .build();

            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));
            when(bookingRepository.findActiveBookingByPassengerAndTrip(1L, 10L)).thenReturn(Optional.of(existing));

            assertThatThrownBy(() -> bookingService.create(1L, 10L, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("already have")
                    .extracting("status")
                    .isEqualTo(HttpStatus.CONFLICT);
        }

        @Test
        @DisplayName("❌ Недостаточно мест → 409")
        void shouldThrowWhenNotEnoughSeats() {
            trip.setAvailableSeats(1);
            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));
            when(bookingRepository.findActiveBookingByPassengerAndTrip(1L, 10L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.create(1L, 10L, 3))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Not enough seats")
                    .extracting("status")
                    .isEqualTo(HttpStatus.CONFLICT);
        }
    }

    // ============================================================
    // CANCEL BOOKING
    // ============================================================

    @Nested
    @DisplayName("cancel()")
    class CancelBooking {

        private Booking booking;

        @BeforeEach
        void setUpBooking() {
            trip.setAvailableSeats(2);
            booking = Booking.builder()
                    .id(100L)
                    .passenger(passenger)
                    .trip(trip)
                    .seatsCount(2)
                    .totalPrice(new BigDecimal("300000.00"))
                    .status(Booking.Status.CONFIRMED)
                    .paymentStatus(Booking.PaymentStatus.UNPAID)
                    .build();
        }

        @Test
        @DisplayName("✅ Пассажир отменяет свою бронь, места возвращаются")
        void shouldCancelOwnBookingAndReturnSeats() {
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));
            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));

            bookingService.cancel(100L, 1L, false);

            assertThat(booking.getStatus()).isEqualTo(Booking.Status.CANCELLED);
            assertThat(trip.getAvailableSeats()).isEqualTo(4); // было 2, вернули 2
            verify(notificationService, times(2)).notifyBookingCancelled(anyString(), eq(100L));
        }

        @Test
        @DisplayName("✅ Админ может отменять чужие брони")
        void shouldAllowAdminToCancelAnyBooking() {
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));
            when(tripRepository.findByIdWithLock(10L)).thenReturn(Optional.of(trip));

            // currentUserId = 999L (другой юзер), но isAdmin = true
            bookingService.cancel(100L, 999L, true);

            assertThat(booking.getStatus()).isEqualTo(Booking.Status.CANCELLED);
        }

        @Test
        @DisplayName("❌ Чужая бронь без админских прав → 403")
        void shouldThrowWhenCancellingOthersBooking() {
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.cancel(100L, 999L, false))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("only cancel your own")
                    .extracting("status")
                    .isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("❌ Уже отменённая бронь → 400")
        void shouldThrowWhenAlreadyCancelled() {
            booking.setStatus(Booking.Status.CANCELLED);
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.cancel(100L, 1L, false))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("already cancelled");
        }

        @Test
        @DisplayName("❌ Отмена прошедшего рейса → 400")
        void shouldThrowWhenTripAlreadyDeparted() {
            trip.setDepartureTime(LocalDateTime.now().minusHours(1));
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.cancel(100L, 1L, false))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("past trip");
        }

        @Test
        @DisplayName("✅ Если рейс отменён водителем, места НЕ возвращаются (нечего возвращать)")
        void shouldNotReturnSeatsIfTripCancelled() {
            trip.setStatus(Trip.Status.CANCELLED);
            int seatsBefore = trip.getAvailableSeats();

            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            bookingService.cancel(100L, 1L, false);

            assertThat(trip.getAvailableSeats()).isEqualTo(seatsBefore); // не изменилось
            verify(tripRepository, never()).findByIdWithLock(anyLong()); // не блокировали trip
        }

        @Test
        @DisplayName("❌ Несуществующая бронь → 404")
        void shouldThrowWhenBookingNotFound() {
            when(bookingRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.cancel(999L, 1L, false))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Booking not found")
                    .extracting("status")
                    .isEqualTo(HttpStatus.NOT_FOUND);
        }
    }
}