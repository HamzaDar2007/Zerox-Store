import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { UserRole } from '@/common/types/enums';

interface SellerGuardProps {
  children: React.ReactNode;
}

/**
 * Restricts access to sellers only.
 * Also allows super_admin (who can impersonate any role).
 */
export function SellerGuard({ children }: SellerGuardProps) {
  const { user } = useAppSelector((state) => state.auth);

  if (!user || (user.role !== UserRole.SELLER && user.role !== UserRole.SUPER_ADMIN)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
