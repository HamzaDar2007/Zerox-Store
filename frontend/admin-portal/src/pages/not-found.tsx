import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 page-enter">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60">
        <FileQuestion className="h-9 w-9 text-muted-foreground/60" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold tracking-tight text-foreground/80">404</h1>
        <p className="text-lg font-medium text-muted-foreground">Page not found</p>
        <p className="text-[13px] text-muted-foreground/60 max-w-sm">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      </div>
      <Button onClick={() => navigate('/')} className="mt-1 shadow-sm">Go to Dashboard</Button>
    </div>
  )
}
