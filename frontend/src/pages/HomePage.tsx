import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { SearchBox } from "@/components/home/SearchBox";
import { Features } from "@/components/home/Features";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

export function HomePage() {
    return (
        <ThemeProvider>
            <SEO
                title="Bosh sahifa"
                description="Samarqand va Toshkent o'rtasidagi qulay sayohat — Karvon"
            />
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <Hero />
                    <SearchBox />
                    <Features />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}