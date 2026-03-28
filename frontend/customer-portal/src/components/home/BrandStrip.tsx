import { useEffect, useState } from 'react'
import { brandsApi } from '@/services/api'
import type { Brand } from '@/types'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'

export function BrandStrip() {
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    brandsApi.list().then((b) => setBrands(b.filter((br) => br.isActive).slice(0, 16))).catch(() => {})
  }, [])

  if (brands.length === 0) return null

  return (
    <section className="py-6" aria-label="Shop by brand">
      <div className="container-main">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Top Brands</h2>
          <ScrollArea className="w-full">
            <div className="flex gap-8 items-center pb-2">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.slug}`}
                  className="shrink-0 flex flex-col items-center gap-2"
                >
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-12 w-auto object-contain brand-logo"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-20 bg-[#F1F5F9] rounded flex items-center justify-center text-sm font-bold text-[#64748B] brand-logo">
                      {brand.name}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </section>
  )
}
