import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Flame } from 'lucide-react'
import { useUIStore } from '@/store/ui.store'
import { categoriesApi } from '@/services/api'
import type { Category } from '@/types'
import { MegaMenu } from './MegaMenu'

export function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const { isMegaMenuOpen, setMegaMenuOpen, setActiveMegaMenuCategory, activeMegaMenuCategory } = useUIStore()
  const location = useLocation()

  useEffect(() => {
    categoriesApi.list().then((cats) => {
      setCategories(cats.filter((c) => c.isActive && !c.parentId).slice(0, 10))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setMegaMenuOpen(false)
  }, [location.pathname, setMegaMenuOpen])

  return (
    <nav className="bg-[#232F3E] text-white text-sm hidden md:block relative" aria-label="Category navigation">
      <div className="container-main flex items-center h-10 gap-0.5 overflow-x-auto">
        <button
          className="flex items-center gap-1 px-3 h-full font-bold hover:ring-1 hover:ring-white rounded transition-all shrink-0 cursor-pointer"
          onClick={() => {
            setMegaMenuOpen(!isMegaMenuOpen)
            setActiveMegaMenuCategory(null)
          }}
          aria-expanded={isMegaMenuOpen}
          aria-haspopup="true"
        >
          <Menu className="h-4 w-4" />
          <span>All</span>
        </button>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categories/${cat.slug}`}
            className="px-3 h-full flex items-center hover:ring-1 hover:ring-white rounded transition-all whitespace-nowrap shrink-0"
            onMouseEnter={() => {
              setActiveMegaMenuCategory(cat.id)
              setMegaMenuOpen(true)
            }}
          >
            {cat.name}
          </Link>
        ))}

        <Link
          to="/flash-sales"
          className="flex items-center gap-1 px-3 h-full hover:ring-1 hover:ring-white rounded transition-all shrink-0"
        >
          <Flame className="h-4 w-4 text-[#F57224] flash-sale-badge" />
          <span className="text-[#FEBD69] font-bold">Flash Sale</span>
        </Link>
      </div>

      {/* Mega Menu */}
      {isMegaMenuOpen && (
        <MegaMenu
          categories={categories}
          activeCategoryId={activeMegaMenuCategory}
          onClose={() => setMegaMenuOpen(false)}
        />
      )}
    </nav>
  )
}
