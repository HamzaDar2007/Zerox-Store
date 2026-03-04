import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  SystemSetting,
  FeatureFlag,
  CreateSystemSettingDto,
  CreateFeatureFlagDto,
} from '@/common/types';

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Settings ──
    getSettings: builder.query<ApiResponse<SystemSetting[]>, { group?: string }>({
      query: (params) => ({
        url: '/system/settings',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'SystemSetting' as const, id })),
              { type: 'SystemSetting', id: 'LIST' },
            ]
          : [{ type: 'SystemSetting', id: 'LIST' }],
    }),

    getSettingsByGroup: builder.query<ApiResponse<SystemSetting[]>, string>({
      query: (group) => `/system/settings/group/${group}`,
      providesTags: [{ type: 'SystemSetting', id: 'LIST' }],
    }),

    getSettingByKey: builder.query<ApiResponse<SystemSetting>, string>({
      query: (key) => `/system/settings/key/${key}`,
    }),

    getSettingById: builder.query<ApiResponse<SystemSetting>, string>({
      query: (id) => `/system/settings/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'SystemSetting', id }],
    }),

    createSetting: builder.mutation<ApiResponse<SystemSetting>, CreateSystemSettingDto>({
      query: (data) => ({
        url: '/system/settings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'SystemSetting', id: 'LIST' }],
    }),

    updateSetting: builder.mutation<
      ApiResponse<SystemSetting>,
      { id: string; data: Partial<CreateSystemSettingDto> }
    >({
      query: ({ id, data }) => ({
        url: `/system/settings/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'SystemSetting', id },
        { type: 'SystemSetting', id: 'LIST' },
      ],
    }),

    updateSettingByKey: builder.mutation<
      ApiResponse<SystemSetting>,
      { key: string; value: string }
    >({
      query: ({ key, value }) => ({
        url: `/system/settings/key/${key}`,
        method: 'PATCH',
        body: { value },
      }),
      invalidatesTags: [{ type: 'SystemSetting', id: 'LIST' }],
    }),

    bulkUpdateSettings: builder.mutation<
      ApiResponse<void>,
      Array<{ key: string; value: string }>
    >({
      query: (settings) => ({
        url: '/system/settings/bulk',
        method: 'POST',
        body: settings,
      }),
      invalidatesTags: [{ type: 'SystemSetting', id: 'LIST' }],
    }),

    deleteSetting: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/system/settings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'SystemSetting', id: 'LIST' }],
    }),

    // ── Feature Flags ──
    getFeatureFlags: builder.query<ApiResponse<FeatureFlag[]>, void>({
      query: () => '/system/features',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'FeatureFlag' as const, id })),
              { type: 'FeatureFlag', id: 'LIST' },
            ]
          : [{ type: 'FeatureFlag', id: 'LIST' }],
    }),

    getEnabledFeatures: builder.query<ApiResponse<FeatureFlag[]>, void>({
      query: () => '/system/features/enabled',
      providesTags: [{ type: 'FeatureFlag', id: 'ENABLED' }],
    }),

    getFeatureFlagById: builder.query<ApiResponse<FeatureFlag>, string>({
      query: (id) => `/system/features/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'FeatureFlag', id }],
    }),

    createFeatureFlag: builder.mutation<ApiResponse<FeatureFlag>, CreateFeatureFlagDto>({
      query: (data) => ({
        url: '/system/features',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'FeatureFlag', id: 'LIST' }],
    }),

    updateFeatureFlag: builder.mutation<
      ApiResponse<FeatureFlag>,
      { id: string; data: Partial<CreateFeatureFlagDto> }
    >({
      query: ({ id, data }) => ({
        url: `/system/features/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'FeatureFlag', id },
        { type: 'FeatureFlag', id: 'LIST' },
        { type: 'FeatureFlag', id: 'ENABLED' },
      ],
    }),

    toggleFeatureFlag: builder.mutation<ApiResponse<FeatureFlag>, string>({
      query: (id) => ({
        url: `/system/features/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'FeatureFlag', id },
        { type: 'FeatureFlag', id: 'LIST' },
        { type: 'FeatureFlag', id: 'ENABLED' },
      ],
    }),

    deleteFeatureFlag: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/system/features/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'FeatureFlag', id: 'LIST' },
        { type: 'FeatureFlag', id: 'ENABLED' },
      ],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetSettingsByGroupQuery,
  useGetSettingByKeyQuery,
  useGetSettingByIdQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
  useUpdateSettingByKeyMutation,
  useBulkUpdateSettingsMutation,
  useDeleteSettingMutation,
  useGetFeatureFlagsQuery,
  useGetEnabledFeaturesQuery,
  useGetFeatureFlagByIdQuery,
  useCreateFeatureFlagMutation,
  useUpdateFeatureFlagMutation,
  useToggleFeatureFlagMutation,
  useDeleteFeatureFlagMutation,
} = systemApi;
