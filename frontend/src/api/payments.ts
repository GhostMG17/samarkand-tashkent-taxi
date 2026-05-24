import { apiClient } from "./client";

export interface PaymentResponse {
    bookingId: number;
    amount: number;
    paymentStatus: string;
    paymentId: string;
    message: string;
    paidAt: string;
}

export async function payForBooking(bookingId: number) {
    const { data } = await apiClient.post<PaymentResponse>(
        `/payments/booking/${bookingId}/pay`
    );
    return data;
}