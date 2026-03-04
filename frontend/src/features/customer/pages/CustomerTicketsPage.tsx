import { useState } from 'react';
import { useGetMyTicketsQuery, useCreateTicketMutation } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { PaginationControls } from '@/common/components/PaginationControls';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
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
import { LifeBuoy, Plus, MessageSquare } from 'lucide-react';
import { formatRelative } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { TicketPriority } from '@/common/types';

export default function CustomerTicketsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);

  const { data, isLoading } = useGetMyTicketsQuery({ page, limit });
  const [createTicket, { isLoading: creating }] = useCreateTicketMutation();

  const tickets = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleCreate = async () => {
    if (!subject.trim() || !description.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    try {
      await createTicket({ subject, description, priority }).unwrap();
      toast.success('Ticket created successfully');
      setDialogOpen(false);
      setSubject('');
      setDescription('');
      setPriority(TicketPriority.MEDIUM);
    } catch {
      toast.error('Failed to create ticket');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Support Tickets" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Get help from our support team"
      >
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Ticket
        </Button>
      </PageHeader>

      {tickets.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="h-12 w-12" />}
          title="No support tickets"
          description="Need help? Create a support ticket and we'll get back to you."
          action={{ label: 'Create Ticket', onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} to={`/account/tickets/${ticket.id}`}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="flex items-start gap-4 py-4">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{ticket.subject}</p>
                      <StatusBadge status={ticket.status} />
                      <StatusBadge status={ticket.priority} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {ticket.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      #{ticket.ticketNumber} · {formatRelative(ticket.createdAt)}
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

      {/* Create Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Subject *</Label>
              <Input
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TicketPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TicketPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TicketPriority.HIGH}>High</SelectItem>
                  <SelectItem value={TicketPriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Please describe your issue in detail..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Submit Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
