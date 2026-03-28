import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { returnsApi } from '@/services/api'
import type { Return } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { formatDate } from '@/lib/utils'
import type { ReturnItem } from '@/types'

/**
 * Returns Page
 * View return requests from customers with detail sheet.
 */
export default function ReturnsPage() {
  const [page, setPage] = useState(1)
  const [detailReturn, setDetailReturn] = useState<Return | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['returns', { page, limit: 10 }],
    queryFn: () => returnsApi.list({ page, limit: 10 }),
  })

  const { data: returnItems = [] } = useQuery({
    queryKey: ['return-items', detailReturn?.id],
    queryFn: () => returnsApi.getItems(detailReturn?.id ?? ''),
    enabled: !!detailReturn,
  })

  const columns: ColumnDef<Return>[] = [
    { accessorKey: 'id', header: 'Return ID', cell: ({ row }) => <span className="font-mono text-xs">#{row.original.id.slice(0, 8)}</span> },
    { accessorKey: 'reason', header: 'Reason', cell: ({ row }) => <span className="truncate max-w-[200px] block">{row.original.reason ?? 'N/A'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Date</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setDetailReturn(row.original)}>View</Button>
      ),
    },
  ]

  const items: ReturnItem[] = Array.isArray(returnItems) ? returnItems : []

  return (
    <div className="space-y-6">
      <PageHeader title="Returns" description="View return requests from customers" />
      <DataTable
        columns={columns}
        data={(data?.data ?? data ?? []) as Return[]}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        manualPagination
        page={page}
        pageCount={data?.totalPages ?? 1}
        onPageChange={setPage}
        searchPlaceholder="Search returns..."
        exportFilename="returns"
        getExportRow={(r) => ({ ID: r.id, Reason: r.reason ?? '', Status: r.status, Date: r.createdAt })}
      />

      <Sheet open={!!detailReturn} onOpenChange={() => setDetailReturn(null)}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Return #{detailReturn?.id.slice(0, 8)}</SheetTitle>
            <SheetDescription>Return request details</SheetDescription>
          </SheetHeader>
          {detailReturn && (
            <div className="mt-4 space-y-4">
              <Card><CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailReturn.status} /></div>
                  <div><span className="text-muted-foreground">Date:</span> {formatDate(detailReturn.createdAt)}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Reason:</span> {detailReturn.reason ?? 'N/A'}</div>
                </div>
              </CardContent></Card>
              <h4 className="text-sm font-medium">Items</h4>
              {items.length === 0 ? <p className="text-sm text-muted-foreground">No items</p> : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <span>{item.orderItemId}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
