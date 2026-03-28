import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HERO_AUTOPLAY_INTERVAL } from '@/constants/config'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const BANNERS = [
  {
    id: 1,
    title: 'Mega Sale Season',
    subtitle: 'Up to 70% OFF on Electronics',
    cta: 'Shop Now',
    link: '/categories/electronics',
    bgGradient: 'from-[#4F46E5] via-[#6366F1] to-[#818CF8]',
    textColor: 'text-white',
  },
  {
    id: 2,
    title: 'New Fashion Arrivals',
    subtitle: 'Trendy styles at unbeatable prices',
    cta: 'Explore',
    link: '/categories/fashion',
    bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
    textColor: 'text-white',
  },
  {
    id: 3,
    title: 'Home & Living Sale',
    subtitle: 'Transform your space — Starting Rs. 499',
    cta: 'Discover',
    link: '/categories/home-living',
    bgGradient: 'from-[#059669] via-[#10B981] to-[#34D399]',
    textColor: 'text-white',
  },
  {
    id: 4,
    title: 'Flash Sale Live Now! ⚡',
    subtitle: 'Limited time deals — Don\'t miss out',
    cta: 'View Deals',
    link: '/flash-sales',
    bgGradient: 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]',
    textColor: 'text-white',
  },
]

export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: HERO_AUTOPLAY_INTERVAL, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <section className="relative" aria-label="Hero banner">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {BANNERS.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0">
              <div className={cn('h-[300px] md:h-[400px] lg:h-[480px] bg-gradient-to-r flex items-center', banner.bgGradient)}>
                <div className="container-main w-full">
                  <div className="max-w-xl">
                    <h2 className={cn('text-3xl md:text-5xl font-bold mb-3 leading-tight', banner.textColor)}>
                      {banner.title}
                    </h2>
                    <p className={cn('text-lg md:text-xl mb-6 opacity-90', banner.textColor)}>
                      {banner.subtitle}
                    </p>
                    <Link to={banner.link}>
                      <Button size="lg" variant="secondary" className="text-base font-bold px-8">
                        {banner.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 h-16 w-10 bg-white/80 hover:bg-white rounded flex items-center justify-center shadow-md transition-colors cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-[#0F172A]" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-16 w-10 bg-white/80 hover:bg-white rounded flex items-center justify-center shadow-md transition-colors cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-[#0F172A]" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            className={cn('carousel-dot', selectedIndex === index && 'active')}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
