import { useState, useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Search, Heart, ShoppingCart, User, LogOut,
  ShieldCheck, LayoutDashboard, Settings, Menu, Sun, Moon,
  Monitor, MapPin, ChevronDown, Package, Headphones, HelpCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/common/components/ui/sheet';
import { Separator } from '@/common/components/ui/separator';
import { Button } from '@/common/components/ui/button';
import { useAppSelector } from '@/store';
import { useAuth } from '@/common/hooks/useAuth';
import { useCartSync } from '@/common/hooks/useCartSync';
import { useTheme } from '@/common/hooks/useTheme';
import { UserRole } from '@/common/types/enums';
import { APP_NAME } from '@/lib/constants';

const NAV_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: "Today's Deals", href: '/products?sortBy=price_asc' },
  { label: 'New Arrivals', href: '/products?sortBy=createdAt&sortOrder=DESC' },
  { label: 'Best Sellers', href: '/products?sortBy=avgRating&sortOrder=DESC' },
];

const FOOTER_SECTIONS = [
  {
    title: 'Get to Know Us',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press Releases', href: '/press' },
    ],
  },
  {
    title: 'Make Money with Us',
    links: [
      { label: 'Sell on LabVerse', href: '/seller' },
      { label: 'Become an Affiliate', href: '/affiliate' },
      { label: 'Advertise Your Products', href: '/advertise' },
    ],
  },
  {
    title: 'Let Us Help You',
    links: [
      { label: 'Your Account', href: '/account' },
      { label: 'Your Orders', href: '/account/orders' },
      { label: 'Shipping & Delivery', href: '/shipping-info' },
      { label: 'Returns & Replacements', href: '/returns-info' },
      { label: 'Help', href: '/help' },
    ],
  },
];

/**
 * Amazon-inspired customer storefront layout.
 * Features: navy header band, search bar, nav bar, dark mode toggle, responsive.
 */
