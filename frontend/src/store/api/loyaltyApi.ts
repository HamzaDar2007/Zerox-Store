import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  LoyaltyPoints,
  LoyaltyTier,
  LoyaltyTransaction,
  Referral,
  ReferralCode,
  CreateLoyaltyTransactionDto,
  CreateLoyaltyTierDto,
} from '@/common/types';

export const loyaltyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Points ──
    getMyLoyaltyPoints: builder.query<ApiResponse<LoyaltyPoints>, void>({
      query: () => '/loyalty/points',
      providesTags: ['LoyaltyPoints'],
    }),

    earnPoints: builder.mutation<ApiResponse<LoyaltyTransaction>, CreateLoyaltyTransactionDto>({
      query: (data) => ({
        url: '/loyalty/points/earn',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LoyaltyPoints', 'LoyaltyTransaction'],
    }),

    redeemPoints: builder.mutation<
      ApiResponse<LoyaltyTransaction>,
      { points: number; orderId?: string }
    >({
      query: (data) => ({
        url: '/loyalty/points/redeem',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LoyaltyPoints', 'LoyaltyTransaction'],
    }),

    getMyLoyaltyTransactions: builder.query<
      ApiResponse<PaginatedResponse<LoyaltyTransaction>>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/loyalty/transactions',
        params,
      }),
      providesTags: ['LoyaltyTransaction'],
    }),

    // ── Tiers ──
    getLoyaltyTiers: builder.query<ApiResponse<LoyaltyTier[]>, void>({
      query: () => '/loyalty/tiers',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'LoyaltyTier' as const, id })),
              { type: 'LoyaltyTier', id: 'LIST' },
            ]
          : [{ type: 'LoyaltyTier', id: 'LIST' }],
    }),

    createLoyaltyTier: builder.mutation<ApiResponse<LoyaltyTier>, CreateLoyaltyTierDto>({
      query: (data) => ({
        url: '/loyalty/tiers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'LoyaltyTier', id: 'LIST' }],
    }),

    updateLoyaltyTier: builder.mutation<
      ApiResponse<LoyaltyTier>,
      { id: string; data: Partial<CreateLoyaltyTierDto> }
    >({
      query: ({ id, data }) => ({
        url: `/loyalty/tiers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'LoyaltyTier', id },
        { type: 'LoyaltyTier', id: 'LIST' },
      ],
    }),

    deleteLoyaltyTier: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/loyalty/tiers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'LoyaltyTier', id: 'LIST' }],
    }),

    // ── Referrals ──
    getMyReferralCode: builder.query<ApiResponse<ReferralCode>, void>({
      query: () => '/loyalty/referral-code',
      providesTags: ['Referral'],
    }),

    applyReferral: builder.mutation<ApiResponse<void>, string>({
      query: (code) => ({
        url: '/loyalty/referral/apply',
        method: 'POST',
        body: { code },
      }),
      invalidatesTags: ['Referral', 'LoyaltyPoints'],
    }),

    getMyReferrals: builder.query<ApiResponse<Referral[]>, void>({
      query: () => '/loyalty/referrals',
      providesTags: ['Referral'],
    }),
  }),
});

export const {
  useGetMyLoyaltyPointsQuery,
  useEarnPointsMutation,
  useRedeemPointsMutation,
  useGetMyLoyaltyTransactionsQuery,
  useGetLoyaltyTiersQuery,
  useCreateLoyaltyTierMutation,
  useUpdateLoyaltyTierMutation,
  useDeleteLoyaltyTierMutation,
  useGetMyReferralCodeQuery,
  useApplyReferralMutation,
  useGetMyReferralsQuery,
} = loyaltyApi;
