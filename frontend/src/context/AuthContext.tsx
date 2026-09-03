"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  authProvider: "LOCAL" | "GOOGLE";
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<any>;

  logout: () => Promise<void>;

  refreshSession: () => Promise<string | null>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // ----------------------------------------
  // REFRESH SESSION
  // ----------------------------------------

  async function refreshSession() {
    try {
      const data = await apiRequest(
        AUTH_ENDPOINTS.refresh,
        {
          method: "POST",
        }
      );

      const token = data.accessToken;

      if (!token) {
        throw new Error(
          "Refresh response does not contain accessToken"
        );
      }

      setAccessToken(token);

      if (data.user) {
        setUser(data.user);
      }

      return token;
    } catch {
      setAccessToken(null);
      setUser(null);

      return null;
    }
  }

  // ----------------------------------------
  // INITIAL SESSION CHECK
  // ----------------------------------------

  useEffect(() => {
    async function initializeAuth() {
      await refreshSession();
      setLoading(false);
    }

    initializeAuth();
  }, []);

  // ----------------------------------------
  // LOGIN
  // ----------------------------------------

  async function login(
    email: string,
    password: string
  ) {
    const data = await apiRequest(
      AUTH_ENDPOINTS.login,
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!data.accessToken) {
      throw new Error(
        "Login response does not contain accessToken"
      );
    }

    setAccessToken(data.accessToken);

    if (data.user) {
      setUser(data.user);
    }
  }

  // ----------------------------------------
  // SIGNUP
  // ----------------------------------------

  async function signup(
    name: string,
    email: string,
    password: string
  ) {
    const data = await apiRequest(
      AUTH_ENDPOINTS.signup,
      {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    return data;
  }

  // ----------------------------------------
  // LOGOUT
  // ----------------------------------------

  async function logout() {
    try {
      await apiRequest(
        AUTH_ENDPOINTS.logout,
        {
          method: "POST",
        }
      );
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}