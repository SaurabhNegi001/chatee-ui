import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import styles from "../../pages/home/ChatLayout.module.css";

const ConversationView = () => {
    const { user } = useAuth();
    const { activeConversation, messages, messagesStatus, sendMessage } = useChat();
    const [draft, setDraft] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!activeConversation) {
        return (
            <div className={styles.emptyState}>
                <p>Search for a username or mobile number to start chatting.</p>
            </div>
        );
    }

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const content = draft.trim();
        if (!content) return;

        sendMessage(content);
        setDraft("");
    };

    return (
        <div className={styles.conversation}>
            <div className={styles.conversationHeader}>
                <span className={styles.conversationUsername}>{activeConversation.username}</span>
                <span className={styles.conversationMobile}>
                    +{activeConversation.countryCode} {activeConversation.mobile}
                </span>
            </div>

            <div className={styles.messageList}>
                {messagesStatus === "loading" && <p className={styles.hint}>Loading messages...</p>}
                {messagesStatus === "succeeded" && messages.length === 0 && (
                    <p className={styles.hint}>Say hi to start the conversation.</p>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={
                            message.senderId === user?.id
                                ? `${styles.bubble} ${styles.bubbleSent}`
                                : `${styles.bubble} ${styles.bubbleReceived}`
                        }
                    >
                        {message.content}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form className={styles.messageForm} onSubmit={handleSend}>
                <input
                    className={styles.messageInput}
                    type="text"
                    placeholder="Type a message"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                />
                <button className={styles.sendButton} type="submit">
                    Send
                </button>
            </form>
        </div>
    );
};

export default ConversationView;
