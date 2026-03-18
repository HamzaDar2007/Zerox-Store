import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldOff } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 text-center p-4 page-enter">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/8">
        <ShieldOff className="h-9 w-9 text-warning/70" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tight text-foreground/80">401</h1>
        <p className="text-lg font-medium text-muted-foreground">Unauthorized</p>
        <p className="text-[13px] text-muted-foreground/60 max-w-sm">
          You need to be logged in to access this page. Please sign in and try again.
        </p>
      </div>
      <Button asChild className="mt-1 shadow-sm">
        <Link to="/login">Go to Login</Link>
      </Button>
    </div>
  )
}
