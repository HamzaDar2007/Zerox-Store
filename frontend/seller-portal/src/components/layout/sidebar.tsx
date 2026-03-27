import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RotateCcw,
  DollarSign,
  Star,
  MessageSquare,
  Bell,
  Store,
  Settings,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Repeat,
  BarChart3,
  Sparkles,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store/theme.store'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import { useAuthStore } from '@/store/auth.store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/inventory', icon: Boxes, label: 'Inventory' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/returns', icon: RotateCcw, label: 'Returns' },
      { to: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/earnings', icon: DollarSign, label: 'Earnings' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/reviews', icon: Star, label: 'Reviews' },
      { to: '/chat', icon: MessageSquare, label: 'Messages' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/settings/store', icon: Store, label: 'Store Settings' },
      { to: '/settings/account', icon: Settings, label: 'Account' },
    ],
  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore()
  const location = useLocation()
  const { store } = useSellerProfile()
  const user = useAuthStore((s) => s.user)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'S'

  const renderNavItem = (item: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) => {
    const isActive = item.to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.to)
    const link = (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
          isActive
            ? 'nav-active-indicator bg-primary/8 text-primary font-semibold shadow-sm shadow-primary/5'
            : 'text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground',
          sidebarCollapsed && 'justify-center px-2',
        )}
      >
        <item.icon className={cn(
          'h-[18px] w-[18px] shrink-0 transition-all duration-200',
          isActive ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-foreground/70',
        )} />
        {!sidebarCollapsed && (
          <span className="truncate transition-opacity duration-200">{item.label}</span>
        )}
        {isActive && !sidebarCollapsed && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/50 animate-scale-in" />
        )}
      </NavLink>
    )

    if (sidebarCollapsed) {
      return (
        <Tooltip key={item.to} delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium text-xs">{item.label}</TooltipContent>
        </Tooltip>
      )
    }
    return link
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className={cn(
        'flex h-16 items-center border-b border-border/30 px-4',
        sidebarCollapsed ? 'justify-center' : 'gap-3',
      )}>
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-accent text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>{store?.name ?? 'Seller Portal'}</span>
              <span className="text-[10px] text-muted-foreground/40 font-medium tracking-wide uppercase">Seller Dashboard</span>
            </div>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-0.5 px-3">
          {navGroups.map((group, gi) => (
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
      <div className="border-t border-border/30 p-3 space-y-2">
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/30 px-3 py-2.5 transition-all duration-200 hover:bg-muted/50 border border-border/30">
            <Avatar className="h-8 w-8 ring-2 ring-primary/15">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold truncate">{user.firstName} {user.lastName}</span>
              <span className="text-[10px] text-muted-foreground/50 truncate">{user.email}</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { toggleSidebar(); setMobileOpen(false) }}
          className={cn('w-full justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/40 rounded-xl h-9', !sidebarCollapsed && 'justify-start gap-2 px-3')}
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
