import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema, type AddressFormData } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addressesApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import type { UserAddress } from '@/types'
import { cn } from '@/lib/utils'
import { MapPin, Plus } from 'lucide-react'

interface AddressStepProps {
  onNext: (address: UserAddress) => void
  selectedAddressId?: string
}

export function AddressStep({ onNext, selectedAddressId }: AddressStepProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selected, setSelected] = useState<string | undefined>(selectedAddressId)
  const selectedMethodRef = useRef(selectedAddressId)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const userId = useAuthStore((s) => s.user?.id)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    addressesApi.list(userId).then((a) => {
      if (cancelled) return
      setAddresses(a)
      if (a.length > 0 && !selectedMethodRef.current) {
        const def = a.find((addr) => addr.isDefault) ?? a[0]
        setSelected(def.id)
      }
      setLoading(false)
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  const handleSaveNew = async (data: AddressFormData) => {
    try {
      if (!userId) return
      const created = await addressesApi.create(userId, data as Omit<UserAddress, 'id' | 'userId'>)
      setAddresses((prev) => [...prev, created])
      setSelected(created.id)
      setShowForm(false)
      reset()
    } catch { /* toast handled by interceptor */ }
  }

  const handleContinue = () => {
    const addr = addresses.find((a) => a.id === selected)
    if (addr) onNext(addr)
  }

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-20 bg-[#F0F2F2] rounded" /><div className="h-20 bg-[#F0F2F2] rounded" /></div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#0F1111] mb-2">Shipping Address</h2>

      {/* Existing Addresses */}
      {addresses.map((addr) => (
        <label
          key={addr.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-[8px] border cursor-pointer transition-colors',
            selected === addr.id ? 'border-[#F57224] bg-[#FFF3EC]' : 'border-[#DDD] hover:border-[#999]',
          )}
        >
          <input
            type="radio"
            name="address"
            checked={selected === addr.id}
            onChange={() => setSelected(addr.id)}
            className="mt-1 accent-[#F57224]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#F57224]" />
              <span className="font-medium text-sm text-[#0F1111]">{addr.label ?? 'Address'}</span>
              {addr.isDefault && <span className="text-xs bg-[#007600] text-white px-2 py-0.5 rounded-full">Default</span>}
            </div>
            <p className="text-sm text-[#565959] mt-1">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}
              {addr.state ? `, ${addr.state}` : ''} {addr.postalCode ?? ''}, {addr.country}
            </p>
          </div>
        </label>
      ))}

      {/* Add New */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add a new address
        </button>
      ) : (
        <form onSubmit={handleSubmit(handleSaveNew)} className="border border-[#DDD] rounded-[8px] p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#0F1111]">New Address</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs">Label</Label>
              <Input placeholder="Home / Office" {...register('label')} />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Country</Label>
              <Input placeholder="Pakistan" {...register('country')} />
              {errors.country && <p className="text-xs text-[#B12704] mt-1">{errors.country.message}</p>}
            </div>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Address Line 1</Label>
            <Input placeholder="Street address" {...register('line1')} />
            {errors.line1 && <p className="text-xs text-[#B12704] mt-1">{errors.line1.message}</p>}
          </div>
          <div>
            <Label className="mb-1 block text-xs">Address Line 2 (Optional)</Label>
            <Input placeholder="Apt, suite, unit, etc." {...register('line2')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="mb-1 block text-xs">City</Label>
              <Input placeholder="City" {...register('city')} />
              {errors.city && <p className="text-xs text-[#B12704] mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block text-xs">State</Label>
              <Input placeholder="State" {...register('state')} />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Postal Code</Label>
              <Input placeholder="Postal code" {...register('postalCode')} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Save Address</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); reset() }}>Cancel</Button>
          </div>
        </form>
      )}

      <Button onClick={handleContinue} disabled={!selected} className="w-full font-bold" size="lg">
        Continue to Shipping
      </Button>
    </div>
  )
}
