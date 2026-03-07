import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Warehouse, Package, Plus, ArrowRightLeft } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  Warehouse as WarehouseType,
  Inventory,
  StockMovement,
} from '@/common/types';
import {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useGetWarehouseInventoryQuery,
  useGetStockMovementsQuery,
  useAdjustStockMutation,
} from '@/store/api';
import { CreateWarehouseDialog, AdjustStockDialog } from '../components/InventoryDialogs';

type Tab = 'warehouses' | 'inventory' | 'movements';

export default function SellerInventoryPage() {
  const [tab, setTab] = useState<Tab>('warehouses');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [movementPage, setMovementPage] = useState(1);

  const { data: warehousesData, isLoading: loadingWarehouses } = useGetWarehousesQuery({});
  const warehouses = warehousesData?.data ?? [];

  const { data: inventoryData, isLoading: loadingInventory } = useGetWarehouseInventoryQuery(
    selectedWarehouseId!,
    { skip: !selectedWarehouseId },
  );
  const inventory = inventoryData?.data ?? [];

  const { data: movementsData } = useGetStockMovementsQuery(
    { productId: 'all', warehouseId: selectedWarehouseId ?? undefined, page: movementPage, limit: 10 },
    { skip: !selectedWarehouseId },
  );
  const movements = movementsData?.data?.items ?? [];
  const movementsTotal = movementsData?.data?.total ?? 0;
  const movementsTotalPages = movementsData?.data?.totalPages ?? 1;

  const [createWarehouse] = useCreateWarehouseMutation();
  const [adjustStock] = useAdjustStockMutation();

  const warehouseCols: ColumnDef<WarehouseType>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'country', header: 'Country' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => { setSelectedWarehouseId(row.original.id); setTab('inventory'); }}>
          View Stock
        </Button>
      ),
    },
  ];

  const inventoryCols: ColumnDef<Inventory>[] = [
    { accessorKey: 'productId', header: 'Product ID' },
    { accessorKey: 'productVariantId', header: 'Variant' },
    { accessorKey: 'quantityOnHand', header: 'Quantity' },
    { accessorKey: 'quantityReserved', header: 'Reserved' },
    {
      id: 'available',
      header: 'Available',
      cell: ({ row }) => (row.original.quantityOnHand ?? 0) - (row.original.quantityReserved ?? 0),
    },
    { accessorKey: 'reorderPoint', header: 'Reorder Point' },
  ];

  const movementCols: ColumnDef<StockMovement>[] = [
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <StatusBadge status={row.original.type} /> },
    { accessorKey: 'quantity', header: 'Qty' },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'createdAt', header: 'Date' },
  ];

  const handleCreateWarehouse = async (data: { name: string; code: string; addressLine1?: string; city?: string; state?: string; countryCode?: string; postalCode?: string }) => {
    try {
      await createWarehouse(data).unwrap();
      toast.success('Warehouse created');
      setShowCreateWarehouse(false);
    } catch { toast.error('Failed to create warehouse'); }
  };

  const handleAdjust = async (data: { productId: string; adjustment: number; reason: string }) => {
    if (!selectedWarehouseId) return;
    try {
      await adjustStock({
        productId: data.productId,
        warehouseId: selectedWarehouseId,
        adjustment: data.adjustment,
        reason: data.reason,
      }).unwrap();
      toast.success('Stock adjusted');
      setShowAdjust(false);
    } catch { toast.error('Failed to adjust stock'); }
  };

  if (loadingWarehouses) return <LoadingSpinner label="Loading inventory..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Management" description="Manage warehouses, stock levels, and movements">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateWarehouse(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Warehouse
          </Button>
          {selectedWarehouseId && (
            <Button onClick={() => setShowAdjust(true)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Adjust Stock
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {(['warehouses', 'inventory', 'movements'] as Tab[]).map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'ghost'} size="sm" onClick={() => setTab(t)} className="capitalize">
            {t}
          </Button>
        ))}
      </div>

      {tab === 'warehouses' && (
        warehouses.length === 0
          ? <EmptyState icon={<Warehouse className="h-12 w-12" />} title="No warehouses" description="Create a warehouse to manage inventory" action={{ label: 'Create Warehouse', onClick: () => setShowCreateWarehouse(true) }} />
          : <DataTable columns={warehouseCols} data={warehouses} />
      )}

      {tab === 'inventory' && (
        !selectedWarehouseId
          ? <Card><CardContent className="p-8 text-center text-muted-foreground">Select a warehouse first</CardContent></Card>
          : loadingInventory
            ? <LoadingSpinner label="Loading stock..." />
            : inventory.length === 0
              ? <EmptyState icon={<Package className="h-12 w-12" />} title="No inventory" description="No stock entries in this warehouse" />
              : <DataTable columns={inventoryCols} data={inventory} />
      )}

      {tab === 'movements' && (
        <DataTable
          columns={movementCols}
          data={movements}
          pagination={{
            page: movementPage,
            limit: 10,
            total: movementsTotal,
            totalPages: movementsTotalPages,
            onPageChange: setMovementPage,
            onLimitChange: () => {},
          }}
        />
      )}

      {/* Summary cards */}
      {selectedWarehouseId && tab === 'inventory' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total SKUs</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{inventory.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total Units</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{inventory.reduce((sum, i) => sum + (i.quantityOnHand ?? 0), 0)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Low Stock Items</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-destructive">{inventory.filter((i) => (i.quantityOnHand ?? 0) <= (i.reorderPoint ?? 0)).length}</p></CardContent>
          </Card>
        </div>
      )}

      <CreateWarehouseDialog
        open={showCreateWarehouse}
        onOpenChange={setShowCreateWarehouse}
        onSubmit={handleCreateWarehouse}
      />

      <AdjustStockDialog
        open={showAdjust}
        onOpenChange={setShowAdjust}
        onSubmit={handleAdjust}
      />
    </div>
  );
}
