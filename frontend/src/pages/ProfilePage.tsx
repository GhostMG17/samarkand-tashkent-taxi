import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
    User as UserIcon,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    Shield,
    Calendar,
    LogOut,
} from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import {
    useUpdateProfile,
    useChangePassword,
    getErrorMessage,
} from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

const profileSchema = z.object({
    firstName: z.string().min(2, "Name is too short").max(50),
    lastName: z.string().max(50).optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function ProfileContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const updateMutation = useUpdateProfile();
    const passwordMutation = useChangePassword();

    // Profile form
    const profileForm = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
        },
    });

    // Password form
    const passwordForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

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

    const handleProfileSubmit = profileForm.handleSubmit((data) => {
        updateMutation.mutate(data);
    });

    const handlePasswordSubmit = passwordForm.handleSubmit((data) => {
        passwordMutation.mutate(
            {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            },
            {
                onSuccess: () => {
                    passwordForm.reset();
                },
            }
        );
    });

    const profileError = updateMutation.error ? getErrorMessage(updateMutation.error) : null;
    const passwordError = passwordMutation.error ? getErrorMessage(passwordMutation.error) : null;

    const roleLabels: Record<string, string> = {
        PASSENGER: t("profile.role.passenger"),
        DRIVER: t("profile.role.driver"),
        ADMIN: t("profile.role.admin"),
    };

    return (
        <main className="container py-6 md:py-10 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                    {t("profile.title")}
                </h1>
                <p className="text-muted-foreground">{t("profile.subtitle")}</p>
            </motion.div>

            {/* Profile card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="overflow-hidden mb-6">
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-karvon flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {user.firstName?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-display font-bold">
                                    {user.firstName} {user.lastName || ""}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    {user.phone}
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 text-karvon-turquoise-700 dark:text-karvon-turquoise-400 text-xs font-semibold">
                    <Shield className="w-3 h-3" />
                      {roleLabels[user.role] || user.role}
                  </span>
                                    {user.createdAt && (
                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                                            {t("profile.memberSince", { date: formatDate(user.createdAt) })}
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile form */}
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">
                                {t("profile.personalInfo")}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label={t("auth.firstName")}
                                    icon={<UserIcon className="w-4 h-4" />}
                                    error={profileForm.formState.errors.firstName?.message}
                                    {...profileForm.register("firstName")}
                                />
                                <Input
                                    label={t("auth.lastName")}
                                    icon={<UserIcon className="w-4 h-4" />}
                                    error={profileForm.formState.errors.lastName?.message}
                                    {...profileForm.register("lastName")}
                                />
                            </div>

                            <Input
                                label={t("auth.phone")}
                                icon={<Phone className="w-4 h-4" />}
                                value={user.phone}
                                disabled
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("profile.phoneCannotChange")}
                            </p>

                            {profileError && (
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{profileError}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={updateMutation.isPending || !profileForm.formState.isDirty}
                            >
                                {updateMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                                        {t("profile.saving")}
                  </span>
                                ) : (
                                    t("profile.saveChanges")
                                )}
                            </Button>
                        </form>
                    </div>
                </Card>
            </motion.div>

            {/* Change password card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="overflow-hidden mb-6">
                    <div className="p-6 md:p-8">
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <h2 className="font-display text-xl font-semibold mb-1">
                                    {t("profile.changePassword")}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {t("profile.changePasswordDesc")}
                                </p>
                            </div>

                            <Input
                                label={t("profile.currentPassword")}
                                icon={<Lock className="w-4 h-4" />}
                                type={showCurrent ? "text" : "password"}
                                error={passwordForm.formState.errors.currentPassword?.message}
                                rightSlot={
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent((p) => !p)}
                                        className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground"
                                        tabIndex={-1}
                                    >
                                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                                {...passwordForm.register("currentPassword")}
                            />

                            <Input
                                label={t("profile.newPassword")}
                                icon={<Lock className="w-4 h-4" />}
                                type={showNew ? "text" : "password"}
                                error={passwordForm.formState.errors.newPassword?.message}
                                rightSlot={
                                    <button
                                        type="button"
                                        onClick={() => setShowNew((p) => !p)}
                                        className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground"
                                        tabIndex={-1}
                                    >
                                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                                {...passwordForm.register("newPassword")}
                            />

                            <Input
                                label={t("profile.confirmPassword")}
                                icon={<Lock className="w-4 h-4" />}
                                type={showNew ? "text" : "password"}
                                error={passwordForm.formState.errors.confirmPassword?.message}
                                {...passwordForm.register("confirmPassword")}
                            />

                            {passwordError && (
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <Button type="submit" disabled={passwordMutation.isPending}>
                                {passwordMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                                        {t("profile.saving")}
                  </span>
                                ) : (
                                    t("profile.changePasswordButton")
                                )}
                            </Button>
                        </form>
                    </div>
                </Card>
            </motion.div>

            {/* Danger zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="overflow-hidden">
                    <div className="p-6">
                        <h2 className="font-display text-xl font-semibold mb-2">
                            {t("profile.session")}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("profile.sessionDesc")}
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                logout();
                                navigate("/");
                            }}
                            className="text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                        >
                            <LogOut className="w-4 h-4" />
                            {t("nav.logout")}
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </main>
    );
}

export function ProfilePage() {
    return (
        <ThemeProvider>
            <SEO
                title="Bosh sahifa"
                description="Samarqand va Toshkent o'rtasidagi qulay sayohat — Karvon"
            />
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">
                    <ProfileContent />
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    );
}