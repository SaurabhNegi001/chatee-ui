import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import type { AppDispatch, RootState } from "../store/store";
import { conversationClosed } from "../store/chatSlice";

/**
 * Makes the Android hardware/gesture back button behave like a real "back",
 * instead of exiting the app. By default Capacitor falls back to the
 * WebView's own history (`webView.canGoBack()`), but opening a chat here is
 * pure Redux/CSS state - it never touches browser history - so there was
 * nothing for the WebView to "go back" to and it just exited. No-ops on web.
 */
export function useAndroidBackButton() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const activeConversationId = useSelector(
        (state: RootState) => state.chat.activeConversation?.userId,
    );

    const stateRef = useRef({ activeConversationId, locationKey: location.key });

    useEffect(() => {
        stateRef.current = { activeConversationId, locationKey: location.key };
    }, [activeConversationId, location.key]);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        const listenerPromise = CapacitorApp.addListener("backButton", () => {
            const { activeConversationId, locationKey } = stateRef.current;

            if (activeConversationId) {
                dispatch(conversationClosed());
                return;
            }

            if (locationKey && locationKey !== "default") {
                navigate(-1);
                return;
            }

            void CapacitorApp.exitApp();
        });

        return () => {
            void listenerPromise.then((listener) => listener.remove());
        };
    }, [dispatch, navigate]);
}
