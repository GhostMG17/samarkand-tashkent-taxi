import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
    ArrowLeftRight,
    Calendar as CalendarIcon,
    Clock,
    Users,
    DollarSign,
    FileText,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCreateTrip } from "@/hooks/useDriverTrips";
import { getErrorMessage } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import type { Direction } from "@/types/api";
import { toast } from "sonner";

const tripSchema = z.object({
    direction: z.enum(["SAMARKAND_TO_TASHKENT", "TASHKENT_TO_SAMARKAND"]),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    totalSeats: z.coerce.number().min(1).max(8),
    price: z.coerce.number().min(1000),
    notes: z.string().optional(),
});

type FormInput = z.input<typeof tripSchema>;
type FormData = z.output<typeof tripSchema>;

interface Props {
    onSuccess?: () => void;
}

export function CreateTripForm({ onSuccess }: Props) {
    const { t } = useTranslation();
    const createMutation = useCreateTrip();
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormInput, any, FormData>({
        resolver: zodResolver(tripSchema),
        defaultValues: {
            direction: "SAMARKAND_TO_TASHKENT",
            date: (() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split("T")[0];
            })(),
            time: "08:00",
            totalSeats: 4,
            price: 150000,
            notes: "",
        },
    });

    const direction = watch("direction");
    const price = Number(watch("price")) || 0;
    const seats = Number(watch("totalSeats")) || 0;

    const fromCity =
        direction === "SAMARKAND_TO_TASHKENT"
            ? t("home.search.samarkand")
            : t("home.search.tashkent");
    const toCity =
        direction === "SAMARKAND_TO_TASHKENT"
            ? t("home.search.tashkent")
            : t("home.search.samarkand");

    const swapDirection = () => {
        setValue(
            "direction",
            direction === "SAMARKAND_TO_TASHKENT"
                ? "TASHKENT_TO_SAMARKAND"
                : "SAMARKAND_TO_TASHKENT"
        );
    };

    const onSubmit = async (data: FormData) => {
        try {
            const departureTime = `${data.date}T${data.time}:00`;
            await createMutation.mutateAsync({
                direction: data.direction as Direction,
                departureTime,
                totalSeats: data.totalSeats,
                price: data.price,
                notes: data.notes,
            });
            toast.success(t("toast.tripCreated"));
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                reset();
                onSuccess?.();
            }, 1500);
        } catch (err) {
        }
    };

    const apiError = createMutation.error ? getErrorMessage(createMutation.error) : null;

    if (showSuccess) {
        return (
            <Card className="p-8 text-center">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-karvon-turquoise-500 to-karvon-turquoise-600 items-center justify-center mb-4 shadow-xl"
                >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="font-display text-2xl font-bold mb-2">
                    {t("driver.create.success")}
                </h3>
                <p className="text-muted-foreground">{t("driver.create.successDesc")}</p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-karvon" />
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
                <div>
                    <h2 className="font-display text-2xl font-bold mb-2">
                        {t("driver.create.title")}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {t("driver.create.subtitle")}
                    </p>
                </div>

                {/* Direction */}
                <div>
                    <label className="text-sm font-medium mb-2 block">
                        {t("driver.create.direction")}
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 p-4 rounded-2xl bg-secondary text-center">
                            <div className="text-xs text-muted-foreground mb-1">
                                {t("home.search.from")}
                            </div>
                            <div className="font-semibold text-lg">{fromCity}</div>
                        </div>
                        <button
                            type="button"
                            onClick={swapDirection}
                            className="w-12 h-12 rounded-2xl bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 hover:bg-karvon-turquoise-200 dark:hover:bg-karvon-turquoise-900/50 flex items-center justify-center transition-colors group shrink-0"
                        >
                            <ArrowLeftRight className="w-5 h-5 text-karvon-turquoise-600 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                        <div className="flex-1 p-4 rounded-2xl bg-secondary text-center">
                            <div className="text-xs text-muted-foreground mb-1">
                                {t("home.search.to")}
                            </div>
                            <div className="font-semibold text-lg">{toCity}</div>
                        </div>
                    </div>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t("driver.create.date")}
                        </label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                {...register("date")}
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-border bg-card focus:border-karvon-turquoise-500 focus:ring-2 focus:ring-karvon-turquoise-500/20 outline-none transition"
                            />
                        </div>
                        {errors.date && (
                            <p className="text-xs text-destructive mt-1">{errors.date.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t("driver.create.time")}
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="time"
                                {...register("time")}
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-border bg-card focus:border-karvon-turquoise-500 focus:ring-2 focus:ring-karvon-turquoise-500/20 outline-none transition"
                            />
                        </div>
                        {errors.time && (
                            <p className="text-xs text-destructive mt-1">{errors.time.message}</p>
                        )}
                    </div>
                </div>

                {/* Seats */}
                <div>
                    <label className="text-sm font-medium mb-2 block">
                        {t("driver.create.totalSeats")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setValue("totalSeats", n)}
                                className={cn(
                                    "w-14 h-14 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-1",
                                    seats === n
                                        ? "bg-karvon-turquoise-600 text-white border-karvon-turquoise-600 shadow-lg scale-105"
                                        : "bg-card border-border hover:border-karvon-turquoise-400"
                                )}
                            >
                                <Users className="w-3 h-3 opacity-60" />
                                <span>{n}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price */}
                <div>
                    <label className="text-sm font-medium mb-2 block">
                        {t("driver.create.price")}
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="number"
                            step="1000"
                            min="1000"
                            {...register("price")}
                            className="w-full pl-10 pr-20 py-3 rounded-xl border border-border bg-card focus:border-karvon-turquoise-500 focus:ring-2 focus:ring-karvon-turquoise-500/20 outline-none transition text-lg font-semibold"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              {t("driver.create.perSeat")}
            </span>
                    </div>
                    {errors.price && (
                        <p className="text-xs text-destructive mt-1">{errors.price.message}</p>
                    )}
                    {price > 0 && seats > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("driver.create.totalRevenue", {
                                amount: formatPrice(price * seats),
                            })}
                        </p>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="text-sm font-medium mb-2 block">
                        {t("driver.create.notes")}
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <textarea
                            rows={2}
                            {...register("notes")}
                            placeholder={t("driver.create.notesPlaceholder")}
                            className="w-full pl-10 pr-3 py-3 rounded-xl border border-border bg-card focus:border-karvon-turquoise-500 focus:ring-2 focus:ring-karvon-turquoise-500/20 outline-none transition resize-none"
                        />
                    </div>
                </div>

                {apiError && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{apiError}</span>
                    </motion.div>
                )}

                <Button
                    type="submit"
                    size="xl"
                    className="w-full"
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? (
                        <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
                            {t("driver.create.creating")}
            </span>
                    ) : (
                        t("driver.create.button")
                    )}
                </Button>
            </form>
        </Card>
    );
}