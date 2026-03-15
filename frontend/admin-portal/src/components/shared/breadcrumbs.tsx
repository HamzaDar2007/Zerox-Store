import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  users: 'Users',
  roles: 'Roles',
  permissions: 'Permissions',
  categories: 'Categories',
  brands: 'Brands',
  sellers: 'Sellers',
  stores: 'Stores',
  products: 'Products',
  orders: 'Orders',
  payments: 'Payments',
  coupons: 'Coupons',
  'flash-sales': 'Flash Sales',
  inventory: 'Inventory',
  shipping: 'Shipping',
  subscriptions: 'Subscriptions',
  returns: 'Returns',
  reviews: 'Reviews',
  notifications: 'Notifications',
  chat: 'Chat',
  audit: 'Audit Logs',
  settings: 'Settings',
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
      <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/')
        const label = routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        const isLast = i === segments.length - 1
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
