import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Badge } from '@/common/components/ui/badge';
import { Card, CardContent } from '@/common/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { Package } from 'lucide-react';
import type { ProductBundle } from '@/common/types';
import { useGetActiveBundlesQuery } from '@/store/api';

export default function BundlesListPage() {
  const [page] = useState(1);
  const { data, isLoading } = useGetActiveBundlesQuery({ page, limit: 12 });
  const bundles = data?.data?.items ?? [];

  if (isLoading) return <LoadingSpinner label="Loading bundles..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Product Bundles" description="Save more with curated bundles" />

      {bundles.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title="No bundles available"
          description="Check back later for great deals on product bundles."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b: ProductBundle) => (
            <Link key={b.id} to={`/bundles/${b.slug}`}>
              <Card className="transition-shadow hover:shadow-lg">
                <CardContent className="p-0">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.name} loading="lazy" decoding="async" className="h-48 w-full rounded-t-lg object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-t-lg bg-muted">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-2 p-4">
                    <h3 className="font-semibold">{b.name}</h3>
                    {b.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {b.bundlePrice != null && (
                        <span className="text-lg font-bold">{formatCurrency(b.bundlePrice)}</span>
                      )}
                      {b.originalTotalPrice != null && b.bundlePrice != null && b.originalTotalPrice > b.bundlePrice && (
                        <span className="text-sm line-through text-muted-foreground">
                          {formatCurrency(b.originalTotalPrice)}
                        </span>
                      )}
                      {b.discountValue > 0 && (
                        <Badge variant="destructive">-{b.discountValue}%</Badge>
                      )}
                    </div>
                    {b.items && (
                      <p className="text-xs text-muted-foreground">{b.items.length} items</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
