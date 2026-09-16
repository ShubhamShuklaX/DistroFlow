import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const me = await api.getMe();
        setUser(me);
      } catch (err) {
        console.error('Failed to restore session:', err);
        clearAuthToken();
        // Default to Distributor owner for instant demo loading
        await switchRole('distributor');
      }
    } else {
      // Default to Distributor on first load for zero friction
      await switchRole('distributor');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setAuthToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.switchRole(targetRole);
      setAuthToken(res.token);
      setUser(res.user);
    } catch (error) {
      console.error('Role switch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.role as UserRole) || 'distributor',
        isLoading,
        login,
        switchRole,
        logout,
        refreshUser,
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
