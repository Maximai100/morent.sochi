import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password-based authentication
// In production, this should be replaced with proper JWT authentication
const MANAGER_PASSWORD = import.meta.env.VITE_MANAGER_PASSWORD || 'admin2024';
const AUTH_STORAGE_KEY = 'manager_auth_token';
const AUTH_EXPIRY_HOURS = 24; // Session expires after 24 hours

interface AuthData {
  token: string;
  expiry: number;
}

/**
 * Generate a simple auth token (in production, this should come from backend)
 */
const generateToken = (): string => {
  return btoa(`manager_${Date.now()}_${Math.random()}`);
};

/**
 * Check if auth data is valid
 */
const isAuthValid = (authData: AuthData | null): boolean => {
  if (!authData) return false;
  if (!authData.token || !authData.expiry) return false;
  if (Date.now() > authData.expiry) return false;
  return true;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = (): boolean => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) {
        setIsAuthenticated(false);
        return false;
      }

      const authData: AuthData = JSON.parse(stored);
      const valid = isAuthValid(authData);
      
      if (!valid) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
        return false;
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      logger.error('Failed to check authentication', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = (password: string): boolean => {
    try {
      // Simple password check (in production, this should be done on backend)
      if (password !== MANAGER_PASSWORD) {
        logger.warn('Failed login attempt');
        return false;
      }

      // Generate and store auth token
      const authData: AuthData = {
        token: generateToken(),
        expiry: Date.now() + (AUTH_EXPIRY_HOURS * 60 * 60 * 1000),
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      logger.info('Manager logged in successfully');
      
      return true;
    } catch (error) {
      logger.error('Login failed', error);
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthenticated(false);
      logger.info('Manager logged out');
      navigate('/');
    } catch (error) {
      logger.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
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