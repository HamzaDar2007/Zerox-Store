import { Loader2 } from 'lucide-react'

export function LoadingPage() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative">
        <div className="h-10 w-10 rounded-full border-2 border-muted/80" />
        <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-[13px] text-muted-foreground/60 font-medium">Loading...</p>
    </div>
  )
}

export function LoadingSpinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}
