import { useSearchParams, Link } from 'react-router-dom';
import { useGetProductsQuery } from '@/store/api';
import { SearchFilterBar } from '@/common/components/SearchFilterBar';
import { PaginationControls } from '@/common/components/PaginationControls';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { EmptyState, ErrorState } from '@/common/components/EmptyState';
import { PriceDisplay } from '@/common/components/PriceDisplay';
import { RatingStars } from '@/common/components/RatingStars';
import { Card, CardContent } from '@/common/components/ui/card';
import { OptimizedImage } from '@/common/components/OptimizedImage';
import { Separator } from '@/common/components/ui/separator';
import { DEFAULT_PAGE } from '@/lib/constants';
import { ShoppingBag, Package } from 'lucide-react';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const limit = Number(searchParams.get('limit')) || 12;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery({
    page,
    limit,
    search: search || undefined,
    categoryId: categoryId || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || undefined,
  });

  const products = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {search ? `Results for "${search}"` : 'All Products'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total > 0
              ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} results`
              : 'No results'}
          </p>
        </div>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={(val) => updateParam('search', val)}
        searchPlaceholder="Search products..."
        filters={[
          {
            label: 'Sort By',
            value: searchParams.get('sortBy') || '',
            options: [
              { label: 'Newest', value: 'createdAt' },
              { label: 'Price: Low to High', value: 'price_asc' },
              { label: 'Price: High to Low', value: 'price_desc' },
              { label: 'Name', value: 'name' },
            ],
            onChange: (val) => {
              if (val.includes('_')) {
                const [field, order] = val.split('_');
                updateParam('sortBy', field);
                updateParam('sortOrder', order.toUpperCase());
              } else {
                updateParam('sortBy', val);
              }
            },
          },
        ]}
        onClear={() => setSearchParams({})}
      />

      <Separator />

      {isLoading ? (
        <LoadingSpinner label="Loading products..." />
      ) : isError ? (
        <ErrorState
          title="Failed to load products"
          message="Something went wrong while fetching products. Please try again."
          onRetry={refetch}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <div
            className={`grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity ${
              isFetching ? 'opacity-50' : ''
            }`}
          >
            {products.map((product) => {
              const discount =
                product.compareAtPrice && product.compareAtPrice > product.price
                  ? Math.round(
                      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
                    )
                  : 0;
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all border-transparent hover:border-primary/20">
                    <div className="relative aspect-square overflow-hidden bg-white dark:bg-muted">
                      {product.images?.[0]?.url ? (
                        <OptimizedImage
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-12 w-12" />
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[hsl(var(--deal-red))] text-white text-xs font-bold px-2 py-0.5 rounded">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                      {product.brand && (
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          {product.brand.name}
                        </span>
                      )}
                      <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <RatingStars
                        rating={product.avgRating ?? 0}
                        reviewCount={product.totalReviews ?? 0}
                        size="sm"
                      />
                      <PriceDisplay
                        price={product.price}
                        compareAtPrice={product.compareAtPrice}
                        size="sm"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3" /> Free shipping
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <PaginationControls
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={(p) => updateParam('page', String(p))}
            onLimitChange={(l) => updateParam('limit', String(l))}
          />
        </>
      )}
    </div>
  );
}
