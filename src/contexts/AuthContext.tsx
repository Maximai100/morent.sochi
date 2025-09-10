import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      // Small delay to ensure localStorage is accessible
      await new Promise(resolve => setTimeout(resolve, 100));
      checkAuth();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const checkAuth = (): boolean => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      logger.info('Checking authentication...', { hasStoredToken: !!stored });
      
      if (!stored) {
        logger.info('No stored authentication token found');
        setIsAuthenticated(false);
        return false;
      }

      const authData: AuthData = JSON.parse(stored);
      const valid = isAuthValid(authData);
      
      logger.info('Token validation result', { 
        isValid: valid, 
        expiryTime: new Date(authData.expiry).toISOString(),
        currentTime: new Date().toISOString()
      });
      
      if (!valid) {
        logger.warn('Authentication token expired or invalid, removing from storage');
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
        return false;
      }

      logger.info('Authentication successful, user is authenticated');
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      logger.error('Failed to check authentication', error);
      // Clear potentially corrupted data
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = (password: string): boolean => {
    try {
      // Simple password check (in production, this should be done on backend)
      if (password !== MANAGER_PASSWORD) {
        logger.warn('Failed login attempt - incorrect password');
        return false;
      }

      // Generate and store auth token
      const authData: AuthData = {
        token: generateToken(),
        expiry: Date.now() + (AUTH_EXPIRY_HOURS * 60 * 60 * 1000),
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      
      logger.info('Manager logged in successfully', {
        expiryTime: new Date(authData.expiry).toISOString(),
        tokenLength: authData.token.length
      });
      
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
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
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