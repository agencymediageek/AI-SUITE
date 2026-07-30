import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/lib/auth';
import { useGetMe } from '@workspace/api-client-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({ query: { enabled: isAuthenticated } });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (!isLoading && user && requireAdmin && user.role !== 'admin') {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, requireAdmin, setLocation]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary font-mono">Initializing APEX CORE...</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
