import { Link } from 'react-router-dom';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from '@/store/api';
import { useAppSelector, useAppDispatch, removeFromLocalCart, updateLocalCartItem, clearLocalCart } from '@/store';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { EmptyState, ErrorState } from '@/common/components/EmptyState';
import { OptimizedImage } from '@/common/components/OptimizedImage';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Separator } from '@/common/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: localItems } = useAppSelector((state) => state.cart);

  const { data: cartResponse, isLoading, isError, refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();

  const serverItems = cartResponse?.data?.items ?? [];
  const items = isAuthenticated ? serverItems : [];

  // Use local cart display for guests
  const displayItems = isAuthenticated
    ? items.map((item) => ({
        id: item.id,
        productId: item.productId,
        slug: item.product?.slug ?? item.productId,
        name: item.product?.name ?? 'Product',
        price: item.priceAtAddition ?? item.product?.price ?? 0,
        quantity: item.quantity,
        imageUrl: item.product?.images?.[0]?.url ?? null,
        variantId: item.variantId,
      }))
    : localItems.map((item, idx) => ({
        id: `local-${idx}`,
        productId: item.productId,
        slug: item.slug ?? item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.image,
        variantId: item.variantId,
      }));

  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleUpdateQuantity = async (
    itemId: string,
    productId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;
    if (isAuthenticated) {
      try {
        await updateCartItem({ id: itemId, data: { quantity: newQuantity } }).unwrap();
      } catch {
        toast.error('Failed to update quantity');
      }
    } else {
      dispatch(updateLocalCartItem({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = async (itemId: string, productId: string) => {
    if (isAuthenticated) {
      try {
        await removeCartItem(itemId).unwrap();
        toast.success('Item removed');
      } catch {
        toast.error('Failed to remove item');
      }
    } else {
      dispatch(removeFromLocalCart({ productId }));
      toast.success('Item removed');
    }
  };

  const handleClearCart = async () => {
    if (isAuthenticated) {
      try {
        await clearCart(undefined).unwrap();
        toast.success('Cart cleared');
      } catch {
        toast.error('Failed to clear cart');
      }
    } else {
      dispatch(clearLocalCart());
      toast.success('Cart cleared');
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading cart..." />;

  if (isError && isAuthenticated) {
    return (
      <ErrorState
        title="Failed to load cart"
        message="Could not fetch your cart items. Please try again."
        onRetry={refetch}
      />
    );
  }

  if (displayItems.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="mx-auto h-12 w-12" />}
        title="Your cart is empty"
        description="Browse our products and add items to your cart."
        action={{ label: 'Continue Shopping', onClick: () => window.location.assign('/products') }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                {displayItems.length} item{displayItems.length !== 1 ? 's' : ''} in your cart
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={handleClearCart}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear all
              </Button>
            </CardHeader>
            <CardContent className="divide-y">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <Link
                    to={`/products/${item.slug}`}
                    className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-white dark:bg-muted ring-1 ring-border"
                  >
                    {item.imageUrl ? (
                      <OptimizedImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                      <p className="text-xs text-green-600 mt-0.5">In Stock</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-md border bg-muted/30">
                        <button
                          className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors rounded-l-md"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.productId, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium border-x">
                          {item.quantity}
                        </span>
                        <button
                          className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors rounded-r-md"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.productId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleRemoveItem(item.id, item.productId)}
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <ShieldCheck className="h-4 w-4" />
                <span>Your order qualifies for secure checkout</span>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({displayItems.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    {subtotal >= 5000 ? 'FREE' : 'Calculated at checkout'}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(subtotal)}</span>
              </div>
              <Link to={isAuthenticated ? '/checkout' : '/login'} className="block">
                <Button className="w-full h-11 bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] text-[hsl(var(--navy))] font-bold shadow-sm">
                  {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Link to="/products" className="block">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
