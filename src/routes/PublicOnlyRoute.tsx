import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const PublicOnlyRoute = () => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicOnlyRoute;
