import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { productsApi } from '@/services/api'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import type { Product } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Package, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency } from '@/lib/utils'
import { TableSkeleton } from '@/components/shared/skeletons'

/**
 * Inventory Management Page
 * Track stock levels with low-stock indicators and inline stock update.
 */
export default function InventoryPage() {
  const { store, isLoading: profileLoading } = useSellerProfile()
  const storeId = store?.id
  const qc = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [stockValue, setStockValue] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory', storeId],
    queryFn: () => productsApi.list({ storeId: storeId ?? '', page: 1, limit: 500 }),
    enabled: !!storeId,
  })

  const updateM = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => productsApi.update(id, { stockQuantity: stock }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setEditOpen(false); toast.success('Stock updated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (profileLoading) return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Track and manage product stock levels" />
      <TableSkeleton />
    </div>
  )
  if (!storeId) return <EmptyState icon={Package} title="No Store" description="Complete onboarding first." />

  const products = (data?.data ?? data ?? []) as Product[]

  const openEdit = (p: Product) => {
    setEditProduct(p)
    setStockValue(String(p.stockQuantity ?? 0))
    setEditOpen(true)
  }

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Product</SortHeader> },
    { accessorKey: 'sku', header: 'SKU', cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku ?? 'N/A'}</span> },
    { accessorKey: 'basePrice', header: 'Price', cell: ({ row }) => formatCurrency(row.original.basePrice) },
    {
      accessorKey: 'stockQuantity', header: ({ column }) => <SortHeader column={column}>Stock</SortHeader>,
      cell: ({ row }) => {
        const qty = row.original.stockQuantity ?? 0
        return (
          <div className="flex items-center gap-2">
            {qty <= 5 && qty > 0 && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            {qty === 0 && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
            <span className={qty === 0 ? 'text-destructive font-medium' : qty <= 5 ? 'text-amber-600 font-medium' : ''}>{qty}</span>
          </div>
        )
      },
    },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    {
      id: 'actions', cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => openEdit(row.original)}>Update Stock</Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Track and manage product stock levels" />
      <DataTable
        columns={columns}
        data={Array.isArray(products) ? products : []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        searchColumn="name"
        searchPlaceholder="Search products..."
        exportFilename="inventory"
        getExportRow={(p) => ({ Name: p.name, SKU: p.sku ?? '', Stock: p.stockQuantity ?? 0, Price: p.basePrice, Active: p.isActive ? 'Yes' : 'No' })}
      />
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Stock</DialogTitle><DialogDescription>{editProduct?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input type="number" min={0} value={stockValue} onChange={(e) => setStockValue(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={() => editProduct && updateM.mutate({ id: editProduct.id, stock: parseInt(stockValue) || 0 })} disabled={updateM.isPending}>Save</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
