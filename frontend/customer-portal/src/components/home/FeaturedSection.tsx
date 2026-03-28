import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface FeaturedSectionProps {
  title: string
  products: Product[]
  viewAllLink?: string
  loading?: boolean
}

export function FeaturedSection({ title, products, viewAllLink, loading }: FeaturedSectionProps) {
  if (!loading && products.length === 0) return null

  return (
    <section className="py-6" aria-label={title}>
      <div className="container-main">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">{title}</h2>
            {viewAllLink && (
              <Link to={viewAllLink} className="text-sm text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1">
                See All <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
