import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const BANNERS = [
  {
    id: 1,
    title: 'Electronics Fest',
    subtitle: 'Up to 50% OFF',
    link: '/categories/electronics',
    bgColor: 'bg-gradient-to-br from-[#0F172A] to-[#1E293B]',
  },
  {
    id: 2,
    title: 'Fashion Week',
    subtitle: 'New Arrivals',
    link: '/categories/fashion',
    bgColor: 'bg-gradient-to-br from-[#4F46E5] to-[#6366F1]',
  },
  {
    id: 3,
    title: 'Home Essentials',
    subtitle: 'Starting Rs. 199',
    link: '/categories/home-living',
    bgColor: 'bg-gradient-to-br from-[#059669] to-[#10B981]',
  },
]

export function PromoBannerRow() {
  return (
    <section className="py-6" aria-label="Promotional banners">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BANNERS.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className={`${banner.bgColor} rounded-xl p-6 text-white hover:opacity-95 transition-opacity flex flex-col justify-between min-h-[160px]`}
            >
              <div>
                <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
                <p className="text-sm opacity-90">{banner.subtitle}</p>
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-fit">
                Shop Now
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
