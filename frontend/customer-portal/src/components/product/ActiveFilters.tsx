import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ActiveFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filterKeys = ['categoryId', 'brandId', 'minPrice', 'maxPrice', 'search']
  const activeFilters: Array<{ key: string; label: string; value: string }> = []

  for (const key of filterKeys) {
    const value = searchParams.get(key)
    if (!value) continue

    if (key === 'categoryId' || key === 'brandId') {
      activeFilters.push({ key, label: key === 'categoryId' ? 'Category' : 'Brand', value })
    } else {
      const labels: Record<string, string> = { minPrice: 'Min Price', maxPrice: 'Max Price', search: 'Search' }
      activeFilters.push({ key, label: labels[key] ?? key, value })
    }
  }

  if (activeFilters.length === 0) return null

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams)
    next.delete(key)
    next.set('page', '1')
    setSearchParams(next)
  }

  const clearAll = () => {
    const next = new URLSearchParams()
    const sort = searchParams.get('sort')
    if (sort) next.set('sort', sort)
    setSearchParams(next)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {activeFilters.map((f, i) => (
        <span
          key={`${f.key}-${f.value}-${i}`}
          className="inline-flex items-center gap-1 bg-[#FFF3EC] border border-[#F57224]/30 text-[#F57224] text-xs font-medium rounded-full px-3 py-1"
        >
          {f.label}: {f.value.length > 20 ? `${f.value.slice(0, 20)}…` : f.value}
          <button
            onClick={() => removeFilter(f.key)}
            className="hover:bg-[#F57224]/10 rounded-full p-0.5 cursor-pointer"
            aria-label={`Remove ${f.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Button variant="ghost" size="sm" className="text-xs" onClick={clearAll}>
        Clear All
      </Button>
    </div>
  )
}
