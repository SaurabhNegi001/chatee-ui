import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppRoutes from "./routes/AppRoutes";
import type { AppDispatch, RootState } from "./store/store";
import { bootstrapSession } from "./store/authSlice";

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const isInitializing = useSelector((state: RootState) => state.auth.isInitializing);

    useEffect(() => {
        dispatch(bootstrapSession());
    }, [dispatch]);

    if (isInitializing) {
        return null;
    }

    return (
        <>
            <AppRoutes />
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default App;
