import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { chatApi } from "../api/chatApi";
import type { ChatMessage, SearchResult } from "../types/chat";

interface ActiveConversation {
    userId: string;
    username: string;
    mobile: number;
    countryCode: number;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

interface ChatState {
    searchResults: SearchResult[];
    searchStatus: AsyncStatus;
    activeConversation: ActiveConversation | null;
    messages: ChatMessage[];
    messagesStatus: AsyncStatus;
}

const initialState: ChatState = {
    searchResults: [],
    searchStatus: "idle",
    activeConversation: null,
    messages: [],
    messagesStatus: "idle",
};

export const searchUsers = createAsyncThunk("chat/search", async (query: string) => {
    return chatApi.searchUsers(query);
});

/** Opens a conversation with `user` and loads its history - if messages already exist they load, otherwise it's just an empty thread ready for a first message. */
export const openConversation = createAsyncThunk(
    "chat/openConversation",
    async (user: SearchResult) => {
        const messages = await chatApi.getConversation(user.id);
        return { user, messages };
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
            .addCase(openConversation.pending, (state, action) => {
                const user = action.meta.arg;
                state.activeConversation = {
                    userId: user.id,
                    username: user.username,
                    mobile: user.mobile,
                    countryCode: user.countryCode,
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

export const { searchCleared, messageReceived } = chatSlice.actions;
export default chatSlice.reducer;
