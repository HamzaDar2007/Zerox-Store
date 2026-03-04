import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  Seller,
  Store,
  SellerDocument,
  SellerWallet,
  WalletTransaction,
  BecomeSellerDto,
  CreateStoreDto,
} from '@/common/types';

interface CreateSellerDocumentDto {
  documentType: string;
  documentUrl: string;
  expiryDate?: string;
}

export const sellersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Sellers ──
    getSellers: builder.query<ApiResponse<Seller[]>, void>({
      query: () => '/sellers',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Seller' as const, id })),
              { type: 'Seller', id: 'LIST' },
            ]
          : [{ type: 'Seller', id: 'LIST' }],
    }),

    getSellerById: builder.query<ApiResponse<Seller>, string>({
      query: (id) => `/sellers/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Seller', id }],
    }),

    createSeller: builder.mutation<ApiResponse<Seller>, BecomeSellerDto>({
      query: (data) => ({
        url: '/sellers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Seller', id: 'LIST' }],
    }),

    updateSeller: builder.mutation<
      ApiResponse<Seller>,
      { id: string; data: Partial<BecomeSellerDto> }
    >({
      query: ({ id, data }) => ({
        url: `/sellers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Seller', id },
        { type: 'Seller', id: 'LIST' },
      ],
    }),

    deleteSeller: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/sellers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Seller', id: 'LIST' }],
    }),

    // ── Seller Documents ──
    getSellerDocuments: builder.query<ApiResponse<SellerDocument[]>, string>({
      query: (sellerId) => `/sellers/${sellerId}/documents`,
      providesTags: (_r, _e, sellerId) => [{ type: 'Seller', id: sellerId }],
    }),

    addSellerDocument: builder.mutation<
      ApiResponse<SellerDocument>,
      { sellerId: string; data: CreateSellerDocumentDto }
    >({
      query: ({ sellerId, data }) => ({
        url: `/sellers/${sellerId}/documents`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { sellerId }) => [{ type: 'Seller', id: sellerId }],
    }),

    // ── Seller Wallet ──
    getSellerWallet: builder.query<ApiResponse<SellerWallet>, string>({
      query: (sellerId) => `/sellers/${sellerId}/wallet`,
      providesTags: (_r, _e, sellerId) => [{ type: 'Seller', id: `wallet-${sellerId}` }],
    }),

    getSellerWalletTransactions: builder.query<ApiResponse<WalletTransaction[]>, string>({
      query: (sellerId) => `/sellers/${sellerId}/wallet/transactions`,
      providesTags: (_r, _e, sellerId) => [{ type: 'Seller', id: `wallet-${sellerId}` }],
    }),

    // ── Stores ──
    createStore: builder.mutation<
      ApiResponse<Store>,
      { sellerId: string; data: CreateStoreDto }
    >({
      query: ({ sellerId, data }) => ({
        url: `/sellers/${sellerId}/stores`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Store', id: 'LIST' }],
    }),

    getStores: builder.query<ApiResponse<Store[]>, void>({
      query: () => '/stores',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Store' as const, id })),
              { type: 'Store', id: 'LIST' },
            ]
          : [{ type: 'Store', id: 'LIST' }],
    }),

    getStoreById: builder.query<ApiResponse<Store>, string>({
      query: (id) => `/stores/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Store', id }],
    }),

    getStoreBySlug: builder.query<ApiResponse<Store>, string>({
      query: (slug) => `/stores/slug/${slug}`,
      providesTags: (result) =>
        result?.data ? [{ type: 'Store', id: result.data.id }] : [],
    }),

    updateStore: builder.mutation<
      ApiResponse<Store>,
      { id: string; data: Partial<CreateStoreDto> }
    >({
      query: ({ id, data }) => ({
        url: `/stores/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Store', id },
        { type: 'Store', id: 'LIST' },
      ],
    }),

    deleteStore: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/stores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Store', id: 'LIST' }],
    }),

    followStore: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/stores/${id}/follow`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Store', id }],
    }),

    unfollowStore: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/stores/${id}/follow`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Store', id }],
    }),
  }),
});

export const {
  useGetSellersQuery,
  useGetSellerByIdQuery,
  useCreateSellerMutation,
  useUpdateSellerMutation,
  useDeleteSellerMutation,
  useGetSellerDocumentsQuery,
  useAddSellerDocumentMutation,
  useGetSellerWalletQuery,
  useGetSellerWalletTransactionsQuery,
  useCreateStoreMutation,
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useGetStoreBySlugQuery,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useFollowStoreMutation,
  useUnfollowStoreMutation,
} = sellersApi;
