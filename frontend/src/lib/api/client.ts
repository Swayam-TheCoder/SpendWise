import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type AuthConfig = {
  getAccessToken: () => string | null;
  setAuth: (accessToken: string, user?: any) => void;
  clearAuth: () => void;
  refresh: () => Promise<boolean>;
};

let authConfig: AuthConfig | null = null;

export function configureApiAuth(config: AuthConfig) {
  authConfig = config;
}

/**
 * Attach access token to protected requests.
 */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authConfig?.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Refresh access token automatically when it expires.
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Never refresh the refresh request itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      authConfig?.clearAuth();
      return Promise.reject(error);
    }

    // Don't retry the same request more than once
    if (originalRequest._retry) {
      authConfig?.clearAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!authConfig) {
        return Promise.reject(error);
      }

      /**
       * IMPORTANT:
       * Use Zustand's shared refresh function.
       *
       * This prevents multiple refresh requests
       * from rotating the same refresh token.
       */
      const refreshed = await authConfig.refresh();

      if (!refreshed) {
        authConfig.clearAuth();
        return Promise.reject(error);
      }

      const newAccessToken = authConfig.getAccessToken();

      if (!newAccessToken) {
        authConfig.clearAuth();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);

    } catch {
      authConfig?.clearAuth();
      return Promise.reject(error);
    }
  },
);

export default apiClient;
