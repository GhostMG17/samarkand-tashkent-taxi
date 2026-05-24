import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    BarChart3,
    Users,
    Car,
    Ticket,
    Shield,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { TopDrivers } from "@/components/admin/TopDrivers";
import { UsersTable } from "@/components/admin/UsersTable";
import { TripsTable } from "@/components/admin/TripsTable";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { useAdminStats } from "@/hooks/useAdmin";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type Tab = "overview" | "users" | "trips" | "bookings";

function AdminContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [tab, setTab] = useState<Tab>("overview");

    const { data: stats, isLoading: statsLoading } = useAdminStats();

    // Not logged in
    if (!isAuthenticated || !user) {
        return (
            <main className="container py-20">
                <div className="max-w-md mx-auto text-center">
                    <h2 className="font-display text-2xl font-bold mb-4">
                        {t("myBookings.loginRequired")}
                    </h2>
                    <Button size="lg" onClick={() => navigate("/login")}>
                        {t("nav.login")}
                    </Button>
                </div>
            </main>
        );
    }

    // Not admin
    if (user.role !== "ADMIN") {
        return (
            <main className="container py-20">
                <div className="max-w-md mx-auto text-center">
                    <div className="inline-flex w-20 h-20 rounded-3xl bg-destructive/10 items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-2">
                        {t("admin.notAdmin")}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {t("admin.notAdminDesc")}
                    </p>
                    <Button size="lg" onClick={() => navigate("/")}>
                        {t("auth.backHome")}
                    </Button>
                </div>
            </main>
        );
    }

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        {
            id: "overview",
            label: t("admin.tabs.overview"),
            icon: <BarChart3 className="w-4 h-4" />,
        },
        {
            id: "users",
            label: t("admin.tabs.users"),
            icon: <Users className="w-4 h-4" />,
        },
        {
            id: "trips",
            label: t("admin.tabs.trips"),
            icon: <Car className="w-4 h-4" />,
        },
        {
            id: "bookings",
            label: t("admin.tabs.bookings"),
            icon: <Ticket className="w-4 h-4" />,
        },
    ];

    return (
        <main className="container py-6 md:py-10">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-karvon-sunset-500 to-karvon-sunset-600 text-white flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl md:text-4xl font-bold">
                            {t("admin.title")}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {t("admin.subtitle")}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-border">
                {tabs.map((tabItem) => (
                    <button
                        key={tabItem.id}
                        onClick={() => setTab(tabItem.id)}
                        className={cn(
                            "px-4 py-2.5 rounded-t-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 border-b-2 -mb-px",
                            tab === tabItem.id
                                ? "border-karvon-turquoise-600 text-karvon-turquoise-600"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tabItem.icon}
                        <span>{tabItem.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {tab === "overview" && (
                <div className="space-y-6">
                    {statsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-karvon-turquoise-600" />
                        </div>
                    ) : stats ? (
                        <>
                            <StatsGrid stats={stats} />
                            <TopDrivers drivers={stats.topDrivers} />
                        </>
                    ) : (
                        <Card className="p-6 bg-destructive/10 border-destructive/30 text-destructive flex items-center gap-3">
                            <AlertCircle className="w-6 h-6" />
                            <span>{t("common.error")}</span>
                        </Card>
                    )}
                </div>
            )}

            {tab === "users" && <UsersTable />}
            {tab === "trips" && <TripsTable />}
            {tab === "bookings" && <BookingsTable />}
        </main>
    );
}

export function AdminDashboardPage() {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">
                    <AdminContent />
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    );
}