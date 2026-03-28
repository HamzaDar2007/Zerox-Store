import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home, ShoppingBag, Heart, Bell, Settings, HelpCircle, LogOut, User, Flame, Tag } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { categoriesApi, authApi } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import { Separator } from '@/components/ui/separator'
import type { Category } from '@/types'

export function MobileMenu() {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const { isAuthenticated, user, refreshToken, logout } = useAuthStore()
  const location = useLocation()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname, setMobileMenuOpen])

  useEffect(() => {
    if (isMobileMenuOpen && categories.length === 0) {
      categoriesApi.list().then((cats) => setCategories(cats.filter((c) => c.isActive && !c.parentId).slice(0, 12))).catch(() => {})
    }
  }, [isMobileMenuOpen, categories.length])

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* ignore */ }
    }
    logout()
    setMobileMenuOpen(false)
  }

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-[300px] p-0">
        {/* User Header */}
        <div className="bg-[#232F3E] text-white p-4 pt-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#F57224] rounded-full flex items-center justify-center font-bold">
              {isAuthenticated ? (user?.firstName?.charAt(0) ?? 'U') : <User className="h-5 w-5" />}
            </div>
            <div>
              {isAuthenticated ? (
                <p className="font-semibold">Hello, {user?.firstName}</p>
              ) : (
                <Link to={ROUTES.LOGIN} className="font-semibold hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-80px)]">
          {/* Main Links */}
          <div className="p-2">
            <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" onClose={() => setMobileMenuOpen(false)} />
            <NavItem to="/flash-sales" icon={<Flame className="h-5 w-5 text-[#F57224]" />} label="Flash Sales" onClose={() => setMobileMenuOpen(false)} />
            <NavItem to="/products" icon={<Tag className="h-5 w-5" />} label="All Products" onClose={() => setMobileMenuOpen(false)} />
          </div>

          <Separator />

          {/* Categories */}
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-bold text-[#565959] uppercase">Shop by Category</p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="flex items-center justify-between px-3 py-2.5 text-sm text-[#0F1111] hover:bg-[#F0F2F2] rounded-[4px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{cat.name}</span>
                <ChevronRight className="h-4 w-4 text-[#8D9096]" />
              </Link>
            ))}
          </div>

          <Separator />

          {/* Account */}
          {isAuthenticated && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-bold text-[#565959] uppercase">Your Account</p>
              <NavItem to={ROUTES.ACCOUNT_ORDERS} icon={<ShoppingBag className="h-5 w-5" />} label="My Orders" onClose={() => setMobileMenuOpen(false)} />
              <NavItem to={ROUTES.ACCOUNT_WISHLIST} icon={<Heart className="h-5 w-5" />} label="Wishlist" onClose={() => setMobileMenuOpen(false)} />
              <NavItem to={ROUTES.ACCOUNT_NOTIFICATIONS} icon={<Bell className="h-5 w-5" />} label="Notifications" onClose={() => setMobileMenuOpen(false)} />
              <NavItem to={ROUTES.ACCOUNT_SETTINGS} icon={<Settings className="h-5 w-5" />} label="Settings" onClose={() => setMobileMenuOpen(false)} />
              <NavItem to={ROUTES.ACCOUNT_CHAT} icon={<HelpCircle className="h-5 w-5" />} label="Help & Support" onClose={() => setMobileMenuOpen(false)} />
            </div>
          )}

          <Separator />

          {isAuthenticated && (
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[#B12704] hover:bg-[#FFF5F5] rounded-[4px] cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NavItem({ to, icon, label, onClose }: { to: string; icon: React.ReactNode; label: string; onClose: () => void }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#0F1111] hover:bg-[#F0F2F2] rounded-[4px]"
      onClick={onClose}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
