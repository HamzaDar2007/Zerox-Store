/**
 * Onboarding Wizard
 * 4-step setup: Business Info → Store Setup → Branding → Done
 * Guides new sellers through account setup with file uploads.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { sellerApi, storeApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { getErrorMessage } from '@/lib/api-error'
import { sanitizeText } from '@/lib/sanitize'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileUploader } from '@/components/shared/file-uploader'
import { CheckCircle, Store, UserCheck, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Seller, Store as StoreType } from '@/types'

const sellerSchema = z.object({
  displayName: z.string().min(1, 'Business name is required').max(200),
  legalName: z.string().max(200).optional(),
  taxId: z.string().max(100).optional(),
})

const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(200),
  slug: z.string().min(1, 'Store URL slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000).optional(),
})

type SellerFormData = z.infer<typeof sellerSchema>
type StoreFormData = z.infer<typeof storeSchema>

const steps = [
  { icon: UserCheck, label: 'Business Info' },
  { icon: Store, label: 'Store Setup' },
  { icon: Image, label: 'Branding' },
  { icon: CheckCircle, label: 'Done' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [store, setStore] = useState<StoreType | null>(null)

  const sellerForm = useForm<SellerFormData>({ resolver: zodResolver(sellerSchema) })
  const storeForm = useForm<StoreFormData>({ resolver: zodResolver(storeSchema) })

  // Check for existing seller/store on mount — if both exist, redirect to dashboard
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const existingSeller = await sellerApi.getMyProfile(user.id)
        if (cancelled) return
        if (existingSeller) {
          setSeller(existingSeller)
          const existingStore = await storeApi.getMyStore(existingSeller.id)
          if (cancelled) return
          if (existingStore) {
            navigate('/', { replace: true })
            return
          }
          setStep(1) // Seller exists but no store — skip to store setup
        }
      } catch {
        // No existing profile — stay on step 0
      }
    })()
    return () => { cancelled = true }
  }, [user?.id, navigate])

  const handleSellerSubmit = async (data: SellerFormData) => {
    setLoading(true)
    try {
      const created = await sellerApi.create({
        ...data,
        displayName: sanitizeText(data.displayName),
        legalName: data.legalName ? sanitizeText(data.legalName) : undefined,
        userId: user?.id ?? '',
      })
      setSeller(created)
      toast.success('Business profile created!')
      setStep(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleStoreSubmit = async (data: StoreFormData) => {
    setLoading(true)
    try {
      const created = await storeApi.create({
        ...data,
        name: sanitizeText(data.name),
        sellerId: seller?.id ?? '',
      })
      setStore(created)
      toast.success('Store created!')
      setStep(2)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    if (!store) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await storeApi.uploadLogo(store.id, formData)
      toast.success('Logo uploaded!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleBannerUpload = async (file: File) => {
    if (!store) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await storeApi.uploadBanner(store.id, formData)
      toast.success('Banner uploaded!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="login-bg flex min-h-screen items-center justify-center p-4">
      <div className="dot-pattern" />
      <div className="page-enter w-full max-w-2xl">
        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-xl">
          <h1 className="mb-2 text-center text-2xl font-bold">Set Up Your Store</h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">Complete these steps to start selling</p>

          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all',
                  i < step ? 'border-primary bg-primary text-primary-foreground' :
                  i === step ? 'border-primary text-primary' :
                  'border-muted text-muted-foreground',
                )}>
                  <s.icon className="h-4 w-4" />
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('h-0.5 w-8', i < step ? 'bg-primary' : 'bg-muted')} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Business Info */}
          {step === 0 && (
            <form onSubmit={sellerForm.handleSubmit(handleSellerSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Business / Display Name *</Label>
                <Input placeholder="My Awesome Store" {...sellerForm.register('displayName')} />
                {sellerForm.formState.errors.displayName && (
                  <p className="text-xs text-destructive">{sellerForm.formState.errors.displayName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Legal Name</Label>
                <Input placeholder="Legal business name (optional)" {...sellerForm.register('legalName')} />
              </div>
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input placeholder="Tax identification number (optional)" {...sellerForm.register('taxId')} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* Step 2: Store Setup */}
          {step === 1 && (
            <form onSubmit={storeForm.handleSubmit(handleStoreSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Store Name *</Label>
                <Input placeholder="My Store" {...storeForm.register('name')} />
                {storeForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{storeForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>URL Slug *</Label>
                <Input placeholder="my-store" {...storeForm.register('slug')} />
                {storeForm.formState.errors.slug && (
                  <p className="text-xs text-destructive">{storeForm.formState.errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Your store URL will be: /stores/your-slug</p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Tell customers about your store..." {...storeForm.register('description')} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* Step 3: Branding */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <FileUploader
                  accept="image/*"
                  maxSizeMB={2}
                  onUpload={(files) => { if (files[0]) handleLogoUpload(files[0]) }}
                />
              </div>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <FileUploader
                  accept="image/*"
                  maxSizeMB={5}
                  onUpload={(files) => { if (files[0]) handleBannerUpload(files[0]) }}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Skip
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <div>
                <h3 className="text-xl font-semibold">You&apos;re All Set!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your seller profile is pending approval. You can start adding products while you wait.
                </p>
              </div>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
