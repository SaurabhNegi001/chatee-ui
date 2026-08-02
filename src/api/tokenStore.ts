/**
 * In-memory access token holder. Kept outside Redux so axiosClient can read
 * it without importing the store (which would create a circular import,
 * since the store's authSlice thunks import axiosClient/authApi).
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
    return accessToken;
}

export function setAccessToken(token: string | null): void {
    accessToken = token;
}

let onSessionExpired: (() => void) | null = null;

/** Registered once at app bootstrap to log the user out in Redux when a silent token refresh fails. */
export function setSessionExpiredHandler(handler: () => void): void {
    onSessionExpired = handler;
}

export function notifySessionExpired(): void {
    onSessionExpired?.();
}
