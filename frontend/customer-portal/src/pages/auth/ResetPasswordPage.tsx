import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema } from '@/lib/validation'
import { authApi } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SEOHead } from '@/components/common/SEOHead'
import { toast } from 'sonner'

type ResetFormData = { newPassword: string; confirmPassword: string }

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetFormData) => {
    if (!token) { toast.error('Invalid reset link'); return }
    setLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword })
      toast.success('Password reset successfully!')
      navigate(ROUTES.LOGIN)
    } catch {
      toast.error('Failed to reset password. The link may be expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Reset Password" />
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-[#0F1111] mb-1">Reset Password</h1>
        <p className="text-sm text-[#565959] mb-6">Enter your new password below</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="newPassword" className="mb-1 block">New Password</Label>
            <Input id="newPassword" type="password" placeholder="New password" {...register('newPassword')} autoFocus />
            {errors.newPassword && <p className="text-xs text-[#B12704] mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="mb-1 block">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirm new password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-[#B12704] mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full font-bold" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </>
  )
}
