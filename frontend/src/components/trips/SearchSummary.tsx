import { motion } from "framer-motion";
import { ArrowLeftRight, Calendar, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { Direction } from "@/types/api";

interface Props {
    direction: Direction;
    date?: string;
    passengers: number;
    onSwap: () => void;
    onDateChange: (date: string) => void;
    onPassengersChange: (n: number) => void;
}

export function SearchSummary({
                                  direction,
                                  date,
                                  passengers,
                                  onSwap,
                                  onDateChange,
                                  onPassengersChange,
                              }: Props) {
    const { t } = useTranslation();
    const isToTashkent = direction === "SAMARKAND_TO_TASHKENT";
    const from = isToTashkent ? t("home.search.samarkand") : t("home.search.tashkent");
    const to = isToTashkent ? t("home.search.tashkent") : t("home.search.samarkand");

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm"
        >
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary">
                    <span className="font-semibold">{from}</span>
                    <Button variant="ghost" size="sm" onClick={onSwap} className="h-8 w-8 p-0">
                        <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold">{to}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="date"
                        value={date || ""}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="bg-transparent outline-none text-sm font-medium cursor-pointer"
                        title={date ? formatDate(date) : ""}
                    />
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={passengers}
                        onChange={(e) => onPassengersChange(Number(e.target.value))}
                        className="bg-transparent outline-none text-sm font-medium cursor-pointer"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n} value={n}>
                                {n} {t("common.seats")}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </motion.div>
    );
}