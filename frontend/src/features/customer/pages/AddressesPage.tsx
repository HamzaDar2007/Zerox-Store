import { useState } from 'react';
import {
  useGetMyAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { EmptyState, ErrorState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Switch } from '@/common/components/ui/switch';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Address, CreateAddressDto } from '@/common/types';

const EMPTY_FORM: CreateAddressDto = {
  fullName: '',
  phone: '',
  province: '',
  city: '',
  streetAddress: '',
  postalCode: '',
  country: 'Pakistan',
  label: '',
  area: '',
  deliveryInstructions: '',
  isDefaultShipping: false,
  isDefaultBilling: false,
};

export default function AddressesPage() {
  const { data, isLoading, isError, refetch } = useGetMyAddressesQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAddressDto>(EMPTY_FORM);

  const addresses: Address[] = data?.data ?? [];

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      streetAddress: addr.streetAddress,
      postalCode: addr.postalCode ?? '',
      country: addr.country,
      label: addr.label ?? '',
      area: addr.area ?? '',
      deliveryInstructions: addr.deliveryInstructions ?? '',
      isDefaultShipping: addr.isDefaultShipping,
      isDefaultBilling: addr.isDefaultBilling,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.city || !form.streetAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await updateAddress({ id: editingId, data: form }).unwrap();
        toast.success('Address updated');
      } else {
        await createAddress(form).unwrap();
        toast.success('Address added');
      }
      setDialogOpen(false);
    } catch {
      toast.error(editingId ? 'Failed to update address' : 'Failed to add address');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id).unwrap();
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  const updateField = <K extends keyof CreateAddressDto>(key: K, value: CreateAddressDto[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isSaving = isCreating || isUpdating;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load addresses"
        message="Something went wrong while fetching your addresses."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Addresses"
        description="Manage your shipping and billing addresses"
      >
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Address
        </Button>
      </PageHeader>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          title="No addresses saved"
          description="Add a shipping address to speed up checkout."
          action={{ label: 'Add Address', onClick: openCreate }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {addr.label || 'Address'}
                    {addr.isDefaultShipping && <Badge variant="secondary">Default Shipping</Badge>}
                    {addr.isDefaultBilling && <Badge variant="outline">Default Billing</Badge>}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(addr)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(addr.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{addr.fullName}</p>
                <p>{addr.streetAddress}</p>
                {addr.area && <p>{addr.area}</p>}
                <p>
                  {addr.city}, {addr.province} {addr.postalCode ?? ''}
                </p>
                <p>{addr.country}</p>
                <p className="text-muted-foreground">{addr.phone}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Label</Label>
              <Input
                placeholder="e.g. Home, Office"
                value={form.label ?? ''}
                onChange={(e) => updateField('label', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Full Name *</Label>
              <Input
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Country</Label>
                <Input
                  value={form.country ?? 'Pakistan'}
                  onChange={(e) => updateField('country', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Province *</Label>
                <Input
                  value={form.province}
                  onChange={(e) => updateField('province', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>City *</Label>
                <Input
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Area</Label>
                <Input
                  value={form.area ?? ''}
                  onChange={(e) => updateField('area', e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Street Address *</Label>
              <Input
                value={form.streetAddress}
                onChange={(e) => updateField('streetAddress', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Postal Code</Label>
              <Input
                value={form.postalCode ?? ''}
                onChange={(e) => updateField('postalCode', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Delivery Instructions</Label>
              <Input
                placeholder="e.g. Ring the bell"
                value={form.deliveryInstructions ?? ''}
                onChange={(e) => updateField('deliveryInstructions', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isDefaultShipping ?? false}
                  onCheckedChange={(v) => updateField('isDefaultShipping', v)}
                />
                <Label>Default Shipping</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isDefaultBilling ?? false}
                  onCheckedChange={(v) => updateField('isDefaultBilling', v)}
                />
                <Label>Default Billing</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingId ? 'Update' : 'Add'} {!isSaving && 'Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
