import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/services/api'
import type { Notification } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingPage } from '@/components/shared/loading'
import { EmptyState } from '@/components/shared/empty-state'
import { Bell, CheckCheck, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { VirtualizedList } from '@/components/shared/virtualized-list'

export default function NotificationsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { page, limit }],
    queryFn: () => notificationsApi.list({ page, limit }),
  })

  const markReadM = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] }) },
  })

  const markAllReadM = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] }); toast.success('All marked as read') },
  })

  const deleteM = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Deleted') },
  })

  if (isLoading) return <LoadingPage />

  const allNotifications = data?.data ?? []
  const notifications = filter === 'all' ? allNotifications
    : filter === 'unread' ? allNotifications.filter((n: Notification) => !n.isRead)
    : allNotifications.filter((n: Notification) => n.isRead)

  const totalPages = data?.totalPages ?? 1

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markReadM.mutate(n.id)
    if (n.actionUrl) navigate(n.actionUrl)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notifications" description="View your notifications">
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent text-muted-foreground'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => markAllReadM.mutate()} disabled={markAllReadM.isPending}>
            <CheckCheck className="mr-2 h-4 w-4" />Mark All Read
          </Button>
        </div>
      </PageHeader>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={filter === 'unread' ? 'No unread notifications' : 'No notifications'} />
      ) : (
        <VirtualizedList
          items={notifications}
          estimateSize={100}
          className="h-[calc(100vh-280px)] overflow-auto"
          renderItem={(n: Notification) => (
            <Card
              key={n.id}
              className={`transition-all duration-200 hover:shadow-md cursor-pointer ${n.isRead ? 'opacity-60' : 'border-l-4 border-l-primary'}`}
              onClick={() => handleNotificationClick(n)}
            >
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{n.title}</h4>
                    {!n.isRead && <Badge variant="default" className="text-[10px]">New</Badge>}
                    <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                    {n.channel && <Badge variant="secondary" className="text-[10px]">{n.channel}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.sentAt)}</p>
                </div>
                <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                  {!n.isRead && (
                    <Button variant="ghost" size="icon" onClick={() => markReadM.mutate(n.id)} title="Mark as read">
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteM.mutate(n.id)} title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
