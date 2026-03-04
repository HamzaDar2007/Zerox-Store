import { useState } from 'react';
import {
  useGetAuditLogsQuery, useGetActivityLogsQuery, useCleanupAuditLogsMutation,
} from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { formatRelative } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { AuditLog, UserActivityLog } from '@/common/types';

export default function SAAuditPage() {
  const [aPage, setAPage] = useState(DEFAULT_PAGE);
  const [aLimit, setALimit] = useState(DEFAULT_LIMIT);
  const [actPage, setActPage] = useState(DEFAULT_PAGE);
  const [actLimit, setActLimit] = useState(DEFAULT_LIMIT);
  const [showCleanup, setShowCleanup] = useState(false);

  const { data: auditData, isLoading: auditLoading } = useGetAuditLogsQuery({ page: aPage, limit: aLimit });
  const { data: actData, isLoading: actLoading } = useGetActivityLogsQuery({ page: actPage, limit: actLimit });
  const [cleanup] = useCleanupAuditLogsMutation();

  const auditLogs = auditData?.data?.items ?? [];
  const auditTotal = auditData?.data?.total ?? 0;
  const auditTotalPages = auditData?.data?.totalPages ?? 1;

  const activityLogs = actData?.data?.items ?? [];
  const actTotal = actData?.data?.total ?? 0;
  const actTotalPages = actData?.data?.totalPages ?? 1;

  const handleCleanup = async () => {
    try {
      await cleanup({ daysToKeep: 90 }).unwrap();
      toast.success('Old audit logs cleaned up (kept last 90 days)');
      setShowCleanup(false);
    } catch {
      toast.error('Failed to cleanup audit logs');
    }
  };

  const auditColumns: ColumnDef<AuditLog, unknown>[] = [
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => <StatusBadge status={row.original.action} />,
    },
    {
      accessorKey: 'entityType',
      header: 'Entity',
      cell: ({ row }) => (
        <div>
          <Badge variant="outline">{row.original.entityType}</Badge>
          <p className="text-xs text-muted-foreground mt-0.5">{row.original.entityId}</p>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm line-clamp-1">{row.original.description || '—'}</span>
      ),
    },
    {
      accessorKey: 'changedFields',
      header: 'Fields',
      cell: ({ row }) =>
        row.original.changedFields && row.original.changedFields.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {row.original.changedFields.join(', ')}
          </span>
        ) : (
          '—'
        ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP',
      cell: ({ row }) => (
        <span className="text-xs font-mono">{row.original.ipAddress || '—'}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'When',
      cell: ({ row }) => formatRelative(row.original.createdAt),
    },
  ];

  const activityColumns: ColumnDef<UserActivityLog, unknown>[] = [
    {
      accessorKey: 'activityType',
      header: 'Type',
      cell: ({ row }) => <StatusBadge status={row.original.activityType} />,
    },
    {
      accessorKey: 'entityType',
      header: 'Entity',
      cell: ({ row }) =>
        row.original.entityType ? (
          <Badge variant="outline">{row.original.entityType}</Badge>
        ) : (
          '—'
        ),
    },
    {
      accessorKey: 'pageUrl',
      header: 'Page',
      cell: ({ row }) => (
        <span className="text-sm line-clamp-1">{row.original.pageUrl || '—'}</span>
      ),
    },
    {
      accessorKey: 'deviceType',
      header: 'Device',
      cell: ({ row }) => row.original.deviceType || '—',
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP',
      cell: ({ row }) => (
        <span className="text-xs font-mono">{row.original.ipAddress || '—'}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'When',
      cell: ({ row }) => formatRelative(row.original.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit & Activity" description="Track all system changes and user activity">
        <Button variant="outline" onClick={() => setShowCleanup(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Cleanup Old Logs
        </Button>
      </PageHeader>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-4">
          <DataTable
            columns={auditColumns}
            data={auditLogs}
            isLoading={auditLoading}
            emptyTitle="No audit logs"
            pagination={{
              page: aPage, limit: aLimit, total: auditTotal, totalPages: auditTotalPages,
              onPageChange: setAPage, onLimitChange: setALimit,
            }}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <DataTable
            columns={activityColumns}
            data={activityLogs}
            isLoading={actLoading}
            emptyTitle="No activity logs"
            pagination={{
              page: actPage, limit: actLimit, total: actTotal, totalPages: actTotalPages,
              onPageChange: setActPage, onLimitChange: setActLimit,
            }}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showCleanup}
        onOpenChange={setShowCleanup}
        title="Cleanup Audit Logs"
        description="This will permanently delete audit logs older than 90 days. This cannot be undone."
        onConfirm={handleCleanup}
      />
    </div>
  );
}
