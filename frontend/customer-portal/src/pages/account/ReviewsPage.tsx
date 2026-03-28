import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { ReviewCard } from '@/components/product/ReviewCard'
import { reviewsApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import type { Review } from '@/types'
import { Star } from 'lucide-react'

export default function ReviewsPage() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    reviewsApi.list({ userId: user.id, limit: 50 }).then((res) => setReviews(res.data)).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>

  return (
    <>
      <SEOHead title="My Reviews" />
      <div>
        <h1 className="text-xl font-bold text-[#0F172A] mb-6">My Reviews</h1>

        {reviews.length === 0 ? (
          <EmptyState icon={<Star className="h-16 w-16" />} title="No reviews yet" description="Share your experience by reviewing products you've purchased." />
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
