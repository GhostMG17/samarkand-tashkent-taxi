import { useQuery } from "@tanstack/react-query";
import { getTripById } from "@/api/trips";

export function useTrip(id: number | undefined) {
    return useQuery({
        queryKey: ["trip", id],
        queryFn: () => getTripById(id!),
        enabled: !!id,
    });
}