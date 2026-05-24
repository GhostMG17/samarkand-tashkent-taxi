import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg" | "xl";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        const variants = {
            primary:
                "bg-karvon-turquoise-600 text-white hover:bg-karvon-turquoise-700 shadow-lg shadow-karvon-turquoise-600/25 hover:shadow-karvon-turquoise-600/40",
            secondary:
                "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost:
                "hover:bg-secondary text-foreground",
            outline:
                "border border-border bg-background hover:bg-secondary text-foreground",
        };

        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            xl: "h-14 px-8 text-lg font-semibold",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
                    "transition-all duration-200 active:scale-[0.98]",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";