import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ordersApi } from '@/services/api'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import type { Order } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, ShoppingCart } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TableSkeleton } from '@/components/shared/skeletons'

/**
 * Orders List Page
 * Displays store orders in a paginated data table with search and export.
 */
export default function OrdersPage() {
  const navigate = useNavigate()
  const { store, isLoading: profileLoading } = useSellerProfile()
  const storeId = store?.id
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', { storeId, page, limit: 10, search }],
    queryFn: () => ordersApi.list({ storeId: storeId!, page, limit: 10 }),
    enabled: !!storeId,
  })

  if (profileLoading) return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="View and manage orders for your store" />
      <TableSkeleton />
    </div>
  )
  if (!storeId) return <EmptyState icon={ShoppingCart} title="No Store" description="Complete onboarding first." />

  const columns: ColumnDef<Order>[] = [
    { accessorKey: 'id', header: 'Order ID', cell: ({ row }) => <span className="font-mono text-xs">#{row.original.id.slice(0, 8)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'totalAmount', header: ({ column }) => <SortHeader column={column}>Total</SortHeader>, cell: ({ row }) => formatCurrency(Number(row.original.totalAmount ?? 0)) },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Date</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/orders/${row.original.id}`)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="View and manage orders for your store" />
      <DataTable
        columns={columns}
        data={(data?.data ?? data ?? []) as Order[]}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        manualPagination
        page={page}
        pageCount={data?.totalPages ?? 1}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search orders..."
        exportFilename="orders"
        getExportRow={(o) => ({ OrderID: o.id, Status: o.status, Total: o.totalAmount, Date: o.createdAt })}
      />
    </div>
  )
}
