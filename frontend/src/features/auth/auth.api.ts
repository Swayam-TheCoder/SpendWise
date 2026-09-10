import apiClient from "@/lib/api/client";

import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  SignupResponse,
} from "./auth.types";

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);

    return response.data;
  },

  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await apiClient.post<SignupResponse>("/auth/signup", data);

    return response.data;
  },

  async refresh() {
    const response = await apiClient.post("/auth/refresh");
    return response.data;
  },

  async logout() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  async getSessions() {
    const response = await apiClient.get("/auth/sessions");
    return response.data;
  },

  async revokeSession(sessionId: string) {
    const response = await apiClient.delete(`/auth/sessions/${sessionId}`);

    return response.data;
  },

  async logoutAll() {
    const response = await apiClient.post("/auth/logout-all");
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post("/auth/forgot-password", { email });

    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });

    return response.data;
  },

  googleLogin() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },

  async deleteAccount() {
    const response = await apiClient.delete("/auth/account");

    return response.data;
  },
};
