import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createBooking, getMyBookings, cancelBooking, getTripPassengers } from "@/api/bookings";



const PAGE_SIZE = 10;

export function useMyBookings() {
    return useInfiniteQuery({
        queryKey: ["my-bookings"],
        queryFn: ({ pageParam = 0 }) => getMyBookings(pageParam, PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const current = lastPage.page?.number ?? 0;
            const total = lastPage.page?.totalPages ?? 1;
            if (current + 1 < total) return current + 1;
            return undefined;
        },
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trips"] });
            queryClient.invalidateQueries({ queryKey: ["trip"] });
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        },
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["trip"] });
        },
    });
}


export function useTripPassengers(tripId: number | undefined) {
    return useQuery({
        queryKey: ["trip-passengers", tripId],
        queryFn: () => getTripPassengers(tripId!),
        enabled: !!tripId,
    });
}