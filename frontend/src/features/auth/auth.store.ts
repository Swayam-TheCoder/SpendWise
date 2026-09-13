import { create } from "zustand";

import { authApi } from "./auth.api";
import type { SignupResponse, User } from "./auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthChecked: boolean;

  login: (email: string, password: string) => Promise<void>;

  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<SignupResponse>;

  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  clearAuth: () => void;
  setAuth: (accessToken: string, user?: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // =========================
  // INITIAL STATE
  // =========================

  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthChecked: false,

  // =========================
  // LOGIN
  // =========================

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const response = await authApi.login({
        email,
        password,
      });

      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // =========================
  // SIGNUP
  // =========================

  signup: async (name, email, password) => {
    set({ isLoading: true });

    try {
      const response = await authApi.signup({
        name,
        email,
        password,
      });

      return response;
    } finally {
      set({ isLoading: false });
    }
  },

  // =========================
  // REFRESH SESSION
  // =========================

  refresh: async () => {
  try {
    const response = await authApi.refresh();

    if (!response?.accessToken) {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });

      return false;
    }

    set({
      accessToken: response.accessToken,
      user: response.user ?? null,
      isAuthenticated: true,
    });

    return true;
  } catch {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    return false;
  } finally {
    set({
      isAuthChecked: true,
    });
  }
},

  // =========================
  // LOGOUT CURRENT SESSION
  // =========================

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  // =========================
  // LOGOUT ALL SESSIONS
  // =========================

  logoutAll: async () => {
    try {
      await authApi.logoutAll();
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  setAuth: (accessToken, user = null) => {
    set({
      accessToken,
      user,
      isAuthenticated: true,
    });
  },

  // =========================
  // CLEAR LOCAL AUTH STATE
  // =========================

  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  
}));
