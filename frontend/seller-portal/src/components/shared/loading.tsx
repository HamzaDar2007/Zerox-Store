import { Loader2 } from 'lucide-react'

export function LoadingPage() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-5 animate-fade-in">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-muted/60" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground font-medium tracking-wide">Loading...</p>
    </div>
  )
}

export function LoadingSpinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}
