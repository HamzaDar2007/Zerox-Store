import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '@/lib/validation'
import { authApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SEOHead } from '@/components/common/SEOHead'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: { email: string }) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
      toast.success('Password reset email sent!')
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <>
        <SEOHead title="Check Your Email" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Check your email</h1>
          <p className="text-sm text-[#94A3B8] mb-6">
            We've sent a password reset link to your email address. Please check your inbox.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" className="h-11">Back to sign in</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead title="Forgot Password" />
      <div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Forgot password?</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-1 block">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} autoFocus />
            {errors.email && <p className="text-xs text-[#EF4444] mt-1">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full h-11 font-semibold text-base" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>

        <p className="text-sm text-[#94A3B8] text-center mt-6">
          <Link to={ROUTES.LOGIN} className="text-[#6366F1] hover:text-[#4F46E5] font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  )
}
