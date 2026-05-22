package com.uz.taxi.samarkand_tashkent.domain.booking.service;

import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;

import java.util.List;
import java.util.Optional;

public interface BookingService {
    Booking create(Long passengerId, Long tripId, int seatsCount);
    Optional<Booking> findById(Long id);
    List<Booking> findByPassenger(Long passengerId);
    List<Booking> findByTrip(Long tripId);
    void cancel(Long bookingId, Long passengerId);
}