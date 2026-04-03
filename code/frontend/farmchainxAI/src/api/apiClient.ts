/**
 * apiClient.ts
 *
 * Central Axios instance for FarmChainX.
 * Configured to work with Spring Boot backend at http://localhost:8080/
 *
 * Features:
 * - JWT token management (access & refresh)
 * - Automatic token refresh on 401 responses
 * - Request/response interceptors
 * - Graceful token expiration handling
 *
 * Token storage keys live here so every other module can import them
 * instead of hard-coding strings.
 *
 * Refresh flow:
 *  1. Any 401 response queues its original request.
 *  2. A single /auth/refresh call is fired.
 *  3. On success, all queued requests are retried with the new token.
 *  4. On failure (refresh expired), the user is redirected to /login.
 */

import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

// ── Storage keys ─────────────────────────────────────────────────────────────
export const TOKEN_KEY = "accessToken";
export const REFRESH_KEY = "refreshToken";
export const USER_KEY = "user";

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return (
    localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY)
  );
}

export function setTokens(
  accessToken: string,
  refreshToken: string,
  persist: boolean
): void {
  const store = persist ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, accessToken);
  store.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(REFRESH_KEY);
    s.removeItem(USER_KEY);
  });
}

// ── Axios instance ────────────────────────────────────────────────────────────
// In production, require an explicit base URL to avoid accidental localhost calls.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8080/api/v1" : "");

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required in production");
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor — silent token refresh on 401 ───────────────────────
let isRefreshing = false;
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
const failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue.length = 0;
}

type RefreshResponseShape = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  accessToken?: string;
  refreshToken?: string;
};

function extractTokensFromRefreshResponse(payload: RefreshResponseShape): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = payload.data?.accessToken ?? payload.accessToken;
  const refreshToken = payload.data?.refreshToken ?? payload.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error("Refresh response did not include access/refresh tokens");
  }

  return { accessToken, refreshToken };
}

async function performRefresh(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const refreshEndpoint =
    import.meta.env.VITE_AUTH_REFRESH_ENDPOINT || "/auth/refresh";
  const refreshUrl = `${BASE_URL}${refreshEndpoint}`;

  const commonHeaders = {
    Authorization: `Bearer ${refreshToken}`,
    "X-Refresh-Token": refreshToken,
  };

  try {
    const { data } = await axios.post<RefreshResponseShape>(
      refreshUrl,
      { refreshToken },
      { headers: commonHeaders }
    );
    return extractTokensFromRefreshResponse(data);
  } catch {
    // Fallback payload key used by some backends
    const { data } = await axios.post<RefreshResponseShape>(
      refreshUrl,
      { token: refreshToken },
      { headers: commonHeaders }
    );
    return extractTokensFromRefreshResponse(data);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Do not intercept 401s for authentication routes (login, register, etc.)
    if (originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue subsequent 401s while a refresh is in-flight
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await performRefresh(refresh);

      const persist = !!localStorage.getItem(REFRESH_KEY);
      setTokens(newAccessToken, newRefreshToken, persist);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
