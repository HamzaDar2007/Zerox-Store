import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  SearchHistory,
  RecentlyViewed,
  ProductComparison,
  Product,
} from '@/common/types';

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Search History ──
    saveSearchHistory: builder.mutation<ApiResponse<SearchHistory>, string>({
      query: (query) => ({
        url: '/search/history',
        method: 'POST',
        body: { query },
      }),
      invalidatesTags: ['Search'],
    }),

    getSearchHistory: builder.query<ApiResponse<SearchHistory[]>, { limit?: number }>({
      query: (params) => ({
        url: '/search/history',
        params,
      }),
      providesTags: ['Search'],
    }),

    clearSearchHistory: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/search/history',
        method: 'DELETE',
      }),
      invalidatesTags: ['Search'],
    }),

    // ── Recently Viewed ──
    addRecentlyViewed: builder.mutation<ApiResponse<RecentlyViewed>, string>({
      query: (productId) => ({
        url: `/search/recently-viewed/${productId}`,
        method: 'POST',
      }),
    }),

    getRecentlyViewed: builder.query<ApiResponse<RecentlyViewed[]>, { limit?: number }>({
      query: (params) => ({
        url: '/search/recently-viewed',
        params,
      }),
    }),

    // ── Product Comparison ──
    addToComparison: builder.mutation<ApiResponse<ProductComparison>, string>({
      query: (productId) => ({
        url: `/search/compare/${productId}`,
        method: 'POST',
      }),
    }),

    getComparison: builder.query<ApiResponse<ProductComparison[]>, void>({
      query: () => '/search/compare',
    }),

    removeFromComparison: builder.mutation<ApiResponse<void>, string>({
      query: (productId) => ({
        url: `/search/compare/${productId}`,
        method: 'DELETE',
      }),
    }),

    // ── Recommendations ──
    getRecommendations: builder.query<ApiResponse<Product[]>, string>({
      query: (productId) => ({
        url: '/search/recommendations',
        params: { productId },
      }),
    }),
  }),
});

export const {
  useSaveSearchHistoryMutation,
  useGetSearchHistoryQuery,
  useClearSearchHistoryMutation,
  useAddRecentlyViewedMutation,
  useGetRecentlyViewedQuery,
  useAddToComparisonMutation,
  useGetComparisonQuery,
  useRemoveFromComparisonMutation,
  useGetRecommendationsQuery,
} = searchApi;
