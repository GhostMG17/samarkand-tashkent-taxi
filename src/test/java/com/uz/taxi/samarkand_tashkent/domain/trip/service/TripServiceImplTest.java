package com.uz.taxi.samarkand_tashkent.domain.trip.service;

import com.uz.taxi.samarkand_tashkent.common.exception.ApiException;
import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TripServiceImpl Tests")
class TripServiceImplTest {

    @Mock private TripRepository tripRepository;

    @InjectMocks private TripServiceImpl tripService;

    private User driver;
    private Trip trip;

    @BeforeEach
    void setUp() {
        driver = User.builder()
                .id(1L)
                .phone("+998901111111")
                .firstName("Sardor")
                .role(User.Role.DRIVER)
                .build();

        trip = Trip.builder()
                .id(10L)
                .driver(driver)
                .direction(Trip.Direction.SAMARKAND_TO_TASHKENT)
                .departureTime(LocalDateTime.now().plusDays(2))
                .totalSeats(4)
                .availableSeats(4)
                .price(new BigDecimal("150000.00"))
                .status(Trip.Status.SCHEDULED)
                .build();
    }

    // ============================================================
    // CREATE TRIP
    // ============================================================

    @Nested
    @DisplayName("create()")
    class CreateTrip {

        @Test
        @DisplayName("✅ Успешное создание рейса")
        void shouldCreateTripSuccessfully() {
            when(tripRepository.save(any(Trip.class))).thenReturn(trip);

            Trip result = tripService.create(trip);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(10L);
            verify(tripRepository).save(trip);
        }

        @Test
        @DisplayName("❌ Прошедшее время отправления → 400")
        void shouldThrowWhenDepartureTimeInPast() {
            trip.setDepartureTime(LocalDateTime.now().minusHours(1));

            assertThatThrownBy(() -> tripService.create(trip))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("must be in the future")
                    .extracting("status")
                    .isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("❌ Ноль мест → 400")
        void shouldThrowWhenSeatsZero() {
            trip.setTotalSeats(0);

            assertThatThrownBy(() -> tripService.create(trip))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("at least 1");
        }

        @Test
        @DisplayName("❌ Отрицательная цена → 400")
        void shouldThrowWhenPriceNegative() {
            trip.setPrice(new BigDecimal("-100"));

            assertThatThrownBy(() -> tripService.create(trip))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("non-negative");
        }
    }

    // ============================================================
    // SEARCH TRIPS
    // ============================================================

    @Nested
    @DisplayName("searchTrips()")
    class SearchTrips {

        @Test
        @DisplayName("✅ Возвращает результаты с pagination")
        void shouldReturnPaginatedResults() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Trip> mockPage = new PageImpl<>(List.of(trip));

            when(tripRepository.searchTrips(any(), any(), any(), any(), eq(pageable)))
                    .thenReturn(mockPage);

            Page<Trip> result = tripService.searchTrips(
                    Trip.Direction.SAMARKAND_TO_TASHKENT,
                    2,
                    null,
                    null,
                    pageable
            );

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("✅ Если dateFrom не задан, используется текущий момент")
        void shouldUseNowAsDefaultDateFrom() {
            Pageable pageable = PageRequest.of(0, 10);
            when(tripRepository.searchTrips(any(), any(), any(), any(), any()))
                    .thenReturn(new PageImpl<>(List.of()));

            tripService.searchTrips(null, null, null, null, pageable);

            // Проверяем что в репозиторий передался не-null dateFrom
            verify(tripRepository).searchTrips(
                    isNull(),
                    isNull(),
                    argThat(date -> date != null && date.isBefore(LocalDateTime.now().plusSeconds(1))),
                    isNull(),
                    eq(pageable)
            );
        }
    }

    // ============================================================
    // CANCEL TRIP
    // ============================================================

    @Nested
    @DisplayName("cancel()")
    class CancelTrip {

        @Test
        @DisplayName("✅ Успешная отмена меняет статус на CANCELLED")
        void shouldCancelSuccessfully() {
            when(tripRepository.findById(10L)).thenReturn(Optional.of(trip));

            tripService.cancel(10L);

            assertThat(trip.getStatus()).isEqualTo(Trip.Status.CANCELLED);
            verify(tripRepository).save(trip);
        }

        @Test
        @DisplayName("❌ Несуществующий рейс → 404")
        void shouldThrowWhenTripNotFound() {
            when(tripRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tripService.cancel(999L))
                    .isInstanceOf(ApiException.class)
                    .extracting("status")
                    .isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("❌ Повторная отмена → 400")
        void shouldThrowWhenAlreadyCancelled() {
            trip.setStatus(Trip.Status.CANCELLED);
            when(tripRepository.findById(10L)).thenReturn(Optional.of(trip));

            assertThatThrownBy(() -> tripService.cancel(10L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("already cancelled");
        }

        @Test
        @DisplayName("❌ Отмена завершённого рейса → 400")
        void shouldThrowWhenTripCompleted() {
            trip.setStatus(Trip.Status.COMPLETED);
            when(tripRepository.findById(10L)).thenReturn(Optional.of(trip));

            assertThatThrownBy(() -> tripService.cancel(10L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Cannot cancel a completed");
        }
    }
}