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
      <main className="flex-1 bg-[#F3F3F3] py-6">
        <div className="container-main">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="hidden md:block w-[240px] shrink-0">
              <div className="bg-white rounded-[4px] border border-[#DDD] overflow-hidden sticky top-[76px]">
                <div className="p-4 bg-[#F57224] text-white">
                  <h2 className="font-bold">My Account</h2>
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
                            ? 'bg-[#FFF3EC] text-[#F57224] font-semibold border-l-3 border-[#F57224]'
                            : 'text-[#0F1111] hover:bg-[#F0F2F2]',
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