export default function CustomerLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { user, logout } = useAuth();
  const { cartCount } = useCartSync();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isSeller = user?.role === UserRole.SELLER;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, navigate],
  );

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'system' ? Monitor : Sun;
  const nextThemeLabel = theme === 'light' ? 'Dark' : theme === 'dark' ? 'System' : 'Light';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ═══ TOP HEADER BAR (Navy) ═══ */}
      <header className="sticky top-0 z-50" role="banner">
        {/* Primary Bar */}
        <div className="bg-[hsl(var(--header-bg))] text-[hsl(var(--header-fg))]">
          <div className="container flex h-14 items-center gap-3 px-4 lg:px-6">
            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-[hsl(var(--header-fg))] hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-[hsl(var(--header-bg))] text-[hsl(var(--header-fg))] border-none p-0">
                <MobileMenu
                  user={user}
                  isAuthenticated={isAuthenticated}
                  isAdmin={isAdmin}
                  isSuperAdmin={isSuperAdmin}
                  isSeller={isSeller}
                  onClose={() => setMobileMenuOpen(false)}
                  logout={logout}
                />
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="h-7 w-7 text-[hsl(var(--amazon-orange))]" />
              <span className="text-xl font-bold tracking-tight hidden sm:inline">
                {APP_NAME}
              </span>
            </Link>

            {/* Delivery Location */}
            <button
              className="hidden lg:flex items-center gap-1 text-xs hover:outline hover:outline-1 hover:outline-white/40 rounded px-2 py-1 transition-all shrink-0"
              onClick={() => navigate('/account/addresses')}
            >
              <MapPin className="h-4 w-4 text-[hsl(var(--header-fg))]" />
              <div className="flex flex-col items-start">
                <span className="text-[hsl(var(--header-fg))]/70 leading-none">Deliver to</span>
                <span className="font-bold leading-tight">Pakistan</span>
              </div>
            </button>

            {/* ── Search Bar ── */}
            <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden md:flex">
              <div className="flex w-full rounded-md overflow-hidden shadow-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search LabVerse..."
                  className="flex-1 px-4 py-2 text-sm text-foreground bg-white dark:bg-gray-100 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--amazon-orange))] placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="px-4 bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-[hsl(var(--navy))]" />
                </button>
              </div>
            </form>

            {/* ── Right Nav Actions ── */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={() =>
                  setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
                }
                className="flex items-center gap-1 text-xs hover:outline hover:outline-1 hover:outline-white/40 rounded px-2 py-1 transition-all"
                title={`Switch to ${nextThemeLabel} mode`}
              >
                <ThemeIcon className="h-4 w-4" />
                <span className="hidden lg:inline text-xs">{theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>

              {/* Account/Sign In */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-start text-xs hover:outline hover:outline-1 hover:outline-white/40 rounded px-2 py-1 transition-all">
                      <span className="text-[hsl(var(--header-fg))]/70 leading-none text-[10px]">
                        Hello, {user?.name?.split(' ')[0] ?? 'User'}
                      </span>
                      <span className="font-bold flex items-center gap-0.5 leading-tight">
                        Account <ChevronDown className="h-3 w-3" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{user?.name ?? 'User'}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/account/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/account/wishlist')}>
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>
                    {isSeller && (
                      <DropdownMenuItem onClick={() => navigate('/seller')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Seller Portal
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Portal
                      </DropdownMenuItem>
                    )}
                    {isSuperAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/super-admin')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Super Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <button className="flex flex-col items-start text-xs hover:outline hover:outline-1 hover:outline-white/40 rounded px-2 py-1 transition-all">
                    <span className="text-[hsl(var(--header-fg))]/70 leading-none text-[10px]">Hello, sign in</span>
                    <span className="font-bold leading-tight">Account</span>
                  </button>
                </Link>
              )}

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className="hidden sm:flex items-center hover:outline hover:outline-1 hover:outline-white/40 rounded px-2 py-1 transition-all"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white/40 rounded px-2 py-1 transition-all relative"
              >
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--amazon-orange))] text-[10px] font-bold text-[hsl(var(--navy))]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold">Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Mobile Search (visible on small screens) ── */}
        <div className="md:hidden bg-[hsl(var(--header-bg))] px-4 pb-2">
          <form onSubmit={handleSearch} className="flex rounded-md overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search LabVerse..."
              className="flex-1 px-3 py-2 text-sm text-foreground bg-white dark:bg-gray-100 dark:text-gray-900 focus:outline-none placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="px-3 bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-[hsl(var(--navy))]" />
            </button>
          </form>
        </div>

        {/* ═══ SUB-NAVIGATION BAR ═══ */}
        <nav className="hidden lg:block bg-[hsl(var(--subheader-bg))] text-[hsl(var(--subheader-fg))]">
          <div className="container flex items-center gap-1 px-4 lg:px-6 overflow-x-auto scrollbar-thin">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="whitespace-nowrap px-3 py-2 text-sm hover:bg-white/10 rounded transition-colors"
              >
                {label}
              </Link>
            ))}
            {isSeller && (
              <Link
                to="/seller"
                className="whitespace-nowrap px-3 py-2 text-sm hover:bg-white/10 rounded transition-colors ml-auto font-medium text-[hsl(var(--amazon-orange))]"
              >
                <LayoutDashboard className="h-4 w-4 inline mr-1" />
                Seller Dashboard
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* ═══ PAGE CONTENT ═══ */}
      <main className="flex-1">
        <div className="container py-6 px-4 lg:px-6">
          <Outlet />
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full py-3 text-sm text-[hsl(var(--header-fg))] bg-[hsl(var(--navy-lighter))] hover:bg-[hsl(var(--navy-light))] transition-colors"
      >
        Back to top
      </button>

      <footer className="bg-[hsl(var(--header-bg))] text-[hsl(var(--header-fg))]">
        <div className="container px-4 lg:px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="font-bold mb-3 text-sm">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-[hsl(var(--header-fg))]/80 hover:text-[hsl(var(--amazon-orange))] hover:underline transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="font-bold mb-3 text-sm">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-sm text-[hsl(var(--header-fg))]/80 hover:text-[hsl(var(--amazon-orange))] hover:underline transition-colors flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-[hsl(var(--header-fg))]/80 hover:text-[hsl(var(--amazon-orange))] hover:underline transition-colors flex items-center gap-1">
                    <Headphones className="h-3 w-3" /> Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-[hsl(var(--navy-lighter))]" />
        <div className="container px-4 lg:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ShoppingBag className="h-5 w-5 text-[hsl(var(--amazon-orange))]" />
              <span className="font-bold">{APP_NAME}</span>
            </Link>
            <p className="text-xs text-[hsl(var(--header-fg))]/60">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved. Multi-Vendor Marketplace Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Mobile Menu ─── */
function MobileMenu({
  user,
  isAuthenticated,
  isAdmin,
  isSuperAdmin,
  isSeller,
  onClose,
  logout,
}: {
  user: { name?: string; email?: string; role?: string } | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSeller: boolean;
  onClose: () => void;
  logout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-[hsl(var(--navy-light))] p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[hsl(var(--amazon-orange))] flex items-center justify-center">
          <User className="h-5 w-5 text-[hsl(var(--navy))]" />
        </div>
        <div>
          {isAuthenticated ? (
            <>
              <p className="font-bold text-sm">Hello, {user?.name?.split(' ')[0] ?? 'User'}</p>
              <p className="text-xs text-[hsl(var(--header-fg))]/70">{user?.email}</p>
            </>
          ) : (
            <Link to="/login" onClick={onClose} className="font-bold text-sm">
              Hello, Sign In
            </Link>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <div className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--header-fg))]/50">
          Shop
        </div>
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            to={href}
            onClick={onClose}
            className="block px-4 py-3 text-sm hover:bg-white/10 transition-colors border-b border-white/5"
          >
            {label}
          </Link>
        ))}

        {isAuthenticated && (
          <>
            <div className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--header-fg))]/50">
              Your Account
            </div>
            <Link to="/account" onClick={onClose} className="block px-4 py-3 text-sm hover:bg-white/10 transition-colors border-b border-white/5">
              <User className="h-4 w-4 inline mr-2" /> My Account
            </Link>
            <Link to="/account/orders" onClick={onClose} className="block px-4 py-3 text-sm hover:bg-white/10 transition-colors border-b border-white/5">
              <Package className="h-4 w-4 inline mr-2" /> My Orders
            </Link>
            <Link to="/account/wishlist" onClick={onClose} className="block px-4 py-3 text-sm hover:bg-white/10 transition-colors border-b border-white/5">
              <Heart className="h-4 w-4 inline mr-2" /> Wishlist
            </Link>
          </>
        )}

        {(isAdmin || isSuperAdmin || isSeller) && (
          <>
            <div className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--header-fg))]/50">
              Portals
            </div>
            {isSeller && (
              <Link to="/seller" onClick={onClose} className="block px-4 py-3 text-sm hover:bg-white/10 transition-colors border-b border-white/5 text-[hsl(var(--amazon-orange))]">
                <LayoutDashboard className="h-4 w-4 inline mr-2" /> Seller Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={onClose} className="block px-4 py-3 text-sm hover:bg-white/10 transition-colors border-b border-white/5">
                <Settings className="h-4 w-4 inline mr-2" /> Admin Portal
              </Link>
            )}
            {isSuperAdmin && (
              <Link to="/super-admin" onClick={onClose} className="block px-4 py-3 text-sm hover:bg-white/10 transition-colors border-b border-white/5">
                <ShieldCheck className="h-4 w-4 inline mr-2" /> Super Admin
              </Link>
            )}
          </>
        )}
      </nav>

      {isAuthenticated && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { logout(); onClose(); }}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
