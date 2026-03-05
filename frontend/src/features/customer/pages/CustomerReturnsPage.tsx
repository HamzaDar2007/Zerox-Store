import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetReturnsQuery, useCreateReturnMutation, useGetReturnReasonsQuery, useGetMyOrdersQuery } from '@/store/api';
import { useAppSelector } from '@/store';
import { PageHeader } from '@/common/components/PageHeader';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { PaginationControls } from '@/common/components/PaginationControls';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { RotateCcw, Plus } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { toast } from 'sonner';

export default function CustomerReturnsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data, isLoading } = useGetReturnsQuery({ page, limit });
  const { data: reasonsData } = useGetReturnReasonsQuery();
  const { data: ordersData } = useGetMyOrdersQuery({ page: 1, limit: 50 });
  const [createReturn, { isLoading: creating }] = useCreateReturnMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ orderId: '', orderItemId: '', reasonId: '', quantity: 1, reasonDetails: '', type: 'return' });
  const user = useAppSelector((s) => s.auth.user);

  const reasons = reasonsData?.data ?? [];
  const orders = ordersData?.data?.items ?? [];

  const returns = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Returns" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Returns" description="Track your return requests">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Request Return
        </Button>
      </PageHeader>

      {returns.length === 0 ? (
        <EmptyState
          icon={<RotateCcw className="h-12 w-12" />}
          title="No return requests"
          description="Your return history will appear here."
          action={{ label: 'Request Return', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => (
            <Link key={ret.id} to={`/account/returns/${ret.id}`}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="flex items-start gap-4 py-4">
                  <RotateCcw className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">Return #{ret.returnNumber}</p>
                      <StatusBadge status={ret.status} />
                      {ret.resolution && <StatusBadge status={ret.resolution} />}
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>
                        Type: <span className="capitalize">{ret.type}</span>
                      </span>
                      <span>Qty: {ret.quantity}</span>
                      {ret.refundAmount != null && (
                        <span>Refund: {formatCurrency(ret.refundAmount)}</span>
                      )}
                    </div>
                    {ret.reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Reason: {ret.reason.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {formatDate(ret.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          <PaginationControls
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      )}

      {/* Create Return Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request a Return</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Order</label>
              <Select value={form.orderId} onValueChange={(v) => setForm((f) => ({ ...f, orderId: v, orderItemId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>#{o.orderNumber} — {formatCurrency(o.totalAmount)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.orderId && (() => {
              const selectedOrder = orders.find((o) => o.id === form.orderId);
              const items = selectedOrder?.items ?? [];
              return (
                <div>
                  <label className="text-sm font-medium">Item</label>
                  <Select value={form.orderItemId} onValueChange={(v) => setForm((f) => ({ ...f, orderItemId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                    <SelectContent>
                      {items.map((item) => {
                        const snap = item.productSnapshot as Record<string, unknown> | null;
                        return (
                          <SelectItem key={item.id} value={item.id}>
                            {(snap?.name as string) ?? 'Product'} × {item.quantity}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              );
            })()}
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Select value={form.reasonId} onValueChange={(v) => setForm((f) => ({ ...f, reasonId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {reasons.filter((r) => r.isActive).map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea placeholder="Describe the issue..." value={form.reasonDetails} onChange={(e) => setForm((f) => ({ ...f, reasonDetails: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!form.orderId || !form.orderItemId || !form.reasonId) {
                  toast.error('Please fill all required fields');
                  return;
                }
                try {
                  await createReturn({
                    orderId: form.orderId,
                    orderItemId: form.orderItemId,
                    userId: user?.id ?? '',
                    reasonId: form.reasonId || undefined,
                    quantity: form.quantity,
                    type: form.type,
                    reasonDetails: form.reasonDetails || undefined,
                  }).unwrap();
                  toast.success('Return request submitted');
                  setShowCreate(false);
                  setForm({ orderId: '', orderItemId: '', reasonId: '', quantity: 1, reasonDetails: '', type: 'return' });
                } catch {
                  toast.error('Failed to submit return request');
                }
              }}
              disabled={creating}
            >
              {creating ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
