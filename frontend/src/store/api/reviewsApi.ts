import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Review,
  CreateReviewDto,
} from '@/common/types';
import type { ReviewStatus, ReviewReportReason } from '@/common/types/enums';

interface ReviewQueryParams {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
  status?: ReviewStatus;
  minRating?: number;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ApiResponse<PaginatedResponse<Review>>, ReviewQueryParams>({
      query: (params) => ({
        url: '/reviews',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Review' as const, id })),
              { type: 'Review', id: 'LIST' },
            ]
          : [{ type: 'Review', id: 'LIST' }],
    }),

    getReviewById: builder.query<ApiResponse<Review>, string>({
      query: (id) => `/reviews/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Review', id }],
    }),

    getRatingSummary: builder.query<ApiResponse<RatingSummary>, string>({
      query: (productId) => `/reviews/product/${productId}/summary`,
    }),

    createReview: builder.mutation<ApiResponse<Review>, CreateReviewDto>({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),

    updateReview: builder.mutation<
      ApiResponse<Review>,
      { id: string; data: Partial<CreateReviewDto> }
    >({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Review', id },
        { type: 'Review', id: 'LIST' },
      ],
    }),

    deleteReview: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),

    updateReviewStatus: builder.mutation<
      ApiResponse<Review>,
      { id: string; status: ReviewStatus }
    >({
      query: ({ id, status }) => ({
        url: `/reviews/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Review', id },
        { type: 'Review', id: 'LIST' },
      ],
    }),

    markReviewHelpful: builder.mutation<
      ApiResponse<void>,
      { id: string; isHelpful: boolean }
    >({
      query: ({ id, isHelpful }) => ({
        url: `/reviews/${id}/helpful`,
        method: 'POST',
        body: { isHelpful },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Review', id }],
    }),

    reportReview: builder.mutation<
      ApiResponse<void>,
      { id: string; reason: ReviewReportReason }
    >({
      query: ({ id, reason }) => ({
        url: `/reviews/${id}/report`,
        method: 'POST',
        body: { reason },
      }),
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewByIdQuery,
  useGetRatingSummaryQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewStatusMutation,
  useMarkReviewHelpfulMutation,
  useReportReviewMutation,
} = reviewsApi;
