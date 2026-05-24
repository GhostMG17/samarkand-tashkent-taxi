import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Sparkles, Zap, BadgeDollarSign } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function Features() {
    const { t } = useTranslation();

    const features = [
        {
            icon: ShieldCheck,
            title: t("home.features.safe.title"),
            desc: t("home.features.safe.desc"),
            color: "from-emerald-500 to-teal-500",
        },
        {
            icon: Sparkles,
            title: t("home.features.comfort.title"),
            desc: t("home.features.comfort.desc"),
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Zap,
            title: t("home.features.fast.title"),
            desc: t("home.features.fast.desc"),
            color: "from-amber-500 to-orange-500",
        },
        {
            icon: BadgeDollarSign,
            title: t("home.features.price.title"),
            desc: t("home.features.price.desc"),
            color: "from-cyan-500 to-blue-500",
        },
    ];

    return (
        <section className="py-20 md:py-32">
            <div className="container">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-5xl font-display font-bold text-center mb-16"
                >
                    {t("home.features.title")}
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <Card className="p-6 h-full group hover:border-karvon-turquoise-500/50 hover:-translate-y-1 transition-all duration-300">
                                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 font-display">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}