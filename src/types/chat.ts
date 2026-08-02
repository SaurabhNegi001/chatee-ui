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
    mobile: number;
    countryCode: number;
}
