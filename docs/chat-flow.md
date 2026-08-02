# Chat Flow

## Pieces and where they live

| Piece | File | Responsibility |
|---|---|---|
| REST wrappers | `src/api/chatApi.ts` | `searchUsers`, `getConversation` — both via `axiosClient`, so auth/refresh is automatic |
| Socket client | `src/api/socket.ts` | Connects once, keeps the auth token fresh across reconnects, exposes `emitSendMessage` |
| State | `src/store/chatSlice.ts` | Search results, the currently open conversation, its messages |
| Hooks | `src/hooks/useChat.ts`, `src/hooks/useChatSocket.ts` | What components actually use |
| UI | `src/components/chat/SearchPanel.tsx`, `ConversationView.tsx`, `src/pages/home/Home.tsx` | Two-pane layout: search on the left, conversation on the right |

## Socket connection lifecycle

`useChatSocket()` is mounted once, in `Home.tsx` (the only authenticated page today). It calls `connectSocket()` — idempotent, returns the existing socket if already connected — and wires the `newMessage` event into Redux via the `messageReceived` action.

The socket authenticates at connect time with `auth: { token: getAccessToken() }` (same in-memory token axios uses, see `auth-flow.md`). If the socket has to reconnect (network blip, server restart) and the access token rotated in the meantime, `socket.io.on("reconnect_attempt", ...)` in `socket.ts` refreshes `socket.auth.token` from the token store first, so a stale token doesn't get retried.

The socket is torn down in exactly one place: `logoutUser` in `authSlice.ts` calls `disconnectSocket()` right after clearing the access token. It's also disconnected if a silent token refresh fails (`store.ts` wires `tokenStore`'s session-expired handler to disconnect the socket before dispatching `sessionExpired`) — a dead session shouldn't hold a live socket.

## Search → open conversation → history loads

This is one flow, not two separate features:

1. `SearchPanel` debounces the search box (300ms) and dispatches `searchUsers(query)` → `GET /user/search`.
2. Clicking a result dispatches `openConversation(user)`. On `pending`, the reducer immediately sets `activeConversation` from the clicked user (so the UI switches instantly) and clears `messages` while `GET /chat/conversation/:userId` is in flight.
3. On `fulfilled`, `messages` is populated with whatever came back — if this pair has messaged before, that history loads; if not, it's an empty array and `ConversationView` shows the "say hi" empty state.

There's no separate code path for "opening an existing chat" vs. "starting a new one" — opening a conversation always re-fetches, so it's automatically correct either way.

## Sending a message

`ConversationView`'s form calls `useChat().sendMessage(content)`, which emits the `sendMessage` socket event directly — it does not go through `chatApi`/`axiosClient`. The backend encrypts, saves, and emits `newMessage` back to both the sender's and recipient's rooms; the sender's own UI updates from that same echoed event, not from a local optimistic append. This means there's a single source of truth for what actually got sent and saved — no risk of the UI showing something that didn't make it to the database.

`chatSlice`'s `messageReceived` reducer only appends an incoming message if it belongs to the currently open conversation (checked against `activeConversation.userId`), so messages for a chat you don't have open right now are silently dropped rather than appearing in the wrong thread. There's no unread-badge/notification for those yet — see the "known scope limits" section in `chatee-be/docs/chat-module.md`.

## Extending this

- **Recent chats sidebar**: would need a backend `Conversation` list endpoint (see the backend doc); on the frontend, add a thunk that fetches it and a list above/instead of search results, each entry dispatching the same `openConversation`.
- **Typing indicators / read receipts**: new socket events, handled the same way `newMessage` is — a listener in `useChatSocket` dispatching a new reducer action.
- **Message pagination**: `openConversation`'s fetch would need a cursor param, and `ConversationView`'s message list would need a "load older" trigger at the top instead of assuming `getConversation` returns everything.
