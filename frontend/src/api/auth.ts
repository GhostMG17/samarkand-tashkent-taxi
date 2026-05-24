import { apiClient } from "./client";
import type {
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    User,
} from "@/types/api";

export async function register(data: RegisterRequest) {
    const { data: response } = await apiClient.post<AuthResponse>("/auth/register", data);
    return response;
}

export async function login(data: LoginRequest) {
    const { data: response } = await apiClient.post<AuthResponse>("/auth/login", data);
    return response;
}

export async function getMe() {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
}

export async function updateProfile(data: UpdateProfileRequest) {
    const { data: response } = await apiClient.patch<User>("/auth/me", data);
    return response;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export async function changePassword(data: ChangePasswordRequest) {
    await apiClient.post("/auth/me/change-password", data);
}