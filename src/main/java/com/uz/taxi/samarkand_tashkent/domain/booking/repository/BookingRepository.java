package com.uz.taxi.samarkand_tashkent.domain.booking.repository;

import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.passenger
            JOIN FETCH b.trip t
            JOIN FETCH t.driver
            WHERE b.passenger.id = :passengerId
            """)
    Page<Booking> findByPassengerId(@Param("passengerId") Long passengerId, Pageable pageable);

    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.passenger
            JOIN FETCH b.trip t
            JOIN FETCH t.driver
            WHERE b.trip.id = :tripId
            """)
    List<Booking> findByTripId(@Param("tripId") Long tripId);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.passenger.id = :passengerId
              AND b.trip.id = :tripId
              AND b.status <> 'CANCELLED'
            """)
    Optional<Booking> findActiveBookingByPassengerAndTrip(
            @Param("passengerId") Long passengerId,
            @Param("tripId") Long tripId
    );

    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.passenger
            JOIN FETCH b.trip t
            JOIN FETCH t.driver
            WHERE b.id = :id
            """)
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);


    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.passenger
        JOIN FETCH b.trip t
        JOIN FETCH t.driver
        WHERE (CAST(:status AS string) IS NULL OR b.status = :status)
          AND (CAST(:paymentStatus AS string) IS NULL OR b.paymentStatus = :paymentStatus)
        """)
    Page<Booking> searchAllBookings(
            @Param("status") Booking.Status status,
            @Param("paymentStatus") Booking.PaymentStatus paymentStatus,
            Pageable pageable
    );

    long countByStatus(Booking.Status status);

    long countByPaymentStatus(Booking.PaymentStatus paymentStatus);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :from")
    long countBookingsCreatedAfter(@Param("from") LocalDateTime from);

    @Query("""
        SELECT COALESCE(SUM(b.totalPrice), 0)
        FROM Booking b
        WHERE b.paymentStatus = 'PAID'
        """)
    BigDecimal calculateTotalRevenue();

    @Query("""
        SELECT COALESCE(SUM(b.totalPrice), 0)
        FROM Booking b
        WHERE b.paymentStatus = 'PAID'
          AND b.createdAt >= :from
        """)
    BigDecimal calculateRevenueAfter(@Param("from") LocalDateTime from);

    List<Booking> findByTripIdAndStatus(Long tripId, Booking.Status status);

}