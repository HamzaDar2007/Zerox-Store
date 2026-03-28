import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

interface ProductCarouselProps {
  products: Product[]
  title?: string
  className?: string
}

export function ProductCarousel({ products, title, className }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 2, containScroll: 'trimSnaps' })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    if (!emblaApi) return
    const onUpdate = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    onUpdate()
    emblaApi.on('select', onUpdate)
    emblaApi.on('reInit', onUpdate)
    return () => {
      emblaApi.off('select', onUpdate)
      emblaApi.off('reInit', onUpdate)
    }
  }, [emblaApi])

  if (products.length === 0) return null

  return (
    <div className={cn('relative', className)}>
      {title && <h3 className="text-lg font-bold text-[#0F1111] mb-3">{title}</h3>}

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="flex-[0_0_200px] md:flex-[0_0_220px] min-w-0">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>

      {canPrev && (
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute -left-3 top-1/2 -translate-y-1/2 h-20 w-8 bg-white border border-[#DDD] rounded shadow-sm flex items-center justify-center hover:bg-[#F7F8F8] transition-colors cursor-pointer z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5 text-[#0F1111]" />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-20 w-8 bg-white border border-[#DDD] rounded shadow-sm flex items-center justify-center hover:bg-[#F7F8F8] transition-colors cursor-pointer z-10"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5 text-[#0F1111]" />
        </button>
      )}
    </div>
  )
}
