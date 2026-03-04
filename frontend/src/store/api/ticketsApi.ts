import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Ticket,
  TicketMessage,
  TicketCategory,
} from '@/common/types';
import type { TicketStatus, TicketPriority } from '@/common/types/enums';

interface TicketQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

interface CreateTicketDto {
  subject: string;
  description: string;
  categoryId?: string;
  priority?: TicketPriority;
  orderId?: string;
}

interface CreateTicketMessageDto {
  content: string;
  attachmentUrl?: string;
}

interface CreateTicketCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<ApiResponse<PaginatedResponse<Ticket>>, TicketQueryParams>({
      query: (params) => ({
        url: '/tickets',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Ticket' as const, id })),
              { type: 'Ticket', id: 'LIST' },
            ]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),

    getMyTickets: builder.query<
      ApiResponse<PaginatedResponse<Ticket>>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/tickets/my-tickets',
        params,
      }),
      providesTags: [{ type: 'Ticket', id: 'MY_TICKETS' }],
    }),

    getTicketById: builder.query<ApiResponse<Ticket>, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Ticket', id }],
    }),

    createTicket: builder.mutation<ApiResponse<Ticket>, CreateTicketDto>({
      query: (data) => ({
        url: '/tickets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Ticket', id: 'LIST' },
        { type: 'Ticket', id: 'MY_TICKETS' },
      ],
    }),

    updateTicket: builder.mutation<
      ApiResponse<Ticket>,
      { id: string; data: Partial<CreateTicketDto> }
    >({
      query: ({ id, data }) => ({
        url: `/tickets/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),

    updateTicketStatus: builder.mutation<
      ApiResponse<Ticket>,
      { id: string; status: TicketStatus }
    >({
      query: ({ id, status }) => ({
        url: `/tickets/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),

    assignTicket: builder.mutation<
      ApiResponse<Ticket>,
      { id: string; assignedToId: string }
    >({
      query: ({ id, assignedToId }) => ({
        url: `/tickets/${id}/assign`,
        method: 'PATCH',
        body: { assignedToId },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),

    getTicketMessages: builder.query<ApiResponse<TicketMessage[]>, string>({
      query: (ticketId) => `/tickets/${ticketId}/messages`,
      providesTags: (_r, _e, ticketId) => [{ type: 'Ticket', id: `messages-${ticketId}` }],
    }),

    addTicketMessage: builder.mutation<
      ApiResponse<TicketMessage>,
      { ticketId: string; data: CreateTicketMessageDto }
    >({
      query: ({ ticketId, data }) => ({
        url: `/tickets/${ticketId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { ticketId }) => [
        { type: 'Ticket', id: `messages-${ticketId}` },
        { type: 'Ticket', id: ticketId },
      ],
    }),

    // ── Ticket Categories ──
    getTicketCategories: builder.query<ApiResponse<TicketCategory[]>, void>({
      query: () => '/tickets/categories/all',
      providesTags: ['TicketCategory'],
    }),

    createTicketCategory: builder.mutation<
      ApiResponse<TicketCategory>,
      CreateTicketCategoryDto
    >({
      query: (data) => ({
        url: '/tickets/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TicketCategory'],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useGetTicketMessagesQuery,
  useAddTicketMessageMutation,
  useGetTicketCategoriesQuery,
  useCreateTicketCategoryMutation,
} = ticketsApi;
