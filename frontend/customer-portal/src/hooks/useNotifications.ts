import { useEffect, useState, useCallback } from 'react'
import { notificationsApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import type { Notification } from '@/types'

export function useNotifications() {
  const { isAuthenticated } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const [res, count] = await Promise.all([
        notificationsApi.list({ limit: 20 }),
        notificationsApi.unreadCount(),
      ])
      setNotifications(res.data)
      setUnreadCount(count)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [isAuthenticated])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markRead = useCallback(async (id: string) => {
    await notificationsApi.markRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications }
}
