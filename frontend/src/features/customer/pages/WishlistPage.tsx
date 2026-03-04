import { useState } from 'react';
import { useGetWishlistQuery, useRemoveFromWishlistMutation, useAddToCartMutation } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState } from '@/common/components/EmptyState';
import { PriceDisplay } from '@/common/components/PriceDisplay';
import { RatingStars } from '@/common/components/RatingStars';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import type { Wishlist } from '@/common/types';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const items: Wishlist[] = data?.data ?? [];

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId).unwrap();
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!token) {
      toast.error('Please log in to add items to cart');
      return;
    }
    try {
      await addToCart({ productId, quantity: 1 }).unwrap();
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Wishlist" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wishlist"
        description={items.length > 0 ? `${items.length} saved item${items.length > 1 ? 's' : ''}` : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title="Your wishlist is empty"
          description="Save items you love to find them later."
          action={{ label: 'Browse Products', onClick: () => navigate('/products') }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <Card key={item.id} className="overflow-hidden">
                <Link to={`/products/${product.slug}`}>
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-muted-foreground">
                        {product.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4 space-y-2">
                  <Link to={`/products/${product.slug}`} className="hover:underline">
                    <h3 className="font-medium line-clamp-2">{product.name}</h3>
                  </Link>
                  {product.avgRating != null && (
                    <RatingStars rating={product.avgRating} reviewCount={product.totalReviews ?? 0} />
                  )}
                  <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice ?? undefined} />
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemove(item.productId)}
                      disabled={removingId === item.productId}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
