import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'
import { ROUTES } from '@/constants/routes'
import { SEARCH_DEBOUNCE_MS } from '@/constants/config'
import { searchApi } from '@/services/api'
import { sanitizeText } from '@/lib/sanitize'

export function Header() {
  const { isAuthenticated, user } = useAuthStore()
  const { itemCount } = useCartStore()
  const { setMobileMenuOpen, isMobileMenuOpen } = useUIStore()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ query: string; count: number }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const q = sanitizeText(searchQuery.trim())
    if (q) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(q)}`)
      setShowSuggestions(false)
    }
  }, [searchQuery, navigate])

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const popular = await searchApi.popular(6)
          setSuggestions(popular.filter((p) => p.query.toLowerCase().includes(value.toLowerCase())))
          setShowSuggestions(true)
        } catch {
          // Silently fail on suggestion fetch
        }
      }, SEARCH_DEBOUNCE_MS)
    } else {
      setShowSuggestions(false)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] sticky top-0 z-40">
      {/* Desktop Header */}
      <div className="container-main hidden md:flex items-center h-16 gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="bg-[#6366F1] text-white font-bold text-lg w-8 h-8 rounded-lg flex items-center justify-center">S</div>
          <span className="text-lg font-semibold text-[#0F172A] tracking-tight">ShopVerse</span>
        </Link>

        {/* Search Bar */}
        <div ref={searchRef} className="flex-1 relative max-w-xl">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search products, brands..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#F1F5F9] border border-transparent text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 focus:bg-white transition-all"
              aria-label="Search"
            />
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-[#E2E8F0] rounded-lg shadow-[var(--shadow-dropdown)] z-50 mt-1 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.query}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] text-left cursor-pointer transition-colors"
                  onClick={() => {
                    setSearchQuery(s.query)
                    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(s.query)}`)
                    setShowSuggestions(false)
                  }}
                >
                  <Search className="h-3.5 w-3.5 text-[#94A3B8]" />
                  <span>{s.query}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account */}
        <Link
          to={isAuthenticated ? ROUTES.ACCOUNT : ROUTES.LOGIN}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors shrink-0"
        >
          <User className="h-5 w-5" />
          <span className="hidden lg:block font-medium">
            {isAuthenticated ? user?.firstName : 'Sign In'}
          </span>
        </Link>

        {/* Orders */}
        <Link
          to={ROUTES.ACCOUNT_ORDERS}
          className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium transition-colors shrink-0 hidden lg:block"
        >
          Orders
        </Link>

        {/* Cart */}
        <Link
          to={ROUTES.CART}
          className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] transition-colors relative shrink-0"
          aria-label={`Cart with ${itemCount} items`}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#6366F1] text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-sm font-medium hidden lg:block">Cart</span>
        </Link>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="container-main flex items-center justify-between h-14">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#64748B] cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#6366F1] text-white font-bold text-sm w-7 h-7 rounded-lg flex items-center justify-center">S</div>
            <span className="text-base font-semibold text-[#0F172A]">ShopVerse</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link to={isAuthenticated ? ROUTES.ACCOUNT : ROUTES.LOGIN} className="p-2 text-[#64748B]" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link to={ROUTES.CART} className="p-2 relative text-[#64748B]" aria-label={`Cart with ${itemCount} items`}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0 bg-[#6366F1] text-white text-[9px] font-semibold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-3 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full h-9 pl-10 pr-4 rounded-lg bg-[#F1F5F9] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
              aria-label="Search"
            />
          </form>
        </div>
      </div>
    </header>
  )
}
