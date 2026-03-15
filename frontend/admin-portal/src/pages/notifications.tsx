import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/services/api'
import type { Notification } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingPage } from '@/components/shared/loading'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils'

export default function NotificationsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ page: 1, limit: 50 }),
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

  const notifications = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="View your notifications">
        <Button variant="outline" onClick={() => markAllReadM.mutate()} disabled={markAllReadM.isPending}>
          <CheckCheck className="mr-2 h-4 w-4" />Mark All Read
        </Button>
      </PageHeader>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-4" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: Notification) => (
            <Card key={n.id} className={n.isRead ? 'opacity-60' : ''}>
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{n.title}</h4>
                    {!n.isRead && <Badge variant="default" className="text-[10px]">New</Badge>}
                    <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.sentAt)}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {!n.isRead && (
                    <Button variant="ghost" size="icon" onClick={() => markReadM.mutate(n.id)}>
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteM.mutate(n.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
