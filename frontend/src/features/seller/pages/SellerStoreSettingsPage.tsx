import { useState, useEffect } from 'react';
import { useGetStoresQuery, useUpdateStoreMutation, useCreateStoreMutation } from '@/store/api';
import { useAppSelector } from '@/store';
import { PageHeader } from '@/common/components/PageHeader';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Save, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerStoreSettingsPage() {
  const { data, isLoading } = useGetStoresQuery();
  const [createStore, { isLoading: creating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: updating }] = useUpdateStoreMutation();
  const user = useAppSelector((s) => s.auth.user);

  const store = data?.data?.[0];

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    returnPolicy: '',
    shippingPolicy: '',
    logoUrl: '',
    bannerUrl: '',
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name,
        slug: store.slug,
        description: store.description ?? '',
        returnPolicy: store.returnPolicy ?? '',
        shippingPolicy: store.shippingPolicy ?? '',
        logoUrl: store.logoUrl ?? '',
        bannerUrl: store.bannerUrl ?? '',
      });
    }
  }, [store]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    try {
      if (store) {
        await updateStore({ id: store.id, data: form }).unwrap();
        toast.success('Store updated');
      } else {
        await createStore({ sellerId: user?.id ?? '', data: { ...form, sellerId: user?.id ?? '' } }).unwrap();
        toast.success('Store created');
      }
    } catch {
      toast.error('Failed to save store settings');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Settings"
        description={store ? 'Update your store details' : 'Create your store'}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="h-4 w-4" /> Store Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Store Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="store-url-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Policies</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Return Policy</Label>
                <Textarea
                  value={form.returnPolicy}
                  onChange={(e) => setForm((p) => ({ ...p, returnPolicy: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label>Shipping Policy</Label>
                <Textarea
                  value={form.shippingPolicy}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, shippingPolicy: e.target.value }))
                  }
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branding</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Logo URL</Label>
                <Input
                  value={form.logoUrl}
                  onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Banner URL</Label>
                <Input
                  value={form.bannerUrl}
                  onChange={(e) => setForm((p) => ({ ...p, bannerUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Button
            onClick={handleSave}
            disabled={creating || updating}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {creating || updating ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
