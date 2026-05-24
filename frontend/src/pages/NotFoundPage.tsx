import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Home, Search, MapPinOff } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

function NotFoundContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <main className="container py-12 md:py-20 flex-1 flex items-center justify-center">
            <div className="max-w-lg mx-auto text-center">
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative inline-block mb-8"
                >
                    <div className="absolute inset-0 bg-karvon-turquoise-500 blur-3xl opacity-30 rounded-full" />
                    <div className="relative w-32 h-32 rounded-3xl bg-gradient-karvon flex items-center justify-center shadow-2xl">
                        <MapPinOff className="w-16 h-16 text-white" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="text-7xl md:text-8xl font-display font-bold bg-gradient-to-br from-karvon-turquoise-600 to-karvon-sunset-600 bg-clip-text text-transparent mb-4">
                        404
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                        {t("notFound.title")}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                        {t("notFound.desc")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button size="lg" onClick={() => navigate("/")}>
                            <Home className="w-4 h-4" />
                            <span>{t("notFound.home")}</span>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => navigate("/trips")}
                        >
                            <Search className="w-4 h-4" />
                            <span>{t("notFound.search")}</span>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

export function NotFoundPage() {
    return (
        <ThemeProvider>
            <SEO
                title="Bosh sahifa"
                description="Samarqand va Toshkent o'rtasidagi qulay sayohat — Karvon"
            />
            <div className="min-h-screen flex flex-col">
                <Header />
                <NotFoundContent />
                <Footer />
            </div>
        </ThemeProvider>
    );
}