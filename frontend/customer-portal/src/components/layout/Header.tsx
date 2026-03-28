import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
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
    <header className="bg-[#131921] text-white sticky top-0 z-40">
      {/* Desktop Header */}
      <div className="container-main hidden md:flex items-center h-[60px] gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 shrink-0 mr-2 hover:ring-1 hover:ring-white rounded p-1 transition-all">
          <div className="bg-[#F57224] text-white font-extrabold text-xl px-2 py-0.5 rounded">S</div>
          <span className="text-lg font-bold">ShopVerse</span>
        </Link>

        {/* Search Bar */}
        <div ref={searchRef} className="flex-1 relative max-w-3xl">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search products, brands and more..."
              className="flex-1 h-10 px-4 rounded-l-[4px] text-[#0F1111] text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]"
              aria-label="Search"
            />
            <button
              type="submit"
              className="bg-[#F57224] hover:bg-[#e0651d] h-10 px-4 rounded-r-[4px] transition-colors cursor-pointer"
              aria-label="Submit search"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-[#DDD] rounded-b shadow-[var(--shadow-dropdown)] z-50 mt-0.5">
              {suggestions.map((s) => (
                <button
                  key={s.query}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#0F1111] hover:bg-[#F0F2F2] text-left cursor-pointer"
                  onClick={() => {
                    setSearchQuery(s.query)
                    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(s.query)}`)
                    setShowSuggestions(false)
                  }}
                >
                  <Search className="h-3 w-3 text-[#565959]" />
                  <span>{s.query}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account */}
        <Link
          to={isAuthenticated ? ROUTES.ACCOUNT : ROUTES.LOGIN}
          className="flex flex-col text-xs hover:ring-1 hover:ring-white rounded p-1 transition-all shrink-0"
        >
          <span className="text-[#ccc]">
            {isAuthenticated ? `Hello, ${user?.firstName}` : 'Hello, Sign In'}
          </span>
          <span className="text-sm font-bold flex items-center gap-0.5">
            Account <ChevronDown className="h-3 w-3" />
          </span>
        </Link>

        {/* Orders */}
        <Link
          to={ROUTES.ACCOUNT_ORDERS}
          className="flex flex-col text-xs hover:ring-1 hover:ring-white rounded p-1 transition-all shrink-0"
        >
          <span className="text-[#ccc]">Returns</span>
          <span className="text-sm font-bold">& Orders</span>
        </Link>

        {/* Cart */}
        <Link
          to={ROUTES.CART}
          className="flex items-center gap-1 hover:ring-1 hover:ring-white rounded p-1 transition-all relative shrink-0"
          aria-label={`Cart with ${itemCount} items`}
        >
          <div className="relative">
            <ShoppingCart className="h-7 w-7" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#F57224] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-sm font-bold hidden lg:block">Cart</span>
        </Link>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="container-main flex items-center justify-between h-14">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link to="/" className="flex items-center gap-1">
            <div className="bg-[#F57224] text-white font-extrabold text-lg px-2 py-0.5 rounded">S</div>
            <span className="text-base font-bold">ShopVerse</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to={isAuthenticated ? ROUTES.ACCOUNT : ROUTES.LOGIN} className="p-2" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link to={ROUTES.CART} className="p-2 relative" aria-label={`Cart with ${itemCount} items`}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0 bg-[#F57224] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-3 pb-2">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ShopVerse..."
              className="flex-1 h-9 px-3 rounded-l-[4px] text-[#0F1111] text-sm focus:outline-none"
              aria-label="Search"
            />
            <button
              type="submit"
              className="bg-[#F57224] hover:bg-[#e0651d] h-9 px-3 rounded-r-[4px] cursor-pointer"
              aria-label="Submit search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
