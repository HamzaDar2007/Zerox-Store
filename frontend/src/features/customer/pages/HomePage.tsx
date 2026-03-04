import { Link } from 'react-router-dom';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api';
import { APP_NAME } from '@/lib/constants';
import { Card, CardContent } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { PriceDisplay } from '@/common/components/PriceDisplay';
import { RatingStars } from '@/common/components/RatingStars';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Badge } from '@/common/components/ui/badge';
import {
  ArrowRight, ShoppingBag, Truck, Shield, Headphones,
  Zap, Tag, TrendingUp, ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({ page: 1, limit: 12 });
  const { data: categoriesData, isLoading: catsLoading } = useGetCategoriesQuery();

  const products = productsData?.data?.items ?? [];
  const categories = (categoriesData?.data ?? []).filter((c) => !c.parentId).slice(0, 8);

  // Pick some "deal" products (ones with compareAtPrice)
  const dealProducts = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 4);
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* ═══ HERO BANNER ═══ */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[hsl(var(--navy))] via-[hsl(var(--navy-light))] to-[hsl(var(--navy))] text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAzMG0tMSAwYTEgMSAwIDEgMCAyIDBhMSAxIDAgMSAwLTIgMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:py-24 text-center">
          <Badge className="mb-4 bg-[hsl(var(--amazon-orange))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--amazon-orange-hover))] text-xs font-bold px-3 py-1">
            <Zap className="h-3 w-3 mr-1" /> Pakistan's Multi-Vendor Marketplace
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover. Shop. <span className="text-[hsl(var(--amazon-orange))]">Save.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            Thousands of products from verified sellers. Free shipping on orders over PKR 5,000. 
            Shop with confidence on {APP_NAME}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/products">
              <Button
                size="lg"
                className="bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] text-[hsl(var(--navy))] font-bold shadow-lg"
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> Shop Now
              </Button>
            </Link>
            <Link to="/products?sortBy=createdAt&sortOrder=DESC">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                New Arrivals <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BADGES ═══ */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, title: 'Free Shipping', desc: 'On orders over PKR 5,000', color: 'text-blue-500' },
          { icon: Shield, title: 'Secure Payments', desc: '256-bit SSL encryption', color: 'text-green-500' },
          { icon: Headphones, title: '24/7 Support', desc: 'Always here to help', color: 'text-purple-500' },
          { icon: ShoppingBag, title: 'Easy Returns', desc: '14-day return policy', color: 'text-[hsl(var(--amazon-orange))]' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <Card key={title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-3 py-4 px-4">
              <div className="rounded-full bg-muted p-2.5">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ═══ DEALS SECTION ═══ */}
      {dealProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-[hsl(var(--deal-red))]" />
              <h2 className="text-xl font-bold">Today's Deals</h2>
            </div>
            <Link
              to="/products?sortBy=price_asc"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              See all deals <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dealProducts.map((product) => {
              const discount = product.compareAtPrice
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : 0;
              return (
                <Link key={product.id} to={`/products/${product.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all h-full border-[hsl(var(--deal-red))]/20">
                    <div className="relative aspect-square bg-white dark:bg-muted flex items-center justify-center overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[hsl(var(--deal-red))] text-white text-xs font-bold px-2 py-1 rounded">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-1.5">
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      <RatingStars rating={product.avgRating ?? 0} reviewCount={product.totalReviews ?? 0} size="sm" />
                      <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice ?? undefined} />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ CATEGORIES ═══ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Shop by Category</h2>
          <Link to="/categories" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {catsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/categories/${cat.slug}`}>
                <Card className="group hover:shadow-md hover:border-primary/30 transition-all h-full">
                  <CardContent className="flex items-center gap-3 py-4 px-4">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-14 w-14 rounded-lg object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{cat.description}</p>
                      )}
                      <span className="text-xs text-primary font-medium mt-1 flex items-center gap-0.5">
                        Shop now <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Featured Products</h2>
          </div>
          <Link to="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {productsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.slug}`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all h-full">
                  <div className="relative aspect-square bg-white dark:bg-muted flex items-center justify-center overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-3 space-y-1.5">
                    <p className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {product.name}
                    </p>
                    <RatingStars rating={product.avgRating ?? 0} reviewCount={product.totalReviews ?? 0} size="sm" />
                    <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice ?? undefined} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="rounded-xl bg-gradient-to-r from-[hsl(var(--amazon-orange))]/10 to-[hsl(var(--amazon-orange))]/5 dark:from-[hsl(var(--amazon-orange))]/20 dark:to-transparent border border-[hsl(var(--amazon-orange))]/20 p-8 text-center">
        <h2 className="text-2xl font-bold">Ready to start selling?</h2>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          Join thousands of sellers on {APP_NAME}. Set up your store in minutes and reach millions of customers.
        </p>
        <Link to="/register">
          <Button
            size="lg"
            className="mt-6 bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] text-[hsl(var(--navy))] font-bold"
          >
            Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
