import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMyBookings } from "@/hooks/useBookings";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

function BookingSuccessContent() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data, isLoading } = useMyBookings();

    const allBookings = data?.pages.flatMap((p) => p.content) ?? [];
    const booking = allBookings.find((b) => b.id === Number(bookingId));

    useEffect(() => {
        if (!isLoading && !booking) {
            const timer = setTimeout(() => navigate("/"), 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, booking, navigate]);

    if (isLoading || !booking) {
        return (
            <div className="container py-20 text-center">
                <div className="text-muted-foreground">{t("success.loading")}</div>
            </div>
        );
    }

    const routeLabel =
        booking.direction === "SAMARKAND_TO_TASHKENT"
            ? t("success.samToTash")
            : t("success.tashToSam");

    return (
        <main className="container py-12 md:py-20">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex justify-center mb-6"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-karvon-turquoise-500 blur-2xl opacity-40 rounded-full" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-karvon-turquoise-500 to-karvon-turquoise-600 flex items-center justify-center shadow-2xl">
                            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
                        {t("success.title")}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t("success.subtitle")}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="overflow-hidden">
                        <div className="h-1 bg-gradient-karvon" />

                        <div className="p-6 md:p-8 space-y-6">
                            <div className="text-center pb-6 border-b border-border">
                                <div className="text-sm text-muted-foreground">
                                    {t("success.bookingNumber")}
                                </div>
                                <div className="text-3xl font-display font-bold mt-1">
                                    #{booking.id}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <DetailRow
                                    icon={<Calendar className="w-4 h-4" />}
                                    label={t("success.date")}
                                    value={formatDate(booking.departureTime)}
                                />
                                <DetailRow
                                    icon={<Clock className="w-4 h-4" />}
                                    label={t("success.time")}
                                    value={formatTime(booking.departureTime)}
                                />
                                <DetailRow
                                    icon={<User className="w-4 h-4" />}
                                    label={t("success.driver")}
                                    value={booking.driverName}
                                />
                                <DetailRow
                                    label={t("success.seats")}
                                    value={`${booking.seatsCount}`}
                                />
                                <DetailRow label={t("success.route")} value={routeLabel} />
                            </div>

                            <div className="p-4 rounded-2xl bg-gradient-to-br from-karvon-turquoise-50 to-karvon-sunset-50 dark:from-karvon-turquoise-900/20 dark:to-karvon-sunset-900/20 border border-karvon-turquoise-200/50 dark:border-karvon-turquoise-700/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{t("success.toPay")}</span>
                                    <span className="text-2xl font-display font-bold">
                    {formatPrice(booking.totalPrice)}
                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t("success.waitingPayment")}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    size="lg"
                                    className="flex-1"
                                    onClick={() => navigate(`/payment/${booking.id}`)}
                                >
                                    <span>{t("success.pay")}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                    onClick={() => navigate("/my-bookings")}
                                >
                                    {t("success.myBookings")}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}

function DetailRow({
                       icon,
                       label,
                       value,
                   }: {
    icon?: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground flex items-center gap-2">
        {icon}
          {label}
      </span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

export function BookingSuccessPage() {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">
                    <BookingSuccessContent />
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    );
}