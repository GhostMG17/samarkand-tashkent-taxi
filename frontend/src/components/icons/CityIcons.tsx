export function SamarkandIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            {/* Купол */}
            <path
                d="M12 4 C9 4 7 7 7 10 L7 14 L17 14 L17 10 C17 7 15 4 12 4 Z"
                fill="currentColor"
                opacity="0.9"
            />
            {/* База */}
            <rect x="6" y="14" width="12" height="6" fill="currentColor" opacity="0.7" />
            {/* Шпиль */}
            <path d="M12 2 L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="2" r="0.8" fill="currentColor" />
        </svg>
    );
}

export function TashkentIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            {/* Несколько башен — современный город */}
            <rect x="4" y="10" width="3" height="11" fill="currentColor" opacity="0.7" />
            <rect x="8" y="6" width="3" height="15" fill="currentColor" opacity="0.85" />
            <rect x="12" y="8" width="3" height="13" fill="currentColor" opacity="0.95" />
            <rect x="16" y="11" width="3" height="10" fill="currentColor" opacity="0.7" />
            {/* Окна */}
            <circle cx="9.5" cy="9" r="0.5" fill="white" opacity="0.6" />
            <circle cx="13.5" cy="11" r="0.5" fill="white" opacity="0.6" />
            <circle cx="13.5" cy="14" r="0.5" fill="white" opacity="0.6" />
        </svg>
    );
}