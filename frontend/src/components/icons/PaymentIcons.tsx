
export function ClickIcon({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#00ADEF" />
            <text
                x="20"
                y="26"
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="white"
                fontFamily="system-ui, sans-serif"
            >
                Click
            </text>
        </svg>
    );
}

export function PaymeIcon({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#26C6DA" />
            <text
                x="20"
                y="26"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="white"
                fontFamily="system-ui, sans-serif"
            >
                Payme
            </text>
        </svg>
    );
}

export function UzcardIcon({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#1A1F36" />
            <text
                x="20"
                y="26"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#FFCD00"
                fontFamily="system-ui, sans-serif"
            >
                UZCARD
            </text>
        </svg>
    );
}

export function HumoIcon({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#0F8B47" />
            <text
                x="20"
                y="26"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="white"
                fontFamily="system-ui, sans-serif"
            >
                Humo
            </text>
        </svg>
    );
}