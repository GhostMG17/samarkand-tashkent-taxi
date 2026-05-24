import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-border bg-card text-card-foreground",
                "shadow-sm hover:shadow-md transition-shadow duration-300",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";