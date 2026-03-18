import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-5 text-center p-4 page-enter">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/8">
        <ShieldAlert className="h-9 w-9 text-destructive/70" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tight text-foreground/80">403</h1>
        <p className="text-lg font-medium text-muted-foreground">Access Forbidden</p>
        <p className="text-[13px] text-muted-foreground/60 max-w-sm">
          You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
      </div>
      <Button asChild variant="outline" className="mt-1">
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
