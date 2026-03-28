import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema, type AddressFormData } from '@/lib/validation'
import { SEOHead } from '@/components/common/SEOHead'
import { addressesApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import type { UserAddress } from '@/types'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AddressesPage() {
  const { user } = useAuthStore()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  useEffect(() => {
    if (!user) return
    addressesApi.list(user.id).then(setAddresses).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const openCreate = () => {
    setEditingId(null)
    reset({ label: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '' })
    setShowDialog(true)
  }

  const openEdit = (addr: UserAddress) => {
    setEditingId(addr.id)
    reset({ label: addr.label ?? '', line1: addr.line1, line2: addr.line2 ?? '', city: addr.city, state: addr.state ?? '', postalCode: addr.postalCode ?? '', country: addr.country })
    setShowDialog(true)
  }

  const onSave = async (data: AddressFormData) => {
    if (!user) return
    try {
      if (editingId) {
        const updated = await addressesApi.update(editingId, data)
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)))
        toast.success('Address updated')
      } else {
        const created = await addressesApi.create(user.id, data)
        setAddresses((prev) => [...prev, created])
        toast.success('Address added')
      }
      setShowDialog(false)
    } catch {
      toast.error('Failed to save address')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return
    try {
      await addressesApi.delete(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Address deleted')
    } catch {
      toast.error('Failed to delete address')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>

  return (
    <>
      <SEOHead title="My Addresses" />
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#0F1111]">My Addresses</h1>
          <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Address</Button>
        </div>

        {addresses.length === 0 ? (
          <EmptyState icon={<MapPin className="h-16 w-16" />} title="No addresses saved" description="Add an address for faster checkout." actionLabel="Add Address" onAction={openCreate} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-[8px] border border-[#DDD] p-4 relative">
                {addr.isDefault && <span className="absolute top-2 right-2 text-xs bg-[#007600] text-white px-2 py-0.5 rounded-full">Default</span>}
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-[#F57224] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-[#0F1111]">{addr.label ?? 'Address'}</p>
                    <p className="text-sm text-[#565959]">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p className="text-sm text-[#565959]">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                    <p className="text-sm text-[#565959]">{addr.country}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(addr)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="text-[#B12704]" onClick={() => handleDelete(addr.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editingId ? 'Edit Address' : 'Add Address'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSave)} className="space-y-3">
              <div><Label className="mb-1 block text-xs">Label</Label><Input placeholder="Home, Work" {...register('label')} /></div>
              <div><Label className="mb-1 block text-xs">Address Line 1</Label><Input {...register('line1')} />{errors.line1 && <p className="text-xs text-[#B12704]">{errors.line1.message}</p>}</div>
              <div><Label className="mb-1 block text-xs">Address Line 2</Label><Input {...register('line2')} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1 block text-xs">City</Label><Input {...register('city')} />{errors.city && <p className="text-xs text-[#B12704]">{errors.city.message}</p>}</div>
                <div><Label className="mb-1 block text-xs">State</Label><Input {...register('state')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1 block text-xs">Postal Code</Label><Input {...register('postalCode')} /></div>
                <div><Label className="mb-1 block text-xs">Country</Label><Input {...register('country')} />{errors.country && <p className="text-xs text-[#B12704]">{errors.country.message}</p>}</div>
              </div>
              <div className="flex gap-2 pt-2"><Button type="submit">Save</Button><Button type="button" variant="ghost" onClick={() => setShowDialog(false)}>Cancel</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
