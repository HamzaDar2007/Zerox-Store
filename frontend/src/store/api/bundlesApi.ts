import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  ProductBundle,
  BundleItem,
  CreateBundleDto,
} from '@/common/types';

interface BundleQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

interface AddBundleItemPayload {
  productId: string;
  variantId?: string;
  quantity?: number;
}

interface BundlePriceResult {
  originalPrice: number;
  bundlePrice: number;
  discount: number;
}

export const bundlesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBundles: builder.query<ApiResponse<PaginatedResponse<ProductBundle>>, BundleQueryParams>({
      query: (params) => ({
        url: '/bundles',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Bundle' as const, id })),
              { type: 'Bundle', id: 'LIST' },
            ]
          : [{ type: 'Bundle', id: 'LIST' }],
    }),

    getActiveBundles: builder.query<
      ApiResponse<PaginatedResponse<ProductBundle>>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/bundles/active',
        params,
      }),
      providesTags: [{ type: 'Bundle', id: 'ACTIVE' }],
    }),

    getBundleById: builder.query<ApiResponse<ProductBundle>, string>({
      query: (id) => `/bundles/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Bundle', id }],
    }),

    getBundleBySlug: builder.query<ApiResponse<ProductBundle>, string>({
      query: (slug) => `/bundles/slug/${slug}`,
      providesTags: (result) =>
        result?.data ? [{ type: 'Bundle', id: result.data.id }] : [],
    }),

    createBundle: builder.mutation<ApiResponse<ProductBundle>, CreateBundleDto>({
      query: (data) => ({
        url: '/bundles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Bundle', id: 'LIST' }],
    }),

    updateBundle: builder.mutation<
      ApiResponse<ProductBundle>,
      { id: string; data: Partial<CreateBundleDto> }
    >({
      query: ({ id, data }) => ({
        url: `/bundles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Bundle', id },
        { type: 'Bundle', id: 'LIST' },
        { type: 'Bundle', id: 'ACTIVE' },
      ],
    }),

    deleteBundle: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/bundles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Bundle', id: 'LIST' },
        { type: 'Bundle', id: 'ACTIVE' },
      ],
    }),

    toggleBundleActive: builder.mutation<ApiResponse<ProductBundle>, string>({
      query: (id) => ({
        url: `/bundles/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Bundle', id },
        { type: 'Bundle', id: 'LIST' },
        { type: 'Bundle', id: 'ACTIVE' },
      ],
    }),

    // ── Bundle Items ──
    getBundleItems: builder.query<ApiResponse<BundleItem[]>, string>({
      query: (bundleId) => `/bundles/${bundleId}/items`,
      providesTags: (_r, _e, bundleId) => [{ type: 'BundleItem', id: bundleId }],
    }),

    addBundleItem: builder.mutation<
      ApiResponse<BundleItem>,
      { bundleId: string; data: AddBundleItemPayload }
    >({
      query: ({ bundleId, data }) => ({
        url: `/bundles/${bundleId}/items`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { bundleId }) => [
        { type: 'BundleItem', id: bundleId },
        { type: 'Bundle', id: bundleId },
      ],
    }),

    updateBundleItem: builder.mutation<
      ApiResponse<BundleItem>,
      { bundleId: string; itemId: string; data: Partial<AddBundleItemPayload> }
    >({
      query: ({ bundleId, itemId, data }) => ({
        url: `/bundles/${bundleId}/items/${itemId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { bundleId }) => [
        { type: 'BundleItem', id: bundleId },
        { type: 'Bundle', id: bundleId },
      ],
    }),

    removeBundleItem: builder.mutation<
      ApiResponse<void>,
      { bundleId: string; itemId: string }
    >({
      query: ({ bundleId, itemId }) => ({
        url: `/bundles/${bundleId}/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { bundleId }) => [
        { type: 'BundleItem', id: bundleId },
        { type: 'Bundle', id: bundleId },
      ],
    }),

    calculateBundlePrice: builder.query<ApiResponse<BundlePriceResult>, string>({
      query: (bundleId) => `/bundles/${bundleId}/price`,
    }),
  }),
});

export const {
  useGetBundlesQuery,
  useGetActiveBundlesQuery,
  useGetBundleByIdQuery,
  useGetBundleBySlugQuery,
  useCreateBundleMutation,
  useUpdateBundleMutation,
  useDeleteBundleMutation,
  useToggleBundleActiveMutation,
  useGetBundleItemsQuery,
  useAddBundleItemMutation,
  useUpdateBundleItemMutation,
  useRemoveBundleItemMutation,
  useCalculateBundlePriceQuery,
} = bundlesApi;
