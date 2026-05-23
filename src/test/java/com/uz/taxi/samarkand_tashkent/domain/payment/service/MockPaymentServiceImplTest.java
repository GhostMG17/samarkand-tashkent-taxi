package com.uz.taxi.samarkand_tashkent.domain.payment.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.repository.BookingRepository;
import com.uz.taxi.samarkand_tashkent.domain.notification.service.NotificationService;
import com.uz.taxi.samarkand_tashkent.domain.payment.dto.PaymentResponse;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
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
@DisplayName("MockPaymentServiceImpl Tests")
class MockPaymentServiceImplTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private MockPaymentServiceImpl paymentService;

    private User passenger;
    private User driver;
    private Trip trip;
    private Booking booking;

    @BeforeEach
    void setUp() {
        passenger = User.builder()
                .id(1L)
                .phone("+998901111111")
                .firstName("Ali")
                .role(User.Role.PASSENGER)
                .build();

        driver = User.builder()
                .id(2L)
                .phone("+998902222222")
                .firstName("Sardor")
                .role(User.Role.DRIVER)
                .build();

        trip = Trip.builder()
                .id(10L)
                .driver(driver)
                .departureTime(LocalDateTime.now().plusDays(1))
                .price(new BigDecimal("150000.00"))
                .status(Trip.Status.SCHEDULED)
                .build();

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

    // ============================================================
    // PAY FOR BOOKING
    // ============================================================

    @Nested
    @DisplayName("payForBooking()")
    class PayForBooking {

        @Test
        @DisplayName("✅ Успешная оплата меняет статус на PAID")
        void shouldPaySuccessfully() {
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentService.payForBooking(100L, 1L);

            assertThat(response).isNotNull();
            assertThat(response.getBookingId()).isEqualTo(100L);
            assertThat(response.getAmount()).isEqualByComparingTo("300000.00");
            assertThat(response.getPaymentStatus()).isEqualTo(Booking.PaymentStatus.PAID);
            assertThat(response.getPaymentId()).startsWith("MOCK_");
            assertThat(booking.getPaymentStatus()).isEqualTo(Booking.PaymentStatus.PAID);
            assertThat(booking.getPaymentId()).isNotNull();
        }

        @Test
        @DisplayName("✅ После оплаты летят уведомления пассажиру и водителю")
        void shouldSendNotificationsAfterPayment() {
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            paymentService.payForBooking(100L, 1L);

            verify(notificationService).notifyPaymentSuccess(
                    eq("+998901111111"),
                    eq(100L),
                    anyString(),
                    eq("+998902222222")
            );
            verify(notificationService).notifyDriverPaymentReceived(
                    eq("+998902222222"),
                    anyString(),
                    eq(2)
            );
        }

        @Test
        @DisplayName("❌ Несуществующая бронь → 404")
        void shouldThrowWhenBookingNotFound() {
            when(bookingRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.payForBooking(999L, 1L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Booking not found")
                    .extracting("status")
                    .isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("❌ Чужая бронь → 403")
        void shouldThrowWhenPayingForForeignBooking() {
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> paymentService.payForBooking(100L, 999L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("only pay for your own")
                    .extracting("status")
                    .isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("❌ Отменённая бронь → 400")
        void shouldThrowWhenBookingCancelled() {
            booking.setStatus(Booking.Status.CANCELLED);
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> paymentService.payForBooking(100L, 1L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("cancelled");
        }

        @Test
        @DisplayName("❌ Повторная оплата → 400")
        void shouldThrowWhenAlreadyPaid() {
            booking.setPaymentStatus(Booking.PaymentStatus.PAID);
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> paymentService.payForBooking(100L, 1L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("already paid");
        }

        @Test
        @DisplayName("❌ Возвращённая бронь не может быть оплачена → 400")
        void shouldThrowWhenBookingRefunded() {
            booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> paymentService.payForBooking(100L, 1L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("refunded");
        }
    }

    // ============================================================
    // REFUND
    // ============================================================

    @Nested
    @DisplayName("refundBooking()")
    class RefundBooking {

        @Test
        @DisplayName("✅ Успешный возврат меняет статус на REFUNDED")
        void shouldRefundSuccessfully() {
            booking.setPaymentStatus(Booking.PaymentStatus.PAID);
            booking.setPaymentId("MOCK_ABC123");
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            PaymentResponse response = paymentService.refundBooking(100L);

            assertThat(response).isNotNull();
            assertThat(response.getPaymentStatus()).isEqualTo(Booking.PaymentStatus.REFUNDED);
            assertThat(response.getMessage()).contains("Refund successful");
            assertThat(booking.getPaymentStatus()).isEqualTo(Booking.PaymentStatus.REFUNDED);
        }

        @Test
        @DisplayName("❌ Возврат неоплаченной брони → 400")
        void shouldThrowWhenRefundingUnpaidBooking() {
            // booking.paymentStatus = UNPAID по умолчанию
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> paymentService.refundBooking(100L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Only paid bookings");
        }

        @Test
        @DisplayName("❌ Повторный возврат → 400")
        void shouldThrowWhenAlreadyRefunded() {
            booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
            when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> paymentService.refundBooking(100L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Only paid bookings");
        }

        @Test
        @DisplayName("❌ Несуществующая бронь → 404")
        void shouldThrowWhenBookingNotFound() {
            when(bookingRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.refundBooking(999L))
                    .isInstanceOf(ApiException.class)
                    .extracting("status")
                    .isEqualTo(HttpStatus.NOT_FOUND);
        }
    }
}