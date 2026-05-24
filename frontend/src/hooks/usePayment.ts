import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payForBooking } from "@/api/payments";

export function usePayBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: payForBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        },
    });
}