import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore, type ThemeColor } from '@/store/theme.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { authApi, usersApi } from '@/services/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { profileSchema, changePasswordSchema } from '@/lib/validation'
import { FileUploader } from '@/components/shared/file-uploader'
import { Progress } from '@/components/ui/progress'

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof changePasswordSchema>

const THEME_COLORS: { name: ThemeColor; label: string; swatch: string }[] = [
  { name: 'blue', label: 'Blue', swatch: 'bg-blue-500' },
  { name: 'emerald', label: 'Emerald', swatch: 'bg-emerald-500' },
  { name: 'rose', label: 'Rose', swatch: 'bg-rose-500' },
  { name: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
  { name: 'violet', label: 'Violet', swatch: 'bg-violet-500' },
]

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const { theme, color, toggleTheme, setColor } = useThemeStore()
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    if (!user) return
    setProfileLoading(true)
    try {
      const updated = await usersApi.update(user.id, data)
      setUser({ ...user, ...updated })
      toast.success('Profile updated')
      setEditingProfile(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordLoading(true)
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch {
      toast.error('Failed to change password. Check your current password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarUpload = async (files: File[]) => {
    if (!user || !files[0]) return
    setAvatarLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', files[0])
      const updated = await usersApi.uploadAvatar(user.id, fd)
      setUser({ ...user, ...updated })
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken
    try { if (refreshToken) await authApi.logout(refreshToken) } catch { /* ignore */ }
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" description="Manage your account settings and preferences" />

      <div className="grid gap-6 max-w-2xl">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile</CardTitle>
            {!editingProfile && (
              <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>Edit</Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label className="text-sm">Avatar</Label>
                <FileUploader accept="image/*" maxSizeMB={2} preview={user?.avatarUrl} onUpload={handleAvatarUpload} />
                {avatarLoading && <Progress value={undefined} className="h-1 mt-1" />}
              </div>
            </div>
            {editingProfile ? (
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...profileForm.register('firstName')} />
                    {profileForm.formState.errors.firstName && <p className="text-sm text-destructive">{profileForm.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...profileForm.register('lastName')} />
                    {profileForm.formState.errors.lastName && <p className="text-sm text-destructive">{profileForm.formState.errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" {...profileForm.register('phone')} placeholder="+1234567890" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" loading={profileLoading}>Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{user?.firstName} {user?.lastName}</p></div>
                <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{user?.email}</p></div>
                <div><Label className="text-muted-foreground">Role</Label><p><Badge variant="outline">{user?.role || 'N/A'}</Badge></p></div>
                <div><Label className="text-muted-foreground">Status</Label><p><Badge variant={user?.isActive ? 'success' : 'destructive'}>{user?.isActive ? 'Active' : 'Inactive'}</Badge></p></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                  {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
                </div>
              </div>
              <Button type="submit" loading={passwordLoading}>Change Password</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>

            <div>
              <Label>Theme Color</Label>
              <p className="text-sm text-muted-foreground mb-3">Choose your accent color</p>
              <div className="flex gap-3">
                {THEME_COLORS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setColor(t.name)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all hover:scale-105',
                      color === t.name ? 'border-primary shadow-sm' : 'border-transparent',
                    )}
                  >
                    <div className={cn('h-8 w-8 rounded-full', t.swatch)} />
                    <span className="text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Irreversible actions</p>
            <Button variant="destructive" onClick={handleLogout}>
              Log Out of All Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
