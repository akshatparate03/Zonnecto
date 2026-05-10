// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const AuthContext = createContext(null);

const KEYS = {
  TOKEN: 'zn_token',
  REFRESH: 'zn_refresh',
  USER_ID: 'zn_user_id',
  EMAIL: 'zn_email',
  USERNAME: 'zn_username',
  FULL_NAME: 'zn_full_name',
  IS_PREMIUM: 'zn_is_premium',
  PREMIUM_PLAN: 'zn_premium_plan',
  PREMIUM_EXPIRES: 'zn_premium_expires',
};

const store = {
  get: (key) => SecureStore.getItemAsync(key),
  set: (key, val) => SecureStore.setItemAsync(key, String(val)),
  del: (key) => SecureStore.deleteItemAsync(key),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const token = await store.get(KEYS.TOKEN);
      if (!token) { setLoading(false); return; }

      const [userId, email, username, fullName, isPremiumStr, premiumPlan, premiumExpiresAt] =
        await Promise.all([
          store.get(KEYS.USER_ID),
          store.get(KEYS.EMAIL),
          store.get(KEYS.USERNAME),
          store.get(KEYS.FULL_NAME),
          store.get(KEYS.IS_PREMIUM),
          store.get(KEYS.PREMIUM_PLAN),
          store.get(KEYS.PREMIUM_EXPIRES),
        ]);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ token, userId, email, username, fullName, isPremium: isPremiumStr === 'true', premiumPlan, premiumExpiresAt });

      // Verify token in background
      verifyToken(token);
    } catch {
      setLoading(false);
    }
  };

  const verifyToken = async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      const cachedEmail = await store.get(KEYS.EMAIL);
      if (!data.email && cachedEmail) data.email = cachedEmail;

      setUser(prev => ({ ...prev, ...data, token }));

      // Update cache
      if (data.username) await store.set(KEYS.USERNAME, data.username);
      if (data.fullName) await store.set(KEYS.FULL_NAME, data.fullName);
      if (data.email) await store.set(KEYS.EMAIL, data.email);
      await store.set(KEYS.IS_PREMIUM, String(!!data.isPremium));
      if (data.premiumPlan) await store.set(KEYS.PREMIUM_PLAN, data.premiumPlan);
      else await store.del(KEYS.PREMIUM_PLAN);
      if (data.premiumExpiresAt) await store.set(KEYS.PREMIUM_EXPIRES, data.premiumExpiresAt);
      else await store.del(KEYS.PREMIUM_EXPIRES);
    } catch (err) {
      if (err.response?.status === 401) await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    await Promise.all(Object.values(KEYS).map(k => store.del(k)));
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setLoading(false);
  };

  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    const { token, refreshToken, userId, username, fullName } = res.data;

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await Promise.all([
      store.set(KEYS.TOKEN, token),
      store.set(KEYS.REFRESH, refreshToken || ''),
      store.set(KEYS.USER_ID, String(userId)),
      store.set(KEYS.EMAIL, email),
      username && store.set(KEYS.USERNAME, username),
      fullName && store.set(KEYS.FULL_NAME, fullName),
    ]);

    setUser(res.data);
    return res.data;
  }, []);

  const register = useCallback(async (email, password, username) => {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, { email, password, username });
    const { token, refreshToken, userId } = res.data;

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await Promise.all([
      store.set(KEYS.TOKEN, token),
      store.set(KEYS.REFRESH, refreshToken || ''),
      store.set(KEYS.USER_ID, String(userId)),
      store.set(KEYS.EMAIL, email),
      store.set(KEYS.USERNAME, username),
    ]);

    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, []);

  const getToken = useCallback(() => {
    return user?.token || store.get(KEYS.TOKEN);
  }, [user]);

  const refreshUserProfile = useCallback(async () => {
    const token = user?.token;
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(prev => ({ ...prev, ...res.data }));
    } catch {}
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
