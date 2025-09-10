import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Loading component for auth check
const AuthLoader = () => (
  <div className="min-h-screen bg-gradient-wave flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Проверка авторизации...</p>
    </div>
  </div>
);

/**
 * Protected route wrapper that requires authentication
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Re-check auth on route change (only if not loading)
    if (!isLoading) {
      checkAuth();
    }
  }, [location.pathname, isLoading, checkAuth]);

  // Show loading while checking authentication
  if (isLoading) {
    return <AuthLoader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};