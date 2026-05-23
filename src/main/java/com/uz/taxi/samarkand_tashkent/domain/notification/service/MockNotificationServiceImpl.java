package com.uz.taxi.samarkand_tashkent.domain.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MockNotificationServiceImpl implements NotificationService {

    private static final String DIVIDER = "═══════════════════════════════════════════";

    @Override
    public void sendSms(String phone, String message) {
        log.info("\n{}\n📱 [MOCK SMS] → {}\n   {}\n{}", DIVIDER, phone, message, DIVIDER);
    }

    @Override
    public void notifyBookingCreated(String passengerPhone, Long bookingId, String driverName, String driverPhone) {
        String message = String.format(
                "Бронирование #%d создано! Водитель: %s (%s). Оплатите бронь для подтверждения.",
                bookingId, driverName, driverPhone
        );
        sendSms(passengerPhone, message);
    }

    @Override
    public void notifyPaymentSuccess(String passengerPhone, Long bookingId, String driverName, String driverPhone) {
        String message = String.format(
                "✅ Оплата по бронированию #%d прошла успешно! Водитель: %s, тел: %s",
                bookingId, driverName, driverPhone
        );
        sendSms(passengerPhone, message);
    }

    @Override
    public void notifyDriverNewBooking(String driverPhone, String passengerName, String passengerPhone, int seatsCount) {
        String message = String.format(
                "🚕 Новое бронирование! Пассажир: %s (%s), мест: %d. Ожидает оплаты.",
                passengerName, passengerPhone, seatsCount
        );
        sendSms(driverPhone, message);
    }

    @Override
    public void notifyDriverPaymentReceived(String driverPhone, String passengerName, int seatsCount) {
        String message = String.format(
                "💰 Оплата получена от %s (мест: %d). Бронирование подтверждено.",
                passengerName, seatsCount
        );
        sendSms(driverPhone, message);
    }

    @Override
    public void notifyBookingCancelled(String phone, Long bookingId) {
        String message = String.format("❌ Бронирование #%d отменено.", bookingId);
        sendSms(phone, message);
    }
}