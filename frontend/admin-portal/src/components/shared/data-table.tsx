import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@radix-ui/react-checkbox'
import { utils, writeFileXLSX } from 'xlsx'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
  pageCount?: number
  page?: number
  onPageChange?: (page: number) => void
  onSearch?: (value: string) => void
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  manualPagination?: boolean
  enableRowSelection?: boolean
  onBulkDelete?: (rows: TData[]) => void
  onBulkStatusChange?: (rows: TData[], status: string) => void
  bulkStatusOptions?: string[]
  exportFilename?: string
  getExportRow?: (row: TData) => Record<string, unknown>
}

const MemoizedSortHeader = memo(function SortHeader({ column, children }: { column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void }; children: React.ReactNode }) {
  const sorted = column.getIsSorted()
  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(sorted === 'asc')}>
      {children}
      {sorted === 'asc' ? <ArrowUp className="ml-1 h-3.5 w-3.5" /> : sorted === 'desc' ? <ArrowDown className="ml-1 h-3.5 w-3.5" /> : <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />}
    </Button>
  )
})

export { MemoizedSortHeader as SortHeader }

export function DataTable<TData, TValue>({
  columns: userColumns,
  data,
  searchPlaceholder = 'Search...',
  searchColumn,
  pageCount,
  page = 1,
  onPageChange,
  onSearch,
  isLoading = false,
  isError = false,
  onRetry,
  manualPagination = false,
  enableRowSelection = false,
  onBulkDelete,
  onBulkStatusChange,
  bulkStatusOptions,
  exportFilename = 'export',
  getExportRow,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        if (onSearch) {
          onSearch(value)
        } else if (searchColumn) {
          // handled by table internal filter
        } else {
          setGlobalFilter(value)
        }
      }, 300)
    },
    [onSearch, searchColumn],
  )

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const selectColumn: ColumnDef<TData, TValue> = {
    id: 'select',
    header: ({ table: t }) => (
      <Checkbox
        checked={t.getIsAllPageRowsSelected()}
        onCheckedChange={(val) => t.toggleAllPageRowsSelected(!!val)}
        aria-label="Select all"
        className="flex h-4 w-4 items-center justify-center rounded border border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val) => row.toggleSelected(!!val)}
        aria-label="Select row"
        className="flex h-4 w-4 items-center justify-center rounded border border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const columns = enableRowSelection ? [selectColumn, ...userColumns] : userColumns

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, globalFilter, rowSelection },
    enableRowSelection,
    ...(manualPagination && pageCount ? { pageCount, manualPagination: true } : {}),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original)

  const exportToCSV = () => {
    const rows = data.map((row) => getExportRow ? getExportRow(row) : (row as Record<string, unknown>))
    const ws = utils.json_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Data')
    const buf = writeFileXLSX(wb, `${exportFilename}.csv`, { type: 'array', bookType: 'csv' })
    saveAs(new Blob([buf as BlobPart], { type: 'text/csv;charset=utf-8' }), `${exportFilename}.csv`)
  }

  const exportToExcel = () => {
    const rows = data.map((row) => getExportRow ? getExportRow(row) : (row as Record<string, unknown>))
    const ws = utils.json_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Data')
    writeFileXLSX(wb, `${exportFilename}.xlsx`)
  }

  const exportToPDF = () => {
    const rows = data.map((row) => getExportRow ? getExportRow(row) : (row as Record<string, unknown>))
    if (rows.length === 0) return
    const headers = Object.keys(rows[0])
    const doc = new jsPDF()
    autoTable(doc, {
      head: [headers],
      body: rows.map((r) => headers.map((h) => String(r[h] ?? ''))),
    })
    doc.save(`${exportFilename}.pdf`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={!onSearch && searchColumn ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? '' : searchInput}
            onChange={(e) => {
              if (!onSearch && searchColumn) {
                table.getColumn(searchColumn)?.setFilterValue(e.target.value)
              } else {
                handleSearchChange(e.target.value)
              }
            }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {enableRowSelection && selectedRows.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
              {onBulkDelete && (
                <Button variant="destructive" size="sm" onClick={() => onBulkDelete(selectedRows)}>
                  <Trash2 className="mr-1 h-4 w-4" />Delete
                </Button>
              )}
              {onBulkStatusChange && bulkStatusOptions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">Change Status</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {bulkStatusOptions.map((status) => (
                      <DropdownMenuItem key={status} onClick={() => onBulkStatusChange(selectedRows, status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}

          {getExportRow && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" />Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToCSV}>Export CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>Export Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>Export PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    <p className="text-sm font-medium">Failed to load data</p>
                    {onRetry && (
                      <Button variant="outline" size="sm" onClick={onRetry}>
                        <RefreshCw className="mr-1 h-4 w-4" />Retry
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {enableRowSelection && selectedRows.length > 0
            ? `${selectedRows.length} of ${data.length} row(s) selected`
            : manualPagination
              ? `Page ${page} of ${pageCount ?? 1}`
              : `${table.getFilteredRowModel().rows.length} row(s)`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => manualPagination ? onPageChange?.(1) : table.setPageIndex(0)}
            disabled={manualPagination ? page <= 1 : !table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => manualPagination ? onPageChange?.(page - 1) : table.previousPage()}
            disabled={manualPagination ? page <= 1 : !table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => manualPagination ? onPageChange?.(page + 1) : table.nextPage()}
            disabled={manualPagination ? page >= (pageCount ?? 1) : !table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => manualPagination ? onPageChange?.(pageCount ?? 1) : table.setPageIndex(table.getPageCount() - 1)}
            disabled={manualPagination ? page >= (pageCount ?? 1) : !table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
