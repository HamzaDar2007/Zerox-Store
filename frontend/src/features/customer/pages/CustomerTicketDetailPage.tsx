import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useGetMyTicketsQuery,
  useGetTicketMessagesQuery,
  useAddTicketMessageMutation,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { StatusBadge } from '@/common/components/StatusBadge';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Textarea } from '@/common/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { formatRelative } from '@/lib/format';
import { toast } from 'sonner';

export default function CustomerTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [message, setMessage] = useState('');

  // Get ticket from list (we don't have a getTicketById hook, so filter from list)
  const { data: ticketsData, isLoading: ticketsLoading } = useGetMyTicketsQuery({ page: 1, limit: 100 });
  const ticket = ticketsData?.data?.items?.find((t) => t.id === ticketId);

  const { data: messagesData, isLoading: messagesLoading } = useGetTicketMessagesQuery(
    ticketId!,
    { skip: !ticketId },
  );
  const messages = messagesData?.data ?? [];

  const [addMessage, { isLoading: sending }] = useAddTicketMessageMutation();

  const handleSend = async () => {
    if (!message.trim() || !ticketId) return;
    try {
      await addMessage({ ticketId, data: { content: message.trim() } }).unwrap();
      setMessage('');
      toast.success('Message sent');
    } catch {
      toast.error('Failed to send message');
    }
  };

  if (ticketsLoading || messagesLoading) return <LoadingSpinner label="Loading ticket..." />;

  if (!ticket) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Link to="/account/tickets">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/account/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={ticket.subject}
          description={`#${ticket.ticketNumber} · ${formatRelative(ticket.createdAt)}`}
        />
        <div className="flex gap-2 ml-auto">
          <StatusBadge status={ticket.status} />
          <StatusBadge status={ticket.priority} />
        </div>
      </div>

      {/* Ticket Description */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Messages Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversation ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No messages yet. Send a message below.</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-3 ${
                    msg.isStaff
                      ? 'bg-blue-50 dark:bg-blue-950/20 ml-0 mr-8'
                      : 'bg-muted ml-8 mr-0'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {msg.isStaff ? 'Support Agent' : 'You'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <p className="text-xs text-primary mt-1">
                      {msg.attachments.length} attachment(s)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reply Input */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Textarea
              placeholder="Type your message..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={sending || !message.trim()} size="icon" className="h-auto">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
