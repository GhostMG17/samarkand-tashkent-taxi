package com.uz.taxi.samarkand_tashkent.domain.payment.service;

import com.uz.taxi.samarkand_tashkent.domain.payment.dto.PaymentResponse;

public interface PaymentService {

    /**
     * Произвести оплату бронирования.
     * MVP: моментальная мок-оплата.
     * Production (потом): создание платежа в Click/Payme, возврат URL для редиректа.
     */
    PaymentResponse payForBooking(Long bookingId, Long passengerId);

    /**
     * Возврат средств (для отменённых оплаченных броней).
     */
    PaymentResponse refundBooking(Long bookingId);
}