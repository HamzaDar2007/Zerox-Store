import { useParams, Link } from 'react-router-dom';
import { useGetProductsQuery } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { PriceDisplay } from '@/common/components/PriceDisplay';
import { EmptyState } from '@/common/components/EmptyState';
import { Package } from 'lucide-react';

export default function BrandPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const { data, isLoading } = useGetProductsQuery({ brandId, limit: 50 });
  const products = data?.data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Brand Products" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Brand Products" />
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No products found"
          description="This brand doesn't have any products yet."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Brand Products" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product: any) => (
          <Link key={product.id} to={`/products/${product.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <PriceDisplay price={product.price} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
