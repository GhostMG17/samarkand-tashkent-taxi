package com.uz.taxi.samarkand_tashkent.domain.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class StatsResponse {

    // Пользователи
    private Long totalUsers;
    private Long totalPassengers;
    private Long totalDrivers;
    private Long totalAdmins;
    private Long activeUsers;
    private Long inactiveUsers;

    // Рейсы
    private Long totalTrips;
    private Long scheduledTrips;
    private Long completedTrips;
    private Long cancelledTrips;

    // Бронирования
    private Long totalBookings;
    private Long confirmedBookings;
    private Long cancelledBookings;
    private Long bookingsToday;
    private Long bookingsThisWeek;
    private Long bookingsThisMonth;

    // Финансы
    private Long paidBookings;
    private Long unpaidBookings;
    private BigDecimal totalRevenue;       // сумма всех PAID
    private BigDecimal revenueToday;
    private BigDecimal revenueThisMonth;

    // Топ водители
    private List<TopDriver> topDrivers;

    @Data
    @Builder
    public static class TopDriver {
        private Long driverId;
        private String driverName;
        private String driverPhone;
        private Long tripsCount;
    }
}