import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Globe, Menu, X, User as UserIcon, LogOut, Ticket ,Car,Shield} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LANGUAGES = [
    { code: "uz", label: "O'zbek", flag: "🇺🇿" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English", flag: "🇬🇧" },
];

export function Header() {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [langOpen, setLangOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

    const handleLogout = () => {
        logout();
        setUserOpen(false);
        setMobileOpen(false);
        toast.success(t("toast.logoutSuccess"));
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative w-9 h-9 rounded-xl bg-gradient-karvon flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                            <path d="M4 18 L9 8 L13 13 L17 6 L20 18 Z" opacity="0.95" />
                            <circle cx="12" cy="4" r="1.5" />
                        </svg>
                    </div>
                    <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-tight">
              {t("brand.name")}
            </span>
                        <span className="text-[10px] text-muted-foreground hidden sm:block">
              {t("brand.tagline")}
            </span>
                    </div>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {/* Language switcher */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLangOpen(!langOpen)}
                            className="gap-2"
                        >
                            <Globe className="w-4 h-4" />
                            <span>{currentLang.flag}</span>
                        </Button>

                        <AnimatePresence>
                            {langOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-20"
                                    >
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    i18n.changeLanguage(lang.code);
                                                    setLangOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-secondary transition-colors",
                                                    i18n.language === lang.code && "bg-secondary"
                                                )}
                                            >
                                                <span className="text-lg">{lang.flag}</span>
                                                <span>{lang.label}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Theme switch */}
                    <Button variant="ghost" size="sm" onClick={toggleTheme}>
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>

                    {/* Auth area */}
                    {isAuthenticated && user ? (
                        <div className="relative ml-2">
                            <button
                                onClick={() => setUserOpen(!userOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-karvon flex items-center justify-center text-white font-semibold text-sm">
                                    {user.firstName?.[0]?.toUpperCase() || "?"}
                                </div>
                                <span className="text-sm font-medium">{user.firstName}</span>
                            </button>

                            <AnimatePresence>
                                {userOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-20"
                                        >
                                            <div className="px-4 py-3 border-b border-border">
                                                <div className="text-sm font-semibold">
                                                    {user.firstName} {user.lastName || ""}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{user.phone}</div>
                                            </div>

                                            {user.role === "ADMIN" && (
                                                <button
                                                    onClick={() => {
                                                        setUserOpen(false);
                                                        navigate("/admin");
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-secondary transition-colors"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    <span>{t("nav.adminPanel")}</span>
                                                </button>
                                            )}

                                            {(user.role === "DRIVER" || user.role === "ADMIN") && (
                                                <button
                                                    onClick={() => {
                                                        setUserOpen(false);
                                                        navigate("/driver");
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-secondary transition-colors"
                                                >
                                                    <Car className="w-4 h-4" />
                                                    <span>{t("nav.driverPanel")}</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setUserOpen(false);
                                                    navigate("/profile");
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-secondary transition-colors"
                                            >
                                                <UserIcon className="w-4 h-4" />
                                                <span>{t("nav.profile")}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUserOpen(false);
                                                    navigate("/my-bookings");
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-secondary transition-colors"
                                            >
                                                <Ticket className="w-4 h-4" />
                                                <span>{t("nav.myTrips")}</span>
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-secondary transition-colors text-destructive"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>{t("nav.logout")}</span>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                                {t("nav.login")}
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
                                {t("nav.register")}
                            </Button>
                        </>
                    )}
                </nav>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-border overflow-hidden"
                    >
                        <div className="container py-4 flex flex-col gap-2">
                            {/* User info if logged in */}
                            {isAuthenticated && user && (
                                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-karvon flex items-center justify-center text-white font-semibold">
                                        {user.firstName?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">
                                            {user.firstName} {user.lastName || ""}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Til / Язык</span>
                                <div className="flex gap-1">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => i18n.changeLanguage(lang.code)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                                                i18n.language === lang.code
                                                    ? "bg-karvon-turquoise-600 text-white"
                                                    : "bg-secondary"
                                            )}
                                        >
                                            {lang.flag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button variant="ghost" onClick={toggleTheme} className="justify-start">
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                            </Button>

                            {isAuthenticated && user ? (
                                <>
                                    {(user.role === "DRIVER" || user.role === "ADMIN") && (
                                        <Button
                                            variant="ghost"
                                            className="justify-start"
                                            onClick={() => {
                                                setMobileOpen(false);
                                                navigate("/driver");
                                            }}
                                        >
                                            <Car className="w-4 h-4" />
                                            <span>{t("nav.driverPanel")}</span>
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        className="justify-start"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            navigate("/profile");
                                        }}
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        <span>{t("nav.profile")}</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="justify-start"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            navigate("/my-bookings");
                                        }}
                                    >
                                        <Ticket className="w-4 h-4" />
                                        <span>{t("nav.myTrips")}</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="justify-start text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>{t("nav.logout")}</span>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="justify-start"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            navigate("/login");
                                        }}
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        {t("nav.login")}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            navigate("/register");
                                        }}
                                    >
                                        {t("nav.register")}
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}