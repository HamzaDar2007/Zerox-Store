import { useEffect, useState } from 'react'
import { reviewsApi } from '@/services/api'
import type { Review, RatingSummary } from '@/types'

export function useReviews(productId: string, params?: { page?: number; limit?: number }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<RatingSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refetchTick, setRefetchTick] = useState(0)
  const page = params?.page
  const limit = params?.limit

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    Promise.all([
      reviewsApi.list({ productId, page, limit }),
      reviewsApi.getSummary(productId),
    ]).then(([res, sum]) => {
      if (cancelled) return
      setReviews(res.data)
      setTotal(res.total)
      setSummary(sum)
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [productId, page, limit, refetchTick])

  const refetch = () => setRefetchTick((t) => t + 1)

  return { reviews, summary, total, loading, refetch }
}
