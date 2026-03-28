import { Outlet, Link, useLocation } from 'react-router-dom'
import { User, MapPin, ShoppingBag, Heart, Star, Bell, Settings, RotateCcw, MessageCircle } from 'lucide-react'
import { TopBar } from './TopBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileMenu } from './MobileMenu'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'

const accountLinks = [
  { to: ROUTES.ACCOUNT_PROFILE, label: 'My Profile', icon: User },
  { to: ROUTES.ACCOUNT_ORDERS, label: 'My Orders', icon: ShoppingBag },
  { to: ROUTES.ACCOUNT_ADDRESSES, label: 'Addresses', icon: MapPin },
  { to: ROUTES.ACCOUNT_WISHLIST, label: 'Wishlist', icon: Heart },
  { to: ROUTES.ACCOUNT_REVIEWS, label: 'My Reviews', icon: Star },
  { to: ROUTES.ACCOUNT_RETURNS, label: 'Returns', icon: RotateCcw },
  { to: ROUTES.ACCOUNT_NOTIFICATIONS, label: 'Notifications', icon: Bell },
  { to: ROUTES.ACCOUNT_CHAT, label: 'Help & Support', icon: MessageCircle },
  { to: ROUTES.ACCOUNT_SETTINGS, label: 'Settings', icon: Settings },
]

export function AccountLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <MobileMenu />
      <main className="flex-1 bg-[#F8FAFC] py-8">
        <div className="container-main">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden md:block w-[240px] shrink-0">
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden sticky top-[76px] shadow-[var(--shadow-card)]">
                <div className="p-4 border-b border-[#E2E8F0]">
                  <h2 className="font-semibold text-[#0F172A]">My Account</h2>
                </div>
                <nav className="py-1">
                  {accountLinks.map((link) => {
                    const isActive = location.pathname === link.to || (link.to !== ROUTES.ACCOUNT_PROFILE && location.pathname.startsWith(link.to))
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-[#EEF2FF] text-[#6366F1] font-medium border-l-3 border-[#6366F1]'
                            : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
