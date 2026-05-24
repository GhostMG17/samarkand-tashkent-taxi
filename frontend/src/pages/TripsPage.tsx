import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { TripCard } from "@/components/trips/TripCard";
import { TripCardSkeleton } from "@/components/trips/TripCardSkeleton";
import { EmptyState } from "@/components/trips/EmptyState";
import { SearchSummary } from "@/components/trips/SearchSummary";
import { useTrips } from "@/hooks/useTrips";
import type { Direction, Trip } from "@/types/api";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

function TripsPageContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const direction = (searchParams.get("direction") as Direction) || "SAMARKAND_TO_TASHKENT";
    const minSeats = Number(searchParams.get("minSeats") || "1");
    const dateFromParam = searchParams.get("dateFrom") || "";
    const dateToParam = searchParams.get("dateTo") || "";
    const date = dateFromParam ? dateFromParam.split("T")[0] : "";

    const queryParams = useMemo(
        () => ({
            direction,
            minSeats,
            dateFrom: dateFromParam || undefined,
            dateTo: dateToParam || undefined,
            sort: "departureTime,asc",
            size: 50,
        }),
        [direction, minSeats, dateFromParam, dateToParam]
    );

    const { data, isLoading, isError, error } = useTrips(queryParams);

    const updateParam = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        next.set(key, value);
        setSearchParams(next);
    };

    const handleSwap = () => {
        const newDir =
            direction === "SAMARKAND_TO_TASHKENT" ? "TASHKENT_TO_SAMARKAND" : "SAMARKAND_TO_TASHKENT";
        updateParam("direction", newDir);
    };

    const handleDateChange = (newDate: string) => {
        if (!newDate) return;
        const next = new URLSearchParams(searchParams);
        next.set("dateFrom", `${newDate}T00:00:00`);
        next.set("dateTo", `${newDate}T23:59:59`);
        setSearchParams(next);
    };

    const handleBook = (trip: Trip) => {
        // Пока что просто переходим на страницу детального просмотра
        // Дальше будет логика: если не залогинен — редирект на /login
        navigate(`/trips/${trip.id}`);
    };

    const handleReset = () => {
        setSearchParams({ direction: "SAMARKAND_TO_TASHKENT", minSeats: "1" });
    };

    const trips = data?.content || [];
    const total = data?.page?.totalElements ?? trips.length;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container py-8">
                {/* Hero strip */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                        {t("trips.title")}
                    </h1>
                    {!isLoading && !isError && (
                        <p className="text-muted-foreground">
                            {t("trips.found", { count: total })}
                        </p>
                    )}
                </motion.div>

                {/* Filters */}
                <SearchSummary
                    direction={direction}
                    date={date}
                    passengers={minSeats}
                    onSwap={handleSwap}
                    onDateChange={handleDateChange}
                    onPassengersChange={(n) => updateParam("minSeats", n.toString())}
                />

                {/* Content */}
                {isLoading && (
                    <div className="space-y-4">
                        <TripCardSkeleton />
                        <TripCardSkeleton />
                        <TripCardSkeleton />
                    </div>
                )}

                {isError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-6 flex items-center gap-3"
                    >
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <div>
                            <div className="font-semibold">{t("common.error")}</div>
                            <div className="text-sm opacity-90">
                                {error instanceof Error ? error.message : "Unknown error"}
                            </div>
                        </div>
                    </motion.div>
                )}

                {!isLoading && !isError && trips.length === 0 && (
                    <EmptyState onReset={handleReset} />
                )}

                {!isLoading && !isError && trips.length > 0 && (
                    <div className="space-y-4">
                        {trips.map((trip, idx) => (
                            <TripCard key={trip.id} trip={trip} index={idx} onBook={handleBook} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export function TripsPage() {
    return (
        <ThemeProvider>
            <SEO
                title="Bosh sahifa"
                description="Samarqand va Toshkent o'rtasidagi qulay sayohat — Karvon"
            />
            <TripsPageContent />
        </ThemeProvider>
    );
}