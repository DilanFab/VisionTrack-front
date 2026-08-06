import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export const AUTH_SESSION_EXPIRED_EVENT = "visiontrack:auth-session-expired";

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const isAuthEndpoint = (url: string | undefined) => {
  if (!url) return false;
  return [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
  ].some((endpoint) => url.includes(endpoint));
};

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No hay refresh token almacenado");
  }

  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${API_BASE}/api/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );

  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data.accessToken;
};

const notifySessionExpired = () => {
  clearStoredAuth();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
};

// Interceptor to add Authorization header with JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken();
      const newAccessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      notifySessionExpired();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export default api;
