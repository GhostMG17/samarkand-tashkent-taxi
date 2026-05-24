import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    Loader2,
    ChevronDown,
    Ticket,
    MoreVertical,
    XCircle,
    DollarSign,
    AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
    useAdminBookings,
    useCancelBookingAsAdmin,
    useMarkBookingAsPaid,
} from "@/hooks/useAdmin";
import { getErrorMessage } from "@/hooks/useAuth";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/api";

export function BookingsTable() {
    const { t } = useTranslation();
    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useAdminBookings();
    const cancelMutation = useCancelBookingAsAdmin();
    const markPaidMutation = useMarkBookingAsPaid();

    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);
    const [confirmPaid, setConfirmPaid] = useState<Booking | null>(null);

    const bookings = data?.pages.flatMap((p) => p.content) ?? [];

    if (isLoading) {
        return (
            <Card className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-karvon-turquoise-600" />
            </Card>
        );
    }

    const statusColors: Record<string, string> = {
        CONFIRMED:
            "bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 text-karvon-turquoise-700 dark:text-karvon-turquoise-400",
        CANCELLED: "bg-destructive/10 text-destructive",
    };

    const paymentColors: Record<string, string> = {
        PAID: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
        UNPAID:
            "bg-karvon-sunset-100 dark:bg-karvon-sunset-700/30 text-karvon-sunset-700 dark:text-karvon-sunset-400",
    };

    const handleConfirmCancel = async () => {
        if (!confirmCancel) return;
        try {
            await cancelMutation.mutateAsync(confirmCancel.id);
            setConfirmCancel(null);
        } catch {}
    };

    const handleConfirmPaid = async () => {
        if (!confirmPaid) return;
        try {
            await markPaidMutation.mutateAsync(confirmPaid.id);
            setConfirmPaid(null);
        } catch {}
    };

    return (
        <div className="space-y-3">
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">#</th>
                            <th className="text-left px-4 py-3 font-semibold">{t("admin.bookings.passenger")}</th>
                            <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">{t("admin.bookings.driver")}</th>
                            <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">{t("admin.bookings.trip")}</th>
                            <th className="text-center px-4 py-3 font-semibold">{t("admin.bookings.seats")}</th>
                            <th className="text-right px-4 py-3 font-semibold">{t("admin.bookings.total")}</th>
                            <th className="text-left px-4 py-3 font-semibold">{t("admin.bookings.payment")}</th>
                            <th className="text-left px-4 py-3 font-semibold">{t("admin.bookings.status")}</th>
                            <th className="text-right px-4 py-3 font-semibold">{t("admin.users.actions")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map((b, idx) => {
                            const canCancel = b.status !== "CANCELLED";
                            const canMarkPaid =
                                b.status !== "CANCELLED" && b.paymentStatus !== "PAID";
                            const hasActions = canCancel || canMarkPaid;

                            return (
                                <motion.tr
                                    key={b.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="border-b border-border last:border-0 hover:bg-secondary/30"
                                >
                                    <td className="px-4 py-3 text-muted-foreground">#{b.id}</td>
                                    <td className="px-4 py-3 font-medium">{b.passengerName}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">{b.driverName}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                                        {formatDate(b.departureTime)} {formatTime(b.departureTime)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="w-3 h-3 text-muted-foreground" />
                          {b.seatsCount}
                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-display font-semibold">
                                        {formatPrice(b.totalPrice)}
                                    </td>
                                    <td className="px-4 py-3">
                      <span
                          className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
                              paymentColors[b.paymentStatus] || "bg-muted"
                          )}
                      >
                        {b.paymentStatus}
                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                      <span
                          className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
                              statusColors[b.status] || "bg-muted"
                          )}
                      >
                        {b.status}
                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right relative">
                                        {hasActions && (
                                            <>
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === b.id ? null : b.id)}
                                                    className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                {menuOpen === b.id && (
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
                                                            {canMarkPaid && (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmPaid(b);
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary text-emerald-600"
                                                                >
                                                                    <DollarSign className="w-4 h-4" />
                                                                    <span>{t("admin.bookings.markPaid")}</span>
                                                                </button>
                                                            )}
                                                            {canCancel && canMarkPaid && (
                                                                <div className="border-t border-border" />
                                                            )}
                                                            {canCancel && (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmCancel(b);
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary text-destructive"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                    <span>{t("admin.bookings.cancelBooking")}</span>
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
                    <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
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

            {/* Cancel booking modal */}
            <Modal
                isOpen={!!confirmCancel}
                onClose={() => setConfirmCancel(null)}
                title={t("admin.bookings.cancelModalTitle")}
            >
                {confirmCancel && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {t("admin.bookings.cancelModalDesc", { id: confirmCancel.id })}
                        </p>

                        <div className="p-3 rounded-xl bg-secondary/50 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("admin.bookings.passenger")}:</span>
                                <span className="font-medium">{confirmCancel.passengerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("admin.bookings.driver")}:</span>
                                <span className="font-medium">{confirmCancel.driverName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("admin.bookings.total")}:</span>
                                <span className="font-medium">{formatPrice(confirmCancel.totalPrice)}</span>
                            </div>
                        </div>

                        {confirmCancel.paymentStatus === "PAID" && (
                            <div className="p-3 rounded-xl bg-karvon-sunset-50 dark:bg-karvon-sunset-700/10 border border-karvon-sunset-200 dark:border-karvon-sunset-700/30 text-xs text-karvon-sunset-700 dark:text-karvon-sunset-400 flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{t("admin.bookings.paidRefundWarning")}</span>
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

            {/* Mark as paid modal */}
            <Modal
                isOpen={!!confirmPaid}
                onClose={() => setConfirmPaid(null)}
                title={t("admin.bookings.markPaidModalTitle")}
            >
                {confirmPaid && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {t("admin.bookings.markPaidModalDesc", { id: confirmPaid.id })}
                        </p>

                        <div className="p-3 rounded-xl bg-secondary/50 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("admin.bookings.passenger")}:</span>
                                <span className="font-medium">{confirmPaid.passengerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("admin.bookings.total")}:</span>
                                <span className="font-medium">{formatPrice(confirmPaid.totalPrice)}</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                            <DollarSign className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{t("admin.bookings.markPaidInfo")}</span>
                        </div>

                        {markPaidMutation.error && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{getErrorMessage(markPaidMutation.error)}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setConfirmPaid(null)}
                                disabled={markPaidMutation.isPending}
                            >
                                {t("myBookings.cancelModal.keep")}
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
                                onClick={handleConfirmPaid}
                                disabled={markPaidMutation.isPending}
                            >
                                {markPaidMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    t("admin.bookings.confirmPaid")
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}