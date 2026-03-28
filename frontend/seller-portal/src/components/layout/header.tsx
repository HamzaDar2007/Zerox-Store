import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sun, Moon, Bell, LogOut, User, Store, Search, Command } from 'lucide-react'
import { useThemeStore } from '@/store/theme.store'
import { useAuthStore } from '@/store/auth.store'
import { notificationsApi, authApi } from '@/services/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'

export function Header() {
  const navigate = useNavigate()
  const { user, refreshToken, logout: clearAuth } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [searchFocused, setSearchFocused] = useState(false)

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30000,
  })

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* ignore */ }
    }
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/30 glass-header px-4 md:px-6">
      {/* Search Area */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className={`search-focus-ring relative flex items-center flex-1 rounded-xl border border-border/40 bg-muted/25 transition-all ${searchFocused ? 'bg-background shadow-sm' : ''}`}>
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent py-2.5 pl-10 pr-14 text-sm outline-none placeholder:text-muted-foreground/35"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                navigate(`/products?search=${encodeURIComponent(e.currentTarget.value.trim())}`)
                e.currentTarget.value = ''
              }
            }}
          />
          <kbd className="absolute right-3 hidden sm:inline-flex h-5 items-center gap-0.5 rounded-md border border-border/50 bg-muted/40 px-1.5 text-[10px] font-medium text-muted-foreground/40">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all duration-200">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all duration-200" onClick={() => navigate('/notifications')}>
          <Bell className="h-4 w-4" />
          {((unreadData as { count?: number })?.count ?? 0) > 0 && (
            <span className="notification-dot absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-background">
              {(unreadData as { count?: number })?.count && (unreadData as { count?: number }).count > 99 ? '99+' : (unreadData as { count?: number })?.count}
            </span>
          )}
        </Button>

        <div className="ml-2 mr-1 h-7 w-px bg-border/30" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative ml-1 h-9 w-9 rounded-full ring-2 ring-border/30 hover:ring-primary/25 transition-all duration-200 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">{getInitials(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl shadow-xl shadow-foreground/5 border-border/50">
            <DropdownMenuLabel className="font-normal px-2 py-2.5">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">{getInitials(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[11px] text-muted-foreground/60 truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem onClick={() => navigate('/settings/account')} className="rounded-lg px-2.5 py-2 cursor-pointer">
              <User className="mr-2.5 h-4 w-4 text-muted-foreground/70" />
              <span className="text-[13px]">Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/store')} className="rounded-lg px-2.5 py-2 cursor-pointer">
              <Store className="mr-2.5 h-4 w-4 text-muted-foreground/70" />
              <span className="text-[13px]">Store Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-lg px-2.5 py-2 text-destructive cursor-pointer focus:text-destructive">
              <LogOut className="mr-2.5 h-4 w-4" />
              <span className="text-[13px]">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
