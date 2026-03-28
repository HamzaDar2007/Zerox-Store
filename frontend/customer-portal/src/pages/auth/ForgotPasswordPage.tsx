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
        <div className="w-full max-w-md mx-auto text-center">
          <h1 className="text-2xl font-extrabold text-[#0F1111] mb-2">Check Your Email</h1>
          <p className="text-sm text-[#565959] mb-6">
            We've sent a password reset link to your email address. Please check your inbox.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline">Back to Sign In</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead title="Forgot Password" />
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-[#0F1111] mb-1">Forgot Password</h1>
        <p className="text-sm text-[#565959] mb-6">Enter your email and we'll send you a reset link</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-1 block">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} autoFocus />
            {errors.email && <p className="text-xs text-[#B12704] mt-1">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full font-bold" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-sm text-[#565959] text-center mt-6">
          <Link to={ROUTES.LOGIN} className="text-[#007185] hover:text-[#C7511F] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </>
  )
}
