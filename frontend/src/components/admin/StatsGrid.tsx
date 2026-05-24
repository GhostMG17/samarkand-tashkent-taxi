import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import {
    Users,
    Car,
    Ticket,
    TrendingUp,
    CalendarCheck,
    Wallet,
    UserCheck,
    UserX,
    CheckCircle2,
    XCircle,
    Calendar,
    DollarSign,
    Activity,
    Coins,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/lib/utils";
import type { AdminStats } from "@/api/admin";

interface Props {
    stats: AdminStats;
}

function safe(val: number | undefined | null): number {
    return typeof val === "number" ? val : 0;
}

export function StatsGrid({ stats }: Props) {
    const { t } = useTranslation();

    if (!stats) return null;

    return (
        <div className="space-y-8">
            {/* Финансы — самое важное наверх */}
            <Section
                title={t("admin.stats.section.finance")}
                icon={<DollarSign className="w-4 h-4" />}
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <BigCard
                        label={t("admin.stats.totalRevenue")}
                        value={formatPrice(safe(stats.totalRevenue))}
                        sub={t("admin.stats.allTime")}
                        icon={<Wallet className="w-6 h-6" />}
                        color="from-emerald-500 to-green-600"
                        highlight
                    />
                    <BigCard
                        label={t("admin.stats.revenueToday")}
                        value={formatPrice(safe(stats.revenueToday))}
                        sub={t("admin.stats.last24h")}
                        icon={<Activity className="w-6 h-6" />}
                        color="from-karvon-turquoise-500 to-karvon-turquoise-600"
                    />
                    <BigCard
                        label={t("admin.stats.revenueThisMonth")}
                        value={formatPrice(safe(stats.revenueThisMonth))}
                        sub={t("admin.stats.thisMonth")}
                        icon={<Coins className="w-6 h-6" />}
                        color="from-karvon-sunset-500 to-karvon-sunset-600"
                    />
                </div>
            </Section>

            {/* Пользователи */}
            <Section
                title={t("admin.stats.section.users")}
                icon={<Users className="w-4 h-4" />}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <SmallCard
                        label={t("admin.stats.totalUsers")}
                        value={safe(stats.totalUsers)}
                        icon={<Users className="w-4 h-4" />}
                        color="text-karvon-turquoise-600"
                    />
                    <SmallCard
                        label={t("admin.stats.totalPassengers")}
                        value={safe(stats.totalPassengers)}
                        icon={<Users className="w-4 h-4" />}
                        color="text-blue-600"
                    />
                    <SmallCard
                        label={t("admin.stats.totalDrivers")}
                        value={safe(stats.totalDrivers)}
                        icon={<Car className="w-4 h-4" />}
                        color="text-karvon-sunset-600"
                    />
                    <SmallCard
                        label={t("admin.stats.totalAdmins")}
                        value={safe(stats.totalAdmins)}
                        icon={<UserCheck className="w-4 h-4" />}
                        color="text-purple-600"
                    />
                    <SmallCard
                        label={t("admin.stats.activeUsers")}
                        value={safe(stats.activeUsers)}
                        icon={<UserCheck className="w-4 h-4" />}
                        color="text-emerald-600"
                    />
                    <SmallCard
                        label={t("admin.stats.inactiveUsers")}
                        value={safe(stats.inactiveUsers)}
                        icon={<UserX className="w-4 h-4" />}
                        color="text-muted-foreground"
                    />
                </div>
            </Section>

            {/* Рейсы */}
            <Section
                title={t("admin.stats.section.trips")}
                icon={<Car className="w-4 h-4" />}
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <SmallCard
                        label={t("admin.stats.totalTrips")}
                        value={safe(stats.totalTrips)}
                        icon={<Car className="w-4 h-4" />}
                        color="text-karvon-turquoise-600"
                    />
                    <SmallCard
                        label={t("admin.stats.scheduledTrips")}
                        value={safe(stats.scheduledTrips)}
                        icon={<Calendar className="w-4 h-4" />}
                        color="text-blue-600"
                    />
                    <SmallCard
                        label={t("admin.stats.completedTrips")}
                        value={safe(stats.completedTrips)}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        color="text-emerald-600"
                    />
                    <SmallCard
                        label={t("admin.stats.cancelledTrips")}
                        value={safe(stats.cancelledTrips)}
                        icon={<XCircle className="w-4 h-4" />}
                        color="text-destructive"
                    />
                </div>
            </Section>

            {/* Бронирования */}
            <Section
                title={t("admin.stats.section.bookings")}
                icon={<Ticket className="w-4 h-4" />}
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <SmallCard
                        label={t("admin.stats.totalBookings")}
                        value={safe(stats.totalBookings)}
                        icon={<Ticket className="w-4 h-4" />}
                        color="text-karvon-turquoise-600"
                    />
                    <SmallCard
                        label={t("admin.stats.confirmedBookings")}
                        value={safe(stats.confirmedBookings)}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        color="text-emerald-600"
                    />
                    <SmallCard
                        label={t("admin.stats.paidBookings")}
                        value={safe(stats.paidBookings)}
                        icon={<DollarSign className="w-4 h-4" />}
                        color="text-karvon-sunset-600"
                    />
                    <SmallCard
                        label={t("admin.stats.unpaidBookings")}
                        value={safe(stats.unpaidBookings)}
                        icon={<Coins className="w-4 h-4" />}
                        color="text-karvon-sunset-600"
                    />
                    <SmallCard
                        label={t("admin.stats.bookingsToday")}
                        value={safe(stats.bookingsToday)}
                        icon={<Activity className="w-4 h-4" />}
                        color="text-blue-600"
                    />
                    <SmallCard
                        label={t("admin.stats.bookingsThisWeek")}
                        value={safe(stats.bookingsThisWeek)}
                        icon={<CalendarCheck className="w-4 h-4" />}
                        color="text-purple-600"
                    />
                    <SmallCard
                        label={t("admin.stats.bookingsThisMonth")}
                        value={safe(stats.bookingsThisMonth)}
                        icon={<TrendingUp className="w-4 h-4" />}
                        color="text-karvon-turquoise-600"
                    />
                    <SmallCard
                        label={t("admin.stats.cancelledBookings")}
                        value={safe(stats.cancelledBookings)}
                        icon={<XCircle className="w-4 h-4" />}
                        color="text-destructive"
                    />
                </div>
            </Section>
        </div>
    );
}

function Section({
                     title,
                     icon,
                     children,
                 }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    {icon}
                </div>
                <h2 className="font-display text-lg font-semibold">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function BigCard({
                     label,
                     value,
                     sub,
                     icon,
                     color,
                     highlight = false,
                 }: {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    highlight?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card
                className={`p-5 relative overflow-hidden ${
                    highlight ? "ring-1 ring-karvon-turquoise-500/30" : ""
                }`}
            >
                {highlight && (
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
                )}
                <div className="relative flex items-start gap-4">
                    <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-md shrink-0`}
                    >
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">{label}</div>
                        <div className="text-2xl md:text-3xl font-display font-bold truncate">
                            {value}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function SmallCard({
                       label,
                       value,
                       icon,
                       color,
                   }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 hover:shadow-md transition-shadow">
                <div className={`flex items-center gap-2 mb-2 ${color}`}>
                    {icon}
                    <div className="text-xs font-medium uppercase tracking-wider truncate">
                        {label}
                    </div>
                </div>
                <div className="text-2xl font-display font-bold">{value}</div>
            </Card>
        </motion.div>
    );
}