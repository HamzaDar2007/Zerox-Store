import { baseApi } from '../baseApi';
import type { ApiResponse, Role, Permission } from '@/common/types';

interface CreateRoleDto {
  name: string;
  displayName?: string;
  description?: string;
  isSystem?: boolean;
}

interface CreatePermissionDto {
  roleId: string;
  module: string;
  action: string;
}

interface AssignRolePermissionsDto {
  permissionIds: string[];
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Roles ──
    getRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => '/roles',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Role' as const, id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),

    getRoleById: builder.query<ApiResponse<Role>, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Role', id }],
    }),

    createRole: builder.mutation<ApiResponse<Role>, CreateRoleDto>({
      query: (data) => ({
        url: '/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    updateRole: builder.mutation<
      ApiResponse<Role>,
      { id: string; data: Partial<CreateRoleDto> }
    >({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    deleteRole: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    // ── Permissions ──
    getPermissions: builder.query<ApiResponse<Permission[]>, void>({
      query: () => '/permissions',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Permission' as const, id })),
              { type: 'Permission', id: 'LIST' },
            ]
          : [{ type: 'Permission', id: 'LIST' }],
    }),

    getPermissionsByModule: builder.query<ApiResponse<Permission[]>, string>({
      query: (module) => ({
        url: '/permissions/by-module',
        params: { module },
      }),
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    getPermissionById: builder.query<ApiResponse<Permission>, string>({
      query: (id) => `/permissions/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Permission', id }],
    }),

    createPermission: builder.mutation<ApiResponse<Permission>, CreatePermissionDto>({
      query: (data) => ({
        url: '/permissions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    updatePermission: builder.mutation<
      ApiResponse<Permission>,
      { id: string; data: Partial<CreatePermissionDto> }
    >({
      query: ({ id, data }) => ({
        url: `/permissions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Permission', id },
        { type: 'Permission', id: 'LIST' },
      ],
    }),

    deletePermission: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    // ── Role-Permissions ──
    getRolePermissions: builder.query<ApiResponse<Permission[]>, string>({
      query: (roleId) => `/role-permissions/${roleId}`,
      providesTags: (_r, _e, roleId) => [{ type: 'RolePermission', id: roleId }],
    }),

    assignRolePermissions: builder.mutation<
      ApiResponse<void>,
      { roleId: string; data: AssignRolePermissionsDto }
    >({
      query: ({ roleId, data }) => ({
        url: `/role-permissions/${roleId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { roleId }) => [
        { type: 'RolePermission', id: roleId },
        { type: 'Role', id: roleId },
      ],
    }),

    removeRolePermission: builder.mutation<
      ApiResponse<void>,
      { roleId: string; permissionId: string }
    >({
      query: ({ roleId, permissionId }) => ({
        url: `/role-permissions/${roleId}/${permissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { roleId }) => [
        { type: 'RolePermission', id: roleId },
        { type: 'Role', id: roleId },
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useGetPermissionsByModuleQuery,
  useGetPermissionByIdQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetRolePermissionsQuery,
  useAssignRolePermissionsMutation,
  useRemoveRolePermissionMutation,
} = rolesApi;
