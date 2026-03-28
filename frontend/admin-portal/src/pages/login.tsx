import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { getErrorMessage } from '@/lib/api-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading'
import { toast } from 'sonner'
import { Sparkles, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: formResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setAuth(res.user, res.accessToken, res.refreshToken)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg flex min-h-screen items-center justify-center p-4">
      <div className="dot-pattern fixed inset-0 pointer-events-none opacity-40" />
      <Card className="relative w-full max-w-[420px] animate-scale-in shadow-2xl shadow-primary/8 border-border/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-2 pt-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground/60 text-[13px] mt-1">Sign in to your admin account</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-10 px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-medium text-foreground/80">Email address</Label>
              <Input id="email" type="email" placeholder="admin@example.com" {...register('email')} className="h-12 rounded-xl bg-muted/30 border-border/40 focus:bg-background" />
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-foreground/80">Password</Label>
                <a href="/forgot-password" className="text-xs text-primary/70 hover:text-primary hover:underline transition-colors font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className="h-12 rounded-xl pr-11 bg-muted/30 border-border/40 focus:bg-background" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 text-[15px] transition-all duration-200 hover:shadow-xl hover:shadow-primary/25" disabled={loading}>
              {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Sign in
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground/40 mt-8">Secured by enterprise-grade encryption</p>
        </CardContent>
      </Card>
    </div>
  )
}
