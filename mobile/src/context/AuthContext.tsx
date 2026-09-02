import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authApi } from '../api/services';
import { offlineStorage } from '../utils/offlineStorage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserLocal: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@moonfit_access_token');
      const savedUserStr = await AsyncStorage.getItem('@moonfit_user');

      if (token && savedUserStr) {
        setUser(JSON.parse(savedUserStr));
        // Intentar refrescar perfil actualizado en segundo plano
        try {
          const res = await authApi.getProfile();
          if (res.data) {
            setUser(res.data);
            await AsyncStorage.setItem('@moonfit_user', JSON.stringify(res.data));
          }
        } catch (e) {
          console.log('No se pudo refrescar perfil en inicio, usando cache');
        }
      }
    } catch (err) {
      console.error('Error cargando auth de AsyncStorage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data) {
      const data = res.data as any;
      const loggedUser = data.user;
      const token = data.accessToken || data.access_token;
      const refreshToken = data.refreshToken || data.refresh_token;

      if (token) {
        await AsyncStorage.setItem('@moonfit_access_token', token);
      }
      if (refreshToken) {
        await AsyncStorage.setItem('@moonfit_refresh_token', refreshToken);
      }
      if (loggedUser) {
        await AsyncStorage.setItem('@moonfit_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    if (res.data) {
      const data = res.data as any;
      const newUser = data.user;
      const token = data.accessToken || data.access_token;
      const refreshToken = data.refreshToken || data.refresh_token;

      if (token) {
        await AsyncStorage.setItem('@moonfit_access_token', token);
      }
      if (refreshToken) {
        await AsyncStorage.setItem('@moonfit_refresh_token', refreshToken);
      }
      if (newUser) {
        await AsyncStorage.setItem('@moonfit_user', JSON.stringify(newUser));
        setUser(newUser);
      }
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['@moonfit_access_token', '@moonfit_refresh_token', '@moonfit_user']);
    await offlineStorage.clearAllCache();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.data) {
        setUser(res.data);
        await AsyncStorage.setItem('@moonfit_user', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Error al refrescar perfil:', e);
    }
  };

  const updateUserLocal = (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      AsyncStorage.setItem('@moonfit_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
