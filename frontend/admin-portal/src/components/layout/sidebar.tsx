import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store/theme.store'
import { useAuthStore } from '@/store/auth.store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Users,
  Shield,
  ShieldCheck,
  Key,
  FolderTree,
  Tags,
  Store,
  UserCheck,
  Package,
  ShoppingCart,
  CreditCard,
  Ticket,
  Zap,
  Warehouse,
  Truck,
  RefreshCw,
  Star,
  Bell,
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Crown,
  Menu,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const ADMIN_ROLES = ['super_admin', 'admin']
const MANAGEMENT_ROLES = ['super_admin', 'admin', 'support_agent']

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Users', icon: Users, path: '/users', roles: ADMIN_ROLES },
  { label: 'Roles', icon: Shield, path: '/roles', roles: ADMIN_ROLES },
  { label: 'Permissions', icon: Key, path: '/permissions', roles: ADMIN_ROLES },
  { label: 'Role Permissions', icon: ShieldCheck, path: '/role-permissions', roles: ADMIN_ROLES },
  { label: 'Categories', icon: FolderTree, path: '/categories' },
  { label: 'Brands', icon: Tags, path: '/brands' },
  { label: 'Sellers', icon: UserCheck, path: '/sellers' },
  { label: 'Stores', icon: Store, path: '/stores' },
  { label: 'Products', icon: Package, path: '/products' },
  { label: 'Orders', icon: ShoppingCart, path: '/orders' },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ADMIN_ROLES },
  { label: 'Coupons', icon: Ticket, path: '/coupons' },
  { label: 'Flash Sales', icon: Zap, path: '/flash-sales' },
  { label: 'Inventory', icon: Warehouse, path: '/inventory' },
  { label: 'Shipping', icon: Truck, path: '/shipping' },
  { label: 'Subscriptions', icon: Crown, path: '/subscriptions' },
  { label: 'Returns', icon: RefreshCw, path: '/returns', roles: MANAGEMENT_ROLES },
  { label: 'Reviews', icon: Star, path: '/reviews' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Chat', icon: MessageSquare, path: '/chat' },
  { label: 'Audit Logs', icon: FileText, path: '/audit', roles: ADMIN_ROLES },
  { label: 'Search Analytics', icon: Search, path: '/search-analytics', roles: ADMIN_ROLES },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const userRole = user?.role ?? user?.roles?.[0]?.role?.name ?? ''
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <span className="text-lg font-bold text-primary">Admin Portal</span>
        )}
        <Button variant="ghost" size="icon" onClick={() => { toggleSidebar(); setMobileOpen(false) }} className="ml-auto">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {visibleItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            const link = (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  sidebarCollapsed && 'justify-center px-2',
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0 transition-transform duration-200', isActive && 'scale-110')} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            )

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return link
          })}
        </nav>
      </ScrollArea>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-3 top-3.5 z-50 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r bg-card transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r bg-card transition-all duration-300 md:flex',
          sidebarCollapsed ? 'w-16' : 'w-64',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
