package com.uz.taxi.samarkand_tashkent.domain.trip.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;

    @Override
    @Transactional
    public Trip create(Trip trip) {
        if (trip.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new ApiException("Departure time must be in the future", HttpStatus.BAD_REQUEST);
        }
        if (trip.getTotalSeats() == null || trip.getTotalSeats() < 1) {
            throw new ApiException("Total seats must be at least 1", HttpStatus.BAD_REQUEST);
        }
        if (trip.getPrice() == null || trip.getPrice().signum() < 0) {
            throw new ApiException("Price must be non-negative", HttpStatus.BAD_REQUEST);
        }
        return tripRepository.save(trip);
    }

    @Override
    public Optional<Trip> findById(Long id) {
        return tripRepository.findById(id);
    }

    @Override
    public List<Trip> findAll() {
        return tripRepository.findAllWithDriver();
    }

    @Override
    public List<Trip> findAvailable(Trip.Direction direction, int seats, LocalDateTime from) {
        return tripRepository.findAvailableTrips(direction, seats, from);
    }

    @Override
    public Page<Trip> searchTrips(
            Trip.Direction direction,
            Integer minSeats,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Pageable pageable
    ) {
        LocalDateTime effectiveFrom = (dateFrom != null) ? dateFrom : LocalDateTime.now();
        return tripRepository.searchTrips(direction, minSeats, effectiveFrom, dateTo, pageable);
    }

    @Override
    public Page<Trip> findMyTrips(Long driverId, Pageable pageable) {
        return tripRepository.findByDriverId(driverId, pageable);
    }

    @Override
    @Transactional
    public Trip update(Trip trip) {
        return tripRepository.save(trip);
    }

    @Override
    @Transactional
    public void cancel(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ApiException("Trip not found", HttpStatus.NOT_FOUND));

        if (trip.getStatus() == Trip.Status.CANCELLED) {
            throw new ApiException("Trip is already cancelled", HttpStatus.BAD_REQUEST);
        }
        if (trip.getStatus() == Trip.Status.COMPLETED) {
            throw new ApiException("Cannot cancel a completed trip", HttpStatus.BAD_REQUEST);
        }

        trip.setStatus(Trip.Status.CANCELLED);
        tripRepository.save(trip);
    }
}