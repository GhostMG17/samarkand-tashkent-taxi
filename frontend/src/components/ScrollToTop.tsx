import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Прокручивает страницу в самый верх при каждом переходе по роуту.
 * Это поведение по умолчанию в большинстве SPA — без него страница
 * остаётся в той же позиции при навигации.
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);

    return null;
}