import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getStoredAccessToken(): string | null {
  return localStorage.getItem('moonfit_access_token');
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem('moonfit_refresh_token');
}

export function setStoredTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('moonfit_access_token', accessToken);
  localStorage.setItem('moonfit_refresh_token', refreshToken);
}

export function clearStoredTokens(): void {
  localStorage.removeItem('moonfit_access_token');
  localStorage.removeItem('moonfit_refresh_token');
  localStorage.removeItem('moonfit_user');
}

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Refresh token on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do not attempt refresh on login or register or refresh itself
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearStoredTokens();
      window.dispatchEvent(new CustomEvent('moonfit_unauthorized'));
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
      setStoredTokens(newAccessToken, newRefreshToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      processQueue(null, newAccessToken);
      return apiClient(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      clearStoredTokens();
      window.dispatchEvent(new CustomEvent('moonfit_unauthorized'));
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
