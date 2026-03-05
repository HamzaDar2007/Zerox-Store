import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  Conversation,
  Message,
} from '@/common/types';

interface CreateConversationDto {
  type: string;
  customerId: string;
  storeId?: string;
  orderId?: string;
  subject?: string;
  status?: string;
}

interface CreateMessageDto {
  content: string;
  messageType?: string;
  attachmentUrl?: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<ApiResponse<Conversation[]>, void>({
      query: () => '/chat/conversations',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Conversation' as const, id })),
              { type: 'Conversation', id: 'LIST' },
            ]
          : [{ type: 'Conversation', id: 'LIST' }],
    }),

    getConversation: builder.query<ApiResponse<Conversation>, string>({
      query: (id) => `/chat/conversations/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Conversation', id }],
    }),

    createConversation: builder.mutation<ApiResponse<Conversation>, CreateConversationDto>({
      query: (data) => ({
        url: '/chat/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),

    getMessages: builder.query<
      ApiResponse<Message[]>,
      { conversationId: string; page?: number; limit?: number }
    >({
      query: ({ conversationId, ...params }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        params,
      }),
      providesTags: (_r, _e, { conversationId }) => [{ type: 'Message', id: conversationId }],
    }),

    sendMessage: builder.mutation<
      ApiResponse<Message>,
      { conversationId: string; data: CreateMessageDto }
    >({
      query: ({ conversationId, data }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: 'Message', id: conversationId },
        { type: 'Conversation', id: conversationId },
      ],
    }),

    markConversationAsRead: builder.mutation<ApiResponse<void>, string>({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Conversation', id }],
    }),

    getChatUnreadCount: builder.query<ApiResponse<number>, void>({
      query: () => '/chat/unread-count',
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  useGetChatUnreadCountQuery,
} = chatApi;
