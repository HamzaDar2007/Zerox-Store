import { useState } from 'react';
import { useGetReviewsQuery, useUpdateReviewStatusMutation, useDeleteReviewMutation } from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { RatingStars } from '@/common/components/RatingStars';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { formatRelative } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewStatus } from '@/common/types/enums';
import type { ColumnDef } from '@tanstack/react-table';
import type { Review } from '@/common/types';

export default function AdminReviewsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useGetReviewsQuery({
    page,
    limit,
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });
  const [updateStatus] = useUpdateReviewStatusMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const reviews = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleApprove = async (id: string) => {
    try {
      await updateStatus({ id, status: ReviewStatus.APPROVED }).unwrap();
      toast.success('Review approved');
    } catch {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatus({ id, status: ReviewStatus.REJECTED }).unwrap();
      toast.success('Review rejected');
    } catch {
      toast.error('Failed to reject review');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget).unwrap();
      toast.success('Review deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const columns: ColumnDef<Review, unknown>[] = [
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => <RatingStars rating={row.original.rating} size="sm" />,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium line-clamp-1">{row.original.title || 'No title'}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{row.original.content}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'isVerifiedPurchase',
      header: 'Verified',
      cell: ({ row }) => (
        <span className={row.original.isVerifiedPurchase ? 'text-green-600' : 'text-muted-foreground'}>
          {row.original.isVerifiedPurchase ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatRelative(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.status === ReviewStatus.PENDING && (
            <>
              <Button
                variant="ghost"
                size="icon"
                title="Approve"
                onClick={() => handleApprove(row.original.id)}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Reject"
                onClick={() => handleReject(row.original.id)}
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
            onClick={() => setDeleteTarget(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Moderate product reviews">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReviewStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(ReviewStatus).map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        emptyTitle="No reviews"
        pagination={{
          page, limit, total, totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Review"
        description="This will permanently remove the review."
        onConfirm={handleDelete}
      />
    </div>
  );
}
