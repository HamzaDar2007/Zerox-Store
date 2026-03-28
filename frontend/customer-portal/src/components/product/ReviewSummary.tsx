import { StarRating } from '@/components/common/StarRating'
import { Progress } from '@/components/ui/progress'
import type { RatingSummary } from '@/types'

interface ReviewSummaryProps {
  summary: RatingSummary
}

export function ReviewSummary({ summary }: ReviewSummaryProps) {
  const avg = summary.avg ?? summary.average ?? 0
  const total = summary.count ?? summary.total ?? 0
  const distribution = summary.distribution ?? {}

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Overall Rating */}
      <div className="text-center md:text-left shrink-0">
        <div className="text-5xl font-bold text-[#0F172A] mb-1">{avg.toFixed(1)}</div>
        <StarRating rating={avg} size="md" />
        <p className="text-sm text-[#64748B] mt-1">{total} {total === 1 ? 'review' : 'reviews'}</p>
      </div>

      {/* Distribution */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] ?? 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-[#6366F1] w-12 shrink-0 text-right cursor-pointer hover:underline">
                {star} star
              </span>
              <Progress value={pct} className="h-4 flex-1" />
              <span className="text-sm text-[#64748B] w-10 shrink-0 text-right">{pct.toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
