import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "@/components/ThemeProvider";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

function AuthLayoutContent({ children, title, subtitle }: AuthLayoutProps) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Левая часть — форма */}
            <div className="flex flex-col p-6 md:p-12">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>{t("auth.backHome")}</span>
                    </Link>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-karvon flex items-center justify-center shadow-lg">
                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                                <path d="M4 18 L9 8 L13 13 L17 6 L20 18 Z" opacity="0.95" />
                                <circle cx="12" cy="4" r="1.5" />
                            </svg>
                        </div>
                        <span className="font-display text-xl font-bold">Karvon</span>
                    </Link>
                </div>

                {/* Form area */}
                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-8">
                            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                                {title}
                            </h1>
                            <p className="text-muted-foreground">{subtitle}</p>
                        </div>
                        {children}
                    </motion.div>
                </div>

                <div className="text-center text-xs text-muted-foreground mt-8">
                    © 2026 Karvon
                </div>
            </div>

            {/* Правая часть — визуал (только на десктопе) */}
            <div className="hidden lg:block relative overflow-hidden bg-gradient-karvon">
                <div className="absolute inset-0 pattern-grid opacity-20" />

                {/* Большой декоративный купол */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full max-w-md"
                    >
                        <svg viewBox="0 0 400 500" className="w-full h-auto text-white/20">
                            {/* Стилизованная мечеть/мавзолей */}
                            <path
                                d="M200 50 L200 80"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <circle cx="200" cy="50" r="4" fill="currentColor" />

                            <path
                                d="M120 200 C120 140, 160 80, 200 80 C240 80, 280 140, 280 200 L280 260 L120 260 Z"
                                fill="currentColor"
                                opacity="0.6"
                            />

                            <rect x="100" y="260" width="200" height="180" fill="currentColor" opacity="0.4" />

                            <path
                                d="M180 320 C180 290, 220 290, 220 320 L220 440 L180 440 Z"
                                fill="currentColor"
                                opacity="0.2"
                            />

                            <circle cx="140" cy="300" r="8" fill="currentColor" opacity="0.3" />
                            <circle cx="260" cy="300" r="8" fill="currentColor" opacity="0.3" />
                            <circle cx="140" cy="360" r="8" fill="currentColor" opacity="0.3" />
                            <circle cx="260" cy="360" r="8" fill="currentColor" opacity="0.3" />

                            {/* Минареты */}
                            <rect x="80" y="200" width="20" height="240" fill="currentColor" opacity="0.5" />
                            <path d="M80 200 L100 200 L90 170 Z" fill="currentColor" opacity="0.6" />

                            <rect x="300" y="200" width="20" height="240" fill="currentColor" opacity="0.5" />
                            <path d="M300 200 L320 200 L310 170 Z" fill="currentColor" opacity="0.6" />
                        </svg>
                    </motion.div>
                </div>

                {/* Текст внизу */}
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="text-3xl font-display font-bold mb-3">
                            {t("auth.welcomeTitle")}
                        </div>
                        <p className="text-white/80 text-lg max-w-md">
                            {t("auth.welcomeText")}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export function AuthLayout(props: AuthLayoutProps) {
    return (
        <ThemeProvider>
            <AuthLayoutContent {...props} />
        </ThemeProvider>
    );
}