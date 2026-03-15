import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { auditApi } from '@/services/api'
import type { AuditLog } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AuditPage() {
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<AuditLog | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { page, limit: 20 }],
    queryFn: () => auditApi.list({ page, limit: 20 }),
  })

  const columns: ColumnDef<AuditLog>[] = [
    { accessorKey: 'action', header: ({ column }) => <SortHeader column={column}>Action</SortHeader>, cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge> },
    { accessorKey: 'tableName', header: ({ column }) => <SortHeader column={column}>Table</SortHeader> },
    { accessorKey: 'recordId', header: 'Record ID', cell: ({ row }) => row.original.recordId?.slice(0, 8) || '—' },
    { accessorKey: 'ip', header: 'IP', cell: ({ row }) => row.original.ip || '—' },
    { accessorKey: 'occurredAt', header: ({ column }) => <SortHeader column={column}>Time</SortHeader>, cell: ({ row }) => formatDateTime(row.original.occurredAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all system changes" />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} manualPagination page={page} pageCount={data?.totalPages ?? 1} onPageChange={setPage} searchPlaceholder="Search logs..."
        enableRowSelection
        exportFilename="audit-logs"
        getExportRow={(r) => ({ Action: r.action, Table: r.tableName, RecordID: r.recordId ?? '', IP: r.ip ?? '', Time: r.occurredAt })}
      />

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Audit Log Detail</DialogTitle><DialogDescription>{detail?.action} on {detail?.tableName}</DialogDescription></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Action:</span> {detail.action}</div>
                <div><span className="text-muted-foreground">Table:</span> {detail.tableName}</div>
                <div><span className="text-muted-foreground">Record ID:</span> {detail.recordId}</div>
                <div><span className="text-muted-foreground">Actor ID:</span> {detail.actorId || '—'}</div>
                <div><span className="text-muted-foreground">IP:</span> {detail.ip || '—'}</div>
                <div><span className="text-muted-foreground">User Agent:</span> {detail.userAgent || '—'}</div>
              </div>
              {detail.diff && (
                <div>
                  <p className="font-medium mb-1">Changes (Diff)</p>
                  <pre className="rounded bg-muted p-3 text-xs overflow-auto max-h-60">
                    {JSON.stringify(detail.diff, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
