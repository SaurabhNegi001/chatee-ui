import { useEffect, useRef, useState } from "react";

import { useChat } from "../../hooks/useChat";
import type { SearchResult } from "../../types/chat";
import styles from "../../pages/home/ChatLayout.module.css";

const DEBOUNCE_MS = 300;

const SearchPanel = () => {
    const [query, setQuery] = useState("");
    const {
        searchResults,
        searchStatus,
        recentConversations,
        recentStatus,
        activeConversation,
        search,
        loadRecentConversations,
        openChat,
    } = useChat();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        loadRecentConversations();
        // Only ever needs to run once on mount - the socket keeps this list fresh afterwards.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!query.trim()) {
            return;
        }

        debounceRef.current = setTimeout(() => {
            search(query.trim());
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, search]);

    const handleSelect = (user: SearchResult) => {
        openChat(user);
    };

    const isSearching = query.trim().length > 0;

    return (
        <div className={styles.searchPanel}>
            <input
                className={styles.searchInput}
                type="text"
                placeholder="Search by username or mobile number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <div className={styles.resultList}>
                {isSearching ? (
                    <>
                        {searchStatus === "loading" && (
                            <p className={styles.hint}>Searching...</p>
                        )}
                        {searchStatus === "succeeded" && searchResults.length === 0 && (
                            <p className={styles.hint}>No users found</p>
                        )}
                        {searchResults.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                className={
                                    activeConversation?.userId === user.id
                                        ? `${styles.resultItem} ${styles.resultItemActive}`
                                        : styles.resultItem
                                }
                                onClick={() => handleSelect(user)}
                            >
                                <span className={styles.resultUsername}>{user.username}</span>
                            </button>
                        ))}
                    </>
                ) : (
                    <>
                        {recentStatus === "loading" && (
                            <p className={styles.hint}>Loading chats...</p>
                        )}
                        {recentStatus === "succeeded" && recentConversations.length === 0 && (
                            <p className={styles.hint}>
                                No recent chats yet — search for a username or mobile number to
                                start.
                            </p>
                        )}
                        {recentConversations.map((conversation) => (
                            <button
                                key={conversation.conversationId}
                                type="button"
                                className={
                                    activeConversation?.userId === conversation.user.id
                                        ? `${styles.resultItem} ${styles.resultItemActive}`
                                        : styles.resultItem
                                }
                                onClick={() => handleSelect(conversation.user)}
                            >
                                <div className={styles.resultTopRow}>
                                    <span className={styles.resultUsername}>
                                        {conversation.user.username}
                                    </span>
                                    {conversation.unreadCount > 0 && (
                                        <span className={styles.unreadBadge}>
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <span className={styles.resultPreview}>
                                    {conversation.lastMessage.content}
                                </span>
                            </button>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPanel;
