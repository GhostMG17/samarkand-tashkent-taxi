import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLogin, getErrorMessage } from "@/hooks/useAuth";
import { formatPhoneInput, normalizePhone } from "@/lib/phoneMask";

const loginSchema = z.object({
    phone: z
        .string()
        .min(15, "Phone is too short") // +998 XX XXX XX XX = 17 символов с пробелами
        .transform((val) => normalizePhone(val))
        .refine((val) => /^\+998\d{9}$/.test(val), {
            message: "Phone must be in format +998XXXXXXXXX",
        }),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            phone: "+998 ",
        },
    });

    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate(data);
    };

    const apiError = loginMutation.error ? getErrorMessage(loginMutation.error) : null;

    return (
        <AuthLayout
            title={t("auth.login.title")}
            subtitle={t("auth.login.subtitle")}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label={t("auth.phone")}
                    icon={<Phone className="w-4 h-4" />}
                    placeholder="+998 90 123 45 67"
                    autoComplete="tel"
                    inputMode="tel"
                    error={errors.phone?.message}
                    {...register("phone", {
                        onChange: (e) => {
                            e.target.value = formatPhoneInput(e.target.value);
                        },
                    })}
                />

                <Input
                    label={t("auth.password")}
                    icon={<Lock className="w-4 h-4" />}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    rightSlot={
                        <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    }
                    {...register("password")}
                />

                {apiError && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{apiError}</span>
                    </motion.div>
                )}

                <Button
                    type="submit"
                    size="xl"
                    className="w-full group"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? (
                        <span>{t("common.loading")}</span>
                    ) : (
                        <>
                            <span>{t("auth.login.button")}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">
          {t("auth.login.noAccount")}{" "}
        </span>
                <Link
                    to="/register"
                    className="text-karvon-turquoise-600 hover:text-karvon-turquoise-700 font-semibold"
                >
                    {t("auth.login.registerLink")}
                </Link>
            </div>
        </AuthLayout>
    );
}