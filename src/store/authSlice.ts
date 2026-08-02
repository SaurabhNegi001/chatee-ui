import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { authApi, type LoginPayload } from "../api/authApi";
import { userApi, type SignUpPayload } from "../api/userApi";
import { setAccessToken } from "../api/tokenStore";
import { disconnectSocket } from "../api/socket";
import type { AuthUser } from "../types/auth";

interface AuthState {
    user: AuthUser | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    isInitializing: boolean;
}

const initialState: AuthState = {
    user: null,
    status: "idle",
    error: null,
    isInitializing: true,
};

function extractErrorMessage(error: unknown, fallback: string): string {
    const response = (error as { response?: { data?: { message?: string | string[] } } })?.response;
    const message = response?.data?.message;

    if (Array.isArray(message)) {
        return message[0] ?? fallback;
    }

    return message ?? fallback;
}

export const registerUser = createAsyncThunk(
    "auth/register",
    async (payload: SignUpPayload, { rejectWithValue }) => {
        try {
            return await userApi.signUp(payload);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Could not create account"));
        }
    },
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (payload: LoginPayload, { rejectWithValue }) => {
        try {
            const result = await authApi.login(payload);
            setAccessToken(result.accessToken);
            return result.user;
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Invalid username/mobile or password"));
        }
    },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
    try {
        await authApi.logout();
    } catch {
        // Best-effort: the client state is cleared regardless.
    }
    setAccessToken(null);
    disconnectSocket();
});

/** Runs once on app start to silently restore a session from the refresh cookie, if any. */
export const bootstrapSession = createAsyncThunk("auth/bootstrap", async () => {
    try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        return await authApi.me();
    } catch {
        setAccessToken(null);
        return null;
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        sessionExpired(state) {
            state.user = null;
            state.status = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.status = "idle";
                state.error = null;
            })
            .addCase(bootstrapSession.pending, (state) => {
                state.isInitializing = true;
            })
            .addCase(bootstrapSession.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isInitializing = false;
            })
            .addCase(bootstrapSession.rejected, (state) => {
                state.user = null;
                state.isInitializing = false;
            });
    },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
