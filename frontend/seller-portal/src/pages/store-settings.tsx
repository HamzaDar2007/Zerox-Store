/**
 * Store Settings Page
 * Update store name, slug, description, and upload logo/banner images.
 */
import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeApi } from '@/services/api'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage as Loading } from '@/components/shared/loading'
import { EmptyState } from '@/components/shared/empty-state'
import { FileUploader } from '@/components/shared/file-uploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const storeSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000).optional(),
})
type StoreFormData = z.infer<typeof storeSchema>

export default function StoreSettingsPage() {
  const qc = useQueryClient()
  const { store, isLoading: profileLoading, refetchStore } = useSellerProfile()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema) as never,
  })

  useEffect(() => {
    if (store) {
      reset({ name: store.name, slug: store.slug, description: store.description ?? '' })
    }
  }, [store, reset])

  const updateM = useMutation({
    mutationFn: (d: StoreFormData) => storeApi.update(store!.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store'] })
      refetchStore()
      toast.success('Store updated!')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const handleLogoUpload = async (files: File[]) => {
    if (!store || !files[0]) return
    const fd = new FormData()
    fd.append('file', files[0])
    try {
      await storeApi.uploadLogo(store.id, fd)
      qc.invalidateQueries({ queryKey: ['store'] })
      refetchStore()
      toast.success('Logo uploaded!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleBannerUpload = async (files: File[]) => {
    if (!store || !files[0]) return
    const fd = new FormData()
    fd.append('file', files[0])
    try {
      await storeApi.uploadBanner(store.id, fd)
      qc.invalidateQueries({ queryKey: ['store'] })
      refetchStore()
      toast.success('Banner uploaded!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (profileLoading) return <Loading />
  if (!store) return <EmptyState icon={Store} title="No Store" description="Complete onboarding to set up your store." />

  return (
    <div className="space-y-6">
      <PageHeader title="Store Settings" description="Manage your store details and branding" />

      <Card>
        <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => updateM.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input {...register('slug')} />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register('description')} rows={4} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || updateM.isPending}>
                {updateM.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Store Logo</CardTitle></CardHeader>
          <CardContent>
            {store.logoUrl && (
              <img src={store.logoUrl} alt="Store logo" className="mb-4 h-24 w-24 rounded-lg object-cover border" />
            )}
            <FileUploader accept="image/*" maxSizeMB={2} onUpload={handleLogoUpload} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Banner Image</CardTitle></CardHeader>
          <CardContent>
            {store.bannerUrl && (
              <img src={store.bannerUrl} alt="Store banner" className="mb-4 h-32 w-full rounded-lg object-cover border" />
            )}
            <FileUploader accept="image/*" maxSizeMB={5} onUpload={handleBannerUpload} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
