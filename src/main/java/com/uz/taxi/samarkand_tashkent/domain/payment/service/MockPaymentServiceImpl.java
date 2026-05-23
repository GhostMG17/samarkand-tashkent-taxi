package com.uz.taxi.samarkand_tashkent.domain.payment.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.repository.BookingRepository;
import com.uz.taxi.samarkand_tashkent.domain.notification.service.NotificationService;
import com.uz.taxi.samarkand_tashkent.domain.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockPaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public PaymentResponse payForBooking(Long bookingId, Long passengerId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        // Только владелец брони может её оплатить
        if (!booking.getPassenger().getId().equals(passengerId)) {
            throw new ApiException("You can only pay for your own bookings", HttpStatus.FORBIDDEN);
        }

        // Проверки статуса
        if (booking.getStatus() == Booking.Status.CANCELLED) {
            throw new ApiException("Cannot pay for cancelled booking", HttpStatus.BAD_REQUEST);
        }
        if (booking.getPaymentStatus() == Booking.PaymentStatus.PAID) {
            throw new ApiException("Booking is already paid", HttpStatus.BAD_REQUEST);
        }
        if (booking.getPaymentStatus() == Booking.PaymentStatus.REFUNDED) {
            throw new ApiException("Booking was refunded, cannot pay again", HttpStatus.BAD_REQUEST);
        }

        // MOCK: моментальная оплата
        String mockPaymentId = "MOCK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        booking.setPaymentStatus(Booking.PaymentStatus.PAID);
        booking.setPaymentId(mockPaymentId);
        bookingRepository.save(booking);

        log.info("💳 [MOCK PAYMENT] Booking #{} paid. Amount: {}, PaymentID: {}",
                booking.getId(), booking.getTotalPrice(), mockPaymentId);

        String driverName = booking.getTrip().getDriver().getFirstName();
        String driverPhone = booking.getTrip().getDriver().getPhone();
        String passengerName = booking.getPassenger().getFirstName();

        notificationService.notifyPaymentSuccess(
                booking.getPassenger().getPhone(),
                booking.getId(),
                driverName,
                driverPhone
        );
        notificationService.notifyDriverPaymentReceived(
                driverPhone,
                passengerName,
                booking.getSeatsCount()
        );

        return PaymentResponse.success(booking);
    }

    @Override
    @Transactional
    public PaymentResponse refundBooking(Long bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        if (booking.getPaymentStatus() != Booking.PaymentStatus.PAID) {
            throw new ApiException("Only paid bookings can be refunded", HttpStatus.BAD_REQUEST);
        }

        booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        bookingRepository.save(booking);

        log.info("💸 [MOCK REFUND] Booking #{} refunded. Amount: {}",
                booking.getId(), booking.getTotalPrice());

        return PaymentResponse.builder()
                .bookingId(booking.getId())
                .amount(booking.getTotalPrice())
                .paymentStatus(booking.getPaymentStatus())
                .paymentId(booking.getPaymentId())
                .message("Refund successful")
                .build();
    }
}