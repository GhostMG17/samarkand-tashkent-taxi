import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Phone,
    MapPin,
    AlertCircle,
    CheckCircle,
    Loader2,
    Sparkles,
} from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CarSeats } from "@/components/trip/CarSeats";
import { SamarkandIcon, TashkentIcon } from "@/components/icons/CityIcons";
import { useTrip } from "@/hooks/useTrip";
import { useCreateBooking } from "@/hooks/useBookings";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/hooks/useAuth";
import { formatPrice, formatTime, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { TripDetailSkeleton } from "@/components/trip/TripDetailSkeleton";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

function TripDetailContent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthStore();

    const tripId = id ? Number(id) : undefined;
    const tripQuery = useTrip(tripId);
    const trip = tripQuery.data;
    const bookMutation = useCreateBooking();

    const [seats, setSeats] = useState(1);

    if (tripQuery.isLoading) {
        return <TripDetailSkeleton />;
    }

    if (tripQuery.isError || !trip) {
        return (
            <div className="container py-12">
                <div className="max-w-md mx-auto text-center">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-destructive/10 items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-2">{t("trip.notFound")}</h2>
                    <Button onClick={() => navigate("/trips")}>
                        {t("trip.backToSearch")}
                    </Button>
                </div>
            </div>
        );
    }

    const isToTashkent = trip.direction === "SAMARKAND_TO_TASHKENT";
    const FromIcon = isToTashkent ? SamarkandIcon : TashkentIcon;
    const ToIcon = isToTashkent ? TashkentIcon : SamarkandIcon;
    const fromName = isToTashkent
        ? t("home.search.samarkand")
        : t("home.search.tashkent");
    const toName = isToTashkent
        ? t("home.search.tashkent")
        : t("home.search.samarkand");

    const routeLabel =
        fromName + " " + String.fromCharCode(8594) + " " + toName;

    const totalPrice = trip.price * seats;
    const canBook =
        trip.status === "SCHEDULED" && trip.availableSeats > 0;

    const handleBook = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: location.pathname } });
            return;
        }
        try {
            const booking = await bookMutation.mutateAsync({
                tripId: trip.id,
                seatsCount: seats,
            });
            toast.success(t("toast.bookingCreated"));
            navigate("/booking/" + booking.id + "/success");
        } catch (err) {
            // ошибка покажется через bookMutation.error
        }
    };

    const apiError = bookMutation.error
        ? getErrorMessage(bookMutation.error)
        : null;

    return (
        <main className="container py-6 md:py-10">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group transition-colors"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>{t("trip.back")}</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                <div className="space-y-6">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="relative overflow-hidden">
                            <div className="absolute inset-0 pattern-grid opacity-30" />

                            <div className="relative p-6 md:p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="px-3 py-1 rounded-full bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 text-karvon-turquoise-700 dark:text-karvon-turquoise-400 text-xs font-semibold">
                                        {trip.status === "SCHEDULED"
                                            ? t("trip.statusScheduled")
                                            : trip.status}
                                    </div>

                                    <div className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                                        {t("trip.routeId")} #{trip.id}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 md:gap-6 my-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-3xl bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 flex items-center justify-center text-karvon-turquoise-600 mb-2">
                                            <FromIcon className="w-9 h-9" />
                                        </div>

                                        <div className="text-base font-semibold">
                                            {fromName}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center min-w-0">
                                        <div className="flex items-center gap-2 mb-2 text-karvon-sunset-600 font-bold text-2xl md:text-3xl font-display">
                                            <Clock className="w-5 h-5" />

                                            <span>
                                                {formatTime(trip.departureTime)}
                                            </span>
                                        </div>

                                        <div className="w-full h-0.5 bg-gradient-to-r from-karvon-turquoise-500 via-karvon-sunset-500 to-karvon-turquoise-500" />

                                        <div className="text-xs text-muted-foreground mt-2">
                                            {t("trip.hoursOnRoad")}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-3xl bg-karvon-sunset-100 dark:bg-karvon-sunset-700/30 flex items-center justify-center text-karvon-sunset-600 mb-2">
                                            <ToIcon className="w-9 h-9" />
                                        </div>

                                        <div className="text-base font-semibold">
                                            {toName}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm font-medium pt-4 border-t border-border">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />

                                    <span className="capitalize">
                                        {formatDate(trip.departureTime)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-6">
                            <h3 className="font-display text-lg font-semibold mb-4">
                                {t("trip.driver")}
                            </h3>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-karvon flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {trip.driverName
                                        ? trip.driverName.charAt(0).toUpperCase()
                                        : "?"}
                                </div>

                                <div className="flex-1">
                                    <div className="text-lg font-semibold">
                                        {trip.driverName}
                                    </div>

                                    <a
                                        href={"tel:" + trip.driverPhone}
                                        className="flex items-center gap-1.5 text-sm text-karvon-turquoise-600 hover:text-karvon-turquoise-700 mt-1"
                                    >
                                        <Phone className="w-4 h-4" />

                                        <span>{trip.driverPhone}</span>
                                    </a>
                                </div>
                            </div>

                            {trip.notes ? (
                                <div className="mt-4 p-4 rounded-xl bg-secondary/50 border-l-4 border-karvon-turquoise-500 text-sm italic">
                                    {trip.notes}
                                </div>
                            ) : null}
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-6">
                            <CarSeats
                                totalSeats={trip.totalSeats}
                                availableSeats={trip.availableSeats}
                                selectedCount={seats}
                                onSelectCount={setSeats}
                            />
                        </Card>
                    </motion.div>

                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="lg:sticky lg:top-24 lg:self-start"
                >
                    <Card className="overflow-hidden">
                        <div className="h-1 bg-gradient-karvon" />

                        <div className="p-6 space-y-5">

                            <div>
                                <div className="text-sm text-muted-foreground mb-1">
                                    {t("trip.totalToPay")}
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-display font-bold bg-gradient-to-br from-karvon-turquoise-600 to-karvon-sunset-600 bg-clip-text text-transparent">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>

                                <div className="text-xs text-muted-foreground mt-1">
                                    {formatPrice(trip.price)} x{" "}
                                    {t("trip.perSeat", { seats })}
                                </div>
                            </div>

                            <div className="bg-secondary/50 rounded-2xl p-4 space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t("trip.route")}
                                    </span>

                                    <span className="font-medium">
                                        {routeLabel}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t("trip.date")}
                                    </span>

                                    <span className="font-medium">
                                        {formatDate(trip.departureTime)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t("trip.time")}
                                    </span>

                                    <span className="font-medium">
                                        {formatTime(trip.departureTime)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t("trip.seats")}
                                    </span>

                                    <span className="font-medium">
                                        {seats}
                                    </span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {apiError ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

                                        <span>{apiError}</span>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            <Button
                                size="xl"
                                className="w-full"
                                onClick={handleBook}
                                disabled={!canBook || bookMutation.isPending}
                            >
                                {bookMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t("trip.booking")}
                                    </span>
                                ) : !canBook ? (
                                    <span>{t("trip.noSeats")}</span>
                                ) : !isAuthenticated ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        {t("trip.loginAndBook")}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        {t("trip.bookNow")}
                                    </span>
                                )}
                            </Button>

                            <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                                <MapPin className="w-3 h-3" />

                                <span>{t("trip.askDriver")}</span>
                            </div>

                        </div>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}

export function TripDetailPage() {
    return (
        <ThemeProvider>
            <SEO
                title="Bosh sahifa"
                description="Samarqand va Toshkent o'rtasidagi qulay sayohat — Karvon"
            />
            <div className="min-h-screen flex flex-col">
                <Header />

                <div className="flex-1">
                    <TripDetailContent />
                </div>

                <Footer />
            </div>
        </ThemeProvider>
    );
}