import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { chatApi } from '@/services/api'
import type { ChatThread, ChatMessage } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { LoadingPage } from '@/components/shared/loading'
import { Send, MessageSquare } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

export default function ChatPage() {
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [message, setMessage] = useState('')
  const user = useAuthStore((s) => s.user)

  const { data: threads, isLoading } = useQuery({
    queryKey: ['chat-threads'],
    queryFn: chatApi.listThreads,
  })

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', selectedThread?.id],
    queryFn: () => chatApi.getMessages(selectedThread!.id),
    enabled: !!selectedThread,
    refetchInterval: 5000,
  })

  const sendM = useMutation({
    mutationFn: (body: string) => chatApi.sendMessage({ threadId: selectedThread!.id, body }),
    onSuccess: () => { setMessage(''); refetchMessages() },
  })

  if (isLoading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader title="Chat" description="Support conversations" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Thread list */}
        <Card className="lg:col-span-1">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Threads</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="space-y-1 p-2">
              {(threads ?? []).length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground text-sm">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  No threads
                </div>
              ) : (
                (threads ?? []).map((t: ChatThread) => (
                  <button
                    key={t.id}
                    className={`w-full text-left rounded-md p-3 text-sm transition-colors ${selectedThread?.id === t.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                    onClick={() => setSelectedThread(t)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Thread #{t.id.slice(0, 8)}</span>
                      <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(t.createdAt)}</p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedThread ? (
            <>
              <CardHeader className="py-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Thread #{selectedThread.id.slice(0, 8)}</CardTitle>
                  <Badge variant="outline">{selectedThread.status}</Badge>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {(messages ?? []).map((m: ChatMessage) => (
                    <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${m.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{m.body}</p>
                        <p className={`text-[10px] mt-1 ${m.senderId === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatDateTime(m.sentAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t p-3 flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) sendM.mutate(message.trim()) }}
                />
                <Button size="icon" onClick={() => message.trim() && sendM.mutate(message.trim())} disabled={sendM.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
              Select a thread to start chatting
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
