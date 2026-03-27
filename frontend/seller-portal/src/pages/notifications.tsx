/**
 * Notifications Page
 * Lists notifications with read/unread state, mark all read, and delete.
 * Uses skeleton loading for improved perceived performance.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/services/api'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ page: 1, limit: 100 }),
  })

  const markReadM = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const markAllM = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Deleted') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const notifications = (data?.data ?? data ?? []) as Notification[]
  const unread = Array.isArray(notifications) ? notifications.filter((n) => !n.readAt).length : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notifications" description="Stay updated" />
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/60" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : 'All caught up!'}
        action={unread > 0 ? { label: 'Mark All Read', onClick: () => markAllM.mutate() } : undefined}
      />

      {(!Array.isArray(notifications) || notifications.length === 0) ? (
        <EmptyState icon={Bell} title="No Notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                !n.readAt && 'bg-primary/5 border-primary/20',
              )}
            >
              <div className={cn(
                'mt-1 h-2 w-2 flex-shrink-0 rounded-full',
                !n.readAt ? 'bg-primary' : 'bg-transparent',
              )} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                {!n.readAt && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markReadM.mutate(n.id)} title="Mark read">
                    <CheckCheck className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteM.mutate(n.id)} title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
