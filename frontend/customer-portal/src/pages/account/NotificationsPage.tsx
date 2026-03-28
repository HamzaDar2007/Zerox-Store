import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { notificationsApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import type { Notification } from '@/types'
import { formatRelativeTime } from '@/lib/format'
import { Bell, Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationsApi.list({ limit: 50 }).then((res) => setNotifications(res.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch { /* silent */ }
  }

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>

  return (
    <>
      <SEOHead title="Notifications" />
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#0F172A]">Notifications</h1>
          {notifications.some((n) => !n.isRead) && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <Check className="h-4 w-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon={<Bell className="h-16 w-16" />} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex gap-3 p-4 rounded-xl border transition-colors',
                  n.isRead ? 'bg-white border-[#E2E8F0]' : 'bg-[#EEF2FF] border-[#6366F1]/30',
                )}
              >
                <Bell className={cn('h-5 w-5 mt-0.5 shrink-0', n.isRead ? 'text-[#64748B]' : 'text-[#6366F1]')} />
                <div className="flex-1 min-w-0">
                  {n.title && <p className="text-sm font-medium text-[#0F172A]">{n.title}</p>}
                  {n.body && <p className="text-sm text-[#64748B]">{n.body}</p>}
                  <p className="text-xs text-[#94A3B8] mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-[#6366F1] hover:underline cursor-pointer">Read</button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="text-[#64748B] hover:text-[#EF4444] cursor-pointer p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
