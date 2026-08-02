import { io, type Socket } from "socket.io-client";

import { ENV } from "../config/env";
import { getAccessToken } from "./tokenStore";

let socket: Socket | null = null;

/** Connects once (idempotent) using the current access token, and keeps the token fresh across reconnects. */
export function connectSocket(): Socket {
    if (socket) {
        return socket;
    }

    socket = io(ENV.SOCKET_URL, {
        auth: { token: getAccessToken() },
    });

    socket.io.on("reconnect_attempt", () => {
        if (socket) {
            socket.auth = { token: getAccessToken() };
        }
    });

    return socket;
}

export function disconnectSocket(): void {
    socket?.disconnect();
    socket = null;
}

export interface SendMessagePayload {
    recipientId: string;
    content: string;
}

export function emitSendMessage(payload: SendMessagePayload): void {
    socket?.emit("sendMessage", payload);
}
