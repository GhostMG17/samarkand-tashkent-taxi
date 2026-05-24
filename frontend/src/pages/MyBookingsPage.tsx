import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Ticket, AlertCircle, Loader2, Search, ChevronDown } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BookingCard } from "@/components/bookings/BookingCard";
import { useMyBookings, useCancelBooking } from "@/hooks/useBookings";
import { getErrorMessage } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/api";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

type FilterTab = "all" | "active" | "past" | "cancelled";

function MyBookingsContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const [filter, setFilter] = useState<FilterTab>("all");
    const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMyBookings();
    const cancelMutation = useCancelBooking();

    // Собираем все страницы в один массив
    const bookings = useMemo(
        () => data?.pages.flatMap((p) => p.content) ?? [],
        [data]
    );

    const now = new Date();

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            const isPast = new Date(b.departureTime) < now;
            const isCancelled = b.status === "CANCELLED";
            switch (filter) {
                case "active":
                    return !isCancelled && !isPast;
                case "past":
                    return !isCancelled && isPast;
                case "cancelled":
                    return isCancelled;
                default:
                    return true;
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookings, filter]);

    const counts = useMemo(() => {
        const all = bookings.length;
        let active = 0,
            past = 0,
            cancelled = 0;
        bookings.forEach((b) => {
            const isPast = new Date(b.departureTime) < now;
            const isCancelled = b.status === "CANCELLED";
            if (isCancelled) cancelled++;
            else if (isPast) past++;
            else active++;
        });
        return { all, active, past, cancelled };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookings]);

    const handlePay = (booking: Booking) => navigate(`/payment/${booking.id}`);
    const handleCancelClick = (booking: Booking) => setConfirmCancel(booking);

    const handleConfirmCancel = async () => {
        if (!confirmCancel) return;
        try {
            await cancelMutation.mutateAsync(confirmCancel.id);
            setConfirmCancel(null);
            toast.success(t("toast.bookingCancelled"));
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    // Не залогинен
    if (!isAuthenticated) {
        return (
            <main className="container py-20">
                <div className="max-w-md mx-auto text-center">
                    <div className="inline-flex w-20 h-20 rounded-3xl bg-secondary items-center justify-center mb-6">
                        <Ticket className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-2">
                        {t("myBookings.loginRequired")}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {t("myBookings.loginRequiredDesc")}
                    </p>
                    <Button size="lg" onClick={() => navigate("/login")}>
                        {t("nav.login")}
                    </Button>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="container py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-karvon-turquoise-600" />
            </main>
        );
    }

    if (isError) {
        return (
            <main className="container py-12">
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-6 max-w-2xl mx-auto flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <span className="font-medium">{t("common.error")}</span>
                </div>
            </main>
        );
    }

    // Empty state
    if (bookings.length === 0) {
        return (
            <main className="container py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto text-center"
                >
                    <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-karvon items-center justify-center mb-6 shadow-xl">
                        <Ticket className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                        {t("myBookings.empty.title")}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        {t("myBookings.empty.desc")}
                    </p>
                    <Button size="lg" onClick={() => navigate("/")}>
                        <Search className="w-4 h-4" />
                        <span>{t("myBookings.empty.findTrip")}</span>
                    </Button>
                </motion.div>
            </main>
        );
    }

    const tabs: { id: FilterTab; label: string; count: number }[] = [
        { id: "all", label: t("myBookings.tabs.all"), count: counts.all },
        { id: "active", label: t("myBookings.tabs.active"), count: counts.active },
        { id: "past", label: t("myBookings.tabs.past"), count: counts.past },
        {
            id: "cancelled",
            label: t("myBookings.tabs.cancelled"),
            count: counts.cancelled,
        },
    ];



    return (
        <main className="container py-6 md:py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                    {t("myBookings.title")}
                </h1>
                <p className="text-muted-foreground">
                    {t("myBookings.subtitle", { count: counts.all })}
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2",
                            filter === tab.id
                                ? "bg-karvon-turquoise-600 text-white shadow-md"
                                : "bg-secondary hover:bg-secondary/70"
                        )}
                    >
                        <span>{tab.label}</span>
                        <span
                            className={cn(
                                "px-1.5 py-0.5 rounded-md text-xs font-semibold",
                                filter === tab.id ? "bg-white/20" : "bg-background"
                            )}
                        >
              {tab.count}
            </span>
                    </button>
                ))}
            </div>

            {/* Bookings list */}
            {filteredBookings.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">{t("myBookings.noInFilter")}</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking, idx) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            index={idx}
                            onPay={handlePay}
                            onCancel={handleCancelClick}
                        />
                    ))}
                </div>
            )}

            {/* Load more button */}
            {hasNextPage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center mt-8"
                >
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("myBookings.loadingMore")}
              </span>
                        ) : (
                            <span className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4" />
                                {t("myBookings.loadMore")}
              </span>
                        )}
                    </Button>
                </motion.div>
            )}

            {/* End of list indicator */}
            {!hasNextPage && bookings.length > 5 && (
                <div className="text-center text-sm text-muted-foreground mt-8 py-4">
                    {t("myBookings.endOfList")}
                </div>
            )}

            {/* Cancel confirmation modal */}
            <Modal
                isOpen={!!confirmCancel}
                onClose={() => setConfirmCancel(null)}
                title={t("myBookings.cancelModal.title")}
            >
                {confirmCancel && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {t("myBookings.cancelModal.desc", { id: confirmCancel.id })}
                        </p>

                        <div className="p-3 rounded-xl bg-secondary/50 text-sm space-y-1">
                            <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("trip.driver")}:
                </span>
                                <span className="font-medium">{confirmCancel.driverName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("trip.seats")}:</span>
                                <span className="font-medium">{confirmCancel.seatsCount}</span>
                            </div>
                            <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("payment.total")}:
                </span>
                                <span className="font-medium">
                  {formatPrice(confirmCancel.totalPrice)}
                </span>
                            </div>
                        </div>

                        {confirmCancel.paymentStatus === "PAID" && (
                            <div className="p-3 rounded-xl bg-karvon-sunset-50 dark:bg-karvon-sunset-700/10 border border-karvon-sunset-200 dark:border-karvon-sunset-700/30 text-xs text-karvon-sunset-700 dark:text-karvon-sunset-400 flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{t("myBookings.cancelModal.paidWarning")}</span>
                            </div>
                        )}

                        {cancelMutation.error && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{getErrorMessage(cancelMutation.error)}</span>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
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
        </main>
    );
}

export function MyBookingsPage() {
    return (
        <ThemeProvider>
            <SEO
                title="Bosh sahifa"
                description="Samarqand va Toshkent o'rtasidagi qulay sayohat — Karvon"
            />
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">
                    <MyBookingsContent />
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    );
}