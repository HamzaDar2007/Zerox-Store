import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Notification,
  NotificationTemplate,
  NotificationPreference,
} from '@/common/types';

interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}

interface CreateNotificationTemplateDto {
  name: string;
  type: string;
  subject?: string;
  body: string;
  variables?: string[];
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      ApiResponse<PaginatedResponse<Notification>>,
      NotificationQueryParams
    >({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    getUnreadCount: builder.query<ApiResponse<number>, void>({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: 'Notification', id: 'UNREAD' }],
    }),

    markAsRead: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    markAllAsRead: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    deleteNotification: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    getNotificationPreferences: builder.query<ApiResponse<NotificationPreference[]>, void>({
      query: () => '/notifications/preferences',
      providesTags: ['NotificationPreference'],
    }),

    updateNotificationPreference: builder.mutation<
      ApiResponse<NotificationPreference>,
      { type: string; data: Partial<NotificationPreference> }
    >({
      query: ({ type, data }) => ({
        url: `/notifications/preferences/${type}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['NotificationPreference'],
    }),

    // ── Notification Templates (admin) ──
    getNotificationTemplates: builder.query<ApiResponse<NotificationTemplate[]>, void>({
      query: () => '/notification-templates',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'NotificationTemplate' as const, id })),
              { type: 'NotificationTemplate', id: 'LIST' },
            ]
          : [{ type: 'NotificationTemplate', id: 'LIST' }],
    }),

    createNotificationTemplate: builder.mutation<
      ApiResponse<NotificationTemplate>,
      CreateNotificationTemplateDto
    >({
      query: (data) => ({
        url: '/notification-templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'NotificationTemplate', id: 'LIST' }],
    }),

    updateNotificationTemplate: builder.mutation<
      ApiResponse<NotificationTemplate>,
      { id: string; data: Partial<CreateNotificationTemplateDto> }
    >({
      query: ({ id, data }) => ({
        url: `/notification-templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'NotificationTemplate', id },
        { type: 'NotificationTemplate', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation,
  useGetNotificationTemplatesQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
} = notificationsApi;
