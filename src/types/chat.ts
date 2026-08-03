export interface ChatMessage {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: string;
}

export interface SearchResult {
    id: string;
    username: string;
}

export interface RecentConversation {
    conversationId: string;
    user: SearchResult;
    lastMessage: {
        content: string;
        senderId: string;
        createdAt: string;
    };
    unreadCount: number;
}
