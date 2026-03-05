import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  ReturnRequest,
  ReturnReason,
} from '@/common/types';
import type { ReturnStatus } from '@/common/types/enums';

interface ReturnQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  orderId?: string;
  status?: ReturnStatus;
}

interface CreateReturnRequestDto {
  orderId: string;
  orderItemId: string;
  userId: string;
  reasonId?: string;
  reasonDetails?: string;
  type: string;
  quantity: number;
  refundAmount?: number;
  resolution?: string;
  customerNotes?: string;
}

interface CreateReturnReasonDto {
  name: string;
  description?: string;
  isActive?: boolean;
  requiresEvidence?: boolean;
}

export const returnsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReturns: builder.query<ApiResponse<PaginatedResponse<ReturnRequest>>, ReturnQueryParams>({
      query: (params) => ({
        url: '/returns',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Return' as const, id })),
              { type: 'Return', id: 'LIST' },
            ]
          : [{ type: 'Return', id: 'LIST' }],
    }),

    getReturnById: builder.query<ApiResponse<ReturnRequest>, string>({
      query: (id) => `/returns/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Return', id }],
    }),

    createReturn: builder.mutation<ApiResponse<ReturnRequest>, CreateReturnRequestDto>({
      query: (data) => ({
        url: '/returns',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Return', id: 'LIST' }],
    }),

    updateReturn: builder.mutation<
      ApiResponse<ReturnRequest>,
      { id: string; data: Partial<CreateReturnRequestDto> }
    >({
      query: ({ id, data }) => ({
        url: `/returns/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Return', id },
        { type: 'Return', id: 'LIST' },
      ],
    }),

    updateReturnStatus: builder.mutation<
      ApiResponse<ReturnRequest>,
      { id: string; status: ReturnStatus; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/returns/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Return', id },
        { type: 'Return', id: 'LIST' },
      ],
    }),

    addReturnImage: builder.mutation<
      ApiResponse<void>,
      { id: string; imageUrl: string }
    >({
      query: ({ id, imageUrl }) => ({
        url: `/returns/${id}/images`,
        method: 'POST',
        body: { imageUrl },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Return', id }],
    }),

    // ── Return Reasons ──
    getReturnReasons: builder.query<ApiResponse<ReturnReason[]>, void>({
      query: () => '/return-reasons',
      providesTags: ['ReturnReason'],
    }),

    createReturnReason: builder.mutation<ApiResponse<ReturnReason>, CreateReturnReasonDto>({
      query: (data) => ({
        url: '/return-reasons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ReturnReason'],
    }),

    updateReturnReason: builder.mutation<
      ApiResponse<ReturnReason>,
      { id: string; data: Partial<CreateReturnReasonDto> }
    >({
      query: ({ id, data }) => ({
        url: `/return-reasons/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['ReturnReason'],
    }),
  }),
});

export const {
  useGetReturnsQuery,
  useGetReturnByIdQuery,
  useCreateReturnMutation,
  useUpdateReturnMutation,
  useUpdateReturnStatusMutation,
  useAddReturnImageMutation,
  useGetReturnReasonsQuery,
  useCreateReturnReasonMutation,
  useUpdateReturnReasonMutation,
} = returnsApi;
