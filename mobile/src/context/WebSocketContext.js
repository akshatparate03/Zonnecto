// src/context/WebSocketContext.js
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { API_BASE_URL, WS_URL } from '../constants/api';
import * as SecureStore from 'expo-secure-store';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [incomingReconnect, setIncomingReconnect] = useState(null);
  const clientRef = useRef(null);
  const initializedRef = useRef(false);

  const fetchCountFallback = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/active-count`);
      if (res.data?.count !== undefined) setOnlineCount(res.data.count);
    } catch {}
  };

  const createAndConnect = useCallback((userId) => {
    if (clientRef.current?.active) clientRef.current.deactivate();

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        userId: userId ? String(userId) : '',
        login: userId ? String(userId) : '',
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/online-count', (msg) => {
          try {
            const data = JSON.parse(msg.body);
            if (data.count !== undefined) setOnlineCount(data.count);
          } catch {}
        });

        if (userId) {
          client.subscribe(`/topic/user/${userId}/reconnect`, (msg) => {
            try {
              const data = JSON.parse(msg.body);
              if (data.event === 'RECONNECT_REQUEST') {
                setIncomingReconnect({ chatRoomId: data.chatRoomId, fromUserId: data.userId });
              }
            } catch {}
          });
        }
        setTimeout(fetchCountFallback, 500);
      },
      onDisconnect: () => { setConnected(false); fetchCountFallback(); },
      onStompError: () => { setConnected(false); fetchCountFallback(); },
    });

    client.activate();
    clientRef.current = client;
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    SecureStore.getItemAsync('zn_token').then(token => {
      SecureStore.getItemAsync('zn_user_id').then(userId => {
        createAndConnect(token && userId ? userId : null);
      });
    });
    fetchCountFallback();

    const interval = setInterval(fetchCountFallback, 15000);
    return () => {
      clearInterval(interval);
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  const subscribe = useCallback((destination, callback) => {
    if (!clientRef.current?.connected) return () => {};
    const sub = clientRef.current.subscribe(destination, callback);
    return () => sub.unsubscribe();
  }, [connected]);

  const send = useCallback((destination, message) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({ destination, body: JSON.stringify(message) });
  }, [connected]);

  const reconnect = useCallback((userId) => {
    initializedRef.current = false;
    setConnected(false);
    createAndConnect(userId);
    initializedRef.current = true;
  }, [createAndConnect]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
      initializedRef.current = false;
    }
    setConnected(false);
  }, []);

  return (
    <WebSocketContext.Provider value={{
      connected, onlineCount, subscribe, send,
      reconnect, disconnect, incomingReconnect, setIncomingReconnect,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
};
