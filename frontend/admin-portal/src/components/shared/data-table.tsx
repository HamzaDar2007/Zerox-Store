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
import { Checkbox } from '@/components/ui/checkbox'

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val) => row.toggleSelected(!!val)}
        aria-label="Select row"
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

  const getExportRows = () => data.map((row) => getExportRow ? getExportRow(row) : (row as Record<string, unknown>))

  const exportToCSV = async () => {
    const { utils, writeFileXLSX } = await import('xlsx')
    const { saveAs } = await import('file-saver')
    const rows = getExportRows()
    const ws = utils.json_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Data')
    const buf = writeFileXLSX(wb, `${exportFilename}.csv`, { type: 'array', bookType: 'csv' })
    saveAs(new Blob([buf as BlobPart], { type: 'text/csv;charset=utf-8' }), `${exportFilename}.csv`)
  }

  const exportToExcel = async () => {
    const { utils, writeFileXLSX } = await import('xlsx')
    const rows = getExportRows()
    const ws = utils.json_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Data')
    writeFileXLSX(wb, `${exportFilename}.xlsx`)
  }

  const exportToPDF = async () => {
    const rows = getExportRows()
    if (rows.length === 0) return
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
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
            className="pl-9 h-10 rounded-xl bg-muted/25 border-border/40 focus:bg-background"
          />
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          {enableRowSelection && selectedRows.length > 0 && (
            <>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{selectedRows.length} selected</span>
              {onBulkDelete && (
                <Button variant="destructive" size="sm" onClick={() => onBulkDelete(selectedRows)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
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
                <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
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

      <div className="rounded-2xl border border-border/40 overflow-hidden bg-card shadow-sm shadow-foreground/[0.02]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/25 hover:bg-muted/25 border-border/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 h-11">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded-md bg-muted/60" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-destructive">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/8">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Failed to load data</p>
                      <p className="text-xs text-muted-foreground">Something went wrong while fetching the data.</p>
                    </div>
                    {onRetry && (
                      <Button variant="outline" size="sm" onClick={onRetry} className="mt-1 rounded-lg">
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Try again
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="border-border/25 table-row-hover">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 text-[13px]">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                      <Search className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground/50">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          {enableRowSelection && selectedRows.length > 0
            ? `${selectedRows.length} of ${data.length} row(s) selected`
            : manualPagination
              ? `Page ${page} of ${pageCount ?? 1}`
              : `${table.getFilteredRowModel().rows.length} row(s)`}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => manualPagination ? onPageChange?.(1) : table.setPageIndex(0)}
            disabled={manualPagination ? page <= 1 : !table.getCanPreviousPage()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => manualPagination ? onPageChange?.(page - 1) : table.previousPage()}
            disabled={manualPagination ? page <= 1 : !table.getCanPreviousPage()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {manualPagination && (
            <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-muted/50 px-2 text-xs font-medium">
              {page}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => manualPagination ? onPageChange?.(page + 1) : table.nextPage()}
            disabled={manualPagination ? page >= (pageCount ?? 1) : !table.getCanNextPage()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => manualPagination ? onPageChange?.(pageCount ?? 1) : table.setPageIndex(table.getPageCount() - 1)}
            disabled={manualPagination ? page >= (pageCount ?? 1) : !table.getCanNextPage()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
