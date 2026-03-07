import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Badge } from '@/common/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { MessageCircle, Send, Plus } from 'lucide-react';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  useCreateConversationMutation,
} from '@/store/api';
import { useAppSelector } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';

export default function CustomerChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newStoreId, setNewStoreId] = useState('');
  const user = useAppSelector((s) => s.auth.user);

  const { data: convoData, isLoading: loadingConvos } = useGetConversationsQuery();
  const conversations = convoData?.data ?? [];

  const { data: msgData } = useGetMessagesQuery(
    { conversationId: selectedId! },
    { skip: !selectedId },
  );
  const messages = msgData?.data ?? [];

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [markRead] = useMarkConversationAsReadMutation();
  const [createConvo] = useCreateConversationMutation();

  const handleSelect = (id: string) => {
    setSelectedId(id);
    markRead(id);
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedId) return;
    try {
      await sendMessage({ conversationId: selectedId, data: { content: messageText } }).unwrap();
      setMessageText('');
    } catch { toast.error('Failed to send message'); }
  };

  const handleCreate = async () => {
    if (!newStoreId.trim()) return;
    try {
      await createConvo({ type: 'customer_seller', customerId: user?.id ?? '', storeId: newStoreId, subject: newSubject || undefined }).unwrap();
      toast.success('Conversation created');
      setShowNew(false);
      setNewSubject('');
      setNewStoreId('');
    } catch { toast.error('Failed to create conversation'); }
  };

  if (loadingConvos) return <LoadingSpinner label="Loading conversations..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Chat with sellers and support">
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Conversation
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3" style={{ minHeight: 500 }}>
        {/* Conversation List */}
        <div className="space-y-2 overflow-y-auto rounded-lg border p-2 lg:col-span-1">
          {conversations.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="h-10 w-10" />}
              title="No conversations"
              description="Start a new conversation with a seller."
            />
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent',
                  selectedId === c.id && 'bg-accent',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {c.subject || 'Conversation'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(c.lastMessageAt || c.createdAt)}
                  </p>
                </div>
                {c.customerUnreadCount > 0 && (
                  <Badge variant="destructive" className="shrink-0">
                    {c.customerUnreadCount}
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>

        {/* Message Thread */}
        <div className="flex flex-col rounded-lg border lg:col-span-2">
          {!selectedId ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-2',
                      m.senderType === ('customer' as never)
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'bg-muted',
                    )}
                  >
                    <p className="text-sm">{m.content}</p>
                    <p className="mt-1 text-xs opacity-70">{formatDate(m.createdAt)}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t p-3">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} disabled={sending || !messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Store ID (seller)"
              value={newStoreId}
              onChange={(e) => setNewStoreId(e.target.value)}
            />
            <Input
              placeholder="Subject (optional)"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
