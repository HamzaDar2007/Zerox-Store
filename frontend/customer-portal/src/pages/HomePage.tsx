import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { HeroBanner } from '@/components/home/HeroBanner'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FlashSaleSection } from '@/components/home/FlashSaleSection'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { PromoBannerRow } from '@/components/home/PromoBannerRow'
import { BrandStrip } from '@/components/home/BrandStrip'
import { AppDownloadBanner } from '@/components/home/AppDownloadBanner'
import { productsApi } from '@/services/api'
import type { Product } from '@/types'

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)

  useEffect(() => {
    productsApi.list({ limit: 10 })
      .then((res) => setFeatured(res.data))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false))

    productsApi.list({ limit: 10, page: 1 })
      .then((res) => setNewArrivals(res.data))
      .catch(() => {})
      .finally(() => setLoadingNew(false))
  }, [])

  return (
    <>
      <SEOHead
        title="ShopVerse — Your One-Stop Shop"
        description="Discover amazing deals on electronics, fashion, home & living, and more. Shop with confidence at ShopVerse."
      />
      <HeroBanner />
      <CategoryStrip />
      <FlashSaleSection />
      <FeaturedSection title="Featured Products" products={featured} viewAllLink="/products" loading={loadingFeatured} />
      <PromoBannerRow />
      <FeaturedSection title="New Arrivals" products={newArrivals} viewAllLink="/products?sort=newest" loading={loadingNew} />
      <BrandStrip />
      <AppDownloadBanner />
    </>
  )
}
