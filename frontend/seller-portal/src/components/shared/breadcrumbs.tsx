import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  products: 'Products',
  inventory: 'Inventory',
  orders: 'Orders',
  returns: 'Returns',
  earnings: 'Earnings',
  reviews: 'Reviews',
  chat: 'Messages',
  notifications: 'Notifications',
  settings: 'Settings',
  store: 'Store Settings',
  account: 'Account',
  onboarding: 'Setup',
  analytics: 'Analytics',
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mb-7">
      <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/')
        const label = routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        const isLast = i === segments.length - 1
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
            {isLast ? (
              <span className="font-semibold text-foreground text-[13px]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
