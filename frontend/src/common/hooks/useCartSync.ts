import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector, setLocalCart, setCartSynced } from '@/store';
import {
  useGetCartQuery,
  useAddToCartMutation,
} from '@/store/api';
import { toast } from 'sonner';
import type { CartItem } from '@/common/types';

/**
 * Syncs the local (guest) cart with the server cart after login.
 * On login: pushes local items to server cart, then clears local state.
 * On logout: server cart is abandoned; local cart starts fresh.
 */
export function useCartSync() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: localItems, isSynced } = useAppSelector((state) => state.cart);
  const [addCartItem] = useAddToCartMutation();
  const syncingRef = useRef(false);

  // Fetch server cart only when authenticated
  const { data: serverCartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated || isSynced || syncingRef.current) return;
    if (localItems.length === 0) {
      dispatch(setCartSynced(true));
      return;
    }

    // Push local items to server
    const syncCart = async () => {
      syncingRef.current = true;
      try {
        for (const item of localItems) {
          await addCartItem({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          }).unwrap();
        }
        // Clear local cart after successful sync
        dispatch(setLocalCart([]));
        dispatch(setCartSynced(true));
      } catch {
        // Surface sync failure to user
        toast.error('Failed to sync your cart. Some items may not have been saved.');
      } finally {
        syncingRef.current = false;
      }
    };

    syncCart();
  }, [isAuthenticated, isSynced, localItems, addCartItem, dispatch]);

  // Return the server cart when authenticated, local cart otherwise
  const cartItems: CartItem[] = isAuthenticated
    ? (serverCartResponse?.data?.items ?? [])
    : [];

  const cartCount = isAuthenticated
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : localItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    localItems,
    cartCount,
    isSynced,
    isAuthenticated,
  };
}
