import { useParams, Link } from 'react-router-dom';
import { useGetBundleByIdQuery } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Skeleton } from '@/common/components/ui/skeleton';
import { PriceDisplay } from '@/common/components/PriceDisplay';
import { Badge } from '@/common/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { Package, ShoppingCart, Tag } from 'lucide-react';
import { useAddToCartMutation } from '@/store/api';
import { toast } from 'sonner';

export default function BundleDetailPage() {
  const { bundleId } = useParams<{ bundleId: string }>();
  const { data, isLoading } = useGetBundleByIdQuery(bundleId!, { skip: !bundleId });
  const [addToCart] = useAddToCartMutation();
  const bundle = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bundle Details" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="space-y-6 text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Bundle not found</h2>
        <Button asChild><Link to="/bundles">View All Bundles</Link></Button>
      </div>
    );
  }

  const handleAddBundleToCart = async () => {
    try {
      for (const item of bundle.items ?? []) {
        await addToCart({ productId: item.productId, quantity: item.quantity ?? 1 }).unwrap();
      }
      toast.success('Bundle added to cart!');
    } catch {
      toast.error('Failed to add bundle to cart');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={bundle.name} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{bundle.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">{bundle.description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  <Tag className="mr-1 h-3 w-3" />
                  {bundle.discountType === 'percentage' ? `${bundle.discountValue}% OFF` : `${formatCurrency(bundle.discountValue)} OFF`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium mb-3">Included Products</h3>
              <div className="divide-y">
                {bundle.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-3">
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <Link to={`/products/${item.product?.slug ?? item.productId}`} className="font-medium hover:underline">
                        {item.product?.name ?? 'Product'}
                      </Link>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity ?? 1}</p>
                    </div>
                    {item.product?.price && <PriceDisplay price={item.product.price} />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit sticky top-24">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Bundle Price</p>
              <p className="text-3xl font-bold text-brand-600">{formatCurrency(bundle.bundlePrice ?? 0)}</p>
              {bundle.originalTotalPrice && (
                <p className="text-sm text-muted-foreground line-through">{formatCurrency(bundle.originalTotalPrice)}</p>
              )}
            </div>
            <Button onClick={handleAddBundleToCart} className="w-full bg-brand-500 text-navy hover:bg-brand-600" size="lg">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add Bundle to Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
