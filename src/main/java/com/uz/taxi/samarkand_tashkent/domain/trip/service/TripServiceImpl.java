package com.uz.taxi.samarkand_tashkent.domain.trip.service;

import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
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
    public Trip create(Trip trip) {
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
    @Transactional
    public Trip update(Trip trip) {
        return tripRepository.save(trip);
    }

    @Override
    @Transactional
    public void cancel(Long id) {
        tripRepository.findById(id).ifPresent(trip -> {
            trip.setStatus(Trip.Status.CANCELLED);
            tripRepository.save(trip);
        });
    }
}