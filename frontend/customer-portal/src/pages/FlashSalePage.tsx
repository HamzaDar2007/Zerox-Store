import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { CountdownTimer } from '@/components/common/CountdownTimer'
import { ProductCard } from '@/components/product/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { flashSalesApi } from '@/services/api'
import type { FlashSale, FlashSaleItem } from '@/types'
import { Flame } from 'lucide-react'

export default function FlashSalePage() {
  const [sales, setSales] = useState<FlashSale[]>([])
  const [allItems, setAllItems] = useState<Record<string, FlashSaleItem[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    flashSalesApi.list().then(async (s) => {
      const active = s.filter((sale) => sale.isActive && new Date(sale.endsAt) > new Date())
      setSales(active)

      const itemsMap: Record<string, FlashSaleItem[]> = {}
      await Promise.all(active.map(async (sale) => {
        const items = await flashSalesApi.getItems(sale.id).catch(() => [])
        itemsMap[sale.id] = items
      }))
      setAllItems(itemsMap)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <SEOHead title="Flash Sales" description="Don't miss out on amazing flash sale deals!" />
      <div className="container-main py-4">
        <Breadcrumb items={[{ label: 'Flash Sales' }]} />

        <div className="flex items-center gap-3 mt-4 mb-6">
          <Flame className="h-8 w-8 text-[#EF4444] flash-sale-badge" />
          <h1 className="text-2xl font-bold text-[#0F172A]">Flash Sales</h1>
        </div>

        {loading ? (
          <div className="space-y-8">{[1, 2].map((i) => <Skeleton key={i} className="h-64" />)}</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16">
            <Flame className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0F172A]">No active flash sales</h2>
            <p className="text-sm text-[#64748B] mt-2">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="bg-[#EF4444] px-6 py-3 flex items-center justify-between">
                  <h2 className="text-white font-bold text-lg">{sale.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm">Ends in</span>
                    <CountdownTimer targetDate={sale.endsAt} size="sm" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {(allItems[sale.id] ?? []).map((item) => (
                      <ProductCard
                        key={item.id}
                        product={item.variant?.product}
                        flashPrice={Number(item.salePrice)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
