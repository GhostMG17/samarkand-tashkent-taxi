import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Clock, Users, Phone, ArrowRight, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SamarkandIcon, TashkentIcon } from "@/components/icons/CityIcons";
import { formatPrice, formatTime, formatDate } from "@/lib/utils";
import type { Trip } from "@/types/api";

interface TripCardProps {
    trip: Trip;
    onBook: (trip: Trip) => void;
    index?: number;
}

export function TripCard({ trip, onBook, index = 0 }: TripCardProps) {
    const { t } = useTranslation();
    const isToTashkent = trip.direction === "SAMARKAND_TO_TASHKENT";
    const FromIcon = isToTashkent ? SamarkandIcon : TashkentIcon;
    const ToIcon = isToTashkent ? TashkentIcon : SamarkandIcon;
    const fromName = isToTashkent ? t("home.search.samarkand") : t("home.search.tashkent");
    const toName = isToTashkent ? t("home.search.tashkent") : t("home.search.samarkand");

    const seatsLeft = trip.availableSeats;
    const seatsColor =
        seatsLeft <= 1
            ? "text-destructive"
            : seatsLeft <= 2
                ? "text-karvon-sunset-500"
                : "text-karvon-turquoise-600";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <Card className="overflow-hidden hover:border-karvon-turquoise-500/50 transition-all group">
                <div className="p-5 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
                        {/* Route + Time + Driver */}
                        <div className="space-y-5">
                            {/* Route */}
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 flex items-center justify-center text-karvon-turquoise-600">
                                        <FromIcon className="w-7 h-7" />
                                    </div>
                                    <div className="text-xs font-medium mt-1.5">{fromName}</div>
                                </div>

                                {/* Connector */}
                                <div className="flex-1 flex items-center min-w-0">
                                    <div className="flex-1 h-px bg-gradient-to-r from-karvon-turquoise-500 to-karvon-sunset-500" />
                                    <div className="px-3 py-1 rounded-full bg-secondary text-xs font-semibold flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(trip.departureTime)}
                                    </div>
                                    <div className="flex-1 h-px bg-gradient-to-r from-karvon-turquoise-500 to-karvon-sunset-500" />
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-karvon-sunset-100 dark:bg-karvon-sunset-700/30 flex items-center justify-center text-karvon-sunset-600">
                                        <ToIcon className="w-7 h-7" />
                                    </div>
                                    <div className="text-xs font-medium mt-1.5">{toName}</div>
                                </div>
                            </div>

                            {/* Date + Driver + Seats */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(trip.departureTime)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span className="font-medium text-foreground">{trip.driverName}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 font-medium ${seatsColor}`}>
                                    <Users className="w-4 h-4" />
                                    <span>
                    {t("common.seatsAvailable", { count: seatsLeft })}
                  </span>
                                </div>
                            </div>

                            {trip.notes && (
                                <div className="text-sm text-muted-foreground italic border-l-2 border-karvon-turquoise-500 pl-3">
                                    "{trip.notes}"
                                </div>
                            )}
                        </div>

                        {/* Price + Button */}
                        <div className="md:text-right md:border-l md:border-border md:pl-6 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                            <div>
                                <div className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-br from-karvon-turquoise-600 to-karvon-sunset-600 bg-clip-text text-transparent">
                                    {formatPrice(trip.price)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 text-right">
                                    {t("common.price")} / {t("common.seats")}
                                </div>
                            </div>

                            <Button
                                size="lg"
                                onClick={() => onBook(trip)}
                                className="group/btn shrink-0"
                            >
                                <span>{t("common.book")}</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}