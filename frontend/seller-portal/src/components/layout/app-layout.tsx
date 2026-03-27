import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { useThemeStore } from '@/store/theme.store'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const sidebarCollapsed = useThemeStore((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-muted/15">
      <Sidebar />
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        'ml-0 md:ml-16',
        !sidebarCollapsed && 'md:ml-64',
      )}>
        <Header />
        <main className="p-4 md:p-6 lg:p-8 page-enter">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
