import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 text-center p-4">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-xl text-muted-foreground">Forbidden</p>
      <p className="text-sm text-muted-foreground max-w-md">
        You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
      </p>
      <Button asChild variant="outline">
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
