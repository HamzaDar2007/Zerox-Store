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
import { AlertTriangle, MessageSquare } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Dispute, DisputeMessage } from '@/common/types';
import {
  useGetDisputesQuery,
  useGetDisputeByIdQuery,
  useGetDisputeMessagesQuery,
  useAddDisputeMessageMutation,
  useAddDisputeEvidenceMutation,
  useUpdateDisputeStatusMutation,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';

export default function SellerDisputesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msgText, setMsgText] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({ type: '', description: '', fileUrl: '' });

  const { data, isLoading } = useGetDisputesQuery({ page, limit });
  const disputes = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const { data: detailData } = useGetDisputeByIdQuery(selectedId!, { skip: !selectedId });
  const detail = detailData?.data;

  const { data: msgsData } = useGetDisputeMessagesQuery(selectedId!, { skip: !selectedId });
  const messages = (msgsData?.data ?? []) as DisputeMessage[];

  const [addMessage] = useAddDisputeMessageMutation();
  const [addEvidence] = useAddDisputeEvidenceMutation();
  const [updateStatus] = useUpdateDisputeStatusMutation();

  const cols: ColumnDef<Dispute>[] = [
    { accessorKey: 'disputeNumber', header: 'Dispute #' },
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <StatusBadge status={row.original.type} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'createdAt', header: 'Opened', cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => setSelectedId(row.original.id)}>
          <MessageSquare className="mr-1 h-4 w-4" /> View
        </Button>
      ),
    },
  ];

  const handleSendMsg = async () => {
    if (!msgText.trim() || !selectedId) return;
    try {
      await addMessage({ disputeId: selectedId, data: { content: msgText } }).unwrap();
      setMsgText('');
    } catch { toast.error('Failed to send message'); }
  };

  const handleAddEvidence = async () => {
    if (!evidenceForm.type || !evidenceForm.fileUrl || !selectedId) return;
    try {
      await addEvidence({ disputeId: selectedId, data: evidenceForm }).unwrap();
      toast.success('Evidence added');
      setShowEvidence(false);
      setEvidenceForm({ type: '', description: '', fileUrl: '' });
    } catch { toast.error('Failed to add evidence'); }
  };

  if (isLoading) return <LoadingSpinner label="Loading disputes..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Disputes" description="Manage and respond to customer disputes" />

      {disputes.length === 0 ? (
        <EmptyState icon={<AlertTriangle className="h-12 w-12" />} title="No disputes" description="No disputes opened against your orders" />
      ) : (
        <DataTable
          columns={cols}
          data={disputes}
          pagination={{ page, limit, total, totalPages, onPageChange: setPage, onLimitChange: setLimit }}
        />
      )}

      {/* Detail + Messages Dialog */}
      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute {detail?.disputeNumber ?? ''}</DialogTitle>
          </DialogHeader>

          {detail && (
            <div className="space-y-2 text-sm">
              <p><strong>Subject:</strong> {detail.subject}</p>
              <p><strong>Type:</strong> <StatusBadge status={detail.type} /></p>
              <p><strong>Status:</strong> <StatusBadge status={detail.status} /></p>
              <p><strong>Description:</strong> {detail.description}</p>
            </div>
          )}

          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            <h4 className="font-semibold text-sm">Messages</h4>
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="rounded-md bg-muted p-2">
                  <p className="text-sm">{m.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <Input placeholder="Type a message..." value={msgText} onChange={(e) => setMsgText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMsg()} />
            <Button size="sm" onClick={handleSendMsg}>Send</Button>
          </div>

          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => setShowEvidence(true)}>Add Evidence</Button>
            {detail?.status === 'open' && (
              <Button size="sm" variant="secondary" onClick={() => updateStatus({ id: selectedId!, status: 'under_review' as never })}>
                Mark Under Review
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Evidence Dialog */}
      <Dialog open={showEvidence} onOpenChange={setShowEvidence}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Evidence</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Evidence type" value={evidenceForm.type} onChange={(e) => setEvidenceForm((f) => ({ ...f, type: e.target.value }))} />
            <Textarea placeholder="Description" value={evidenceForm.description} onChange={(e) => setEvidenceForm((f) => ({ ...f, description: e.target.value }))} />
            <Input placeholder="File URL" value={evidenceForm.fileUrl} onChange={(e) => setEvidenceForm((f) => ({ ...f, fileUrl: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvidence(false)}>Cancel</Button>
            <Button onClick={handleAddEvidence}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
