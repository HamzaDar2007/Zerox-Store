import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store/theme.store'
import { useAuthStore } from '@/store/auth.store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
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
  Sparkles,
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

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ],
  },
  {
    label: 'Access Control',
    items: [
      { label: 'Users', icon: Users, path: '/users', roles: ADMIN_ROLES },
      { label: 'Roles', icon: Shield, path: '/roles', roles: ADMIN_ROLES },
      { label: 'Permissions', icon: Key, path: '/permissions', roles: ADMIN_ROLES },
      { label: 'Role Permissions', icon: ShieldCheck, path: '/role-permissions', roles: ADMIN_ROLES },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Categories', icon: FolderTree, path: '/categories' },
      { label: 'Brands', icon: Tags, path: '/brands' },
      { label: 'Products', icon: Package, path: '/products' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Sellers', icon: UserCheck, path: '/sellers' },
      { label: 'Stores', icon: Store, path: '/stores' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Orders', icon: ShoppingCart, path: '/orders' },
      { label: 'Payments', icon: CreditCard, path: '/payments', roles: ADMIN_ROLES },
      { label: 'Coupons', icon: Ticket, path: '/coupons' },
      { label: 'Flash Sales', icon: Zap, path: '/flash-sales' },
      { label: 'Inventory', icon: Warehouse, path: '/inventory' },
      { label: 'Shipping', icon: Truck, path: '/shipping' },
      { label: 'Subscriptions', icon: Crown, path: '/subscriptions' },
      { label: 'Returns', icon: RefreshCw, path: '/returns', roles: MANAGEMENT_ROLES },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'Reviews', icon: Star, path: '/reviews' },
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Chat', icon: MessageSquare, path: '/chat' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Audit Logs', icon: FileText, path: '/audit', roles: ADMIN_ROLES },
      { label: 'Search Analytics', icon: Search, path: '/search-analytics', roles: ADMIN_ROLES },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const userRole = user?.role ?? user?.roles?.[0]?.role?.name ?? ''
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0)

  const renderNavItem = (item: NavItem) => {
    const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
    const link = (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
          isActive
            ? 'nav-active-indicator bg-primary/8 text-primary font-semibold'
            : 'text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground',
          sidebarCollapsed && 'justify-center px-2',
        )}
      >
        <item.icon className={cn(
          'h-[18px] w-[18px] shrink-0 transition-all duration-200',
          isActive ? 'text-primary drop-shadow-sm' : 'text-muted-foreground/60 group-hover:text-foreground',
        )} />
        {!sidebarCollapsed && (
          <span className="truncate transition-opacity duration-200">{item.label}</span>
        )}
        {isActive && !sidebarCollapsed && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
        )}
      </NavLink>
    )

    if (sidebarCollapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium text-xs">{item.label}</TooltipContent>
        </Tooltip>
      )
    }
    return link
  }

  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div className={cn(
        'flex h-16 items-center border-b border-border/40 px-4',
        sidebarCollapsed ? 'justify-center' : 'gap-3',
      )}>
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-accent text-primary-foreground shadow-md shadow-primary/20 transition-transform hover:scale-105">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold tracking-tight truncate">Admin Portal</span>
              <span className="text-[10px] text-muted-foreground/50 font-medium">Management Console</span>
            </div>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent text-primary-foreground shadow-md shadow-primary/20 transition-transform hover:scale-105">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-0.5 px-3">
          {visibleGroups.map((group, gi) => (
            <div key={group.label}>
              {!sidebarCollapsed && gi > 0 && (
                <div className="nav-group-label">{group.label}</div>
              )}
              {sidebarCollapsed && gi > 0 && (
                <div className="mx-3 my-2 h-px bg-border/50" />
              )}
              {group.items.map(renderNavItem)}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Section & Collapse Toggle */}
      <div className="border-t border-border/40 p-3 space-y-2">
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted/60">
            <Avatar className="h-8 w-8 ring-2 ring-primary/10">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                {getInitials(`${user.firstName ?? ''} ${user.lastName ?? ''}`)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold truncate">{user.firstName} {user.lastName}</span>
              <span className="text-[10px] text-muted-foreground/60 truncate capitalize">{userRole.replace(/_/g, ' ')}</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { toggleSidebar(); setMobileOpen(false) }}
          className={cn('w-full justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 rounded-lg', !sidebarCollapsed && 'justify-start gap-2 px-3')}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span className="text-xs">Collapse</span></>}
        </Button>
      </div>
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
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col sidebar-gradient border-r border-border/50 transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col sidebar-gradient border-r border-border/50 transition-all duration-300 md:flex',
          sidebarCollapsed ? 'w-16' : 'w-64',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
