import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
    onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
        >
            <div className="inline-flex w-20 h-20 rounded-3xl bg-secondary items-center justify-center mb-6">
                <SearchX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">
                {t("trips.empty.title")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("trips.empty.desc")}
            </p>
            <Button variant="outline" size="lg" onClick={onReset}>
                {t("trips.empty.reset")}
            </Button>
        </motion.div>
    );
}