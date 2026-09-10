import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

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
};

let authConfig: AuthConfig | null = null;

let refreshPromise: Promise<string | null> | null = null;

export function configureApiAuth(config: AuthConfig) {
  authConfig = config;
}

/**
 * Attach access token to protected requests.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authConfig?.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
);

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

    /**
     * Never try to refresh the refresh request itself.
     */
    if (originalRequest.url?.includes("/auth/refresh")) {
      authConfig?.clearAuth();
      return Promise.reject(error);
    }

    /**
     * Don't retry the same request more than once.
     */
    if (originalRequest._retry) {
      authConfig?.clearAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      /**
       * If another request is already refreshing,
       * wait for that refresh instead of sending another one.
       */
      if (!refreshPromise) {
        refreshPromise = apiClient
          .post("/auth/refresh")
          .then((response) => {
            const accessToken = response.data?.accessToken;
            const user = response.data?.user;

            if (!accessToken) {
              throw new Error("Unable to refresh access token");
            }

            authConfig?.setAuth(accessToken, user);

            return accessToken;
          })
          .catch(() => {
            authConfig?.clearAuth();
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
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