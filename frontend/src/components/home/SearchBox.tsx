import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeftRight, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Direction } from "@/types/api";

export function SearchBox() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [direction, setDirection] = useState<Direction>("SAMARKAND_TO_TASHKENT");
    const [date, setDate] = useState<string>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });
    const [passengers, setPassengers] = useState(1);

    const swap = () => {
        setDirection((d) =>
            d === "SAMARKAND_TO_TASHKENT" ? "TASHKENT_TO_SAMARKAND" : "SAMARKAND_TO_TASHKENT"
        );
    };

    const fromCity = direction === "SAMARKAND_TO_TASHKENT"
        ? t("home.search.samarkand")
        : t("home.search.tashkent");
    const toCity = direction === "SAMARKAND_TO_TASHKENT"
        ? t("home.search.tashkent")
        : t("home.search.samarkand");

    const handleSearch = () => {
        const params = new URLSearchParams({
            direction,
            minSeats: passengers.toString(),
            dateFrom: `${date}T00:00:00`,
            dateTo: `${date}T23:59:59`,
        });
        navigate(`/trips?${params.toString()}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative -mt-12 md:-mt-20 z-20"
        >
            <div className="container">
                <div className="relative max-w-4xl mx-auto">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-karvon rounded-3xl blur-xl opacity-30" />

                    <div className="relative bg-card border border-border rounded-3xl shadow-2xl p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_auto_auto] gap-3 md:gap-2 items-stretch">
                            {/* From */}
                            <CityField
                                label={t("home.search.from")}
                                city={fromCity}
                                icon={<MapPin className="w-4 h-4 text-karvon-turquoise-500" />}
                            />

                            {/* Swap */}
                            <button
                                onClick={swap}
                                className="md:self-center md:mt-6 h-10 w-10 mx-auto rounded-full bg-secondary hover:bg-karvon-turquoise-100 dark:hover:bg-karvon-turquoise-900/30 flex items-center justify-center transition-colors group"
                                title="Swap"
                            >
                                <ArrowLeftRight className="w-4 h-4 group-hover:text-karvon-turquoise-600 transition-colors md:rotate-0 rotate-90" />
                            </button>

                            {/* To */}
                            <CityField
                                label={t("home.search.to")}
                                city={toCity}
                                icon={<MapPin className="w-4 h-4 text-karvon-sunset-500" />}
                            />

                            {/* Divider on desktop */}
                            <div className="hidden md:block w-px bg-border self-stretch my-2 mx-1" />

                            {/* Date */}
                            <FieldWrapper label={t("home.search.date")} icon={<Calendar className="w-4 h-4" />}>
                                <input
                                    type="date"
                                    value={date}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-transparent text-base font-medium outline-none w-full cursor-pointer"
                                />
                            </FieldWrapper>

                            {/* Passengers + Search */}
                            <div className="flex gap-2 md:gap-3">
                                <FieldWrapper
                                    label={t("home.search.passengers")}
                                    icon={<Users className="w-4 h-4" />}
                                    className="flex-1 md:w-32"
                                >
                                    <select
                                        value={passengers}
                                        onChange={(e) => setPassengers(Number(e.target.value))}
                                        className="bg-transparent text-base font-medium outline-none cursor-pointer w-full"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </FieldWrapper>
                            </div>
                        </div>

                        {/* Search button */}
                        <Button
                            size="xl"
                            onClick={handleSearch}
                            className="w-full mt-4 md:mt-5 group"
                        >
                            <span>{t("home.search.button")}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CityField({
                       label,
                       city,
                       icon,
                   }: {
    label: string;
    city: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="px-4 py-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
            </div>
            <div className="text-lg font-semibold">{city}</div>
        </div>
    );
}

function FieldWrapper({
                          label,
                          icon,
                          children,
                          className,
                      }: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("px-4 py-3 rounded-2xl bg-secondary/50", className)}>
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            {children}
        </div>
    );
}