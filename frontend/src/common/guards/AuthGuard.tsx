import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated,
 * preserving the intended destination in location state.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
