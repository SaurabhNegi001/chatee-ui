import { axiosClient } from "./axiosClient";
import type { AuthUser } from "../types/auth";

export interface LoginPayload {
    identifier: string;
    password: string;
}

export interface LoginResult {
    accessToken: string;
    user: AuthUser;
}

export const authApi = {
    login: (payload: LoginPayload) =>
        axiosClient
            .post<{ data: LoginResult }>("/auth/login", payload)
            .then((res) => res.data.data),

    refresh: () =>
        axiosClient
            .post<{ data: { accessToken: string } }>("/auth/refresh")
            .then((res) => res.data.data),

    logout: () => axiosClient.post("/auth/logout"),

    me: () => axiosClient.get<{ data: AuthUser }>("/auth/me").then((res) => res.data.data),
};
