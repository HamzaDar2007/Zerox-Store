import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/validation'
import { authApi } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SEOHead } from '@/components/common/SEOHead'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

type RegisterFormData = { firstName: string; lastName: string; email: string; password: string; confirmPassword: string }

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      toast.success('Account created! Please sign in.')
      navigate(ROUTES.LOGIN)
    } catch {
      toast.error('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Create Account" />
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-[#0F1111] mb-1">Create Account</h1>
        <p className="text-sm text-[#565959] mb-6">Join ShopVerse today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="mb-1 block">First Name</Label>
              <Input id="firstName" placeholder="John" {...register('firstName')} autoFocus />
              {errors.firstName && <p className="text-xs text-[#B12704] mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName" className="mb-1 block">Last Name</Label>
              <Input id="lastName" placeholder="Doe" {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-[#B12704] mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="mb-1 block">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-[#B12704] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="mb-1 block">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
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

          <div>
            <Label htmlFor="confirmPassword" className="mb-1 block">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Re-enter your password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-[#B12704] mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full font-bold" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="text-sm text-[#565959] text-center mt-6">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </>
  )
}
