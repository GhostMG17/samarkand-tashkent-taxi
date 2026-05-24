import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import {
    getStats,
    getAdminUsers,
    getAdminTrips,
    getAdminBookings,
    activateUser,
    deactivateUser,
    changeUserRole,
    cancelTripAsAdmin,
    cancelBookingAsAdmin,
    markBookingAsPaid,
    completeTripAsAdmin,
} from "@/api/admin";

const PAGE_SIZE = 15;

export function useAdminStats() {
    return useQuery({
        queryKey: ["admin-stats"],
        queryFn: getStats,
        staleTime: 1000 * 30,
    });
}

export function useAdminUsers() {
    return useInfiniteQuery({
        queryKey: ["admin-users"],
        queryFn: ({ pageParam = 0 }) => getAdminUsers(pageParam, PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const current = lastPage.page?.number ?? 0;
            const total = lastPage.page?.totalPages ?? 1;
            if (current + 1 < total) return current + 1;
            return undefined;
        },
    });
}

export function useAdminTrips() {
    return useInfiniteQuery({
        queryKey: ["admin-trips"],
        queryFn: ({ pageParam = 0 }) => getAdminTrips(pageParam, PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const current = lastPage.page?.number ?? 0;
            const total = lastPage.page?.totalPages ?? 1;
            if (current + 1 < total) return current + 1;
            return undefined;
        },
    });
}

export function useAdminBookings() {
    return useInfiniteQuery({
        queryKey: ["admin-bookings"],
        queryFn: ({ pageParam = 0 }) => getAdminBookings(pageParam, PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const current = lastPage.page?.number ?? 0;
            const total = lastPage.page?.totalPages ?? 1;
            if (current + 1 < total) return current + 1;
            return undefined;
        },
    });
}

export function useToggleUserActive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, active }: { id: number; active: boolean }) =>
            active ? deactivateUser(id) : activateUser(id),
        onSuccess: (_, { active }) => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            toast.success(
                active
                    ? i18n.t("toast.userDeactivated")
                    : i18n.t("toast.userActivated")
            );
        },
    });
}

export function useChangeUserRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
                         id,
                         role,
                     }: {
            id: number;
            role: "PASSENGER" | "DRIVER" | "ADMIN";
        }) => changeUserRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            toast.success(i18n.t("toast.roleChanged"));
        },
    });
}


export function useCancelTripAsAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelTripAsAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trips"] });
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            toast.success(i18n.t("toast.tripCancelled"));
        },
    });
}

export function useCancelBookingAsAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelBookingAsAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["admin-trips"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            toast.success(i18n.t("toast.bookingCancelled"));
        },
    });
}

export function useMarkBookingAsPaid() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markBookingAsPaid,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            toast.success(i18n.t("toast.markedPaid"));
        },
    });
}



export function useCompleteTripAsAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: completeTripAsAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-trips"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            toast.success(i18n.t("toast.tripCompleted"));
        },
    });
}