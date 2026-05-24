import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    Plus,
    TrendingUp,
    Calendar,
    Wallet,
    AlertCircle,
    Loader2,
    ChevronDown,
} from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CreateTripForm } from "@/components/driver/CreateTripForm";
import { DriverTripCard } from "@/components/driver/DriverTripCard";
import { useMyTrips, useCancelTrip } from "@/hooks/useDriverTrips";
import { getErrorMessage } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types/api";
import { toast } from "sonner";
import { DriverDashboardSkeleton } from "@/components/driver/DriverDashboardSkeleton";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";


type FilterTab = "all" | "active" | "past" | "cancelled";

function DriverDashboardContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    const [filter, setFilter] = useState<FilterTab>("all");
    const [showCreate, setShowCreate] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState<Trip | null>(null);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMyTrips();
    const cancelMutation = useCancelTrip();

    const trips = useMemo(
        () => data?.pages.flatMap((p) => p.content) ?? [],
        [data]
    );

    const now = new Date();

    const stats = useMemo(() => {
        let activeCount = 0;
        let totalEarned = 0;
        let totalPassengers = 0;
        trips.forEach((t) => {
            const isPast = new Date(t.departureTime) < now;
            const isCancelled = t.status === "CANCELLED";
            const booked = t.totalSeats - t.availableSeats;
            if (!isCancelled && !isPast) activeCount++;
            if (!isCancelled) {
                totalEarned += t.price * booked;
                totalPassengers += booked;
            }
        });
        return { activeCount, totalEarned, totalPassengers, total: trips.length };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trips]);

    const filteredTrips = useMemo(() => {
        return trips.filter((t) => {
            const isPast = new Date(t.departureTime) < now;
            const isCancelled = t.status === "CANCELLED";
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
    }, [trips, filter]);

    const counts = useMemo(() => {
        let active = 0, past = 0, cancelled = 0;
        trips.forEach((t) => {
            const isPast = new Date(t.departureTime) < now;
            const isCancelled = t.status === "CANCELLED";
            if (isCancelled) cancelled++;
            else if (isPast) past++;
            else active++;
        });
        return { all: trips.length, active, past, cancelled };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trips]);

    // Auto-load on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 600
            ) {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Не залогинен или не водитель
    if (!isAuthenticated) {
        return (
            <main className="container py-20">
                <div className="max-w-md mx-auto text-center">
                    <h2 className="font-display text-2xl font-bold mb-2">
                        {t("myBookings.loginRequired")}
                    </h2>
                    <Button size="lg" onClick={() => navigate("/login")} className="mt-4">
                        {t("nav.login")}
                    </Button>
                </div>
            </main>
        );
    }

    if (user && user.role !== "DRIVER" && user.role !== "ADMIN") {
        return (
            <main className="container py-20">
                <div className="max-w-md mx-auto text-center">
                    <div className="inline-flex w-20 h-20 rounded-3xl bg-destructive/10 items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-2">
                        {t("driver.notDriver")}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {t("driver.notDriverDesc")}
                    </p>
                    <Button size="lg" onClick={() => navigate("/")}>
                        {t("auth.backHome")}
                    </Button>
                </div>
            </main>
        );
    }

    const handleConfirmCancel = async () => {
        if (!confirmCancel) return;
        try {
            await cancelMutation.mutateAsync(confirmCancel.id);
            setConfirmCancel(null);
            toast.success(t("toast.tripCancelled"));
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    const tabs: { id: FilterTab; label: string; count: number }[] = [
        { id: "all", label: t("myBookings.tabs.all"), count: counts.all },
        { id: "active", label: t("myBookings.tabs.active"), count: counts.active },
        { id: "past", label: t("myBookings.tabs.past"), count: counts.past },
        { id: "cancelled", label: t("myBookings.tabs.cancelled"), count: counts.cancelled },
    ];

    return (
        <main className="container py-6 md:py-10">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-end justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
                        {t("driver.title")}
                    </h1>
                    <p className="text-muted-foreground">{t("driver.subtitle")}</p>
                </div>
                <Button size="lg" onClick={() => setShowCreate(true)}>
                    <Plus className="w-5 h-5" />
                    <span>{t("driver.createButton")}</span>
                </Button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                    icon={<Calendar className="w-5 h-5" />}
                    label={t("driver.stats.activeTrips")}
                    value={stats.activeCount.toString()}
                    color="from-karvon-turquoise-500 to-karvon-turquoise-600"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label={t("driver.stats.passengers")}
                    value={stats.totalPassengers.toString()}
                    color="from-karvon-sunset-500 to-karvon-sunset-600"
                />
                <StatCard
                    icon={<Wallet className="w-5 h-5" />}
                    label={t("driver.stats.totalEarned")}
                    value={formatPrice(stats.totalEarned)}
                    color="from-purple-500 to-pink-500"
                />
            </div>

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

            {/* Content */}
            {isLoading ? (
                <DriverDashboardSkeleton />
            ) : isError ? (
                <Card className="p-6 bg-destructive/10 border-destructive/30 text-destructive flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <span>{t("common.error")}</span>
                </Card>
            ) : trips.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-secondary items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">
                        {t("driver.empty.title")}
                    </h3>
                    <p className="text-muted-foreground mb-6">{t("driver.empty.desc")}</p>
                    <Button size="lg" onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4" />
                        {t("driver.createButton")}
                    </Button>
                </Card>
            ) : filteredTrips.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">{t("myBookings.noInFilter")}</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredTrips.map((trip, idx) => (
                        <DriverTripCard
                            key={trip.id}
                            trip={trip}
                            index={idx}
                            onCancel={(t) => setConfirmCancel(t)}
                        />
                    ))}
                </div>
            )}

            {/* Load more */}
            {hasNextPage && (
                <div className="flex justify-center mt-8">
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
                </div>
            )}

            {/* Create modal */}
            <Modal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                title={t("driver.create.modalTitle")}
            >
                <CreateTripForm onSuccess={() => setShowCreate(false)} />
            </Modal>

            {/* Cancel modal */}
            <Modal
                isOpen={!!confirmCancel}
                onClose={() => setConfirmCancel(null)}
                title={t("driver.cancelModal.title")}
            >
                {confirmCancel && (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {t("driver.cancelModal.desc", { id: confirmCancel.id })}
                        </p>

                        {(confirmCancel.totalSeats - confirmCancel.availableSeats) > 0 && (
                            <div className="p-3 rounded-xl bg-karvon-sunset-50 dark:bg-karvon-sunset-700/10 border border-karvon-sunset-200 dark:border-karvon-sunset-700/30 text-xs text-karvon-sunset-700 dark:text-karvon-sunset-400 flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>
                  {t("driver.cancelModal.warning", {
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
                                    t("driver.cancelModal.confirm")
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </main>
    );
}

function StatCard({
                      icon,
                      label,
                      value,
                      color,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <Card className="p-5">
            <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-md`}>
                    {icon}
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-xl font-display font-bold">{value}</div>
                </div>
            </div>
        </Card>
    );
}

export function DriverDashboardPage() {
    return (
        <ThemeProvider>
            <SEO
                title="Bosh sahifa"
                description="Samarqand va Toshkent o'rtasidagi qulay sayohat — Karvon"
            />
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">
                    <DriverDashboardContent />
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    );
}