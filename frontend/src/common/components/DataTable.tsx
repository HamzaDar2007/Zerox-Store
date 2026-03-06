import { useState, useCallback, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Skeleton } from '@/common/components/ui/skeleton';
import { PaginationControls } from '@/common/components/PaginationControls';
import { EmptyState, ErrorState } from '@/common/components/EmptyState';
import { cn } from '@/lib/utils';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Server-side pagination */
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  /** Server-side sorting callback */
  onSortChange?: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void;
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Whether there was an error fetching data */
  isError?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Callback to retry when error state is shown */
  onRetry?: () => void;
  /** Enable row selection */
  selectable?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: TData[]) => void;
  /** Empty state text */
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * Full-featured data table built on TanStack Table v8 + shadcn Table.
 * Supports server-side pagination, sorting, and row selection.
 */
export function DataTable<TData>({
  columns: userColumns,
  data,
  pagination,
  onSortChange,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  selectable = false,
  onSelectionChange,
  emptyTitle = 'No results found',
  emptyDescription,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Prepend selection column if selectable
  const columns = useMemo(() => {
    if (!selectable) return userColumns;

    const selectCol: ColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      size: 40,
    };

    return [selectCol, ...userColumns];
  }, [userColumns, selectable]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      if (onSortChange && newSorting.length > 0) {
        onSortChange(
          newSorting[0].id,
          newSorting[0].desc ? 'DESC' : 'ASC',
        );
      }
    },
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (onSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => data[Number(key)]);
        onSelectionChange(selectedRows);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: onSortChange ? undefined : getSortedRowModel(),
    manualSorting: !!onSortChange,
    enableRowSelection: selectable,
  });

  const renderSortIcon = useCallback(
    (columnId: string) => {
      const sort = sorting.find((s) => s.id === columnId);
      if (!sort) {
        return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />;
      }
      return sort.desc ? (
        <ArrowDown className="ml-1 inline h-3 w-3" />
      ) : (
        <ArrowUp className="ml-1 inline h-3 w-3" />
      );
    },
    [sorting],
  );

  if (isError) {
    return (
      <ErrorState
        title="Failed to load data"
        message={errorMessage ?? 'An error occurred while fetching data. Please try again.'}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((_col, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.getCanSort() && 'cursor-pointer select-none',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {header.column.getCanSort() && renderSortIcon(header.column.id)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <PaginationControls
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          onLimitChange={pagination.onLimitChange}
        />
      )}
    </div>
  );
}
