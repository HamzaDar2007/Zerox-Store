import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  Cart,
  CartItem,
  Wishlist,
  AddToCartDto,
  UpdateCartItemDto,
  AddToWishlistDto,
  CheckoutSession,
} from '@/common/types';

interface CreateCheckoutSessionDto {
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingMethodId?: string;
  voucherCode?: string;
  notes?: string;
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Cart ──
    getCart: builder.query<ApiResponse<Cart>, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<ApiResponse<CartItem>, AddToCartDto>({
      query: (data) => ({
        url: '/cart/items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation<
      ApiResponse<CartItem>,
      { id: string; data: UpdateCartItemDto }
    >({
      query: ({ id, data }) => ({
        url: `/cart/items/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/cart/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // ── Wishlist ──
    getWishlist: builder.query<ApiResponse<Wishlist[]>, void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),

    addToWishlist: builder.mutation<ApiResponse<Wishlist>, AddToWishlistDto>({
      query: (data) => ({
        url: '/wishlist',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlist: builder.mutation<ApiResponse<void>, string>({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    isInWishlist: builder.query<ApiResponse<boolean>, string>({
      query: (productId) => `/wishlist/check/${productId}`,
    }),

    // ── Checkout ──
    createCheckoutSession: builder.mutation<
      ApiResponse<CheckoutSession>,
      CreateCheckoutSessionDto
    >({
      query: (data) => ({
        url: '/checkout/session',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Checkout'],
    }),

    getCheckoutSession: builder.query<ApiResponse<CheckoutSession>, string>({
      query: (id) => `/checkout/session/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Checkout', id }],
    }),

    updateCheckoutSession: builder.mutation<
      ApiResponse<CheckoutSession>,
      { id: string; data: Partial<CreateCheckoutSessionDto> }
    >({
      query: ({ id, data }) => ({
        url: `/checkout/session/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Checkout', id }],
    }),

    completeCheckout: builder.mutation<ApiResponse<CheckoutSession>, string>({
      query: (id) => ({
        url: `/checkout/session/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: ['Checkout', 'Cart', { type: 'Order', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useIsInWishlistQuery,
  useCreateCheckoutSessionMutation,
  useGetCheckoutSessionQuery,
  useUpdateCheckoutSessionMutation,
  useCompleteCheckoutMutation,
} = cartApi;
