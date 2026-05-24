import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    Calendar,
    Clock,
    Users,
    ChevronDown,
    ChevronUp,
    XCircle,
    Phone,
    CheckCircle2,
    AlertCircle,
    Loader2,
    CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SamarkandIcon, TashkentIcon } from "@/components/icons/CityIcons";
import { useTripPassengers } from "@/hooks/useBookings";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types/api";
import { useCompleteTrip } from "@/hooks/useDriverTrips";

interface Props {
    trip: Trip;
    onCancel: (trip: Trip) => void;
    index?: number;
}

export function DriverTripCard({ trip, onCancel, index = 0 }: Props) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const completeMutation = useCompleteTrip();

    const isToTashkent = trip.direction === "SAMARKAND_TO_TASHKENT";
    const FromIcon = isToTashkent ? SamarkandIcon : TashkentIcon;
    const ToIcon = isToTashkent ? TashkentIcon : SamarkandIcon;
    const fromName = isToTashkent
        ? t("home.search.samarkand")
        : t("home.search.tashkent");
    const toName = isToTashkent
        ? t("home.search.tashkent")
        : t("home.search.samarkand");

    const isCancelled = trip.status === "CANCELLED";
    const isCompleted = trip.status === "COMPLETED";
    const isPast = new Date(trip.departureTime) < new Date();
    const canCancel = !isCancelled && !isCompleted && !isPast;
    const bookedSeats = trip.totalSeats - trip.availableSeats;
    const occupancyPercent = (bookedSeats / trip.totalSeats) * 100;
    const canComplete = !isCancelled && !isCompleted && isPast;

    let statusLabel = "";
    let statusClass = "";

    if (isCancelled) {
        statusLabel = t("driver.tripStatus.cancelled");
        statusClass = "bg-muted text-muted-foreground";
    } else if (isCompleted) {
        statusLabel = t("driver.tripStatus.completed");
        statusClass =
            "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
    } else if (isPast) {
        statusLabel = t("driver.tripStatus.pendingComplete");
        statusClass =
            "bg-karvon-sunset-100 dark:bg-karvon-sunset-700/30 text-karvon-sunset-700 dark:text-karvon-sunset-400";
    } else {
        statusLabel = t("driver.tripStatus.active");
        statusClass =
            "bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 text-karvon-turquoise-700 dark:text-karvon-turquoise-400";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className={cn("overflow-hidden", isCancelled && "opacity-60")}>
                <div className="p-5 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5">
                        <div className="space-y-4">
                            {/* Status + ID */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs font-semibold",
                                        statusClass
                                    )}
                                >
                                    {statusLabel}
                                </span>

                                <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                                    #{trip.id}
                                </span>
                            </div>

                            {/* Route */}
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-11 h-11 rounded-2xl bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 flex items-center justify-center text-karvon-turquoise-600">
                                        <FromIcon className="w-6 h-6" />
                                    </div>

                                    <div className="text-[11px] font-medium mt-1">
                                        {fromName}
                                    </div>
                                </div>

                                <div className="flex-1 flex items-center min-w-0">
                                    <div className="flex-1 h-px bg-gradient-to-r from-karvon-turquoise-500 to-karvon-sunset-500" />

                                    <div className="px-2.5 py-1 rounded-full bg-secondary text-xs font-semibold flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(trip.departureTime)}
                                    </div>

                                    <div className="flex-1 h-px bg-gradient-to-r from-karvon-turquoise-500 to-karvon-sunset-500" />
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-11 h-11 rounded-2xl bg-karvon-sunset-100 dark:bg-karvon-sunset-700/30 flex items-center justify-center text-karvon-sunset-600">
                                        <ToIcon className="w-6 h-6" />
                                    </div>

                                    <div className="text-[11px] font-medium mt-1">
                                        {toName}
                                    </div>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(trip.departureTime)}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-muted-foreground" />

                                    <span className="font-medium">
                                        {bookedSeats}/{trip.totalSeats}{" "}
                                        {t("trip.seats").toLowerCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Occupancy bar */}
                            <div className="space-y-1">
                                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${occupancyPercent}%` }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className="h-full bg-gradient-to-r from-karvon-turquoise-500 to-karvon-sunset-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {t("driver.occupancy", {
                                            percent: Math.round(occupancyPercent),
                                        })}
                                    </span>

                                    <span>
                                        {formatPrice(trip.price * bookedSeats)}{" "}
                                        {t("driver.earned")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="md:text-right md:border-l md:border-border md:pl-5 space-y-3 md:min-w-[170px]">
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    {t("trip.perSeat", { seats: 1 })}
                                </div>

                                <div className="text-2xl font-display font-bold">
                                    {formatPrice(trip.price)}
                                </div>
                            </div>
                            <div className="flex md:flex-col gap-2">
                                {canComplete && (
                                    <Button
                                        size="sm"
                                        onClick={() => completeMutation.mutate(trip.id)}
                                        disabled={completeMutation.isPending}
                                        className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
                                    >
                                        {completeMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>{t("driver.completeTrip")}</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                                {canCancel && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onCancel(trip)}
                                        className="flex-1 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>{t("driver.cancelTrip")}</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Expand passengers */}
                    {bookedSeats > 0 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full mt-4 pt-4 border-t border-border flex items-center justify-between text-sm font-medium hover:text-karvon-turquoise-600 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Users className="w-4 h-4" />

                                {expanded
                                    ? t("driver.hidePassengers")
                                    : t("driver.showPassengers", {
                                        count: bookedSeats,
                                    })}
                            </span>

                            {expanded ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    <AnimatePresence>
                        {expanded && <PassengersList tripId={trip.id} />}
                    </AnimatePresence>
                </div>
            </Card>
        </motion.div>
    );
}

function PassengersList({ tripId }: { tripId: number }) {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useTripPassengers(tripId);

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
        >
            <div className="pt-4 space-y-2">
                {isLoading && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                )}

                {isError && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{t("common.error")}</span>
                    </div>
                )}

                {data && data.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                        {t("driver.noPassengers")}
                    </div>
                )}

                {data &&
                    data
                        .filter((b) => b.status !== "CANCELLED")
                        .map((booking) => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-karvon flex items-center justify-center text-white font-semibold text-sm">
                                        {booking.passengerName?.[0]?.toUpperCase() || "?"}
                                    </div>

                                    <div>
                                        <div className="font-medium text-sm">
                                            {booking.passengerName}
                                        </div>

                                        {booking.passengerPhone && (
                                            <a
                                                href={`tel:${booking.passengerPhone}`}
                                                className="text-xs text-karvon-turquoise-600 hover:text-karvon-turquoise-700 flex items-center gap-1"
                                            >
                                                <Phone className="w-3 h-3" />
                                                {booking.passengerPhone}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {booking.seatsCount}{" "}
                                        {t("trip.seats").toLowerCase()}
                                    </span>

                                    {booking.paymentStatus === "PAID" ? (
                                        <span className="flex items-center gap-1 text-xs text-karvon-turquoise-600 dark:text-karvon-turquoise-400 font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {t("driver.paid")}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-karvon-sunset-600 dark:text-karvon-sunset-400 font-medium">
                                            <CreditCard className="w-3.5 h-3.5" />
                                            {t("driver.unpaid")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
            </div>
        </motion.div>
    );
}