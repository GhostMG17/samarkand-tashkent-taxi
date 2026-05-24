import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

export function Hero() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden">
            {/* Декоративный фон */}
            <div className="absolute inset-0 pattern-grid opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-karvon-turquoise-500/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-karvon-sunset-500/20 blur-[120px] rounded-full" />

            {/* Силуэты куполов */}
            <DomesSilhouette />

            <div className="container relative z-10 pt-12 pb-20 md:pt-20 md:pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur mb-6 text-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-karvon-sunset-500" />
                        <span className="text-muted-foreground">{t("brand.tagline")}</span>
                    </motion.div>

                    {/* Title */}
                    <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-balance mb-6">
            <span className="bg-gradient-to-r from-karvon-turquoise-500 via-karvon-turquoise-400 to-karvon-sunset-500 bg-clip-text text-transparent">
              {t("home.hero.title")}
            </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl font-medium text-foreground/90 mb-3">
                        {t("home.hero.subtitle")}
                    </p>

                    <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                        {t("home.hero.description")}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

function DomesSilhouette() {
    return (
        <svg
            className="absolute bottom-0 left-0 right-0 w-full h-32 md:h-48 text-karvon-turquoise-500/10 dark:text-karvon-turquoise-400/10"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
            fill="currentColor"
        >
            {/* Стилизованные купола Регистана */}
            <path d="M0,200 L0,140 Q50,140 80,100 Q100,75 100,60 L100,40 Q105,40 105,60 L105,100 Q140,140 200,140 L260,140 Q280,140 290,120 Q300,90 320,70 Q335,55 340,55 Q345,55 360,70 Q380,90 390,120 Q400,140 420,140 L500,140 Q525,140 540,100 Q555,75 555,55 L555,35 Q560,35 560,55 L560,100 Q580,140 610,140 L700,140 Q730,140 745,100 Q760,75 765,55 L765,30 Q770,30 770,55 L770,100 Q790,140 820,140 L920,140 Q950,140 970,100 Q985,75 985,55 L985,35 Q990,35 990,55 L990,100 Q1015,140 1050,140 L1200,140 L1200,200 Z" />
        </svg>
    );
}