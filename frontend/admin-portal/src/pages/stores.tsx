import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { storesApi } from '@/services/api'
import type { Store } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'

export default function StoresPage() {
  const { data, isLoading } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list })

  const columns: ColumnDef<Store>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'slug', header: ({ column }) => <SortHeader column={column}>Slug</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Created</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Stores" description="View seller stores" />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} searchColumn="name" searchPlaceholder="Search stores..."
        enableRowSelection
        exportFilename="stores"
        getExportRow={(r) => ({ Name: r.name, Slug: r.slug, Active: r.isActive, Created: r.createdAt })}
      />
    </div>
  )
}
