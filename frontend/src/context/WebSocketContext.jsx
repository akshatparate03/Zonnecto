import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

export const WebSocketContext = createContext();

const WS_URL =
  import.meta.env.VITE_WS_URL || "http://localhost:8080/api/ws/chat";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export function WebSocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  // ✅ Global reconnect request state — koi bhi component subscribe kar sakta hai
  const [incomingReconnect, setIncomingReconnect] = useState(null); // { chatRoomId, fromUserId }
  const clientRef = useRef(null);
  const initializedRef = useRef(false);
  const reconnectSubRef = useRef(null); // personal reconnect topic subscription

  const fetchCountFallback = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/active-count`);
      if (res.data?.count !== undefined) {
        setOnlineCount(res.data.count);
      }
    } catch (e) {}
  };

  const createAndConnect = useCallback((userId) => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        userId: userId ? String(userId) : "",
        login: userId ? String(userId) : "",
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);

        // Subscribe to online count - backend will immediately send current count
        client.subscribe("/topic/online-count", (msg) => {
          try {
            const data = JSON.parse(msg.body);
            if (data.count !== undefined) {
              setOnlineCount(data.count);
            }
          } catch (e) {}
        });

        // ✅ Personal reconnect topic — user kahi bhi ho, reconnect request milegi
        if (userId) {
          if (reconnectSubRef.current) {
            try {
              reconnectSubRef.current.unsubscribe();
            } catch (e) {}
          }
          reconnectSubRef.current = client.subscribe(
            `/topic/user/${userId}/reconnect`,
            (msg) => {
              try {
                const data = JSON.parse(msg.body);
                if (data.event === "RECONNECT_REQUEST") {
                  setIncomingReconnect({
                    chatRoomId: data.chatRoomId,
                    fromUserId: data.userId,
                  });
                }
              } catch (e) {}
            },
          );
        }

        // REST fallback - 500ms baad bhi fetch karo safety ke liye
        setTimeout(fetchCountFallback, 500);
      },
      onDisconnect: () => {
        console.log("[WS] Disconnected");
        setConnected(false);
        // Disconnect pe bhi REST se count lo
        fetchCountFallback();
      },
      onStompError: (err) => {
        console.error("[WS] Error:", err);
        setConnected(false);
        fetchCountFallback();
      },
    });

    client.activate();
    clientRef.current = client;
    return client;
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // Token ho ya na ho - WebSocket connect karo (count tracking ke liye)
    // Token nahi hai toh userId empty bhejo
    if (token && userId) {
      createAndConnect(userId);
    } else {
      // Not logged in - still connect for count but no userId
      createAndConnect(null);
    }

    // Fallback: initial count REST se bhi lo
    fetchCountFallback();

    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  // Periodic REST fallback - har 15 sec mein sync karo (backup only)
  useEffect(() => {
    const interval = setInterval(fetchCountFallback, 15000);
    return () => clearInterval(interval);
  }, []);

  const reconnect = useCallback(
    (userId) => {
      initializedRef.current = false;
      setConnected(false);
      createAndConnect(userId);
      initializedRef.current = true;
    },
    [createAndConnect],
  );

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
      initializedRef.current = false;
    }
    setConnected(false);
    fetchCountFallback();
  }, []);

  const subscribe = useCallback(
    (destination, callback) => {
      if (!clientRef.current?.connected) {
        console.warn("[WS] Not connected, cannot subscribe to", destination);
        return () => {};
      }
      const sub = clientRef.current.subscribe(destination, callback);
      return () => sub.unsubscribe();
    },
    [connected],
  );

  const send = useCallback(
    (destination, message) => {
      if (!clientRef.current?.connected) {
        console.warn("[WS] Not connected, cannot send");
        return;
      }
      clientRef.current.publish({
        destination,
        body: JSON.stringify(message),
      });
    },
    [connected],
  );

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        onlineCount,
        subscribe,
        send,
        reconnect,
        disconnect,
        incomingReconnect,
        setIncomingReconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = React.useContext(WebSocketContext);
  if (!context)
    throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
}
