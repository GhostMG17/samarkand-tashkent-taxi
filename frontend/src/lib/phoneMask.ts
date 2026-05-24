/**
 * Форматирует номер в маску +998 90 123 45 67
 * При вводе автоматически расставляет пробелы
 */
export function formatPhoneInput(value: string): string {
    // Оставляем только цифры
    const digits = value.replace(/\D/g, "");

    // Если начинается не с 998 — добавляем
    let normalized = digits;
    if (!normalized.startsWith("998")) {
        if (normalized.startsWith("8")) {
            normalized = "99" + normalized;
        } else if (normalized.startsWith("9") && !normalized.startsWith("99")) {
            normalized = "99" + normalized;
        }
    }

    // Ограничиваем до 12 цифр (998 + 9 цифр номера)
    normalized = normalized.slice(0, 12);

    // Форматируем по маске +998 XX XXX XX XX
    if (normalized.length === 0) return "+998 ";
    if (normalized.length <= 3) return `+${normalized}`;
    if (normalized.length <= 5)
        return `+${normalized.slice(0, 3)} ${normalized.slice(3)}`;
    if (normalized.length <= 8)
        return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5)}`;
    if (normalized.length <= 10)
        return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8)}`;
    return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8, 10)} ${normalized.slice(10, 12)}`;
}

/**
 * Убирает все пробелы и не-цифры из номера для отправки на бэк.
 * +998 90 123 45 67 → +998901234567
 */
export function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, "");
    return digits ? `+${digits}` : "";
}