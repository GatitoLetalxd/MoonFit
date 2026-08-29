import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi } from '../api/services';
import { setStoredTokens, clearStoredTokens, getStoredAccessToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginAsAdminShortcut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('moonfit_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('moonfit_user', JSON.stringify(res.data));
      }
    } catch (err) {
      clearStoredTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('moonfit_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('moonfit_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await authApi.login(email, pass);
    const { user: loggedUser, accessToken, refreshToken } = res.data;
    setStoredTokens(accessToken, refreshToken);
    setUser(loggedUser);
    localStorage.setItem('moonfit_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (data: any): Promise<User> => {
    const res = await authApi.register(data);
    const { user: registeredUser, accessToken, refreshToken } = res.data;
    setStoredTokens(accessToken, refreshToken);
    setUser(registeredUser);
    localStorage.setItem('moonfit_user', JSON.stringify(registeredUser));
    return registeredUser;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('moonfit_refresh_token') || undefined;
      await authApi.logout(refreshToken);
    } catch (err) {
      // Continue cleanup
    } finally {
      clearStoredTokens();
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  const loginAsAdminShortcut = async () => {
    await login('rogeeromontufar@gmail.com', 'password');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshProfile,
        loginAsAdminShortcut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
