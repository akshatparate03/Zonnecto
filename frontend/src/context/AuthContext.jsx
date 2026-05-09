import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");
    const username = localStorage.getItem("username");
    const fullName = localStorage.getItem("fullName");
    const isPremium = localStorage.getItem("isPremium") === "true";
    const premiumPlan = localStorage.getItem("premiumPlan") || null;
    const premiumExpiresAt = localStorage.getItem("premiumExpiresAt") || null;

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({
        token,
        userId,
        email,
        username,
        fullName,
        isPremium,
        premiumPlan,
        premiumExpiresAt,
      });
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Profile data se user update karo — token + email preserve karo
      const data = response.data;
      // email backend se nahi aaya to localStorage se lo (admin check ke liye zaroori)
      const cachedEmail = localStorage.getItem("email");
      if (!data.email && cachedEmail) data.email = cachedEmail;
      setUser({ ...data, token });
      // ✅ Cache username/fullName/premium localStorage mein taaki refresh pe bhi dikhein
      if (data.username) localStorage.setItem("username", data.username);
      if (data.fullName) localStorage.setItem("fullName", data.fullName);
      if (data.email) localStorage.setItem("email", data.email);
      localStorage.setItem("isPremium", String(!!data.isPremium));
      if (data.premiumPlan)
        localStorage.setItem("premiumPlan", data.premiumPlan);
      else localStorage.removeItem("premiumPlan");
      if (data.premiumExpiresAt)
        localStorage.setItem("premiumExpiresAt", data.premiumExpiresAt);
      else localStorage.removeItem("premiumExpiresAt");
    } catch (err) {
      const status = err.response?.status;
      // ✅ Sirf 401 (expired/invalid token) pe logout karo
      // 400 = profile incomplete (naya user), 403 = banned — logout mat karo
      if (status === 401) {
        _clearSession();
      }
      // 400/403/500 pe user logged-in rehega cached data se
    } finally {
      // ✅ Loading ALWAYS false karo verify complete hone ke baad
      setLoading(false);
    }
  };

  const _clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    localStorage.removeItem("isPremium");
    localStorage.removeItem("premiumPlan");
    localStorage.removeItem("premiumExpiresAt");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setLoading(false);
  };

  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    const { token, refreshToken, userId, username, fullName } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken || "");
    localStorage.setItem("userId", String(userId));
    localStorage.setItem("email", email);
    if (username) localStorage.setItem("username", username);
    if (fullName) localStorage.setItem("fullName", fullName);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(response.data);
    return response.data;
  }, []);

  const register = useCallback(
    async (email, password, username, inviteCode = null) => {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        username,
        inviteCode,
      });
      const { token, refreshToken, userId } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", String(userId));
      localStorage.setItem("email", email); // ✅ FIX: email save karo localStorage mein
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(response.data);
      return response.data;
    },
    [],
  );

  const logout = useCallback(() => {
    _clearSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
