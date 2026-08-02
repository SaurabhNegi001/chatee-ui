import { configureStore } from "@reduxjs/toolkit";

import authReducer, { sessionExpired } from "./authSlice";
import chatReducer from "./chatSlice";
import { setSessionExpiredHandler } from "../api/tokenStore";
import { disconnectSocket } from "../api/socket";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
    },
});

setSessionExpiredHandler(() => {
    disconnectSocket();
    store.dispatch(sessionExpired());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
