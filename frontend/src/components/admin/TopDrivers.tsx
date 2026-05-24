import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Trophy, Crown, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminStats } from "@/api/admin";
import { cn } from "@/lib/utils";

interface Props {
    drivers: AdminStats["topDrivers"];
}

export function TopDrivers({ drivers }: Props) {
    const { t } = useTranslation();

    if (!drivers || drivers.length === 0) {
        return (
            <Card className="p-8 text-center">
                <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">
                    {t("admin.topDrivers.empty")}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {t("admin.topDrivers.emptyDesc")}
                </p>
            </Card>
        );
    }

    const medalColors = [
        "from-yellow-400 to-amber-500",
        "from-gray-300 to-gray-400",
        "from-orange-400 to-amber-600",
    ];

    return (
        <Card className="overflow-hidden">
            <div className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow-md">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-semibold">
                            {t("admin.topDrivers.title")}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {t("admin.topDrivers.subtitle")}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {drivers.slice(0, 10).map((driver, idx) => (
                        <motion.div
                            key={driver.driverId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-xl transition-colors",
                                idx < 3 ? "bg-secondary/50" : "hover:bg-secondary/30"
                            )}
                        >
                            {/* Rank */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0",
                                    idx < 3
                                        ? `bg-gradient-to-br ${medalColors[idx]} text-white shadow-md`
                                        : "bg-secondary text-muted-foreground"
                                )}
                            >
                                {idx === 0 ? (
                                    <Crown className="w-5 h-5" />
                                ) : (
                                    idx + 1
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">
                                    {driver.driverName}
                                </div>

                                {driver.driverPhone && (
                                    <a
                                        href={`tel:${driver.driverPhone}`}
                                        className="text-xs text-karvon-turquoise-600 hover:text-karvon-turquoise-700 flex items-center gap-1"
                                    >
                                        <Phone className="w-3 h-3" />
                                        {driver.driverPhone}
                                    </a>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="text-right shrink-0">
                                <div className="font-display font-bold text-lg">
                                    {driver.tripsCount}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t("admin.topDrivers.trips")}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Card>
    );
}