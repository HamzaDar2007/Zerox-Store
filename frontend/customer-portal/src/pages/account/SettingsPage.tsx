import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema } from '@/lib/validation'
import { SEOHead } from '@/components/common/SEOHead'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type ChangePasswordData = { currentPassword: string; newPassword: string; confirmPassword: string }

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onChangePassword = async (data: ChangePasswordData) => {
    setLoading(true)
    try {
      await authApi.changePassword({ oldPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed successfully')
      reset()
    } catch {
      toast.error('Failed to change password. Check your current password.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    toast.info('Please contact support to delete your account.')
  }

  return (
    <>
      <SEOHead title="Settings" />
      <div className="max-w-xl">
        <h1 className="text-xl font-bold text-[#0F172A] mb-6">Settings</h1>

        {/* Change Password */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-[#0F172A] mb-4">Change Password</h2>
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <Label className="mb-1 block">Current Password</Label>
              <Input type="password" {...register('currentPassword')} />
              {errors.currentPassword && <p className="text-xs text-[#EF4444] mt-1">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block">New Password</Label>
              <Input type="password" {...register('newPassword')} />
              {errors.newPassword && <p className="text-xs text-[#EF4444] mt-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block">Confirm New Password</Label>
              <Input type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-[#EF4444] mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Changing…' : 'Change Password'}
            </Button>
          </form>
        </section>

        <Separator className="my-6" />

        {/* Danger Zone */}
        <section>
          <h2 className="text-base font-bold text-[#EF4444] mb-2">Danger Zone</h2>
          <p className="text-sm text-[#64748B] mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-[#EF4444] border-[#EF4444] hover:bg-red-50">Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, order history, and all personal data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-[#EF4444] hover:bg-red-700">Delete Account</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </>
  )
}
