import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  BulkOperation,
  ImportExportJob,
  CreateBulkOperationDto,
  CreateImportExportJobDto,
} from '@/common/types';
import type { JobStatus as BulkOperationStatus, ImportJobType, JobStatus } from '@/common/types/enums';

interface BulkOperationQueryParams {
  page?: number;
  limit?: number;
  status?: BulkOperationStatus;
  operationType?: string;
}

interface JobQueryParams {
  page?: number;
  limit?: number;
  type?: ImportJobType;
  status?: JobStatus;
  userId?: string;
}

export const operationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Bulk Operations ──
    getBulkOperations: builder.query<
      ApiResponse<PaginatedResponse<BulkOperation>>,
      BulkOperationQueryParams
    >({
      query: (params) => ({
        url: '/operations/bulk',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'BulkOperation' as const, id })),
              { type: 'BulkOperation', id: 'LIST' },
            ]
          : [{ type: 'BulkOperation', id: 'LIST' }],
    }),

    getBulkOperationById: builder.query<ApiResponse<BulkOperation>, string>({
      query: (id) => `/operations/bulk/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'BulkOperation', id }],
    }),

    createBulkOperation: builder.mutation<ApiResponse<BulkOperation>, CreateBulkOperationDto>({
      query: (data) => ({
        url: '/operations/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'BulkOperation', id: 'LIST' }],
    }),

    updateBulkOperationProgress: builder.mutation<
      ApiResponse<BulkOperation>,
      { id: string; successCount: number; failureCount?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/operations/bulk/${id}/progress`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'BulkOperation', id }],
    }),

    cancelBulkOperation: builder.mutation<ApiResponse<BulkOperation>, string>({
      query: (id) => ({
        url: `/operations/bulk/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'BulkOperation', id },
        { type: 'BulkOperation', id: 'LIST' },
      ],
    }),

    failBulkOperation: builder.mutation<
      ApiResponse<BulkOperation>,
      { id: string; errorLog: string }
    >({
      query: ({ id, errorLog }) => ({
        url: `/operations/bulk/${id}/fail`,
        method: 'POST',
        body: { errorLog },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'BulkOperation', id },
        { type: 'BulkOperation', id: 'LIST' },
      ],
    }),

    // ── Import/Export Jobs ──
    getJobs: builder.query<ApiResponse<PaginatedResponse<ImportExportJob>>, JobQueryParams>({
      query: (params) => ({
        url: '/operations/jobs',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'ImportExportJob' as const, id })),
              { type: 'ImportExportJob', id: 'LIST' },
            ]
          : [{ type: 'ImportExportJob', id: 'LIST' }],
    }),

    getMyJobs: builder.query<ApiResponse<ImportExportJob[]>, { jobType?: string }>({
      query: (params) => ({
        url: '/operations/jobs/my-jobs',
        params,
      }),
      providesTags: [{ type: 'ImportExportJob', id: 'MY_JOBS' }],
    }),

    getJobById: builder.query<ApiResponse<ImportExportJob>, string>({
      query: (id) => `/operations/jobs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'ImportExportJob', id }],
    }),

    createJob: builder.mutation<ApiResponse<ImportExportJob>, CreateImportExportJobDto>({
      query: (data) => ({
        url: '/operations/jobs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'ImportExportJob', id: 'LIST' },
        { type: 'ImportExportJob', id: 'MY_JOBS' },
      ],
    }),

    updateJobProgress: builder.mutation<
      ApiResponse<ImportExportJob>,
      { id: string; processedRows: number; successRows?: number; failedRows?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/operations/jobs/${id}/progress`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ImportExportJob', id }],
    }),

    completeJob: builder.mutation<
      ApiResponse<ImportExportJob>,
      { id: string; resultFileUrl?: string }
    >({
      query: ({ id, resultFileUrl }) => ({
        url: `/operations/jobs/${id}/complete`,
        method: 'POST',
        body: { resultFileUrl },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'ImportExportJob', id },
        { type: 'ImportExportJob', id: 'LIST' },
      ],
    }),

    failJob: builder.mutation<
      ApiResponse<ImportExportJob>,
      { id: string; errorMessage: string; errorDetails?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/operations/jobs/${id}/fail`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'ImportExportJob', id },
        { type: 'ImportExportJob', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetBulkOperationsQuery,
  useGetBulkOperationByIdQuery,
  useCreateBulkOperationMutation,
  useUpdateBulkOperationProgressMutation,
  useCancelBulkOperationMutation,
  useFailBulkOperationMutation,
  useGetJobsQuery,
  useGetMyJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobProgressMutation,
  useCompleteJobMutation,
  useFailJobMutation,
} = operationsApi;
