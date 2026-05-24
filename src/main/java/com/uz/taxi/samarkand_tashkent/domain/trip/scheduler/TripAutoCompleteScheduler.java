package com.uz.taxi.samarkand_tashkent.domain.trip.scheduler;

import com.uz.taxi.samarkand_tashkent.domain.trip.entity.Trip;
import com.uz.taxi.samarkand_tashkent.domain.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Автоматически переводит "висящие" SCHEDULED рейсы в COMPLETED,
 * если их время отправления + 6 часов уже прошло.
 *
 * Это страховка на случай, если водитель забыл нажать "Завершить" сам.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TripAutoCompleteScheduler {

    private final TripRepository tripRepository;

    /**
     * Запускается каждый час (cron: "0 0 * * * *").
     * Для отладки можно использовать fixedRate в миллисекундах.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoCompleteOldTrips() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(6);

        List<Trip> oldScheduledTrips = tripRepository.findOldScheduledTrips(cutoff);

        if (oldScheduledTrips.isEmpty()) {
            return;
        }

        log.info("Auto-completing {} old SCHEDULED trips (older than {})",
                oldScheduledTrips.size(), cutoff);

        for (Trip trip : oldScheduledTrips) {
            trip.setStatus(Trip.Status.COMPLETED);
            log.debug("Auto-completed trip #{} (departure: {})",
                    trip.getId(), trip.getDepartureTime());
        }

        tripRepository.saveAll(oldScheduledTrips);
    }
}