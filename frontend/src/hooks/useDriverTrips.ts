import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createTrip, getMyTrips, cancelTrip,completeTrip } from "@/api/trips";
import { toast } from "sonner";
import i18n from "@/i18n";


const PAGE_SIZE = 10;

export function useMyTrips() {
    return useInfiniteQuery({
        queryKey: ["my-trips"],
        queryFn: ({ pageParam = 0 }) => getMyTrips(pageParam, PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const current = lastPage.page?.number ?? 0;
            const total = lastPage.page?.totalPages ?? 1;
            if (current + 1 < total) return current + 1;
            return undefined;
        },
    });
}

export function useCreateTrip() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTrip,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-trips"] });
            queryClient.invalidateQueries({ queryKey: ["trips"] });
        },
    });
}

export function useCancelTrip() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelTrip,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-trips"] });
            queryClient.invalidateQueries({ queryKey: ["trip"] });
        },
    });
}

export function useCompleteTrip() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: completeTrip,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-trips"] });
            queryClient.invalidateQueries({ queryKey: ["trips"] });
            toast.success(i18n.t("toast.tripCompleted"));
        },
    });
}