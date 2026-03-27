import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { MessageSquare, Send, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { sanitizeText } from '@/lib/sanitize'
import type { ChatThread, ChatMessage } from '@/types'

/**
 * Chat / Messages Page
 * Thread-based messaging with auto-scroll and polling refresh.
 */
export default function ChatPage() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: threads = [] } = useQuery({
    queryKey: ['chat-threads'],
    queryFn: chatApi.listThreads,
    refetchInterval: 15000,
  })

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', selectedThread?.id],
    queryFn: () => chatApi.getMessages(selectedThread!.id),
    enabled: !!selectedThread,
    refetchInterval: 5000,
  })

  const sendM = useMutation({
    mutationFn: (body: string) => chatApi.sendMessage({ threadId: selectedThread!.id, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat-messages', selectedThread?.id] })
      qc.invalidateQueries({ queryKey: ['chat-threads'] })
      setMessage('')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark thread as read when selected
  useEffect(() => {
    if (selectedThread) {
      chatApi.updateLastRead(selectedThread.id).catch(() => {})
    }
  }, [selectedThread])

  const handleSend = () => {
    if (!message.trim()) return
    sendM.mutate(sanitizeText(message.trim()))
  }

  const threadList: ChatThread[] = Array.isArray(threads) ? threads : []
  const messageList: ChatMessage[] = Array.isArray(messages) ? messages : []

  return (
    <div className="flex h-[calc(100vh-10rem)] rounded-lg border bg-card overflow-hidden">
      {/* Thread list */}
      <div className={cn(
        'w-80 flex-shrink-0 border-r flex flex-col',
        selectedThread ? 'hidden md:flex' : 'flex',
      )}>
        <div className="border-b p-4">
          <h2 className="font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threadList.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
          ) : (
            threadList.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={cn(
                  'flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b',
                  selectedThread?.id === thread.id && 'bg-muted',
                )}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {thread.subject?.[0]?.toUpperCase() ?? 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{thread.subject ?? 'Chat'}</p>
                  <p className="truncate text-xs text-muted-foreground">{thread.status}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={cn(
        'flex-1 flex flex-col',
        !selectedThread ? 'hidden md:flex' : 'flex',
      )}>
        {!selectedThread ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a thread from the list to start messaging" />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b p-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedThread(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <p className="font-medium">{selectedThread.subject ?? 'Chat'}</p>
                <p className="text-xs text-muted-foreground">{selectedThread.status}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messageList.map((msg) => {
                const isMe = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2',
                      isMe ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    )}>
                      <p className="text-sm">{msg.body}</p>
                      <p className={cn('mt-1 text-[10px]', isMe ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!message.trim() || sendM.isPending} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
