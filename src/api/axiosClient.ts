import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { ENV } from "../config/env";
import { getAccessToken, notifySessionExpired, setAccessToken } from "./tokenStore";

const BASE_URL = `${ENV.API_URL}/api/v1`;

const AUTH_FREE_PATHS = ["/auth/login", "/auth/refresh"];

export const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

function isAuthFreePath(url: string | undefined): boolean {
    return AUTH_FREE_PATHS.some((path) => url?.includes(path));
}

axiosClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token && !isAuthFreePath(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = axios
            .post<{ data: { accessToken: string } }>(
                `${BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true },
            )
            .then((response) => {
                const token = response.data.data.accessToken;
                setAccessToken(token);
                return token;
            })
            .catch(() => {
                setAccessToken(null);
                return null;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthFreePath(originalRequest.url)
        ) {
            originalRequest._retry = true;

            const newToken = await refreshAccessToken();

            if (newToken) {
                originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
                return axiosClient(originalRequest);
            }

            notifySessionExpired();
        }

        return Promise.reject(error);
    },
);
