import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  Voucher,
  Campaign,
  FlashSale,
  CreateVoucherDto,
  CreateCampaignDto,
  CreateFlashSaleDto,
} from '@/common/types';

interface VoucherValidatePayload {
  code: string;
  orderTotal: number;
}

interface VoucherApplyPayload {
  code: string;
  orderId: string;
}

interface VoucherValidationResult {
  isValid: boolean;
  discount: number;
  message?: string;
}

export const marketingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Vouchers ──
    getVouchers: builder.query<ApiResponse<Voucher[]>, { isActive?: boolean }>({
      query: (params) => ({
        url: '/marketing/vouchers',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Voucher' as const, id })),
              { type: 'Voucher', id: 'LIST' },
            ]
          : [{ type: 'Voucher', id: 'LIST' }],
    }),

    getVoucherByCode: builder.query<ApiResponse<Voucher>, string>({
      query: (code) => `/marketing/vouchers/code/${code}`,
    }),

    createVoucher: builder.mutation<ApiResponse<Voucher>, CreateVoucherDto>({
      query: (data) => ({
        url: '/marketing/vouchers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Voucher', id: 'LIST' }],
    }),

    validateVoucher: builder.mutation<
      ApiResponse<VoucherValidationResult>,
      VoucherValidatePayload
    >({
      query: (data) => ({
        url: '/marketing/vouchers/validate',
        method: 'POST',
        body: data,
      }),
    }),

    applyVoucher: builder.mutation<ApiResponse<void>, VoucherApplyPayload>({
      query: (data) => ({
        url: '/marketing/vouchers/apply',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    // ── Campaigns ──
    getCampaigns: builder.query<ApiResponse<Campaign[]>, { isActive?: boolean }>({
      query: (params) => ({
        url: '/marketing/campaigns',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Campaign' as const, id })),
              { type: 'Campaign', id: 'LIST' },
            ]
          : [{ type: 'Campaign', id: 'LIST' }],
    }),

    getCampaignById: builder.query<ApiResponse<Campaign>, string>({
      query: (id) => `/marketing/campaigns/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Campaign', id }],
    }),

    createCampaign: builder.mutation<ApiResponse<Campaign>, CreateCampaignDto>({
      query: (data) => ({
        url: '/marketing/campaigns',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),

    updateCampaign: builder.mutation<
      ApiResponse<Campaign>,
      { id: string; data: Partial<CreateCampaignDto> }
    >({
      query: ({ id, data }) => ({
        url: `/marketing/campaigns/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Campaign', id },
        { type: 'Campaign', id: 'LIST' },
      ],
    }),

    // ── Flash Sales ──
    getActiveFlashSales: builder.query<ApiResponse<FlashSale[]>, void>({
      query: () => '/marketing/flash-sales/active',
      providesTags: [{ type: 'FlashSale', id: 'ACTIVE' }],
    }),

    getFlashSaleById: builder.query<ApiResponse<FlashSale>, string>({
      query: (id) => `/marketing/flash-sales/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'FlashSale', id }],
    }),

    createFlashSale: builder.mutation<ApiResponse<FlashSale>, CreateFlashSaleDto>({
      query: (data) => ({
        url: '/marketing/flash-sales',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'FlashSale', id: 'ACTIVE' }],
    }),
  }),
});

export const {
  useGetVouchersQuery,
  useGetVoucherByCodeQuery,
  useCreateVoucherMutation,
  useValidateVoucherMutation,
  useApplyVoucherMutation,
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useGetActiveFlashSalesQuery,
  useGetFlashSaleByIdQuery,
  useCreateFlashSaleMutation,
} = marketingApi;
