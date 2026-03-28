import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { storesApi, productsApi } from '@/services/api'
import type { Store, Product } from '@/types'

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>()
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    storesApi.getBySlug(slug).then(async (s) => {
      setStore(s)
      const res = await productsApi.list({ storeId: s.id, limit: 20 })
      setProducts(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container-main py-6 space-y-4">
        <Skeleton className="h-48 w-full rounded-[8px]" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
      </div>
    )
  }

  if (!store) {
    return <div className="container-main py-16 text-center"><h2 className="text-xl font-bold">Store not found</h2></div>
  }

  return (
    <>
      <SEOHead title={store.name} description={store.description} />
      <div className="container-main py-4">
        <Breadcrumb items={[{ label: 'Stores' }, { label: store.name }]} />

        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#232F3E] to-[#37475A] rounded-[8px] overflow-hidden mt-4 flex items-end p-6">
          {store.bannerUrl && (
            <img src={store.bannerUrl} alt={store.name} className="absolute inset-0 h-full w-full object-cover opacity-50" />
          )}
          <div className="relative z-10 flex items-center gap-4">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-16 w-16 rounded-full bg-white border-2 border-white object-contain" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[#F57224] flex items-center justify-center text-white text-2xl font-bold border-2 border-white">
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{store.name}</h1>
              {store.description && <p className="text-white/80 text-sm mt-1">{store.description}</p>}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-[#0F1111] mb-4">All Products ({products.length})</h2>
          <ProductGrid products={products} />
        </div>
      </div>
    </>
  )
}
