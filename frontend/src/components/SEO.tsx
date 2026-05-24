import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
}

const DEFAULTS = {
    title: "Karvon — Samarqand ↔ Toshkent taksi xizmati",
    description: "Samarqand va Toshkent o'rtasidagi qulay sayohat. Bron qiling va yo'lga chiqing.",
    image: "/og-image.png",
    type: "website",
};

/**
 * Динамически меняет meta-теги для каждой страницы.
 * Используется для шеринга в соцсетях и SEO.
 */
export function SEO({ title, description, image, type }: SEOProps) {
    useEffect(() => {
        const finalTitle = title ? `${title} — Karvon` : DEFAULTS.title;
        const finalDesc = description || DEFAULTS.description;
        const finalImage = image || DEFAULTS.image;
        const finalType = type || DEFAULTS.type;

        document.title = finalTitle;

        setMeta("description", finalDesc);
        setMeta("og:title", finalTitle, "property");
        setMeta("og:description", finalDesc, "property");
        setMeta("og:image", finalImage, "property");
        setMeta("og:type", finalType, "property");
        setMeta("og:url", window.location.href, "property");
        setMeta("twitter:card", "summary_large_image");
        setMeta("twitter:title", finalTitle);
        setMeta("twitter:description", finalDesc);
        setMeta("twitter:image", finalImage);
    }, [title, description, image, type]);

    return null;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
    let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
    }
    element.content = content;
}