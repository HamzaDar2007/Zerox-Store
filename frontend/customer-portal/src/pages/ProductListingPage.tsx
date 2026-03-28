import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProductGrid } from '@/components/product/ProductGrid'
import { FilterSidebar } from '@/components/product/FilterSidebar'
import { SortDropdown } from '@/components/product/SortDropdown'
import { ActiveFilters } from '@/components/product/ActiveFilters'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { productsApi } from '@/services/api'
import type { Product, PaginatedResponse } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/constants/config'
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ProductListItem } from '@/components/product/ProductListItem'

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const page = parseInt(searchParams.get('page') ?? '1')
  const search = searchParams.get('search') ?? undefined
  const categoryId = searchParams.get('categoryId') ?? undefined
  const brandId = searchParams.get('brandId') ?? undefined
  const sort = searchParams.get('sort') ?? undefined

  useEffect(() => {
    let cancelled = false
    productsApi
      .list({ page, limit: DEFAULT_PAGE_SIZE, search, categoryId, brandId, sort })
      .then((res: PaginatedResponse<Product>) => {
        if (cancelled) return
        setProducts(res.data)
        setTotal(res.total)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, search, categoryId, brandId, sort])

  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE)

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <SEOHead title={search ? `Search: ${search}` : 'All Products'} />
      <div className="container-main py-4">
        <Breadcrumb items={[{ label: 'Products' }]} />

        <div className="flex gap-6 mt-4">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-[250px] shrink-0">
            <FilterSidebar />
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#64748B]">
                  {loading ? 'Loading…' : `${total} results`}
                  {search && <span> for "<strong>{search}</strong>"</span>}
                </p>

                {/* Mobile filter toggle */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] pt-10">
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center gap-3">
                <SortDropdown />
                <div className="hidden md:flex items-center border border-[#E2E8F0] rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 cursor-pointer ${viewMode === 'grid' ? 'bg-[#6366F1] text-white' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 cursor-pointer ${viewMode === 'list' ? 'bg-[#6366F1] text-white' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <ActiveFilters />

            {/* Results */}
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<LayoutGrid className="h-16 w-16" />}
                title="No products found"
                description="Try adjusting your filters or search terms."
              />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <ProductGrid products={products} />
                ) : (
                  <div className="space-y-4">
                    {products.map((p) => (
                      <ProductListItem key={p.id} product={p} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 7) {
                        pageNum = i + 1
                      } else if (page <= 4) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i
                      } else {
                        pageNum = page - 3 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
