package com.uz.taxi.samarkand_tashkent.domain.trip.repository;

import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByDirectionAndStatusAndDepartureTimeAfter(
            Trip.Direction direction,
            Trip.Status status,
            LocalDateTime after
    );

    @Query("SELECT t FROM Trip t JOIN FETCH t.driver WHERE t.direction = :direction AND t.availableSeats >= :seats AND t.departureTime > :now AND t.status = 'SCHEDULED'")
    List<Trip> findAvailableTrips(
            @Param("direction") Trip.Direction direction,
            @Param("seats") int seats,
            @Param("now") LocalDateTime now
    );

    @Query("SELECT t FROM Trip t JOIN FETCH t.driver")
    List<Trip> findAllWithDriver();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Trip t WHERE t.id = :id")
    Optional<Trip> findByIdWithLock(@Param("id") Long id);
}