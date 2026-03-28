import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ImageGallery } from '@/components/product/ImageGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { PriceDisplay } from '@/components/common/PriceDisplay'
import { StarRating } from '@/components/common/StarRating'
import { QuantitySelector } from '@/components/common/QuantitySelector'
import { ReviewSummary } from '@/components/product/ReviewSummary'
import { ReviewCard } from '@/components/product/ReviewCard'
import { ReviewForm } from '@/components/product/ReviewForm'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { productsApi, reviewsApi, cartApi } from '@/services/api'
import { sanitizeHtml } from '@/lib/sanitize'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import type { Product, ProductVariant, ProductImage, Review, RatingSummary } from '@/types'
import { ShoppingCart, Heart, Share2, ShieldCheck, Truck, RefreshCw, Store } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated } = useAuthStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    productsApi.getBySlug(slug).then(async (p) => {
      setProduct(p)

      const [v, img] = await Promise.all([
        productsApi.getVariants(p.id),
        productsApi.getImages(p.id),
      ])
      setVariants(v)
      setImages(img)
      if (v.length > 0) setSelectedVariant(v.find((x) => x.isActive) ?? v[0])

      // Load reviews + summary
      reviewsApi.list({ productId: p.id, limit: 10 }).then((r) => setReviews(r.data)).catch(() => {})
      reviewsApi.getSummary(p.id).then(setRatingSummary).catch(() => {})

      // Related products from same category
      if (p.categoryId) {
        productsApi.list({ categoryId: p.categoryId, limit: 6 }).then((r) => {
          setRelatedProducts(r.data.filter((x) => x.id !== p.id).slice(0, 5))
        }).catch(() => {})
      }

      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  const handleAddToCart = async () => {
    if (!selectedVariant || !isAuthenticated) {
      if (!isAuthenticated) toast.error('Please log in to add items to cart')
      return
    }
    setAddingToCart(true)
    try {
      const item = await cartApi.addItem({ variantId: selectedVariant.id, quantity })
      useCartStore.getState().addItemOptimistic(item)
      toast.success('Added to cart!')
      setQuantity(1)
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="container-main py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/4" /><Skeleton className="h-12 w-1/2" /><Skeleton className="h-10 w-full" /></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-main py-16 text-center">
        <h2 className="text-xl font-bold text-[#0F172A]">Product not found</h2>
        <p className="text-[#64748B] mt-2">The product you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  const displayPrice = selectedVariant?.price ?? product.basePrice
  const originalPrice = product.basePrice !== displayPrice ? product.basePrice : undefined

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.shortDesc ?? `Buy ${product.name} at ShopVerse`}
        image={images[0]?.url}
      />

      <div className="container-main py-4">
        <Breadcrumb items={[
          { label: 'Products', to: '/products' },
          ...(product.category ? [{ label: product.category.name, to: `/categories/${product.category.slug}` }] : []),
          { label: product.name },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Images */}
          <ImageGallery images={images} productName={product.name} />

          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">{product.name}</h1>

            {/* Store */}
            {product.store && (
              <Link to={`/stores/${product.store.slug}`} className="text-sm text-[#6366F1] hover:text-[#4F46E5] hover:underline flex items-center gap-1 mb-2">
                <Store className="h-4 w-4" /> Visit {product.store.name}
              </Link>
            )}

            {/* Rating */}
            {ratingSummary && (
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={ratingSummary.avg ?? ratingSummary.average ?? 0} size="md" />
                <span className="text-sm text-[#6366F1]">
                  {ratingSummary.count ?? ratingSummary.total ?? 0} reviews
                </span>
              </div>
            )}

            <Separator className="my-3" />

            {/* Price */}
            <PriceDisplay
              currentPrice={displayPrice}
              originalPrice={originalPrice}
              size="lg"
            />

            {product.shortDesc && (
              <p className="text-sm text-[#0F172A] mt-3">{product.shortDesc}</p>
            )}

            <Separator className="my-4" />

            {/* Variants */}
            <VariantSelector
              variants={variants}
              selectedVariantId={selectedVariant?.id}
              onSelect={setSelectedVariant}
            />

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mt-6">
              <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={10} />
              <Button size="lg" className="flex-1 font-bold" onClick={handleAddToCart} disabled={addingToCart || !selectedVariant}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addingToCart ? 'Adding…' : 'Add to Cart'}
              </Button>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-6 mt-4">
              <button className="text-sm text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1 cursor-pointer">
                <Heart className="h-4 w-4" /> Add to Wishlist
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
                className="text-sm text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>

            <Separator className="my-4" />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-5 w-5 text-[#10B981]" />
                <span className="text-xs text-[#64748B]">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="h-5 w-5 text-[#10B981]" />
                <span className="text-xs text-[#64748B]">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-5 w-5 text-[#10B981]" />
                <span className="text-xs text-[#64748B]">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <Tabs defaultValue="description" className="mt-10">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({ratingSummary?.count ?? ratingSummary?.total ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              {product.fullDesc ? (
                <div className="prose max-w-none text-sm text-[#0F172A]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.fullDesc) }} />
              ) : (
                <p className="text-sm text-[#64748B]">{product.shortDesc ?? 'No description available.'}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-6">
              {ratingSummary && <ReviewSummary summary={ratingSummary} />}
              <Separator />
              {reviews.length > 0 ? (
                reviews.map((r) => <ReviewCard key={r.id} review={r} />)
              ) : (
                <p className="text-sm text-[#64748B] text-center py-4">No reviews yet. Be the first to review!</p>
              )}
              <Separator />
              {isAuthenticated && (
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-4">Write a Review</h3>
                  <ReviewForm
                    productId={product.id}
                    onSuccess={() => {
                      reviewsApi.list({ productId: product.id, limit: 10 }).then((r) => setReviews(r.data)).catch(() => {})
                      reviewsApi.getSummary(product.id).then(setRatingSummary).catch(() => {})
                    }}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <ProductCarousel products={relatedProducts} title="Related Products" />
          </div>
        )}
      </div>
    </>
  )
}
