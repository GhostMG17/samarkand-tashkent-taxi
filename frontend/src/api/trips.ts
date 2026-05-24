import { apiClient } from "./client";
import type { Trip, PageResponse, Direction } from "@/types/api";

export interface SearchTripsParams {
    direction?: Direction;
    minSeats?: number;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface CreateTripRequest {
    direction: Direction;
    departureTime: string;
    totalSeats: number;
    price: number;
    notes?: string;
}

export async function searchTrips(params: SearchTripsParams = {}) {
    const { data } = await apiClient.get<PageResponse<Trip>>("/trips", { params });
    return data;
}

export async function getTripById(id: number) {
    const { data } = await apiClient.get<Trip>(`/trips/${id}`);
    return data;
}

export async function createTrip(data: CreateTripRequest) {
    const { data: response } = await apiClient.post<Trip>("/trips", data);
    return response;
}

export async function getMyTrips(page = 0, size = 10) {
    const { data } = await apiClient.get<PageResponse<Trip>>("/trips/my", {
        params: { page, size, sort: "departureTime,desc" },
    });
    return data;
}

export async function cancelTrip(id: number) {
    await apiClient.patch(`/trips/${id}/cancel`);
}


export async function completeTrip(id: number) {
    const { data } = await apiClient.patch<Trip>(`/trips/${id}/complete`);
    return data;
}