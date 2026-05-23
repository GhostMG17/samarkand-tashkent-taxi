package com.uz.taxi.samarkand_tashkent.domain.booking.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.booking.entity.Booking;
import com.uz.taxi.samarkand_tashkent.domain.booking.repository.BookingRepository;
import com.uz.taxi.samarkand_tashkent.domain.notification.service.NotificationService;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public Booking create(Long passengerId, Long tripId, int seatsCount) {
        if (seatsCount < 1) {
            throw new ApiException("Seats count must be at least 1", HttpStatus.BAD_REQUEST);
        }

        Trip trip = tripRepository.findByIdWithLock(tripId)
                .orElseThrow(() -> new ApiException("Trip not found", HttpStatus.NOT_FOUND));

        if (trip.getStatus() == Trip.Status.CANCELLED) {
            throw new ApiException("Trip is cancelled", HttpStatus.BAD_REQUEST);
        }
        if (trip.getStatus() == Trip.Status.COMPLETED) {
            throw new ApiException("Trip is already completed", HttpStatus.BAD_REQUEST);
        }
        if (trip.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new ApiException("Trip has already departed", HttpStatus.BAD_REQUEST);
        }
        if (trip.getDriver().getId().equals(passengerId)) {
            throw new ApiException("You cannot book your own trip", HttpStatus.BAD_REQUEST);
        }

        Optional<Booking> existing = bookingRepository
                .findActiveBookingByPassengerAndTrip(passengerId, tripId);
        if (existing.isPresent()) {
            throw new ApiException("You already have an active booking for this trip", HttpStatus.CONFLICT);
        }

        if (trip.getAvailableSeats() < seatsCount) {
            throw new ApiException(
                    "Not enough seats. Available: " + trip.getAvailableSeats(),
                    HttpStatus.CONFLICT
            );
        }

        User passenger = userRepository.findById(passengerId)
                .orElseThrow(() -> new ApiException("Passenger not found", HttpStatus.NOT_FOUND));

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

        Booking saved = bookingRepository.save(booking);

        // 📨 Уведомления
        String driverName = trip.getDriver().getFirstName();
        String driverPhone = trip.getDriver().getPhone();
        String passengerName = passenger.getFirstName() +
                (passenger.getLastName() != null ? " " + passenger.getLastName() : "");

        notificationService.notifyBookingCreated(
                passenger.getPhone(),
                saved.getId(),
                driverName,
                driverPhone
        );
        notificationService.notifyDriverNewBooking(
                driverPhone,
                passengerName,
                passenger.getPhone(),
                seatsCount
        );

        return saved;
    }

    @Override
    public Optional<Booking> findById(Long id) {
        return bookingRepository.findByIdWithDetails(id);
    }

    @Override
    public Page<Booking> findByPassenger(Long passengerId, Pageable pageable) {
        return bookingRepository.findByPassengerId(passengerId, pageable);
    }

    @Override
    public List<Booking> findByTrip(Long tripId) {
        return bookingRepository.findByTripId(tripId);
    }

    @Override
    @Transactional
    public void cancel(Long bookingId, Long currentUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        if (!isAdmin && !booking.getPassenger().getId().equals(currentUserId)) {
            throw new ApiException("You can only cancel your own bookings", HttpStatus.FORBIDDEN);
        }

        if (booking.getStatus() == Booking.Status.CANCELLED) {
            throw new ApiException("Booking is already cancelled", HttpStatus.BAD_REQUEST);
        }

        Trip trip = booking.getTrip();
        if (trip.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new ApiException("Cannot cancel a booking for a past trip", HttpStatus.BAD_REQUEST);
        }

        if (trip.getStatus() == Trip.Status.SCHEDULED) {
            Trip lockedTrip = tripRepository.findByIdWithLock(trip.getId())
                    .orElseThrow(() -> new ApiException("Trip not found", HttpStatus.NOT_FOUND));
            lockedTrip.setAvailableSeats(lockedTrip.getAvailableSeats() + booking.getSeatsCount());
            tripRepository.save(lockedTrip);
        }

        booking.setStatus(Booking.Status.CANCELLED);
        bookingRepository.save(booking);

        // 📨 Уведомление об отмене (и пассажиру, и водителю)
        notificationService.notifyBookingCancelled(
                booking.getPassenger().getPhone(),
                booking.getId()
        );
        notificationService.notifyBookingCancelled(
                trip.getDriver().getPhone(),
                booking.getId()
        );
    }
}