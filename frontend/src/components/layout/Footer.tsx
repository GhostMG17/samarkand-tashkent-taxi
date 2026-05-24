import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, MessageCircle, MapPin, Mail } from "lucide-react";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-border bg-secondary/30 mt-auto">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-karvon flex items-center justify-center shadow-lg">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                                    <path d="M4 18 L9 8 L13 13 L17 6 L20 18 Z" opacity="0.95" />
                                    <circle cx="12" cy="4" r="1.5" />
                                </svg>
                            </div>
                            <span className="font-display text-xl font-bold">Karvon</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                            {t("footer.product")}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="hover:text-karvon-turquoise-600 transition-colors">
                                    {t("nav.home")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/trips" className="hover:text-karvon-turquoise-600 transition-colors">
                                    {t("footer.findTrip")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="hover:text-karvon-turquoise-600 transition-colors">
                                    {t("footer.faq")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For drivers */}
                    <div>
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                            {t("footer.forDrivers")}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/register" className="hover:text-karvon-turquoise-600 transition-colors">
                                    {t("footer.becomeDriver")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/driver" className="hover:text-karvon-turquoise-600 transition-colors">
                                    {t("nav.driverPanel")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                            {t("footer.contact")}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="tel:+998901234567"
                                    className="flex items-center gap-2 hover:text-karvon-turquoise-600 transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    +998 90 123 45 67
                                </a>
                            </li>

                            <li>
                                <a
                                    href="https://t.me/karvon_uz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-karvon-turquoise-600 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Telegram
                                </a>
                            </li>

                            <li>
                                <a
                                    href="mailto:hello@karvon.uz"
                                    className="flex items-center gap-2 hover:text-karvon-turquoise-600 transition-colors"
                                >
                                    <Mail className="w-4 h-4" />
                                    hello@karvon.uz
                                </a>
                            </li>

                            <li className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {t("footer.location")}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <div>© 2026 Karvon — {t("footer.copyright")}</div>
                    <div className="flex items-center gap-4">
                        <Link to="/faq" className="hover:text-foreground transition-colors">
                            {t("footer.terms")}
                        </Link>
                        <span>·</span>
                        <Link to="/faq" className="hover:text-foreground transition-colors">
                            {t("footer.privacy")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}