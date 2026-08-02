import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { connectSocket } from "../api/socket";
import { messageReceived } from "../store/chatSlice";
import type { AppDispatch } from "../store/store";
import type { ChatMessage } from "../types/chat";

/** Connects the chat socket (idempotent) and wires incoming messages into Redux. Mount once on an authenticated page. */
export function useChatSocket() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const socket = connectSocket();

        const handleNewMessage = (message: ChatMessage) => {
            dispatch(messageReceived(message));
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [dispatch]);
}
