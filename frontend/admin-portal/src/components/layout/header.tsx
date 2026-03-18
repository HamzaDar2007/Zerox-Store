import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, LogOut, Moon, Sun, User, Search, Command } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi, authApi } from '@/services/api'

export function Header() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [searchFocused, setSearchFocused] = useState(false)

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30000,
  })

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken
    try { if (refreshToken) await authApi.logout(refreshToken) } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 glass-header px-4 md:px-6">
      {/* Search Area */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className={`search-focus-ring relative flex items-center flex-1 rounded-lg border border-border/50 bg-muted/30 transition-all ${searchFocused ? 'bg-background shadow-sm' : ''}`}>
          <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent py-2 pl-9 pr-12 text-sm outline-none placeholder:text-muted-foreground/40"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="absolute right-2.5 hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground/50">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted/60">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted/60" onClick={() => navigate('/notifications')}>
          <Bell className="h-4 w-4" />
          {(unreadData?.count ?? 0) > 0 && (
            <span className="notification-dot absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-background">
              {unreadData!.count > 99 ? '99+' : unreadData!.count}
            </span>
          )}
        </Button>

        <div className="ml-1.5 h-6 w-px bg-border/40" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative ml-1 h-9 w-9 rounded-full ring-2 ring-border/40 hover:ring-primary/30 transition-all duration-200 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">{getInitials(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5">
            <DropdownMenuLabel className="font-normal px-2 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">{getInitials(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[11px] text-muted-foreground/70 truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-md px-2 py-1.5 cursor-pointer">
              <User className="mr-2 h-3.5 w-3.5" />
              <span className="text-[13px]">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="rounded-md px-2 py-1.5 text-destructive cursor-pointer focus:text-destructive">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span className="text-[13px]">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
