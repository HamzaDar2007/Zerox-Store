import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { sellersApi } from '@/services/api'
import type { Seller } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'

export default function SellersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['sellers'], queryFn: sellersApi.list })

  const columns: ColumnDef<Seller>[] = [
    { accessorKey: 'displayName', header: ({ column }) => <SortHeader column={column}>Display Name</SortHeader> },
    { accessorKey: 'legalName', header: ({ column }) => <SortHeader column={column}>Legal Name</SortHeader>, cell: ({ row }) => row.original.legalName || '—' },
    { accessorKey: 'commissionRate', header: ({ column }) => <SortHeader column={column}>Commission %</SortHeader>, cell: ({ row }) => row.original.commissionRate != null ? `${row.original.commissionRate}%` : '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Joined</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Sellers" description="View and manage sellers" />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} searchColumn="displayName" searchPlaceholder="Search sellers..."
        enableRowSelection
        exportFilename="sellers"
        getExportRow={(r) => ({ DisplayName: r.displayName, LegalName: r.legalName ?? '', Commission: r.commissionRate ?? '', Status: r.status, Joined: r.createdAt })}
      />
    </div>
  )
}
