import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Warehouse, Package } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Warehouse as WarehouseType, Inventory } from '@/common/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import {
  useGetWarehousesQuery,
  useGetWarehouseInventoryQuery,
} from '@/store/api';

export default function AdminInventoryPage() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

  const { data: warehousesData, isLoading } = useGetWarehousesQuery({});
  const warehouses = warehousesData?.data ?? [];

  const { data: inventoryData, isLoading: loadingInventory } = useGetWarehouseInventoryQuery(
    selectedWarehouseId!,
    { skip: !selectedWarehouseId },
  );
  const inventory = inventoryData?.data ?? [];

  const warehouseCols: ColumnDef<WarehouseType>[] = [
    { accessorKey: 'name', header: 'Warehouse' },
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'isDefault', header: 'Default', cell: ({ row }) => row.original.isDefault ? 'Yes' : 'No' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedWarehouseId(row.original.id)}>View Inventory</Button>
      ),
    },
  ];

  const inventoryCols: ColumnDef<Inventory>[] = [
    { accessorKey: 'productId', header: 'Product ID' },
    { accessorKey: 'productVariantId', header: 'Variant' },
    { accessorKey: 'quantityOnHand', header: 'On Hand' },
    { accessorKey: 'quantityReserved', header: 'Reserved' },
    { accessorKey: 'quantityAvailable', header: 'Available' },
    { accessorKey: 'lowStockThreshold', header: 'Low Stock At' },
    { accessorKey: 'lastRestockedAt', header: 'Last Restocked' },
  ];

  if (isLoading) return <LoadingSpinner label="Loading inventory..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Overview" description="View warehouse inventory across all sellers" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Warehouses</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{warehouses.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{warehouses.filter((w) => w.isActive).length}</p></CardContent>
        </Card>
        {selectedWarehouseId && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Items in Warehouse</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{inventory.length}</p></CardContent>
          </Card>
        )}
      </div>

      {warehouses.length === 0 ? (
        <EmptyState icon={<Warehouse className="h-12 w-12" />} title="No warehouses" description="No warehouses have been created yet" />
      ) : (
        <DataTable columns={warehouseCols} data={warehouses} />
      )}

      {selectedWarehouseId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Warehouse Inventory</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedWarehouseId(null)}>Close</Button>
          </div>
          {loadingInventory ? (
            <LoadingSpinner label="Loading stock..." />
          ) : inventory.length === 0 ? (
            <EmptyState icon={<Package className="h-12 w-12" />} title="Empty" description="No stock in this warehouse" />
          ) : (
            <DataTable columns={inventoryCols} data={inventory} />
          )}
        </div>
      )}
    </div>
  );
}
