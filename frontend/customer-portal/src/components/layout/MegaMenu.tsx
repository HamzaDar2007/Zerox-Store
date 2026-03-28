import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Category } from '@/types'
import { categoriesApi } from '@/services/api'

interface MegaMenuProps {
  categories: Category[]
  activeCategoryId: string | null
  onClose: () => void
}

export function MegaMenu({ categories, activeCategoryId, onClose }: MegaMenuProps) {
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeCategoryId) return
    let cancelled = false
    categoriesApi.list().then((all) => {
      if (!cancelled) setSubCategories(all.filter((c) => c.parentId === activeCategoryId && c.isActive))
    }).catch(() => {})
    return () => { cancelled = true; setSubCategories([]) }
  }, [activeCategoryId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const activeCategory = categories.find((c) => c.id === activeCategoryId)

  return (
    <div
      ref={menuRef}
      className="mega-menu absolute left-0 right-0 top-full bg-white text-[#0F172A] border-t border-[#E2E8F0] z-50"
      onMouseLeave={onClose}
    >
      <div className="container-main py-6">
        {activeCategory ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{activeCategory.name}</h3>
              <Link
                to={`/categories/${activeCategory.slug}`}
                className="text-sm text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1"
                onClick={onClose}
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {subCategories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/categories/${sub.slug}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                    onClick={onClose}
                  >
                    {sub.imageUrl ? (
                      <img src={sub.imageUrl} alt={sub.name} className="h-12 w-12 object-contain" loading="lazy" />
                    ) : (
                      <div className="h-12 w-12 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#64748B] text-xs font-semibold">
                        {sub.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-center">{sub.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No subcategories available</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                onClick={onClose}
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="h-12 w-12 object-contain" loading="lazy" />
                ) : (
                  <div className="h-12 w-12 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#64748B] text-xs font-semibold">
                    {cat.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm text-center font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
