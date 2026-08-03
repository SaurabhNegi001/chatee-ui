import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { connectSocket } from "../api/socket";
import { fetchRecentConversations, markConversationRead, messageReceived } from "../store/chatSlice";
import type { AppDispatch, RootState } from "../store/store";
import type { ChatMessage } from "../types/chat";

/** Connects the chat socket (idempotent) and wires incoming messages into Redux. Mount once on an authenticated page. */
export function useChatSocket() {
    const dispatch = useDispatch<AppDispatch>();
    const activeConversationId = useSelector(
        (state: RootState) => state.chat.activeConversation?.userId,
    );

    const activeConversationIdRef = useRef(activeConversationId);
    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
    }, [activeConversationId]);

    useEffect(() => {
        const socket = connectSocket();

        const handleNewMessage = (message: ChatMessage) => {
            dispatch(messageReceived(message));

            const openUserId = activeConversationIdRef.current;
            const belongsToOpenConversation =
                openUserId &&
                (message.senderId === openUserId || message.recipientId === openUserId);

            if (belongsToOpenConversation) {
                // Already viewing this thread - mark it read immediately rather
                // than leaving it "unread" until the user re-opens it.
                dispatch(markConversationRead(openUserId));
            } else {
                // Keep the recent-chats list (preview text, ordering, unread count) in sync.
                dispatch(fetchRecentConversations());
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [dispatch]);
}
