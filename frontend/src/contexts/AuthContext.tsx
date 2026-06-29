import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('calaminas_token');
      const storedUser = localStorage.getItem('calaminas_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Fetch fresh user profile in background
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('calaminas_user', JSON.stringify(res.data.data));
        } catch (err) {
          // Token is invalid, API interceptor handles clear
          console.error("Failed to load user session", err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, token: tokenString } = res.data;
      
      setToken(tokenString);
      setUser(userData);
      
      localStorage.setItem('calaminas_token', tokenString);
      localStorage.setItem('calaminas_user', JSON.stringify(userData));
    } catch (err) {
      setLoading(false);
      throw err;
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn("Logout request failed on server", err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('calaminas_token');
      localStorage.removeItem('calaminas_user');
      setLoading(false);
    }
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  const hasPermission = (permission: string) => {
    if (user?.roles.includes('Administrador')) return true; // Admin bypass
    return user?.permissions.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
