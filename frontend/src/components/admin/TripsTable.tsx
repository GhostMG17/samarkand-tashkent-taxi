import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    Loader2,
    ChevronDown,
    Car,
    MoreVertical,
    XCircle,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
    useAdminTrips,
    useCancelTripAsAdmin,
    useCompleteTripAsAdmin,
} from "@/hooks/useAdmin";
import { getErrorMessage } from "@/hooks/useAuth";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types/api";

export function TripsTable() {
    const { t } = useTranslation();
    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useAdminTrips();
    const cancelMutation = useCancelTripAsAdmin();
    const completeMutation = useCompleteTripAsAdmin();

    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [confirmCancel, setConfirmCancel] = useState<Trip | null>(null);

    const trips = data?.pages.flatMap((p) => p.content) ?? [];

    if (isLoading) {
        return (
            <Card className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-karvon-turquoise-600" />
            </Card>
        );
    }

    const statusColors: Record<string, string> = {
        SCHEDULED:
            "bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 text-karvon-turquoise-700 dark:text-karvon-turquoise-400",
        COMPLETED:
            "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
        CANCELLED: "bg-destructive/10 text-destructive",
    };

    const handleConfirmCancel = async () => {
        if (!confirmCancel) return;
        try {
            await cancelMutation.mutateAsync(confirmCancel.id);
            setConfirmCancel(null);
        } catch {
            // shown via mutation
        }
    };

    return (
        <div className="space-y-3">
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">#</th>
                            <th className="text-left px-4 py-3 font-semibold">{t("admin.trips.route")}</th>
                            <th className="text-left px-4 py-3 font-semibold">{t("admin.trips.driver")}</th>
                            <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">{t("admin.trips.departure")}</th>
                            <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">{t("admin.trips.seats")}</th>
                            <th className="text-right px-4 py-3 font-semibold">{t("admin.trips.price")}</th>
                            <th className="text-left px-4 py-3 font-semibold">{t("admin.trips.status")}</th>
                            <th className="text-right px-4 py-3 font-semibold">{t("admin.users.actions")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {trips.map((trip, idx) => {
                            // Любой SCHEDULED рейс может быть либо отменён, либо завершён админом
                            const isCancellable =
                                trip.status === "SCHEDULED" &&
                                new Date(trip.departureTime) > new Date();
                            const isCompletable = trip.status === "SCHEDULED";
                            const hasActions = isCancellable || isCompletable;

                            return (
                                <motion.tr
                                    key={trip.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="border-b border-border last:border-0 hover:bg-secondary/30"
                                >
                                    <td className="px-4 py-3 text-muted-foreground">#{trip.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Car className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>
                                                    {trip.direction === "SAMARKAND_TO_TASHKENT"
                                                        ? `${t("home.search.samarkand")} → ${t("home.search.tashkent")}`
                                                        : `${t("home.search.tashkent")} → ${t("home.search.samarkand")}`}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{trip.driverName}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                                        {formatDate(trip.departureTime)}{" "}
                                        <span className="font-medium">{formatTime(trip.departureTime)}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="font-medium">{trip.totalSeats - trip.availableSeats}</span>
                                        <span className="text-muted-foreground">/{trip.totalSeats}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-display font-semibold">
                                        {formatPrice(trip.price)}
                                    </td>
                                    <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
                                                    statusColors[trip.status] || "bg-muted"
                                                )}
                                            >
                                                {trip.status}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 text-right relative">
                                        {hasActions && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setMenuOpen(menuOpen === trip.id ? null : trip.id)
                                                    }
                                                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                {menuOpen === trip.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setMenuOpen(null)}
                                                        />
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="absolute right-2 top-full mt-1 w-52 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-20"
                                                        >
                                                            {/* Завершить рейс */}
                                                            {isCompletable && (
                                                                <button
                                                                    onClick={() => {
                                                                        completeMutation.mutate(trip.id);
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary text-emerald-600"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                    <span>{t("admin.trips.completeTrip")}</span>
                                                                </button>
                                                            )}

                                                            {/* Разделитель если есть обе кнопки */}
                                                            {isCompletable && isCancellable && (
                                                                <div className="border-t border-border" />
                                                            )}

                                                            {/* Отменить рейс */}
                                                            {isCancellable && (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmCancel(trip);
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary text-destructive"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                    <span>{t("admin.trips.cancelTrip")}</span>
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </motion.tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {hasNextPage && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                {t("myBookings.loadMore")}
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Cancel modal */}
            <Modal
                isOpen={!!confirmCancel}
                onClose={() => setConfirmCancel(null)}
                title={t("admin.trips.cancelModalTitle")}
            >
                {confirmCancel && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {t("admin.trips.cancelModalDesc", { id: confirmCancel.id })}
                        </p>

                        <div className="p-3 rounded-xl bg-secondary/50 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("admin.trips.driver")}:</span>
                                <span className="font-medium">{confirmCancel.driverName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("admin.trips.departure")}:</span>
                                <span className="font-medium">
                                    {formatDate(confirmCancel.departureTime)} {formatTime(confirmCancel.departureTime)}
                                </span>
                            </div>
                        </div>

                        {confirmCancel.totalSeats - confirmCancel.availableSeats > 0 && (
                            <div className="p-3 rounded-xl bg-karvon-sunset-50 dark:bg-karvon-sunset-700/10 border border-karvon-sunset-200 dark:border-karvon-sunset-700/30 text-xs text-karvon-sunset-700 dark:text-karvon-sunset-400 flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>
                                    {t("admin.trips.cancelWarning", {
                                        count: confirmCancel.totalSeats - confirmCancel.availableSeats,
                                    })}
                                </span>
                            </div>
                        )}

                        {cancelMutation.error && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{getErrorMessage(cancelMutation.error)}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setConfirmCancel(null)}
                                disabled={cancelMutation.isPending}
                            >
                                {t("myBookings.cancelModal.keep")}
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 !bg-destructive hover:!bg-destructive/90"
                                onClick={handleConfirmCancel}
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    t("myBookings.cancelModal.confirm")
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}