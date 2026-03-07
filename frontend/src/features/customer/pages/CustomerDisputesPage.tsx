import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { formatDate } from '@/lib/format';
import { AlertTriangle, Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Dispute } from '@/common/types';
import { DisputeType } from '@/common/types/enums';
import {
  useGetDisputesQuery,
  useCreateDisputeMutation,
  useGetDisputeMessagesQuery,
  useAddDisputeMessageMutation,
} from '@/store/api';
import { useAppSelector } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';

export default function CustomerDisputesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ orderId: '', type: '' as DisputeType | '', subject: '', description: '', sellerId: '' });
  const [msgText, setMsgText] = useState('');
  const user = useAppSelector((s) => s.auth.user);

  const { data, isLoading } = useGetDisputesQuery({ page, limit });
  const disputes = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const [createDispute] = useCreateDisputeMutation();
  const [addMessage] = useAddDisputeMessageMutation();

  const { data: msgsData } = useGetDisputeMessagesQuery(
    selectedId!,
    { skip: !selectedId },
  );
  const messages = msgsData?.data ?? [];

  const handleCreate = async () => {
    if (!form.orderId || !form.type || !form.subject) return;
    try {
      await createDispute({ orderId: form.orderId, customerId: user?.id ?? '', sellerId: form.sellerId, type: form.type as DisputeType, subject: form.subject, description: form.description }).unwrap();
      toast.success('Dispute created');
      setShowCreate(false);
      setForm({ orderId: '', type: '', subject: '', description: '', sellerId: '' });
    } catch { toast.error('Failed to create dispute'); }
  };

  const handleSendMsg = async () => {
    if (!msgText.trim() || !selectedId) return;
    try {
      await addMessage({ disputeId: selectedId, data: { content: msgText } }).unwrap();
      setMsgText('');
    } catch { toast.error('Failed to send message'); }
  };

  const columns: ColumnDef<Dispute, unknown>[] = [
    { accessorKey: 'disputeNumber', header: 'Dispute #' },
    { accessorKey: 'subject', header: 'Subject' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(row.original.id)}>
          Messages
        </Button>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner label="Loading disputes..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Disputes" description="Manage your order disputes">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Open Dispute
        </Button>
      </PageHeader>

      {disputes.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-10 w-10" />}
          title="No disputes"
          description="You haven't opened any disputes yet."
        />
      ) : (
        <DataTable
          columns={columns}
          data={disputes}
          pagination={{
            page,
            limit,
            total,
            totalPages,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Order ID"
              value={form.orderId}
              onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
            />
            <Input
              placeholder="Seller ID"
              value={form.sellerId}
              onChange={(e) => setForm((f) => ({ ...f, sellerId: e.target.value }))}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DisputeType }))}
            >
              <option value="">Select type...</option>
              {Object.values(DisputeType).map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <Input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Dispute Messages</DialogTitle>
          </DialogHeader>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="rounded-md bg-muted p-2">
                  <p className="text-sm">{m.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Type a message..."
            />
            <Button onClick={handleSendMsg} disabled={!msgText.trim()}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
