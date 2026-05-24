import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRegister, getErrorMessage } from "@/hooks/useAuth";
import { formatPhoneInput, normalizePhone } from "@/lib/phoneMask";

const registerSchema = z.object({
    firstName: z.string().min(2, "Name is too short"),
    lastName: z.string().optional(),
    phone: z
        .string()
        .min(15, "Phone is too short")
        .transform((val) => normalizePhone(val))
        .refine((val) => /^\+998\d{9}$/.test(val), {
            message: "Phone must be in format +998XXXXXXXXX",
        }),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const registerMutation = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            phone: "+998 ",
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        registerMutation.mutate(data);
    };

    const apiError = registerMutation.error ? getErrorMessage(registerMutation.error) : null;

    return (
        <AuthLayout
            title={t("auth.register.title")}
            subtitle={t("auth.register.subtitle")}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label={t("auth.firstName")}
                        icon={<UserIcon className="w-4 h-4" />}
                        placeholder="Ali"
                        autoComplete="given-name"
                        error={errors.firstName?.message}
                        {...register("firstName")}
                    />

                    <Input
                        label={t("auth.lastName")}
                        icon={<UserIcon className="w-4 h-4" />}
                        placeholder="Karimov"
                        autoComplete="family-name"
                        error={errors.lastName?.message}
                        {...register("lastName")}
                    />
                </div>

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
                    autoComplete="new-password"
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
                    disabled={registerMutation.isPending}
                >
                    {registerMutation.isPending ? (
                        <span>{t("common.loading")}</span>
                    ) : (
                        <>
                            <span>{t("auth.register.button")}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center px-4">
                    {t("auth.register.terms")}
                </p>
            </form>

            <div className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">
          {t("auth.register.hasAccount")}{" "}
        </span>
                <Link
                    to="/login"
                    className="text-karvon-turquoise-600 hover:text-karvon-turquoise-700 font-semibold"
                >
                    {t("auth.register.loginLink")}
                </Link>
            </div>
        </AuthLayout>
    );
}