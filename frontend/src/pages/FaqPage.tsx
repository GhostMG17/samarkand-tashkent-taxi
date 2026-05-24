import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronDown, HelpCircle, MessageCircle, Phone } from "lucide-react";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";


function FaqContent() {
    const { t } = useTranslation();
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    const faqs = [
        { q: t("faq.q1"), a: t("faq.a1") },
        { q: t("faq.q2"), a: t("faq.a2") },
        { q: t("faq.q3"), a: t("faq.a3") },
        { q: t("faq.q4"), a: t("faq.a4") },
        { q: t("faq.q5"), a: t("faq.a5") },
        { q: t("faq.q6"), a: t("faq.a6") },
        { q: t("faq.q7"), a: t("faq.a7") },
        { q: t("faq.q8"), a: t("faq.a8") },
    ];

    return (
        <main className="container py-10 md:py-16 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-karvon items-center justify-center mb-4 shadow-xl">
                    <HelpCircle className="w-8 h-8 text-white" />
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
                    {t("faq.title")}
                </h1>

                <p className="text-lg text-muted-foreground">
                    {t("faq.subtitle")}
                </p>
            </motion.div>

            <div className="space-y-3 mb-12">
                {faqs.map((faq, idx) => {
                    const isOpen = openIdx === idx;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                        >
                            <Card className="overflow-hidden">
                                <button
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                    className="w-full p-5 md:p-6 text-left flex items-start gap-4 hover:bg-secondary/30 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="font-semibold text-base md:text-lg">
                                            {faq.q}
                                        </div>
                                    </div>

                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0",
                                            isOpen
                                                ? "bg-karvon-turquoise-600 text-white rotate-180"
                                                : "bg-secondary text-muted-foreground"
                                        )}
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 md:px-6 pb-5 md:pb-6 text-muted-foreground leading-relaxed">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Contact card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 pattern-grid opacity-30" />
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-karvon-turquoise-500/10 blur-3xl rounded-full" />

                    <div className="relative p-8 text-center">
                        <div className="inline-flex w-14 h-14 rounded-2xl bg-karvon-sunset-100 dark:bg-karvon-sunset-700/30 items-center justify-center mb-4">
                            <MessageCircle className="w-7 h-7 text-karvon-sunset-600" />
                        </div>

                        <h2 className="font-display text-2xl font-bold mb-2">
                            {t("faq.stillHaveQuestions")}
                        </h2>

                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            {t("faq.contactUsDesc")}
                        </p>

                        <div className="flex flex-wrap justify-center gap-3">
                            <a href="tel:+998901234567">
                                <Button size="lg">
                                    <Phone className="w-4 h-4" />
                                    +998 90 123 45 67
                                </Button>
                            </a>

                            <a
                                href="https://t.me/karvon_uz"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" size="lg">
                                    <MessageCircle className="w-4 h-4" />
                                    Telegram
                                </Button>
                            </a>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </main>
    );
}

export function FaqPage() {
    return (
        <ThemeProvider>
            <SEO
                title="FAQ"
                description="Frequently asked questions about Karvon service"
            />
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">
                    <FaqContent />
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    );
}