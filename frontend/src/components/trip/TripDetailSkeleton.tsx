import { Card } from "@/components/ui/Card";

export function TripDetailSkeleton() {
    return (
        <main className="container py-6 md:py-10">
            {/* Back button skeleton */}
            <div className="h-5 w-20 bg-secondary rounded animate-pulse mb-6" />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                <div className="space-y-6">
                    {/* Hero card skeleton */}
                    <Card className="overflow-hidden">
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-28 bg-secondary rounded-full animate-pulse" />
                                <div className="h-6 w-20 bg-secondary rounded-full animate-pulse" />
                            </div>

                            <div className="flex items-center gap-4 md:gap-6 my-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-3xl bg-secondary animate-pulse" />
                                    <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <div className="h-8 w-24 bg-secondary rounded animate-pulse" />
                                    <div className="w-full h-0.5 bg-secondary animate-pulse" />
                                    <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-3xl bg-secondary animate-pulse" />
                                    <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
                                </div>
                            </div>

                            <div className="h-5 w-40 bg-secondary rounded animate-pulse" />
                        </div>
                    </Card>

                    {/* Driver card skeleton */}
                    <Card className="p-6">
                        <div className="h-6 w-24 bg-secondary rounded animate-pulse mb-4" />
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-secondary animate-pulse" />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 w-32 bg-secondary rounded animate-pulse" />
                                <div className="h-4 w-40 bg-secondary rounded animate-pulse" />
                            </div>
                        </div>
                    </Card>

                    {/* Seats skeleton */}
                    <Card className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
                                <div className="h-5 w-24 bg-secondary rounded animate-pulse" />
                            </div>
                            <div className="rounded-3xl border-2 border-border bg-secondary/30 p-6 max-w-sm mx-auto">
                                <div className="h-3 rounded-t-2xl bg-secondary animate-pulse mb-4" />
                                <div className="grid grid-cols-2 gap-4">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square rounded-xl bg-secondary animate-pulse"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sticky panel skeleton */}
                <Card className="overflow-hidden lg:sticky lg:top-24 lg:self-start">
                    <div className="h-1 bg-gradient-karvon" />
                    <div className="p-6 space-y-5">
                        <div>
                            <div className="h-4 w-24 bg-secondary rounded animate-pulse mb-2" />
                            <div className="h-10 w-48 bg-secondary rounded animate-pulse" />
                        </div>
                        <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
                                    <div className="h-4 w-28 bg-secondary rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="h-14 w-full bg-secondary rounded-xl animate-pulse" />
                    </div>
                </Card>
            </div>
        </main>
    );
}