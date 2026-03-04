import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Store,
  BarChart3,
  Settings,
  ShieldCheck,
  Menu,
  LogOut,
  ChevronLeft,
  Tag,
  FileText,
  Bell,
  MessageSquare,
  TicketCheck,
  Database,
  Globe,
  Wrench,
  Flag,
  ScrollText,
  Repeat,
  Trophy,
  KeyRound,
  UserCog,
} from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { ScrollArea } from '@/common/components/ui/scroll-area';
import { Separator } from '@/common/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/common/components/ui/sheet';
import { useAppSelector, useAppDispatch, toggleSidebar } from '@/store';
import { useAuth } from '@/common/hooks/useAuth';
import { cn } from '@/lib/utils';

const superAdminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/super-admin' },
  { label: 'Users', icon: Users, href: '/super-admin/users' },
  { label: 'Sellers', icon: Store, href: '/super-admin/sellers' },
  { label: 'Products', icon: Package, href: '/super-admin/products' },
  { label: 'Categories', icon: Tag, href: '/super-admin/categories' },
  { label: 'Orders', icon: ShoppingCart, href: '/super-admin/orders' },
  { label: 'Reviews', icon: MessageSquare, href: '/super-admin/reviews' },
  { label: 'Tickets', icon: TicketCheck, href: '/super-admin/tickets' },
  { label: 'Notifications', icon: Bell, href: '/super-admin/notifications' },
  { label: 'CMS', icon: FileText, href: '/super-admin/cms' },
  { label: 'i18n', icon: Globe, href: '/super-admin/i18n' },
  { label: 'SEO', icon: ScrollText, href: '/super-admin/seo' },
  { label: 'Roles', icon: ShieldCheck, href: '/super-admin/roles' },
  { label: 'Permissions', icon: KeyRound, href: '/super-admin/permissions' },
  { label: 'Role Assignments', icon: UserCog, href: '/super-admin/role-assignments' },
  { label: 'Feature Flags', icon: Flag, href: '/super-admin/feature-flags' },
  { label: 'Operations', icon: Wrench, href: '/super-admin/operations' },
  { label: 'Subscriptions', icon: Repeat, href: '/super-admin/subscriptions' },
  { label: 'Loyalty', icon: Trophy, href: '/super-admin/loyalty' },
  { label: 'Audit Logs', icon: Database, href: '/super-admin/audit' },
  { label: 'Analytics', icon: BarChart3, href: '/super-admin/analytics' },
  { label: 'Settings', icon: Settings, href: '/super-admin/settings' },
];

function SidebarContent() {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <Link
          to="/super-admin"
          className="flex items-center gap-2 font-semibold text-primary"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>Super Admin</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {superAdminNav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                location.pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden border-r bg-muted/40 transition-all duration-300 lg:block',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => dispatch(toggleSidebar())}
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform',
                !sidebarOpen && 'rotate-180',
              )}
            />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {user?.name}
            </span>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
