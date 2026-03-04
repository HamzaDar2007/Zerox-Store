import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Store,
  BarChart3,
  Settings,
  Shield,
  Menu,
  LogOut,
  ChevronLeft,
  Tag,
  FileText,
  Bell,
  MessageSquare,
  TicketCheck,
  CreditCard,
  Truck,
  Receipt,
  Megaphone,
  Warehouse,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { ScrollArea } from '@/common/components/ui/scroll-area';
import { Separator } from '@/common/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/common/components/ui/sheet';
import { useAppSelector, useAppDispatch, toggleSidebar } from '@/store';
import { useAuth } from '@/common/hooks/useAuth';
import { cn } from '@/lib/utils';

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Categories', icon: Tag, href: '/admin/categories' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Sellers', icon: Store, href: '/admin/sellers' },
  { label: 'Payments', icon: CreditCard, href: '/admin/payments' },
  { label: 'Shipping', icon: Truck, href: '/admin/shipping' },
  { label: 'Tax', icon: Receipt, href: '/admin/tax' },
  { label: 'Inventory', icon: Warehouse, href: '/admin/inventory' },
  { label: 'Bundles', icon: Package, href: '/admin/bundles' },
  { label: 'Disputes', icon: AlertTriangle, href: '/admin/disputes' },
  { label: 'Marketing', icon: Megaphone, href: '/admin/marketing' },
  { label: 'Reviews', icon: MessageSquare, href: '/admin/reviews' },
  { label: 'Tickets', icon: TicketCheck, href: '/admin/tickets' },
  { label: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { label: 'CMS', icon: FileText, href: '/admin/cms' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { label: 'Roles', icon: Shield, href: '/admin/roles' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

function SidebarContent() {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/admin" className="flex items-center gap-2 font-semibold text-primary">
          <Shield className="h-5 w-5" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {adminNav.map((item) => (
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

export default function AdminLayout() {
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
            <span className="text-sm text-muted-foreground">{user?.name}</span>
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
