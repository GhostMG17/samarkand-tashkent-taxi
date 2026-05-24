package com.uz.taxi.samarkand_tashkent.domain.trip.repository;

import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    @Query("""
            SELECT t FROM Trip t JOIN FETCH t.driver
            WHERE t.direction = :direction
              AND t.availableSeats >= :seats
              AND t.departureTime > :now
              AND t.status = 'SCHEDULED'
            """)
    List<Trip> findAvailableTrips(
            @Param("direction") Trip.Direction direction,
            @Param("seats") int seats,
            @Param("now") LocalDateTime now
    );

    @Query("""
        SELECT t FROM Trip t JOIN FETCH t.driver
        WHERE (CAST(:direction AS string) IS NULL OR t.direction = :direction)
          AND (CAST(:minSeats AS integer) IS NULL OR t.availableSeats >= :minSeats)
          AND (CAST(:dateFrom AS timestamp) IS NULL OR t.departureTime >= :dateFrom)
          AND (CAST(:dateTo AS timestamp) IS NULL OR t.departureTime <= :dateTo)
          AND t.status = 'SCHEDULED'
        """)
    Page<Trip> searchTrips(
            @Param("direction") Trip.Direction direction,
            @Param("minSeats") Integer minSeats,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );

    @Query("""
            SELECT t FROM Trip t JOIN FETCH t.driver
            WHERE t.driver.id = :driverId
            """)
    Page<Trip> findByDriverId(@Param("driverId") Long driverId, Pageable pageable);

    @Query("SELECT t FROM Trip t JOIN FETCH t.driver")
    List<Trip> findAllWithDriver();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Trip t JOIN FETCH t.driver WHERE t.id = :id")
    Optional<Trip> findByIdWithLock(@Param("id") Long id);

    @Query("""
        SELECT t FROM Trip t JOIN FETCH t.driver
        WHERE (CAST(:status AS string) IS NULL OR t.status = :status)
          AND (CAST(:direction AS string) IS NULL OR t.direction = :direction)
        """)
    Page<Trip> searchAllTrips(
            @Param("status") Trip.Status status,
            @Param("direction") Trip.Direction direction,
            Pageable pageable
    );

    long countByStatus(Trip.Status status);

    @Query("""
        SELECT t.driver.id, t.driver.firstName, t.driver.lastName, t.driver.phone, COUNT(t)
        FROM Trip t
        GROUP BY t.driver.id, t.driver.firstName, t.driver.lastName, t.driver.phone
        ORDER BY COUNT(t) DESC
        """)
    List<Object[]> findTopDriversByTripCount(Pageable pageable);

    @Query("SELECT t FROM Trip t WHERE t.status = com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip.Status.SCHEDULED AND t.departureTime < :cutoff")
    List<Trip> findOldScheduledTrips(@Param("cutoff") LocalDateTime cutoff);
}