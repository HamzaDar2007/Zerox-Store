import { useState } from 'react';
import {
  useGetBulkOperationsQuery, useCancelBulkOperationMutation,
  useGetJobsQuery,
} from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { formatRelative } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Progress } from '@/common/components/ui/progress';
import { XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { JobStatus } from '@/common/types/enums';
import type { ColumnDef } from '@tanstack/react-table';
import type { BulkOperation, ImportExportJob } from '@/common/types';

export default function SAOperationsPage() {
  const [bPage, setBPage] = useState(DEFAULT_PAGE);
  const [bLimit, setBLimit] = useState(DEFAULT_LIMIT);
  const [jPage, setJPage] = useState(DEFAULT_PAGE);
  const [jLimit, setJLimit] = useState(DEFAULT_LIMIT);

  const { data: bulkData, isLoading: bulkLoading } = useGetBulkOperationsQuery({ page: bPage, limit: bLimit });
  const { data: jobsData, isLoading: jobsLoading } = useGetJobsQuery({ page: jPage, limit: jLimit });
  const [cancelOp] = useCancelBulkOperationMutation();

  const bulkOps = bulkData?.data?.items ?? [];
  const bulkTotal = bulkData?.data?.total ?? 0;
  const bulkTotalPages = bulkData?.data?.totalPages ?? 1;

  const jobs = jobsData?.data?.items ?? [];
  const jobsTotal = jobsData?.data?.total ?? 0;
  const jobsTotalPages = jobsData?.data?.totalPages ?? 1;

  const handleCancelOp = async (id: string) => {
    try {
      await cancelOp(id).unwrap();
      toast.success('Operation cancelled');
    } catch {
      toast.error('Failed to cancel operation');
    }
  };

  const bulkColumns: ColumnDef<BulkOperation, unknown>[] = [
    {
      accessorKey: 'operationType',
      header: 'Operation',
      cell: ({ row }) => <Badge variant="outline">{row.original.operationType}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const total = row.original.totalCount || 0;
        const done = (row.original.successCount || 0) + (row.original.failureCount || 0);
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={pct} className="h-2" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{done}/{total}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'failureCount',
      header: 'Failures',
      cell: ({ row }) => (
        <span className={row.original.failureCount ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
          {row.original.failureCount || 0}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Started',
      cell: ({ row }) => formatRelative(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        row.original.status === JobStatus.PROCESSING || row.original.status === JobStatus.PENDING ? (
          <Button variant="ghost" size="icon" title="Cancel" onClick={() => handleCancelOp(row.original.id)}>
            <XCircle className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  const jobColumns: ColumnDef<ImportExportJob, unknown>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const total = row.original.totalRows || 0;
        const done = row.original.processedRows || 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={pct} className="h-2" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{done}/{total}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'failedRows',
      header: 'Failed',
      cell: ({ row }) => (
        <span className={row.original.failedRows ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
          {row.original.failedRows || 0}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatRelative(row.original.createdAt),
    },
    {
      accessorKey: 'resultFileUrl',
      header: 'Result',
      cell: ({ row }) =>
        row.original.resultFileUrl ? (
          <a href={row.original.resultFileUrl} className="text-primary underline text-sm" target="_blank">
            Download
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Operations" description="Monitor bulk operations and import/export jobs" />

      <Tabs defaultValue="bulk">
        <TabsList>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="jobs">Import/Export Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="mt-4">
          <DataTable
            columns={bulkColumns}
            data={bulkOps}
            isLoading={bulkLoading}
            emptyTitle="No bulk operations"
            pagination={{
              page: bPage, limit: bLimit, total: bulkTotal, totalPages: bulkTotalPages,
              onPageChange: setBPage, onLimitChange: setBLimit,
            }}
          />
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <DataTable
            columns={jobColumns}
            data={jobs}
            isLoading={jobsLoading}
            emptyTitle="No import/export jobs"
            pagination={{
              page: jPage, limit: jLimit, total: jobsTotal, totalPages: jobsTotalPages,
              onPageChange: setJPage, onLimitChange: setJLimit,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
