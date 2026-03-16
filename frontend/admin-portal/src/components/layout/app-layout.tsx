import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { useThemeStore } from '@/store/theme.store'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { sidebarCollapsed } = useThemeStore()

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className={cn(
        'transition-all duration-300',
        /* Mobile: no left margin (sidebar is overlay). Desktop: margin based on collapse state */
        'ml-0 md:ml-16',
        !sidebarCollapsed && 'md:ml-64',
      )}>
        <Header />
        <main className="p-4 md:p-6 animate-fade-in">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
