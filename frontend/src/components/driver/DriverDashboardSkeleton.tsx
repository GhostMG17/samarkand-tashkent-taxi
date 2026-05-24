import { Card } from "@/components/ui/Card";

export function DriverDashboardSkeleton() {
    return (
        <div className="container py-6 md:py-10">
            {/* Header skeleton */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-secondary rounded animate-pulse" />
                    <div className="h-5 w-80 bg-secondary rounded animate-pulse" />
                </div>
                <div className="h-12 w-40 bg-secondary rounded-xl animate-pulse" />
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-secondary animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-24 bg-secondary rounded animate-pulse" />
                                <div className="h-6 w-16 bg-secondary rounded animate-pulse" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-10 w-24 bg-secondary rounded-xl animate-pulse"
                    />
                ))}
            </div>

            {/* Trip cards skeleton */}
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-6">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="h-6 w-20 bg-secondary rounded-full animate-pulse" />
                                <div className="h-6 w-16 bg-secondary rounded-full animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-secondary animate-pulse" />
                                <div className="flex-1 h-px bg-secondary animate-pulse" />
                                <div className="w-11 h-11 rounded-2xl bg-secondary animate-pulse" />
                            </div>
                            <div className="h-2 rounded-full bg-secondary animate-pulse" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}