import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { chatApi } from "../api/chatApi";
import type { ChatMessage, RecentConversation, SearchResult } from "../types/chat";

interface ActiveConversation {
    userId: string;
    username: string;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

interface ChatState {
    searchResults: SearchResult[];
    searchStatus: AsyncStatus;
    recentConversations: RecentConversation[];
    recentStatus: AsyncStatus;
    activeConversation: ActiveConversation | null;
    messages: ChatMessage[];
    messagesStatus: AsyncStatus;
}

const initialState: ChatState = {
    searchResults: [],
    searchStatus: "idle",
    recentConversations: [],
    recentStatus: "idle",
    activeConversation: null,
    messages: [],
    messagesStatus: "idle",
};

export const searchUsers = createAsyncThunk("chat/search", async (query: string) => {
    return chatApi.searchUsers(query);
});

export const fetchRecentConversations = createAsyncThunk(
    "chat/fetchRecent",
    async () => {
        return chatApi.getRecentConversations();
    },
);

/** Opens a conversation with `user` and loads its history - if messages already exist they load, otherwise it's just an empty thread ready for a first message. */
export const openConversation = createAsyncThunk(
    "chat/openConversation",
    async (user: SearchResult, { dispatch }) => {
        const messages = await chatApi.getConversation(user.id);
        // Fetching the conversation marks it read server-side - refresh so the unread badge clears.
        void dispatch(fetchRecentConversations());
        return { user, messages };
    },
);

/** Marks a conversation read (e.g. a message arrived while it was already open) and refreshes the unread badge. */
export const markConversationRead = createAsyncThunk(
    "chat/markConversationRead",
    async (userId: string, { dispatch }) => {
        await chatApi.markConversationRead(userId);
        void dispatch(fetchRecentConversations());
    },
);

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        searchCleared(state) {
            state.searchResults = [];
            state.searchStatus = "idle";
        },
        /** Returns to the search list on mobile, where only one pane shows at a time. */
        conversationClosed(state) {
            state.activeConversation = null;
            state.messages = [];
            state.messagesStatus = "idle";
        },
        /** Dispatched by the socket listener (see useChatSocket) when a `newMessage` event arrives. */
        messageReceived(state, action: PayloadAction<ChatMessage>) {
            const message = action.payload;
            const otherUserId = state.activeConversation?.userId;

            if (
                otherUserId &&
                (message.senderId === otherUserId || message.recipientId === otherUserId)
            ) {
                state.messages.push(message);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchUsers.pending, (state) => {
                state.searchStatus = "loading";
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.searchStatus = "succeeded";
                state.searchResults = action.payload;
            })
            .addCase(searchUsers.rejected, (state) => {
                state.searchStatus = "failed";
                state.searchResults = [];
            })
            .addCase(fetchRecentConversations.pending, (state) => {
                state.recentStatus = "loading";
            })
            .addCase(fetchRecentConversations.fulfilled, (state, action) => {
                state.recentStatus = "succeeded";
                state.recentConversations = action.payload;
            })
            .addCase(fetchRecentConversations.rejected, (state) => {
                state.recentStatus = "failed";
            })
            .addCase(openConversation.pending, (state, action) => {
                const user = action.meta.arg;
                state.activeConversation = {
                    userId: user.id,
                    username: user.username,
                };
                state.messages = [];
                state.messagesStatus = "loading";
            })
            .addCase(openConversation.fulfilled, (state, action) => {
                state.messages = action.payload.messages;
                state.messagesStatus = "succeeded";
            })
            .addCase(openConversation.rejected, (state) => {
                state.messagesStatus = "failed";
            });
    },
});

export const { searchCleared, messageReceived, conversationClosed } = chatSlice.actions;
export default chatSlice.reducer;
