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
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <Header />
        <main className="p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
