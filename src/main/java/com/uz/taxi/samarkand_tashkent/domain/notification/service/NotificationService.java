package com.uz.taxi.samarkand_tashkent.domain.notification.service;

public interface NotificationService {

    /**
     * Отправка SMS на номер телефона.
     * @param phone номер в формате +998XXXXXXXXX
     * @param message текст сообщения
     */
    void sendSms(String phone, String message);

    /**
     * Уведомление пассажиру о создании бронирования.
     */
    void notifyBookingCreated(String passengerPhone, Long bookingId, String driverName, String driverPhone);

    /**
     * Уведомление пассажиру об успешной оплате.
     */
    void notifyPaymentSuccess(String passengerPhone, Long bookingId, String driverName, String driverPhone);

    /**
     * Уведомление водителю о новом бронировании.
     */
    void notifyDriverNewBooking(String driverPhone, String passengerName, String passengerPhone, int seatsCount);

    /**
     * Уведомление водителю об оплате.
     */
    void notifyDriverPaymentReceived(String driverPhone, String passengerName, int seatsCount);

    /**
     * Уведомление об отмене бронирования.
     */
    void notifyBookingCancelled(String phone, Long bookingId);
}