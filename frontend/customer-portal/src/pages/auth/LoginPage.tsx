import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validation'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SEOHead } from '@/components/common/SEOHead'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

type LoginFormData = { email: string; password: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string })?.from ?? ROUTES.HOME

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setAuth(res.user, res.accessToken, res.refreshToken)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Sign In" />
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-[#0F1111] mb-1">Sign In</h1>
        <p className="text-sm text-[#565959] mb-6">Welcome back to ShopVerse</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-1 block">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} autoFocus />
            {errors.email && <p className="text-xs text-[#B12704] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="password">Password</Label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#565959] cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-[#B12704] mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full font-bold" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-[#565959] text-center mt-6">
          New to ShopVerse?{' '}
          <Link to={ROUTES.REGISTER} className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium">
            Create your account
          </Link>
        </p>
      </div>
    </>
  )
}
