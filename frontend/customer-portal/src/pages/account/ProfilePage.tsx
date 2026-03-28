import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema } from '@/lib/validation'
import { useAuthStore } from '@/store/auth.store'
import { usersApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SEOHead } from '@/components/common/SEOHead'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'

type ProfileFormData = { firstName: string; lastName: string; phone?: string }

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return
    setLoading(true)
    try {
      const updated = await usersApi.update(user.id, data)
      setUser(updated)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      await usersApi.uploadAvatar(user.id, formData)
      const updated = await usersApi.get(user.id)
      setUser(updated)
      toast.success('Avatar updated!')
    } catch {
      toast.error('Failed to upload avatar')
    }
  }

  return (
    <>
      <SEOHead title="My Profile" />
      <div className="max-w-xl">
        <h1 className="text-xl font-bold text-[#0F172A] mb-6">My Profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
              <AvatarFallback className="text-xl">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 h-7 w-7 bg-[#6366F1] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#E06520] transition-colors">
              <Camera className="h-3.5 w-3.5 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-medium text-[#0F172A]">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-[#64748B]">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="mb-1 block">First Name</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-xs text-[#EF4444] mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName" className="mb-1 block">Last Name</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-[#EF4444] mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="mb-1 block">Email</Label>
            <Input id="email" value={user?.email ?? ''} disabled className="bg-[#F1F5F9]" />
            <p className="text-xs text-[#64748B] mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="phone" className="mb-1 block">Phone (Optional)</Label>
            <Input id="phone" placeholder="+923001234567" {...register('phone')} />
            {errors.phone && <p className="text-xs text-[#EF4444] mt-1">{errors.phone.message}</p>}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </>
  )
}
