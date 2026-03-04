import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { UserRole } from '@/common/types/enums';
import { ROUTE_PREFIX } from '@/lib/constants';

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * Protects auth pages (login, register) from authenticated users.
 * Redirects authenticated users to their appropriate portal.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (isAuthenticated && user) {
    // If we have a redirect target from AuthGuard, go there
    const from = (location.state as { from?: Location })?.from?.pathname;
    if (from) {
      return <Navigate to={from} replace />;
    }

    // Otherwise redirect to the user's portal
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return <Navigate to={ROUTE_PREFIX.SUPER_ADMIN} replace />;
      case UserRole.ADMIN:
        return <Navigate to={ROUTE_PREFIX.ADMIN} replace />;
      case UserRole.SELLER:
        return <Navigate to={ROUTE_PREFIX.SELLER} replace />;
      default:
        return <Navigate to={ROUTE_PREFIX.CUSTOMER} replace />;
    }
  }

  return <>{children}</>;
}
