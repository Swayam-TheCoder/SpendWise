export type AuthProvider = "LOCAL" | "GOOGLE";

export interface User {
  id: string;
  name: string;
  email: string;
  authProvider: AuthProvider;
  isEmailVerified: boolean;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}