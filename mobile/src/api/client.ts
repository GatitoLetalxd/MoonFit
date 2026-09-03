import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// URL del backend: En dispositivo físico usa la IP LAN de la PC o la variable de entorno.
export const BASE_API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.7:3000/api';

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para inyectar token de acceso
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@moonfit_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error leyendo token de AsyncStorage', error);
  }
  return config;
});

// Interceptor para refresco de token automático
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    // No interceptar rutas de login o registro para preservar el mensaje real de credenciales incorrectas
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('@moonfit_refresh_token');
        if (!refreshToken) {
          await AsyncStorage.multiRemove(['@moonfit_access_token', '@moonfit_refresh_token', '@moonfit_user']);
          processQueue(error, null);
          return Promise.reject(error);
        }

        const res = await axios.post(`${BASE_API_URL}/auth/refresh`, {
          refreshToken: refreshToken,
          refresh_token: refreshToken,
        });

        const refreshData = res.data?.data || res.data || {};
        const newAccessToken = refreshData.accessToken || refreshData.access_token;
        const newRefreshToken = refreshData.refreshToken || refreshData.refresh_token;

        if (newAccessToken) {
          await AsyncStorage.setItem('@moonfit_access_token', newAccessToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem('@moonfit_refresh_token', newRefreshToken);
          }
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await AsyncStorage.multiRemove(['@moonfit_access_token', '@moonfit_refresh_token', '@moonfit_user']);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
