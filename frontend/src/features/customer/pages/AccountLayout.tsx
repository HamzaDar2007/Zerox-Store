import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/common/hooks/useAuth';
import { UserAvatar } from '@/common/components/UserAvatar';
import { Button } from '@/common/components/ui/button';
import { cn } from '@/lib/utils';
import { UserRole } from '@/common/types/enums';
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  MessageSquare,
  LogOut,
  Bell,
  RotateCcw,
  CreditCard,
  Repeat,
  Trophy,
  AlertTriangle,
  Star,
  ShieldCheck,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

const accountNav = [
  { label: 'Profile', icon: User, href: '/account' },
  { label: 'My Orders', icon: ShoppingBag, href: '/account/orders' },
  { label: 'My Reviews', icon: Star, href: '/account/reviews' },
  { label: 'Addresses', icon: MapPin, href: '/account/addresses' },
  { label: 'Wishlist', icon: Heart, href: '/account/wishlist' },
  { label: 'Returns', icon: RotateCcw, href: '/account/returns' },
  { label: 'Subscriptions', icon: Repeat, href: '/account/subscriptions' },
  { label: 'Loyalty', icon: Trophy, href: '/account/loyalty' },
  { label: 'Payment Methods', icon: CreditCard, href: '/account/payment-methods' },
  { label: 'Disputes', icon: AlertTriangle, href: '/account/disputes' },
  { label: 'Chat', icon: MessageSquare, href: '/account/chat' },
  { label: 'Notifications', icon: Bell, href: '/account/notifications' },
  { label: 'Support', icon: MessageSquare, href: '/account/tickets' },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isSeller = user?.role === UserRole.SELLER;

  return (
    <div className="grid gap-8 lg:grid-cols-4">
      {/* Sidebar */}
      <aside className="space-y-6">
        {user && (
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <UserAvatar name={user.name} image={user.profileImage} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}

        {/* Portal Links */}
        {(isAdmin || isSuperAdmin || isSeller) && (
          <div className="space-y-1 rounded-lg border p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Portals</p>
            {isSeller && (
              <Link
                to="/seller"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4" />
                Seller Portal
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                Admin Portal
              </Link>
            )}
            {isSuperAdmin && (
              <Link
                to="/super-admin"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
              >
                <ShieldCheck className="h-4 w-4" />
                Super Admin Portal
              </Link>
            )}
          </div>
        )}

        <nav className="flex flex-col gap-1">
          {accountNav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                location.pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="mt-2 justify-start gap-3 px-3 text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </aside>

      {/* Page Content */}
      <div className="lg:col-span-3">
        <Outlet />
      </div>
    </div>
  );
}
