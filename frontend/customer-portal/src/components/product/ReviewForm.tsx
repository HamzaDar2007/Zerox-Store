import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviewSchema, type ReviewFormData } from '@/lib/validation'
import { StarRating } from '@/components/common/StarRating'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { reviewsApi } from '@/services/api'
import { toast } from 'sonner'

interface ReviewFormProps {
  productId: string
  orderId?: string
  onSuccess?: () => void
}

export function ReviewForm({ productId, orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  })

  const handleSetRating = (value: number) => {
    setRating(value)
    setValue('rating', value, { shouldValidate: true })
  }

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitting(true)
    try {
      await reviewsApi.create({ ...data, productId, orderId, rating })
      toast.success('Review submitted successfully!')
      reset()
      setRating(0)
      onSuccess?.()
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="mb-2 block">Your Rating</Label>
        <StarRating rating={rating} size="lg" interactive onRate={handleSetRating} />
        {errors.rating && <p className="text-xs text-[#EF4444] mt-1">{errors.rating.message}</p>}
      </div>

      <div>
        <Label htmlFor="review-title" className="mb-1 block">Review Title</Label>
        <Input id="review-title" placeholder="Summarize your review" {...register('title')} />
        {errors.title && <p className="text-xs text-[#EF4444] mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="review-body" className="mb-1 block">Your Review</Label>
        <Textarea
          id="review-body"
          placeholder="Tell others about your experience…"
          rows={4}
          {...register('body')}
        />
        {errors.body && <p className="text-xs text-[#EF4444] mt-1">{errors.body.message}</p>}
      </div>

      <Button type="submit" disabled={submitting || rating === 0}>
        {submitting ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  )
}
