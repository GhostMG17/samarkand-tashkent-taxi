import { apiClient } from "./client";
import type { Trip, Booking, User, PageResponse } from "@/types/api";

export interface AdminStats {
    // Пользователи
    totalUsers: number;
    totalPassengers: number;
    totalDrivers: number;
    totalAdmins: number;
    activeUsers: number;
    inactiveUsers: number;

    // Рейсы
    totalTrips: number;
    scheduledTrips: number;
    completedTrips: number;
    cancelledTrips: number;

    // Бронирования
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    bookingsToday: number;
    bookingsThisWeek: number;
    bookingsThisMonth: number;

    // Финансы
    paidBookings: number;
    unpaidBookings: number;
    totalRevenue: number;
    revenueToday: number;
    revenueThisMonth: number;

    // Топ водители
    topDrivers: Array<{
        driverId: number;
        driverName: string;
        driverPhone: string;
        tripsCount: number;
    }>;
}

export async function getStats() {
    const { data } = await apiClient.get<AdminStats>("/admin/stats");
    return data;
}

export async function getAdminUsers(page = 0, size = 20) {
    const { data } = await apiClient.get<PageResponse<User>>("/admin/users", {
        params: { page, size, sort: "createdAt,desc" },
    });
    return data;
}

export async function getAdminTrips(page = 0, size = 20) {
    const { data } = await apiClient.get<PageResponse<Trip>>("/admin/trips", {
        params: { page, size, sort: "departureTime,desc" },
    });
    return data;
}

export async function getAdminBookings(page = 0, size = 20) {
    const { data } = await apiClient.get<PageResponse<Booking>>("/admin/bookings", {
        params: { page, size, sort: "createdAt,desc" },
    });
    return data;
}

export async function activateUser(id: number) {
    await apiClient.patch(`/admin/users/${id}/activate`);
}

export async function deactivateUser(id: number) {
    await apiClient.patch(`/admin/users/${id}/deactivate`);
}

export async function changeUserRole(id: number, role: "PASSENGER" | "DRIVER" | "ADMIN") {
    await apiClient.patch(`/admin/users/${id}/role`, { role });
}

export async function cancelTripAsAdmin(id: number) {
    const { data } = await apiClient.patch<Trip>(`/admin/trips/${id}/cancel`);
    return data;
}

export async function cancelBookingAsAdmin(id: number) {
    const { data } = await apiClient.patch<Booking>(`/admin/bookings/${id}/cancel`);
    return data;
}

export async function markBookingAsPaid(id: number) {
    const { data } = await apiClient.patch<Booking>(`/admin/bookings/${id}/mark-paid`);
    return data;
}

export async function completeTripAsAdmin(id: number) {
    const { data } = await apiClient.patch<Trip>(`/admin/trips/${id}/complete`);
    return data;
}