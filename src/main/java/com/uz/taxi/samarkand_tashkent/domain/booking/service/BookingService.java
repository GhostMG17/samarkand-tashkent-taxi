package com.uz.taxi.samarkand_tashkent.domain.booking.service;

import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface BookingService {

    Booking create(Long passengerId, Long tripId, int seatsCount);

    Optional<Booking> findById(Long id);

    Page<Booking> findByPassenger(Long passengerId, Pageable pageable);

    List<Booking> findByTrip(Long tripId);

    // Отмена пассажиром (или админом — passengerId == null означает админ)
    void cancel(Long bookingId, Long currentUserId, boolean isAdmin);
}