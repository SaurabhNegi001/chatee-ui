import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../store/store";
import { openConversation, searchUsers } from "../store/chatSlice";
import { emitSendMessage } from "../api/socket";
import type { SearchResult } from "../types/chat";

export function useChat() {
    const dispatch = useDispatch<AppDispatch>();
    const { searchResults, searchStatus, activeConversation, messages, messagesStatus } =
        useSelector((state: RootState) => state.chat);

    const search = useCallback((query: string) => dispatch(searchUsers(query)), [dispatch]);

    const openChat = useCallback(
        (user: SearchResult) => dispatch(openConversation(user)),
        [dispatch],
    );

    const sendMessage = useCallback(
        (content: string) => {
            if (!activeConversation) return;
            emitSendMessage({ recipientId: activeConversation.userId, content });
        },
        [activeConversation],
    );

    return {
        searchResults,
        searchStatus,
        activeConversation,
        messages,
        messagesStatus,
        search,
        openChat,
        sendMessage,
    };
}
