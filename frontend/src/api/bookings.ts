import { apiClient } from "./client";
import type { Booking, PageResponse } from "@/types/api";

export interface CreateBookingRequest {
    tripId: number;
    seatsCount: number;
}

export async function createBooking(data: CreateBookingRequest) {
    const { data: response } = await apiClient.post<Booking>("/bookings", data);
    return response;
}

export async function getMyBookings(page = 0, size = 20) {
    const { data } = await apiClient.get<PageResponse<Booking>>("/bookings/my", {
        params: { page, size, sort: "createdAt,desc" },
    });
    return data;
}

export async function cancelBooking(id: number) {
    await apiClient.patch(`/bookings/${id}/cancel`);
}

export async function getTripPassengers(tripId: number) {
    const { data } = await apiClient.get<Booking[]>(`/bookings/trip/${tripId}/passengers`);
    return data;
}