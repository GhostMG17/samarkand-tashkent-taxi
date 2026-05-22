package com.uz.taxi.samarkand_tashkent.domain.trip.service;

import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TripService {
    Trip create(Trip trip);
    Optional<Trip> findById(Long id);
    List<Trip> findAll();
    List<Trip> findAvailable(Trip.Direction direction, int seats, LocalDateTime from);
    Trip update(Trip trip);
    void cancel(Long id);
}