import { useEffect, useRef, useState } from "react";

import { useChat } from "../../hooks/useChat";
import type { SearchResult } from "../../types/chat";
import styles from "../../pages/home/ChatLayout.module.css";

const DEBOUNCE_MS = 300;

const SearchPanel = () => {
    const [query, setQuery] = useState("");
    const { searchResults, searchStatus, activeConversation, search, openChat } = useChat();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                {searchStatus === "loading" && <p className={styles.hint}>Searching...</p>}
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
                        <span className={styles.resultMobile}>
                            +{user.countryCode} {user.mobile}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchPanel;
