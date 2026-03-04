import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Dispute,
  DisputeMessage,
  DisputeEvidence,
} from '@/common/types';
import type { DisputeStatus } from '@/common/types/enums';

interface DisputeQueryParams {
  page?: number;
  limit?: number;
  customerId?: string;
  orderId?: string;
  status?: DisputeStatus;
}

interface CreateDisputeDto {
  orderId: string;
  type: string;
  subject: string;
  description: string;
  disputedAmount?: number;
}

interface CreateDisputeMessageDto {
  content: string;
  attachmentUrl?: string;
}

interface CreateDisputeEvidenceDto {
  type: string;
  description: string;
  fileUrl: string;
}

export const disputesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDisputes: builder.query<ApiResponse<PaginatedResponse<Dispute>>, DisputeQueryParams>({
      query: (params) => ({
        url: '/disputes',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Dispute' as const, id })),
              { type: 'Dispute', id: 'LIST' },
            ]
          : [{ type: 'Dispute', id: 'LIST' }],
    }),

    getDisputeById: builder.query<ApiResponse<Dispute>, string>({
      query: (id) => `/disputes/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Dispute', id }],
    }),

    createDispute: builder.mutation<ApiResponse<Dispute>, CreateDisputeDto>({
      query: (data) => ({
        url: '/disputes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Dispute', id: 'LIST' }],
    }),

    updateDisputeStatus: builder.mutation<
      ApiResponse<Dispute>,
      { id: string; status: DisputeStatus; resolution?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/disputes/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Dispute', id },
        { type: 'Dispute', id: 'LIST' },
      ],
    }),

    addDisputeEvidence: builder.mutation<
      ApiResponse<DisputeEvidence>,
      { disputeId: string; data: CreateDisputeEvidenceDto }
    >({
      query: ({ disputeId, data }) => ({
        url: `/disputes/${disputeId}/evidence`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { disputeId }) => [{ type: 'Dispute', id: disputeId }],
    }),

    getDisputeMessages: builder.query<ApiResponse<DisputeMessage[]>, string>({
      query: (disputeId) => `/disputes/${disputeId}/messages`,
      providesTags: (_r, _e, id) => [{ type: 'Dispute', id: `messages-${id}` }],
    }),

    addDisputeMessage: builder.mutation<
      ApiResponse<DisputeMessage>,
      { disputeId: string; data: CreateDisputeMessageDto }
    >({
      query: ({ disputeId, data }) => ({
        url: `/disputes/${disputeId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { disputeId }) => [
        { type: 'Dispute', id: `messages-${disputeId}` },
        { type: 'Dispute', id: disputeId },
      ],
    }),
  }),
});

export const {
  useGetDisputesQuery,
  useGetDisputeByIdQuery,
  useCreateDisputeMutation,
  useUpdateDisputeStatusMutation,
  useAddDisputeEvidenceMutation,
  useGetDisputeMessagesQuery,
  useAddDisputeMessageMutation,
} = disputesApi;
