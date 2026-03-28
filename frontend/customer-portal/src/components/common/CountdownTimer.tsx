import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: string | Date
  onExpire?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CountdownTimer({ targetDate, onExpire, className, size = 'md' }: CountdownTimerProps) {
  const calculateTimeLeft = useCallback(() => {
    const target = new Date(targetDate).getTime()
    const now = Date.now()
    const diff = target - now

    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true }

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    }
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft()
      setTimeLeft(newTime)
      if (newTime.expired) {
        clearInterval(timer)
        onExpire?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft, onExpire])

  if (timeLeft.expired) return <span className="text-[#EF4444] font-bold">Expired</span>

  const pad = (n: number) => n.toString().padStart(2, '0')

  const textSize = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }[size]
  const labelSize = { sm: 'text-[9px]', md: 'text-[10px]', lg: 'text-xs' }[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <TimeBlock value={pad(timeLeft.hours)} label="HRS" textSize={textSize} labelSize={labelSize} />
      <span className={cn('font-bold text-white', textSize)}>:</span>
      <TimeBlock value={pad(timeLeft.minutes)} label="MIN" textSize={textSize} labelSize={labelSize} />
      <span className={cn('font-bold text-white', textSize)}>:</span>
      <TimeBlock value={pad(timeLeft.seconds)} label="SEC" textSize={textSize} labelSize={labelSize} />
    </div>
  )
}

function TimeBlock({ value, label, textSize, labelSize }: { value: string; label: string; textSize: string; labelSize: string }) {
  return (
    <div className="flex flex-col items-center bg-[#0F172A] text-white rounded px-2 py-1 min-w-[40px]">
      <span className={cn('font-bold leading-tight', textSize)}>{value}</span>
      <span className={cn('uppercase tracking-wider', labelSize)}>{label}</span>
    </div>
  )
}
