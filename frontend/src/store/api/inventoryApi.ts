import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Inventory,
  Warehouse,
  StockMovement,
  StockReservation,
  InventoryTransfer,
  CreateWarehouseDto,
  CreateStockMovementDto,
  CreateTransferDto,
} from '@/common/types';

interface AdjustStockPayload {
  productId: string;
  warehouseId: string;
  adjustment: number;
  reason: string;
  variantId?: string;
}

interface ReserveStockPayload {
  productId: string;
  warehouseId: string;
  quantity: number;
  orderId: string;
  variantId?: string;
}

interface MovementQueryParams {
  warehouseId?: string;
  page?: number;
  limit?: number;
}

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Warehouses ──
    getWarehouses: builder.query<ApiResponse<Warehouse[]>, { sellerId?: string }>({
      query: (params) => ({
        url: '/warehouses',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Warehouse' as const, id })),
              { type: 'Warehouse', id: 'LIST' },
            ]
          : [{ type: 'Warehouse', id: 'LIST' }],
    }),

    getWarehouseById: builder.query<ApiResponse<Warehouse>, string>({
      query: (id) => `/warehouses/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Warehouse', id }],
    }),

    createWarehouse: builder.mutation<ApiResponse<Warehouse>, CreateWarehouseDto>({
      query: (data) => ({
        url: '/warehouses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Warehouse', id: 'LIST' }],
    }),

    updateWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      { id: string; data: Partial<CreateWarehouseDto> }
    >({
      query: ({ id, data }) => ({
        url: `/warehouses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
      ],
    }),

    deleteWarehouse: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/warehouses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Warehouse', id: 'LIST' }],
    }),

    getWarehouseInventory: builder.query<ApiResponse<Inventory[]>, string>({
      query: (warehouseId) => `/warehouses/${warehouseId}/inventory`,
      providesTags: (_r, _e, warehouseId) => [{ type: 'Inventory', id: warehouseId }],
    }),

    // ── Inventory ──
    getProductInventory: builder.query<
      ApiResponse<Inventory[]>,
      { productId: string; variantId?: string }
    >({
      query: ({ productId, variantId }) => ({
        url: `/inventory/product/${productId}`,
        params: { variantId },
      }),
      providesTags: (_r, _e, { productId }) => [{ type: 'Inventory', id: productId }],
    }),

    adjustStock: builder.mutation<ApiResponse<Inventory>, AdjustStockPayload>({
      query: (data) => ({
        url: '/inventory/adjust',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Inventory', id: productId }],
    }),

    reserveStock: builder.mutation<ApiResponse<StockReservation>, ReserveStockPayload>({
      query: (data) => ({
        url: '/inventory/reserve',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Inventory', id: productId }],
    }),

    releaseReservation: builder.mutation<ApiResponse<void>, string>({
      query: (reservationId) => ({
        url: `/inventory/release/${reservationId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),

    getStockMovements: builder.query<
      ApiResponse<PaginatedResponse<StockMovement>>,
      { productId: string } & MovementQueryParams
    >({
      query: ({ productId, ...params }) => ({
        url: `/inventory/movements/${productId}`,
        params,
      }),
    }),

    createStockMovement: builder.mutation<ApiResponse<StockMovement>, CreateStockMovementDto>({
      query: (data) => ({
        url: '/inventory/movements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),

    // ── Transfers ──
    getInventoryTransfers: builder.query<
      ApiResponse<InventoryTransfer[]>,
      { warehouseId?: string }
    >({
      query: (params) => ({
        url: '/inventory/transfers',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'InventoryTransfer' as const, id })),
              { type: 'InventoryTransfer', id: 'LIST' },
            ]
          : [{ type: 'InventoryTransfer', id: 'LIST' }],
    }),

    createInventoryTransfer: builder.mutation<
      ApiResponse<InventoryTransfer>,
      CreateTransferDto
    >({
      query: (data) => ({
        url: '/inventory/transfers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'InventoryTransfer', id: 'LIST' }],
    }),

    completeInventoryTransfer: builder.mutation<ApiResponse<InventoryTransfer>, string>({
      query: (id) => ({
        url: `/inventory/transfers/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'InventoryTransfer', id },
        { type: 'InventoryTransfer', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseByIdQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetWarehouseInventoryQuery,
  useGetProductInventoryQuery,
  useAdjustStockMutation,
  useReserveStockMutation,
  useReleaseReservationMutation,
  useGetStockMovementsQuery,
  useCreateStockMovementMutation,
  useGetInventoryTransfersQuery,
  useCreateInventoryTransferMutation,
  useCompleteInventoryTransferMutation,
} = inventoryApi;
