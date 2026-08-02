import { axiosClient } from "./axiosClient";
import type { ChatMessage, SearchResult } from "../types/chat";

export const chatApi = {
    searchUsers: (query: string) =>
        axiosClient
            .get<{ data: SearchResult[] }>("/user/search", { params: { query } })
            .then((res) => res.data.data),

    getConversation: (userId: string) =>
        axiosClient
            .get<{ data: ChatMessage[] }>(`/chat/conversation/${userId}`)
            .then((res) => res.data.data),
};
