package com.uz.taxi.samarkand_tashkent.domain.booking.service;

import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.repository.BookingRepository;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Booking create(Long passengerId, Long tripId, int seatsCount) {
        Trip trip = tripRepository.findByIdWithLock(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (trip.getStatus() != Trip.Status.SCHEDULED) {
            throw new RuntimeException("Trip is not available");
        }

        if (trip.getAvailableSeats() < seatsCount) {
            throw new RuntimeException("Not enough seats. Available: " + trip.getAvailableSeats());
        }

        User passenger = userRepository.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        trip.setAvailableSeats(trip.getAvailableSeats() - seatsCount);
        tripRepository.save(trip);

        BigDecimal totalPrice = trip.getPrice().multiply(BigDecimal.valueOf(seatsCount));

        Booking booking = Booking.builder()
                .passenger(passenger)
                .trip(trip)
                .seatsCount(seatsCount)
                .totalPrice(totalPrice)
                .status(Booking.Status.CONFIRMED)
                .paymentStatus(Booking.PaymentStatus.UNPAID)
                .build();

        return bookingRepository.save(booking);
    }

    @Override
    public Optional<Booking> findById(Long id) {
        return bookingRepository.findById(id);
    }

    @Override
    public List<Booking> findByPassenger(Long passengerId) {
        return bookingRepository.findByPassengerId(passengerId);
    }

    @Override
    public List<Booking> findByTrip(Long tripId) {
        return bookingRepository.findByTripId(tripId);
    }

    @Override
    @Transactional
    public void cancel(Long bookingId, Long passengerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getPassenger().getId().equals(passengerId)) {
            throw new RuntimeException("Not your booking");
        }

        if (booking.getStatus() == Booking.Status.CANCELLED) {
            throw new RuntimeException("Already cancelled");
        }

        Trip trip = booking.getTrip();
        trip.setAvailableSeats(trip.getAvailableSeats() + booking.getSeatsCount());
        tripRepository.save(trip);

        booking.setStatus(Booking.Status.CANCELLED);
        bookingRepository.save(booking);
    }
}