// ============ ENUMS ============
export type Direction = "SAMARKAND_TO_TASHKENT" | "TASHKENT_TO_SAMARKAND";
export type TripStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type UserRole = "PASSENGER" | "DRIVER" | "ADMIN";

// ============ AUTH ============
export interface RegisterRequest {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
}

export interface LoginRequest {
    phone: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    user?: User;
}

// ============ USER ============
export interface User {
    id: number;
    phone: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
    active: boolean;
    createdAt?: string;
}

// ============ TRIP ============
export interface Trip {
    id: number;
    driverName: string;
    driverPhone: string;
    direction: Direction;
    departureTime: string;
    totalSeats: number;
    availableSeats: number;
    price: number;
    status: TripStatus;
    notes?: string;
    createdAt: string;
}

// ============ BOOKING ============
export interface Booking {
    id: number;
    tripId: number;
    direction: string;
    departureTime: string;
    driverName: string;
    driverPhone?: string;
    passengerName?: string;
    passengerPhone?: string;
    seatsCount: number;
    totalPrice: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    tripStatus?: TripStatus;
    createdAt: string;
}

// ============ PAGINATION ============
export interface PageResponse<T> {
    content: T[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}

// ============ API ERROR ============
export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    fields?: Record<string, string>;
}