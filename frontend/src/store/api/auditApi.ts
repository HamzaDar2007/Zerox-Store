import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  AuditLog,
  UserActivityLog,
} from '@/common/types';

interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

interface ActivityLogQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}

interface UserActivitySummary {
  totalActivities: number;
  byType: Record<string, number>;
  recentActivities: UserActivityLog[];
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Audit Logs ──
    getAuditLogs: builder.query<
      ApiResponse<PaginatedResponse<AuditLog>>,
      AuditLogQueryParams
    >({
      query: (params) => ({
        url: '/audit/logs',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'AuditLog' as const, id })),
              { type: 'AuditLog', id: 'LIST' },
            ]
          : [{ type: 'AuditLog', id: 'LIST' }],
    }),

    getAuditLogById: builder.query<ApiResponse<AuditLog>, string>({
      query: (id) => `/audit/logs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'AuditLog', id }],
    }),

    getEntityAuditHistory: builder.query<
      ApiResponse<AuditLog[]>,
      { entityType: string; entityId: string }
    >({
      query: ({ entityType, entityId }) =>
        `/audit/logs/entity/${entityType}/${entityId}`,
    }),

    getUserAuditActivity: builder.query<
      ApiResponse<AuditLog[]>,
      { userId: string; startDate?: string; endDate?: string }
    >({
      query: ({ userId, ...params }) => ({
        url: `/audit/logs/user/${userId}`,
        params,
      }),
    }),

    cleanupAuditLogs: builder.mutation<ApiResponse<void>, { daysToKeep?: number }>({
      query: (data) => ({
        url: '/audit/logs/cleanup',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'AuditLog', id: 'LIST' }],
    }),

    // ── Activity Logs ──
    getActivityLogs: builder.query<
      ApiResponse<PaginatedResponse<UserActivityLog>>,
      ActivityLogQueryParams
    >({
      query: (params) => ({
        url: '/audit/activity',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'ActivityLog' as const, id })),
              { type: 'ActivityLog', id: 'LIST' },
            ]
          : [{ type: 'ActivityLog', id: 'LIST' }],
    }),

    getMyActivity: builder.query<ApiResponse<UserActivityLog[]>, { days?: number }>({
      query: (params) => ({
        url: '/audit/activity/my-activity',
        params,
      }),
    }),

    getUserActivitySummary: builder.query<
      ApiResponse<UserActivitySummary>,
      { userId: string; days?: number }
    >({
      query: ({ userId, ...params }) => ({
        url: `/audit/activity/user/${userId}/summary`,
        params,
      }),
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogByIdQuery,
  useGetEntityAuditHistoryQuery,
  useGetUserAuditActivityQuery,
  useCleanupAuditLogsMutation,
  useGetActivityLogsQuery,
  useGetMyActivityQuery,
  useGetUserActivitySummaryQuery,
} = auditApi;
