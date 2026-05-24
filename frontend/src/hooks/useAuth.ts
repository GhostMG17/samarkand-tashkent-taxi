import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { AxiosError } from "axios";
import { login, register, getMe } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import type { LoginRequest, RegisterRequest, ApiError } from "@/types/api";
import { toast } from "sonner";
import i18n from "@/i18n";
import { updateProfile, changePassword } from "@/api/auth";


export function useLogin() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    const location = useLocation();

    return useMutation({
        mutationFn: (data: LoginRequest) => login(data),
        onSuccess: async (response) => {
            const token = response.accessToken;
            if (!token) throw new Error("No token in response");

            // Сначала кладём токен в Zustand, чтобы interceptor его увидел
            useAuthStore.setState({ token, isAuthenticated: true });

            // Теперь getMe пойдёт с правильным токеном
            const user = await getMe();

            // Окончательно сохраняем юзера + токен
            setAuth(user, token);
            toast.success(i18n.t("toast.loginSuccess"));

            const from = (location.state as { from?: string })?.from || "/";
            navigate(from, { replace: true });
        },
    });
}

export function useRegister() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    const location = useLocation();

    return useMutation({
        mutationFn: (data: RegisterRequest) => register(data),
        onSuccess: async (response) => {
            const token = response.accessToken;
            if (!token) throw new Error("No token in response");

            // Сначала токен в Zustand
            useAuthStore.setState({ token, isAuthenticated: true });

            const user = await getMe();

            setAuth(user, token);
            toast.success(i18n.t("toast.registerSuccess"));

            const from = (location.state as { from?: string })?.from || "/";
            navigate(from, { replace: true });
        },
    });
}

export function useCurrentUser() {
    const token = useAuthStore((s) => s.token);
    return useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        enabled: !!token,
        staleTime: 1000 * 60 * 5,
    });
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiError | undefined;
        if (data?.error) return data.error;
        if (data?.fields) {
            return Object.values(data.fields).join(", ");
        }
        return error.message;
    }
    if (error instanceof Error) return error.message;
    return "Unknown error";
}


export function useUpdateProfile() {
    const setAuth = useAuthStore((s) => s.setAuth);

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (user) => {
            const token = useAuthStore.getState().token;
            if (token) {
                setAuth(user, token);
            }
            toast.success(i18n.t("toast.profileUpdated"));
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success(i18n.t("toast.passwordChanged"));
        },
    });
}