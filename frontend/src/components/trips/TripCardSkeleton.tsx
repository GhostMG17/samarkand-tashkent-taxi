import { Card } from "@/components/ui/Card";

export function TripCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary animate-pulse" />
                            <div className="flex-1 h-px bg-secondary animate-pulse" />
                            <div className="w-12 h-12 rounded-2xl bg-secondary animate-pulse" />
                        </div>
                        <div className="flex gap-4">
                            <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
                            <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-8 w-32 bg-secondary rounded animate-pulse" />
                        <div className="h-12 w-32 bg-secondary rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        </Card>
    );
}