import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { categoriesApi, brandsApi } from '@/services/api'
import type { Category, Brand } from '@/types'

interface FilterGroup {
  title: string
  key: string
  open: boolean
}

export function FilterSidebar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ category: true, brand: true, price: true })

  useEffect(() => {
    categoriesApi.list().then((c) => setCategories(c.filter((cat) => cat.isActive))).catch(() => {})
    brandsApi.list().then((b) => setBrands(b.filter((br) => br.isActive))).catch(() => {})
  }, [])

  const toggleExpand = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }))

  const selectedCategory = searchParams.get('categoryId') ?? ''
  const selectedBrand = searchParams.get('brandId') ?? ''
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.set('page', '1')
    setSearchParams(next)
  }

  const toggleSingle = (key: string, id: string, current: string) => {
    updateFilter(key, current === id ? '' : id)
  }

  const groups: FilterGroup[] = [
    { title: 'Category', key: 'category', open: expanded.category ?? true },
    { title: 'Brand', key: 'brand', open: expanded.brand ?? true },
    { title: 'Price Range', key: 'price', open: expanded.price ?? true },
  ]

  return (
    <aside className="w-full bg-white rounded-xl border border-[#E2E8F0] p-4">
      <h2 className="font-bold text-base text-[#0F172A] mb-4">Filters</h2>

      {groups.map((group, i) => (
        <div key={group.key}>
          {i > 0 && <Separator className="my-3" />}
          <button
            onClick={() => toggleExpand(group.key)}
            className="flex items-center justify-between w-full text-left py-1 cursor-pointer"
          >
            <span className="text-sm font-bold text-[#0F172A]">{group.title}</span>
            {group.open ? <ChevronUp className="h-4 w-4 text-[#64748B]" /> : <ChevronDown className="h-4 w-4 text-[#64748B]" />}
          </button>

          {group.open && group.key === 'category' && (
            <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-[#0F172A] cursor-pointer hover:text-[#4F46E5]">
                  <Checkbox
                    checked={selectedCategory === cat.id}
                    onCheckedChange={() => toggleSingle('categoryId', cat.id, selectedCategory)}
                  />
                  <span className="line-clamp-1">{cat.name}</span>
                </label>
              ))}
            </div>
          )}

          {group.open && group.key === 'brand' && (
            <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 text-sm text-[#0F172A] cursor-pointer hover:text-[#4F46E5]">
                  <Checkbox
                    checked={selectedBrand === brand.id}
                    onCheckedChange={() => toggleSingle('brandId', brand.id, selectedBrand)}
                  />
                  <span className="line-clamp-1">{brand.name}</span>
                </label>
              ))}
            </div>
          )}

          {group.open && group.key === 'price' && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full border border-[#E2E8F0] rounded px-2 py-1.5 text-sm focus:border-[#6366F1] focus:outline-none"
                min={0}
              />
              <span className="text-[#64748B]">–</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full border border-[#E2E8F0] rounded px-2 py-1.5 text-sm focus:border-[#6366F1] focus:outline-none"
                min={0}
              />
            </div>
          )}
        </div>
      ))}
    </aside>
  )
}
