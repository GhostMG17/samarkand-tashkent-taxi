import { useQuery } from "@tanstack/react-query";
import { searchTrips, type SearchTripsParams } from "@/api/trips";

export function useTrips(params: SearchTripsParams) {
    return useQuery({
        queryKey: ["trips", params],
        queryFn: () => searchTrips(params),
    });
}