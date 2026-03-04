import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { GitCompare, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '@/common/types';
import {
  useGetComparisonQuery,
  useRemoveFromComparisonMutation,
  useGetProductsQuery,
} from '@/store/api';

export default function ComparisonPage() {
  const { data: compData, isLoading } = useGetComparisonQuery();
  const comparisons = compData?.data ?? [];
  const productIds = comparisons.flatMap((c) => c.productIds);

  // Fetch all products to filter locally — a simplified approach
  const { data: productsData } = useGetProductsQuery({ page: 1, limit: 100 });
  const allProducts = productsData?.data?.items ?? [];
  const products = allProducts.filter((p: Product) => productIds.includes(p.id));

  const [removeFromComparison] = useRemoveFromComparisonMutation();

  if (isLoading) return <LoadingSpinner label="Loading comparison..." />;

  if (productIds.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Compare Products" />
        <EmptyState
          icon={<GitCompare className="h-10 w-10" />}
          title="No products to compare"
          description="Add products to compare using the compare button on product pages."
          action={{ label: 'Browse Products', onClick: () => window.location.href = '/products' }}
        />
      </div>
    );
  }

  const attrs = ['price', 'averageRating', 'totalReviews', 'totalSales'] as const;
  const attrLabels: Record<string, string> = {
    price: 'Price',
    averageRating: 'Rating',
    totalReviews: 'Reviews',
    totalSales: 'Sales',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Compare Products" description={`Comparing ${products.length} products`} />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 text-left">Feature</th>
              {products.map((p: Product) => (
                <th key={p.id} className="border p-3 text-center">
                  <div className="space-y-2">
                    <Link to={`/products/${p.slug}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromComparison(p.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attrs.map((attr) => (
              <tr key={attr}>
                <td className="border p-3 font-medium">{attrLabels[attr]}</td>
                {products.map((p: Product) => (
                  <td key={p.id} className="border p-3 text-center">
                    {attr === 'price'
                      ? formatCurrency(p.price)
                      : String((p as unknown as Record<string, unknown>)[attr] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="border p-3 font-medium">Category</td>
              {products.map((p: Product) => (
                <td key={p.id} className="border p-3 text-center">{p.categoryId?.slice(0, 8)}…</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
