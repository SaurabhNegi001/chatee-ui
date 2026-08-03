import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Home from "../pages/home/Home";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import { useAuth } from "../hooks/useAuth";
import { useAndroidBackButton } from "../hooks/useAndroidBackButton";

/** useNavigate/useLocation only work inside <BrowserRouter>, so this hook needs its own component rendered as a child of it, not called directly in AppRoutes. */
const BackButtonHandler = () => {
    useAndroidBackButton();
    return null;
};

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <BrowserRouter>
            <BackButtonHandler />
            <Routes>
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Home />} />
                </Route>

                <Route
                    path="/"
                    element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
