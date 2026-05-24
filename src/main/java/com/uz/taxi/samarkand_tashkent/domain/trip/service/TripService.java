package com.uz.taxi.samarkand_tashkent.domain.trip.service;

import com.uz.taxi.samarkand_tashkent.domain.trip.dto.TripResponse;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TripService {
    Trip create(Trip trip);
    Optional<Trip> findById(Long id);
    List<Trip> findAll();

    List<Trip> findAvailable(Trip.Direction direction, int seats, LocalDateTime from);

    // НОВЫЙ — основной поиск с пагинацией
    Page<Trip> searchTrips(
            Trip.Direction direction,
            Integer minSeats,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Pageable pageable
    );

    Page<Trip> findMyTrips(Long driverId, Pageable pageable);

    Trip update(Trip trip);
    void cancel(Long id);

    TripResponse completeTrip(Long tripId, String driverPhone);
}