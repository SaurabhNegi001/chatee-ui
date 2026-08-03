import { axiosClient } from "./axiosClient";
import type { ChatMessage, RecentConversation, SearchResult } from "../types/chat";

export const chatApi = {
    searchUsers: (query: string) =>
        axiosClient
            .get<{ data: SearchResult[] }>("/user/search", { params: { query } })
            .then((res) => res.data.data),

    getConversation: (userId: string) =>
        axiosClient
            .get<{ data: ChatMessage[] }>(`/chat/conversation/${userId}`)
            .then((res) => res.data.data),

    getRecentConversations: () =>
        axiosClient
            .get<{ data: RecentConversation[] }>("/chat/recent")
            .then((res) => res.data.data),

    markConversationRead: (userId: string) =>
        axiosClient.post(`/chat/conversation/${userId}/read`),
};
