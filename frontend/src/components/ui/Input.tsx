import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: ReactNode;
    error?: string;
    rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, icon, error, rightSlot, id, ...props }, ref) => {
        const inputId = id || `input-${label?.replace(/\s+/g, "-").toLowerCase()}`;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-foreground"
                    >
                        {label}
                    </label>
                )}
                <div
                    className={cn(
                        "relative flex items-center rounded-xl border bg-card transition-all",
                        "focus-within:border-karvon-turquoise-500 focus-within:ring-2 focus-within:ring-karvon-turquoise-500/20",
                        error
                            ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/20"
                            : "border-border"
                    )}
                >
                    {icon && (
                        <div className="pl-3.5 text-muted-foreground pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        className={cn(
                            "flex-1 bg-transparent px-3.5 py-3 text-base outline-none",
                            "placeholder:text-muted-foreground",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            className
                        )}
                        {...props}
                    />
                    {rightSlot && <div className="pr-2">{rightSlot}</div>}
                </div>
                {error && (
                    <p className="text-xs text-destructive font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";