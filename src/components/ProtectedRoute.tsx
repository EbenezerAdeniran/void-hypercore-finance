import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen void-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="hypercore-glow w-12 h-12 rounded-full border-2 border-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading HYPERCORE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};