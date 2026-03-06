import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { UserRole } from '@/common/types/enums';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Roles that are allowed to access this route */
  allowedRoles: UserRole[];
  /** Where to redirect if user lacks the required role (default: /) */
  fallback?: string;
}

/**
 * Restricts access to users with specific roles.
 * Should be nested inside AuthGuard (assumes user is authenticated).
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback = '/',
}: RoleGuardProps) {
  const { user } = useAppSelector((state) => state.auth);

  // Super admin bypasses all role checks (mirrors backend RolesGuard behavior)
  if (user?.role === UserRole.SUPER_ADMIN) {
    return <>{children}</>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
