import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

export const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — берём токен из Zustand store (единый источник)
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — обрабатывает 401 (токен невалидный)
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config?.url?.includes("/auth/");
            if (!isAuthEndpoint) {
                // Токен протух → разлогиниваем через Zustand
                useAuthStore.getState().logout();
            }
        }
        return Promise.reject(error);
    }
);