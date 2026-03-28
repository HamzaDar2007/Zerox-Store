import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, ChevronRight } from 'lucide-react'
import { flashSalesApi } from '@/services/api'
import type { FlashSale, FlashSaleItem } from '@/types'
import { CountdownTimer } from '@/components/common/CountdownTimer'
import { ProductCard } from '@/components/product/ProductCard'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function FlashSaleSection() {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null)
  const [items, setItems] = useState<FlashSaleItem[]>([])

  useEffect(() => {
    flashSalesApi.list().then((sales) => {
      const active = sales.find((s) => s.isActive && new Date(s.endsAt) > new Date())
      if (active) {
        setFlashSale(active)
        flashSalesApi.getItems(active.id).then(setItems).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  if (!flashSale || items.length === 0) return null

  return (
    <section className="py-6" aria-label="Flash sale">
      <div className="container-main">
        {/* Header */}
        <div className="bg-[#EF4444] rounded-t-[8px] px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-white flash-sale-badge" />
            <h2 className="text-white font-bold text-lg md:text-xl">{flashSale.name || 'Flash Sale'}</h2>
            <CountdownTimer targetDate={flashSale.endsAt} size="sm" />
          </div>
          <Link
            to="/flash-sales"
            className="text-white text-sm flex items-center gap-1 hover:underline"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products */}
        <div className="bg-white rounded-b-[8px] border border-t-0 border-[#E2E8F0] p-4">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-2">
              {items.map((item) => (
                <div key={item.id} className="min-w-[200px] max-w-[220px]">
                  <ProductCard
                    product={item.variant?.product}
                    flashPrice={Number(item.salePrice)}
                    compact
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </section>
  )
}
