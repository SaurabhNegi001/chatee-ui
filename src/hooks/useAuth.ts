import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../store/store";
import { loginUser, logoutUser, registerUser } from "../store/authSlice";
import type { LoginPayload } from "../api/authApi";
import type { SignUpPayload } from "../api/userApi";

export function useAuth() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, status, error, isInitializing } = useSelector(
        (state: RootState) => state.auth,
    );

    const login = useCallback(
        (payload: LoginPayload) => dispatch(loginUser(payload)).unwrap(),
        [dispatch],
    );

    const register = useCallback(
        (payload: SignUpPayload) => dispatch(registerUser(payload)).unwrap(),
        [dispatch],
    );

    const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

    return {
        user,
        isAuthenticated: !!user,
        status,
        error,
        isInitializing,
        login,
        register,
        logout,
    };
}
