import { motion } from "framer-motion";
import { Car, User, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface CarSeatsProps {
    totalSeats: number;     // пассажирских мест ВСЕГО
    availableSeats: number; // свободных пассажирских мест
    selectedCount: number;
    onSelectCount: (count: number) => void;
}

export function CarSeats({
                             totalSeats,
                             availableSeats,
                             selectedCount,
                             onSelectCount,
                         }: CarSeatsProps) {
    const { t } = useTranslation();
    const bookedSeats = totalSeats - availableSeats;

    // Создаём только пассажирские места (без водителя)
    const passengerSeats = Array.from({ length: totalSeats }, (_, i) => {
        const seatNum = i + 1; // 1, 2, 3...
        if (seatNum <= bookedSeats) {
            return { status: "booked" as const, num: seatNum };
        }
        if (seatNum <= bookedSeats + selectedCount) {
            return { status: "selected" as const, num: seatNum };
        }
        return { status: "available" as const, num: seatNum };
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Car className="w-5 h-5 text-karvon-turquoise-600" />
                    <span>{t("trip.carSeats")}</span>
                </h3>
                <div className="text-sm text-muted-foreground">
                    {t("trip.seatsAvailable", { available: availableSeats, total: totalSeats })}
                </div>
            </div>

            <div className="relative">
                <div className="rounded-3xl border-2 border-border bg-gradient-to-b from-secondary/30 to-secondary/60 p-6 max-w-sm mx-auto">
                    {/* Лобовое стекло */}
                    <div className="h-3 rounded-t-2xl bg-karvon-turquoise-200/40 dark:bg-karvon-turquoise-700/20 mb-4" />

                    {/* Передний ряд: водитель + переднее пассажирское */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <DriverSeat />
                        {passengerSeats[0] && <SeatBox seat={passengerSeats[0]} />}
                    </div>

                    {/* Перегородка */}
                    <div className="h-0.5 bg-border/50 mb-3" />

                    {/* Задние пассажирские места */}
                    <div className="grid grid-cols-2 gap-4">
                        {passengerSeats.slice(1).map((seat, idx) => (
                            <SeatBox key={idx} seat={seat} />
                        ))}
                    </div>

                    {/* Багажник */}
                    <div className="h-2 rounded-b-xl bg-secondary/80 mt-4" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                    {t("trip.howManySeats")}
                </div>
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: availableSeats }, (_, i) => i + 1).map((n) => (
                        <button
                            key={n}
                            onClick={() => onSelectCount(n)}
                            className={cn(
                                "w-12 h-12 rounded-xl font-semibold transition-all border-2",
                                selectedCount === n
                                    ? "bg-karvon-turquoise-600 text-white border-karvon-turquoise-600 shadow-lg scale-105"
                                    : "bg-card border-border hover:border-karvon-turquoise-400 hover:bg-secondary"
                            )}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                <Legend color="bg-karvon-turquoise-600" label={t("trip.legendSelected")} />
                <Legend color="bg-card border-2 border-border" label={t("trip.legendAvailable")} />
                <Legend color="bg-muted" label={t("trip.legendBooked")} />
            </div>
        </div>
    );
}

function DriverSeat() {
    return (
        <div className="aspect-square rounded-xl flex flex-col items-center justify-center bg-foreground text-background relative">
            <Car className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
        Driver
      </span>
        </div>
    );
}

function SeatBox({
                     seat,
                 }: {
    seat: { status: "booked" | "selected" | "available"; num: number };
}) {
    const styles = {
        booked: "bg-muted text-muted-foreground",
        selected: "bg-karvon-turquoise-600 text-white shadow-lg",
        available: "bg-card border-2 border-border text-foreground",
    };

    return (
        <motion.div
            initial={false}
            animate={{ scale: seat.status === "selected" ? 1.05 : 1 }}
            className={cn(
                "aspect-square rounded-xl flex items-center justify-center font-semibold text-sm",
                styles[seat.status]
            )}
        >
            {seat.status === "selected" ? (
                <Check className="w-5 h-5" />
            ) : seat.status === "booked" ? (
                <User className="w-4 h-4 opacity-50" />
            ) : (
                seat.num
            )}
        </motion.div>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded", color)} />
            <span className="text-muted-foreground">{label}</span>
        </div>
    );
}