import { Outlet } from 'react-router-dom'
import { Store } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="login-bg flex min-h-screen items-center justify-center p-4">
      <div className="dot-pattern" />
      <div className="page-enter w-full max-w-md">
        <div className="auth-card rounded-2xl p-8 animate-scale-in">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25">
              <Store className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {import.meta.env.VITE_APP_NAME || 'Seller Portal'}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Manage your store and grow your business</p>
          </div>
          <Outlet />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          Powered by LabVerse &middot; Secure Login
        </p>
      </div>
    </div>
  )
}
