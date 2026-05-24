import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    Calendar,
    Clock,
    Phone,
    Users,
    CreditCard,
    XCircle,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SamarkandIcon, TashkentIcon } from "@/components/icons/CityIcons";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/api";

interface BookingCardProps {
    booking: Booking;
    onPay: (booking: Booking) => void;
    onCancel: (booking: Booking) => void;
    index?: number;
}

export function BookingCard({
                                booking,
                                onPay,
                                onCancel,
                                index = 0,
                            }: BookingCardProps) {
    const { t } = useTranslation();

    const isToTashkent = booking.direction === "SAMARKAND_TO_TASHKENT";
    const FromIcon = isToTashkent ? SamarkandIcon : TashkentIcon;
    const ToIcon = isToTashkent ? TashkentIcon : SamarkandIcon;
    const fromName = isToTashkent
        ? t("home.search.samarkand")
        : t("home.search.tashkent");
    const toName = isToTashkent
        ? t("home.search.tashkent")
        : t("home.search.samarkand");

    const isCancelled = booking.status === "CANCELLED";
    const isPaid = booking.paymentStatus === "PAID";
    const isPast = new Date(booking.departureTime) < new Date();
    const canPay = !isCancelled && !isPaid && !isPast;
    const canCancel = !isCancelled && !isPast;

    // Статус-бейдж
    let statusLabel = "";
    let statusClass = "";
    if (isCancelled) {
        statusLabel = t("myBookings.status.cancelled");
        statusClass = "bg-muted text-muted-foreground";
    } else if (isPaid) {
        statusLabel = t("myBookings.status.confirmed");
        statusClass =
            "bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 text-karvon-turquoise-700 dark:text-karvon-turquoise-400";
    } else if (isPast) {
        statusLabel = t("myBookings.status.expired");
        statusClass = "bg-muted text-muted-foreground";
    } else {
        statusLabel = t("myBookings.status.awaitingPayment");
        statusClass =
            "bg-karvon-sunset-100 dark:bg-karvon-sunset-700/20 text-karvon-sunset-700 dark:text-karvon-sunset-400";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card
                className={cn(
                    "overflow-hidden transition-all",
                    isCancelled && "opacity-60"
                )}
            >
                <div className="p-5 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-start">
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
                  #{booking.id}
                </span>
                            </div>

                            {/* Route */}
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-11 h-11 rounded-2xl bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 flex items-center justify-center text-karvon-turquoise-600">
                                        <FromIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-[11px] font-medium mt-1">{fromName}</div>
                                </div>

                                <div className="flex-1 flex items-center min-w-0">
                                    <div className="flex-1 h-px bg-gradient-to-r from-karvon-turquoise-500 to-karvon-sunset-500" />
                                    <div className="px-2.5 py-1 rounded-full bg-secondary text-xs font-semibold flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(booking.departureTime)}
                                    </div>
                                    <div className="flex-1 h-px bg-gradient-to-r from-karvon-turquoise-500 to-karvon-sunset-500" />
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-11 h-11 rounded-2xl bg-karvon-sunset-100 dark:bg-karvon-sunset-700/30 flex items-center justify-center text-karvon-sunset-600">
                                        <ToIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-[11px] font-medium mt-1">{toName}</div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(booking.departureTime)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>
                    {booking.seatsCount} {t("trip.seats").toLowerCase()}
                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">{t("trip.driver")}:</span>
                                    <span className="font-medium">{booking.driverName}</span>
                                </div>
                                {booking.driverPhone && isPaid && (
                                    <a
                                        href={`tel:${booking.driverPhone}`}
                                        className="flex items-center gap-1 text-karvon-turquoise-600 hover:text-karvon-turquoise-700"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span className="font-medium">{booking.driverPhone}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Right column — price + actions */}
                        <div className="md:text-right md:border-l md:border-border md:pl-5 space-y-3 md:min-w-[180px]">
                            <div>
                                <div className="text-2xl md:text-3xl font-display font-bold bg-gradient-to-br from-karvon-turquoise-600 to-karvon-sunset-600 bg-clip-text text-transparent">
                                    {formatPrice(booking.totalPrice)}
                                </div>
                            </div>

                            <div className="flex md:flex-col gap-2">
                                {canPay && (
                                    <Button
                                        size="sm"
                                        onClick={() => onPay(booking)}
                                        className="flex-1 group"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        <span>{t("myBookings.actions.pay")}</span>
                                    </Button>
                                )}
                                {canCancel && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onCancel(booking)}
                                        className="flex-1 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>{t("myBookings.actions.cancel")}</span>
                                    </Button>
                                )}
                                {isPaid && !isPast && (
                                    <div className="flex items-center gap-1.5 text-xs text-karvon-turquoise-600 dark:text-karvon-turquoise-400 font-medium md:justify-end">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{t("myBookings.ticketReady")}</span>
                                    </div>
                                )}
                                {isPast && !isCancelled && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:justify-end">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{t("myBookings.tripCompleted")}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}