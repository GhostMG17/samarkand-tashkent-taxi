import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Shield,
    AlertCircle,
    Lock,
    Sparkles,
} from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    ClickIcon,
    PaymeIcon,
    UzcardIcon,
    HumoIcon,
} from "@/components/icons/PaymentIcons";
import { useMyBookings } from "@/hooks/useBookings";
import { usePayBooking } from "@/hooks/usePayment";
import { getErrorMessage } from "@/hooks/useAuth";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

type PaymentMethod = "click" | "payme" | "uzcard" | "humo";

interface MethodOption {
    id: PaymentMethod;
    name: string;
    icon: React.ReactNode;
}

function PaymentContent() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data, isLoading } = useMyBookings();
    const payMutation = usePayBooking();

    const [method, setMethod] = useState<PaymentMethod>("click");
    const [paid, setPaid] = useState(false);

    const allBookings = data?.pages.flatMap((p) => p.content) ?? [];
    const booking = allBookings.find((b) => b.id === Number(bookingId));

    const methods: MethodOption[] = [
        { id: "click", name: "Click", icon: <ClickIcon className="w-12 h-12" /> },
        { id: "payme", name: "Payme", icon: <PaymeIcon className="w-12 h-12" /> },
        { id: "uzcard", name: "Uzcard", icon: <UzcardIcon className="w-12 h-12" /> },
        { id: "humo", name: "Humo", icon: <HumoIcon className="w-12 h-12" /> },
    ];

    if (isLoading) {
        return (
            <div className="container py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-karvon-turquoise-600" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="container py-12">
                <div className="max-w-md mx-auto text-center">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-destructive/10 items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-2">
                        {t("payment.notFound")}
                    </h2>
                    <Button onClick={() => navigate("/my-bookings")}>
                        {t("payment.toMyBookings")}
                    </Button>
                </div>
            </div>
        );
    }

    // Уже оплачено
    if (booking.paymentStatus === "PAID") {
        return (
            <div className="container py-12">
                <div className="max-w-md mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex w-20 h-20 rounded-2xl bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 items-center justify-center mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10 text-karvon-turquoise-600" />
                    </motion.div>
                    <h2 className="text-2xl font-display font-bold mb-2">
                        {t("payment.alreadyPaid")}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {t("payment.alreadyPaidDesc")}
                    </p>
                    <Button onClick={() => navigate("/my-bookings")}>
                        {t("payment.toMyBookings")}
                    </Button>
                </div>
            </div>
        );
    }

    const handlePay = async () => {
        try {
            await payMutation.mutateAsync(booking.id);
            setPaid(true);
            toast.success(t("toast.paymentSuccess"));
            setTimeout(() => {
                navigate("/my-bookings");
            }, 2500);
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    const apiError = payMutation.error ? getErrorMessage(payMutation.error) : null;

    // Success state — анимация после успешной оплаты
    if (paid) {
        return (
            <div className="container py-12 md:py-20">
                <div className="max-w-md mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-karvon-turquoise-500 blur-3xl opacity-50 rounded-full"
                            />
                            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-karvon-turquoise-500 to-karvon-turquoise-600 flex items-center justify-center shadow-2xl">
                                <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="font-display text-3xl md:text-4xl font-bold mb-3"
                    >
                        {t("payment.success.title")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-muted-foreground mb-2"
                    >
                        {t("payment.success.subtitle")}
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-sm text-muted-foreground"
                    >
                        {t("payment.success.redirect")}
                    </motion.p>
                </div>
            </div>
        );
    }

    return (
        <main className="container py-6 md:py-10">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group transition-colors"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>{t("trip.back")}</span>
            </button>

            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur mb-4 text-sm">
                        <Lock className="w-3.5 h-3.5 text-karvon-turquoise-600" />
                        <span className="text-muted-foreground">{t("payment.secure")}</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                        {t("payment.title")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("payment.subtitle", { id: booking.id })}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
                    {/* Methods */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-6">
                            <h2 className="font-display text-xl font-semibold mb-5">
                                {t("payment.chooseMethod")}
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                {methods.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMethod(m.id)}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all text-left group",
                                            "flex items-center gap-3",
                                            method === m.id
                                                ? "border-karvon-turquoise-500 bg-karvon-turquoise-50 dark:bg-karvon-turquoise-900/20 shadow-md"
                                                : "border-border hover:border-karvon-turquoise-300 hover:bg-secondary/50"
                                        )}
                                    >
                                        {m.icon}
                                        <div className="flex-1">
                                            <div className="font-semibold">{m.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {m.id === "click" || m.id === "payme"
                                                    ? t("payment.eWallet")
                                                    : t("payment.card")}
                                            </div>
                                        </div>
                                        {method === m.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-5 h-5 rounded-full bg-karvon-turquoise-600 flex items-center justify-center"
                                            >
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Demo notice */}
                            <div className="mt-5 p-3 rounded-xl bg-karvon-sunset-50 dark:bg-karvon-sunset-700/10 border border-karvon-sunset-200 dark:border-karvon-sunset-700/30 text-xs text-karvon-sunset-700 dark:text-karvon-sunset-400 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{t("payment.demoNotice")}</span>
                            </div>

                            {/* Security info */}
                            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                                <Shield className="w-4 h-4" />
                                <span>{t("payment.securityNote")}</span>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Order summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="md:sticky md:top-24 md:self-start"
                    >
                        <Card className="overflow-hidden">
                            <div className="h-1 bg-gradient-karvon" />
                            <div className="p-6 space-y-5">
                                <h3 className="font-display text-lg font-semibold">
                                    {t("payment.orderSummary")}
                                </h3>

                                <div className="space-y-2 text-sm">
                                    <Row
                                        label={t("payment.bookingNumber")}
                                        value={`#${booking.id}`}
                                    />
                                    <Row
                                        label={t("payment.route")}
                                        value={
                                            booking.direction === "SAMARKAND_TO_TASHKENT"
                                                ? t("success.samToTash")
                                                : t("success.tashToSam")
                                        }
                                    />
                                    <Row
                                        label={t("payment.date")}
                                        value={formatDate(booking.departureTime)}
                                    />
                                    <Row
                                        label={t("payment.time")}
                                        value={formatTime(booking.departureTime)}
                                    />
                                    <Row
                                        label={t("payment.seats")}
                                        value={`${booking.seatsCount}`}
                                    />
                                    <Row label={t("payment.driver")} value={booking.driverName} />
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("payment.total")}
                    </span>
                                        <span className="text-3xl font-display font-bold bg-gradient-to-br from-karvon-turquoise-600 to-karvon-sunset-600 bg-clip-text text-transparent">
                      {formatPrice(booking.totalPrice)}
                    </span>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {apiError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>{apiError}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    size="xl"
                                    className="w-full"
                                    onClick={handlePay}
                                    disabled={payMutation.isPending}
                                >
                                    {payMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                                            {t("payment.processing")}
                    </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                                            {t("payment.payNow", {
                                                amount: formatPrice(booking.totalPrice),
                                            })}
                    </span>
                                    )}
                                </Button>

                                <div className="text-xs text-center text-muted-foreground">
                                    {t("payment.termsNote")}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

export function PaymentPage() {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">
                    <PaymentContent />
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    );
}