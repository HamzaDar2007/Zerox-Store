import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetReviewsQuery, useDeleteReviewMutation } from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { formatDate } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Review } from '@/common/types';
import type { RootState } from '@/store';

const columns: ColumnDef<Review, unknown>[] = [
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < row.original.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'content',
    header: 'Review',
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
        {row.original.content ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'isVerifiedPurchase',
    header: 'Verified',
    cell: ({ row }) =>
      row.original.isVerifiedPurchase ? (
        <span className="text-xs font-medium text-green-600">Verified</span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export default function MyReviewsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const user = useSelector((s: RootState) => s.auth.user);
  const [deleteReview] = useDeleteReviewMutation();

  const { data, isLoading } = useGetReviewsQuery({
    page,
    limit,
    userId: user?.id,
  });

  const reviews = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(id);
    }
  };

  const columnsWithActions: ColumnDef<Review, unknown>[] = [
    ...columns,
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(row.original.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My Reviews" description="Manage your product reviews" />

      <DataTable
        columns={columnsWithActions}
        data={reviews}
        isLoading={isLoading}
        emptyTitle="No reviews yet"
        emptyDescription="When you review a product, it will appear here."
        pagination={{
          page,
          limit,
          total,
          totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />
    </div>
  );
}
