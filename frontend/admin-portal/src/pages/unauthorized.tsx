import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldOff } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-4">
      <ShieldOff className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold">401</h1>
      <p className="text-xl text-muted-foreground">Unauthorized</p>
      <p className="text-sm text-muted-foreground max-w-md">
        You need to be logged in to access this page. Please sign in and try again.
      </p>
      <Button asChild>
        <Link to="/login">Go to Login</Link>
      </Button>
    </div>
  )
}
