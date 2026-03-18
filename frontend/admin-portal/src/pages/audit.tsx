import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { auditApi } from '@/services/api'
import type { AuditLog } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Filter, X } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AuditPage() {
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<AuditLog | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [actionFilter, setActionFilter] = useState('')
  const [tableFilter, setTableFilter] = useState('')
  const [actorFilter, setActorFilter] = useState('')

  const params: Record<string, unknown> = { page, limit: 20 }
  if (actionFilter) params.action = actionFilter
  if (tableFilter) params.tableName = tableFilter
  if (actorFilter) params.actorId = actorFilter

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.list(params as { page?: number; limit?: number; action?: string; tableName?: string; actorId?: string }),
  })

  const clearFilters = () => {
    setActionFilter('')
    setTableFilter('')
    setActorFilter('')
    setPage(1)
  }

  const hasFilters = actionFilter || tableFilter || actorFilter

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
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Audit Logs" description="Track all system changes">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasFilters && <Badge variant="default" className="ml-2 text-[10px]">Active</Badge>}
        </Button>
      </PageHeader>

      {showFilters && (
        <Card className="animate-slide-in-down">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Action</Label>
                <Input value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1) }} placeholder="e.g., CREATE, UPDATE, DELETE" />
              </div>
              <div className="space-y-2">
                <Label>Table Name</Label>
                <Input value={tableFilter} onChange={(e) => { setTableFilter(e.target.value); setPage(1) }} placeholder="e.g., users, orders" />
              </div>
              <div className="space-y-2">
                <Label>Actor ID</Label>
                <Input value={actorFilter} onChange={(e) => { setActorFilter(e.target.value); setPage(1) }} placeholder="User UUID" />
              </div>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" />Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} manualPagination page={page} pageCount={data?.totalPages ?? 1} onPageChange={setPage} searchPlaceholder="Search logs..."
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
