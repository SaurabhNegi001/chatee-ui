import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { useChatSocket } from "../../hooks/useChatSocket";
import SearchPanel from "../../components/chat/SearchPanel";
import ConversationView from "../../components/chat/ConversationView";
import styles from "./ChatLayout.module.css";

const Home = () => {
    const { user, logout } = useAuth();
    const { activeConversation } = useChat();
    const navigate = useNavigate();
    useChatSocket();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const pageClassName = activeConversation
        ? `${styles.page} ${styles.chatOpen}`
        : styles.page;

    return (
        <div className={pageClassName}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <span className={styles.currentUser}>{user?.username}</span>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        Log out
                    </button>
                </div>
                <SearchPanel />
            </aside>

            <main className={styles.main}>
                <ConversationView />
            </main>
        </div>
    );
};

export default Home;
