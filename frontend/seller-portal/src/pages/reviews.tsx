/**
 * Reviews Management Page
 * View customer reviews and reply to feedback.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { reviewsApi } from '@/services/api'
import type { Review } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Star, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { sanitizeText } from '@/lib/sanitize'
import { formatDate } from '@/lib/utils'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}</span>
    </div>
  )
}

export default function ReviewsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [detailReview, setDetailReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reviews', { page, limit: 10 }],
    queryFn: () => reviewsApi.list({ page, limit: 10 }),
  })

  const reviewList = (data?.data ?? []) as Review[]
  const summary = reviewList.length
    ? { avg: reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length, count: reviewList.length }
    : { avg: 0, count: 0 }

  const replyM = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => reviewsApi.reply(id, sanitizeText(body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      setDetailReview(null)
      setReplyText('')
      toast.success('Reply posted!')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const columns: ColumnDef<Review>[] = [
    { accessorKey: 'rating', header: ({ column }) => <SortHeader column={column}>Rating</SortHeader>, cell: ({ row }) => <StarRating rating={row.original.rating} /> },
    { accessorKey: 'title', header: 'Title', cell: ({ row }) => <span className="truncate max-w-[200px] block">{row.original.title ?? 'No title'}</span> },
    { accessorKey: 'body', header: 'Comment', cell: ({ row }) => <span className="truncate max-w-[250px] block text-muted-foreground">{row.original.body?.slice(0, 80) ?? ''}</span> },
    { id: 'replied', header: 'Replied', cell: ({ row }) => row.original.sellerReply ? <span className="text-xs text-green-600">Yes</span> : <span className="text-xs text-muted-foreground">No</span> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Date</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => { setDetailReview(row.original); setReplyText(row.original.sellerReply ?? '') }}>
          <MessageSquare className="mr-1 h-3.5 w-3.5" />{row.original.sellerReply ? 'View' : 'Reply'}
        </Button>
      ),
    },
  ]

  const avgRating = summary?.avg ?? 0
  const reviewsList = ((data as { data?: Review[] })?.data ?? data ?? []) as Review[]
  const totalReviews = summary?.count ?? reviewsList.length

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Customer reviews for your products" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Average Rating" value={avgRating ? avgRating.toFixed(1) : 'N/A'} icon={Star} />
        <StatCard label="Total Reviews" value={totalReviews} icon={MessageSquare} />
        <StatCard label="Response Rate" value={
          totalReviews ? `${Math.round((reviewsList.filter((r) => r.sellerReply).length / totalReviews) * 100)}%` : 'N/A'
        } icon={MessageSquare} />
      </div>

      <DataTable
        columns={columns}
        data={reviewsList}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        manualPagination
        page={page}
        pageCount={data?.totalPages ?? 1}
        onPageChange={setPage}
        searchPlaceholder="Search reviews..."
        exportFilename="reviews"
        getExportRow={(r) => ({ Rating: r.rating, Title: r.title ?? '', Comment: r.body ?? '', Date: r.createdAt, Replied: r.sellerReply ? 'Yes' : 'No' })}
      />

      {/* Review Detail Sheet */}
      <Sheet open={!!detailReview} onOpenChange={() => setDetailReview(null)}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Review Detail</SheetTitle>
            <SheetDescription>Customer feedback</SheetDescription>
          </SheetHeader>
          {detailReview && (
            <div className="mt-4 space-y-4">
              <Card><CardContent className="pt-4 space-y-3">
                <StarRating rating={detailReview.rating} />
                {detailReview.title && <h4 className="font-medium">{detailReview.title}</h4>}
                <p className="text-sm text-muted-foreground">{detailReview.body ?? 'No comment'}</p>
                <p className="text-xs text-muted-foreground">{formatDate(detailReview.createdAt)}</p>
              </CardContent></Card>

              {detailReview.sellerReply && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4">
                    <p className="mb-1 text-xs font-medium text-primary">Your Reply</p>
                    <p className="text-sm">{detailReview.sellerReply}</p>
                    {detailReview.sellerReplyAt && <p className="mt-2 text-xs text-muted-foreground">{formatDate(detailReview.sellerReplyAt)}</p>}
                  </CardContent>
                </Card>
              )}

              {!detailReview.sellerReply && (
                <div className="space-y-2">
                  <Label>Write a Reply</Label>
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Thank the customer or address their concerns..." rows={4} />
                  <Button
                    onClick={() => replyText.trim() && replyM.mutate({ id: detailReview.id, body: replyText.trim() })}
                    disabled={!replyText.trim() || replyM.isPending}
                    className="w-full"
                  >
                    {replyM.isPending ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
