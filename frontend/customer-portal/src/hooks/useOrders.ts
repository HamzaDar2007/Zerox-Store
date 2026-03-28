import { useEffect, useState } from 'react'
import { ordersApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import type { Order, PaginatedResponse } from '@/types'

export function useOrders(params?: { page?: number; limit?: number; status?: string }) {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const page = params?.page
  const limit = params?.limit
  const status = params?.status

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    ordersApi.list({ page, limit, status }).then((res: PaginatedResponse<Order>) => {
      if (cancelled) return
      setOrders(res.data)
      setTotal(res.total)
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isAuthenticated, page, limit, status])

  return { orders, total, loading }
}
