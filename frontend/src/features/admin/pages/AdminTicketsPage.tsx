import { useState } from 'react';
import { useGetTicketsQuery, useUpdateTicketStatusMutation } from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { formatRelative } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TicketStatus } from '@/common/types/enums';
import type { ColumnDef } from '@tanstack/react-table';
import type { Ticket } from '@/common/types';

export default function AdminTicketsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data, isLoading } = useGetTicketsQuery({ page, limit });
  const [updateStatus] = useUpdateTicketStatusMutation();

  const tickets = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleResolve = async (id: string) => {
    try {
      await updateStatus({ id, status: TicketStatus.RESOLVED }).unwrap();
      toast.success('Ticket resolved');
    } catch {
      toast.error('Failed to resolve ticket');
    }
  };

  const columns: ColumnDef<Ticket, unknown>[] = [
    {
      accessorKey: 'ticketNumber',
      header: 'Ticket #',
      cell: ({ row }) => <span className="font-medium">#{row.original.ticketNumber}</span>,
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => <span className="line-clamp-1">{row.original.subject}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <StatusBadge status={row.original.priority} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatRelative(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        row.original.status !== TicketStatus.RESOLVED &&
        row.original.status !== TicketStatus.CLOSED ? (
          <Button
            variant="ghost"
            size="icon"
            title="Resolve"
            onClick={() => handleResolve(row.original.id)}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description="Manage customer support tickets" />

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        emptyTitle="No tickets"
        pagination={{
          page, limit, total, totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />
    </div>
  );
}
